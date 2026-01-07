import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';
import { DEFAULT_CIPHER_SETTINGS, CipherTier } from '@/lib/cipher/tier-config';

interface RouteContext {
  params: Promise<{ url: string }>;
}

export interface CipherSettingsResponse {
  enabled: boolean;
  tier: CipherTier;
  sessionResume: boolean;
  resumeWindowHours: number;
  advancedMode: boolean;
  advancedChecks: Record<string, boolean> | null;
  flagThreshold: number;
  blockThreshold: number;
  minResponseTimeMs: number;
}

/**
 * Get Cipher settings for a published survey
 * This is called by the survey page to configure the CipherTracker
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<CipherSettingsResponse | { error: string }>> {
  try {
    const { url: publishedUrl } = await context.params;

    const { data: project, error } = await ProjectsService.getPublishedProject(publishedUrl);

    if (error || !project) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Extract cipher settings from project settings, falling back to defaults
    const projectSettings = project.settings || {};
    const cipherSettings = projectSettings.cipher || {};

    // Merge with defaults
    const settings: CipherSettingsResponse = {
      enabled: cipherSettings.enabled ?? DEFAULT_CIPHER_SETTINGS.enabled,
      tier: (cipherSettings.tier as CipherTier) ?? DEFAULT_CIPHER_SETTINGS.tier,
      sessionResume: cipherSettings.sessionResume ?? DEFAULT_CIPHER_SETTINGS.sessionResume,
      resumeWindowHours: cipherSettings.resumeWindowHours ?? DEFAULT_CIPHER_SETTINGS.resumeWindowHours,
      advancedMode: cipherSettings.advancedMode ?? DEFAULT_CIPHER_SETTINGS.advancedMode,
      advancedChecks: cipherSettings.advancedChecks || null,
      flagThreshold: cipherSettings.flagThreshold ?? DEFAULT_CIPHER_SETTINGS.flagThreshold,
      blockThreshold: cipherSettings.blockThreshold ?? DEFAULT_CIPHER_SETTINGS.blockThreshold,
      minResponseTimeMs: cipherSettings.minResponseTimeMs ?? DEFAULT_CIPHER_SETTINGS.minResponseTimeMs,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching cipher settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
