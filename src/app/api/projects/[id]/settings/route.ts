import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Default settings structure
const defaultSettings = {
  privacy: {
    isPublic: true,
    requireAuthentication: false,
    passwordProtected: false,
    password: null,
    allowAnonymousResponses: true,
    collectIpAddresses: false,
    showProgressBar: true,
    showQuestionNumbers: true,
  },
  branding: {
    showSurbeeBadge: true,
    customLogo: null,
    primaryColor: "#6366f1",
    backgroundColor: "#ffffff",
    fontFamily: "Inter",
  },
  domains: {
    customDomain: null,
    customDomainVerified: false,
    allowedDomains: [],
    blockDomains: [],
  },
  responses: {
    limitResponses: false,
    maxResponses: null,
    limitOnePerUser: false,
    closeAfterDate: null,
    closeMessage: "This survey is now closed.",
    showThankYouPage: true,
    thankYouMessage: "Thank you for completing this survey!",
    redirectUrl: null,
  },
  notifications: {
    emailOnResponse: false,
    emailRecipients: [],
    dailyDigest: false,
    weeklyReport: false,
  },
  cipher: {
    enabled: true,
    // NEW: Tier system (1-5)
    tier: 3 as 1 | 2 | 3 | 4 | 5,
    // Legacy sensitivity (kept for backwards compatibility)
    sensitivity: "medium" as "low" | "medium" | "high",
    // Advanced mode allows granular check control
    advancedMode: false,
    advancedChecks: {} as Record<string, boolean>,
    // Session persistence
    sessionResume: true,
    resumeWindowHours: 48,
    // Thresholds
    flagThreshold: 0.6,
    blockThreshold: 0.85,
    minResponseTimeMs: 30000,
    // Legacy individual checks (kept for backwards compatibility)
    detectBots: true,
    detectVpn: true,
    detectDuplicates: true,
    detectProxies: true,
    blockSuspicious: false,
    requireMinTime: true,
    minTimeSeconds: 30,
    detectStraightLining: true,
    detectSpeedsters: true,
  },
  advanced: {
    enableCaptcha: false,
    preventBotResponses: true,
    allowEditResponses: false,
    savePartialResponses: true,
    randomizeQuestions: false,
    randomizeOptions: false,
  },
};

// GET - Fetch project settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch project with settings
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, user_id, settings, title')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (project.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Merge with defaults to ensure all fields exist
    const settings = {
      ...defaultSettings,
      ...project.settings,
      privacy: { ...defaultSettings.privacy, ...project.settings?.privacy },
      branding: { ...defaultSettings.branding, ...project.settings?.branding },
      domains: { ...defaultSettings.domains, ...project.settings?.domains },
      responses: { ...defaultSettings.responses, ...project.settings?.responses },
      notifications: { ...defaultSettings.notifications, ...project.settings?.notifications },
      cipher: { ...defaultSettings.cipher, ...project.settings?.cipher },
      advanced: { ...defaultSettings.advanced, ...project.settings?.advanced },
    };

    return NextResponse.json({
      settings,
      projectTitle: project.title,
    });
  } catch (error) {
    console.error('Error in GET /api/projects/[id]/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update project settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { userId, settings } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify project ownership
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (fetchError || !existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (existingProject.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Validate and sanitize settings
    const sanitizedSettings = {
      privacy: {
        isPublic: Boolean(settings.privacy?.isPublic ?? defaultSettings.privacy.isPublic),
        requireAuthentication: Boolean(settings.privacy?.requireAuthentication ?? defaultSettings.privacy.requireAuthentication),
        passwordProtected: Boolean(settings.privacy?.passwordProtected ?? defaultSettings.privacy.passwordProtected),
        password: settings.privacy?.passwordProtected ? (settings.privacy?.password || null) : null,
        allowAnonymousResponses: Boolean(settings.privacy?.allowAnonymousResponses ?? defaultSettings.privacy.allowAnonymousResponses),
        collectIpAddresses: Boolean(settings.privacy?.collectIpAddresses ?? defaultSettings.privacy.collectIpAddresses),
        showProgressBar: Boolean(settings.privacy?.showProgressBar ?? defaultSettings.privacy.showProgressBar),
        showQuestionNumbers: Boolean(settings.privacy?.showQuestionNumbers ?? defaultSettings.privacy.showQuestionNumbers),
      },
      branding: {
        showSurbeeBadge: Boolean(settings.branding?.showSurbeeBadge ?? defaultSettings.branding.showSurbeeBadge),
        customLogo: settings.branding?.customLogo || null,
        primaryColor: settings.branding?.primaryColor || defaultSettings.branding.primaryColor,
        backgroundColor: settings.branding?.backgroundColor || defaultSettings.branding.backgroundColor,
        fontFamily: settings.branding?.fontFamily || defaultSettings.branding.fontFamily,
      },
      domains: {
        customDomain: settings.domains?.customDomain || null,
        customDomainVerified: Boolean(settings.domains?.customDomainVerified ?? false),
        allowedDomains: Array.isArray(settings.domains?.allowedDomains) ? settings.domains.allowedDomains : [],
        blockDomains: Array.isArray(settings.domains?.blockDomains) ? settings.domains.blockDomains : [],
      },
      responses: {
        limitResponses: Boolean(settings.responses?.limitResponses ?? defaultSettings.responses.limitResponses),
        maxResponses: settings.responses?.limitResponses ? (settings.responses?.maxResponses || null) : null,
        limitOnePerUser: Boolean(settings.responses?.limitOnePerUser ?? defaultSettings.responses.limitOnePerUser),
        closeAfterDate: settings.responses?.closeAfterDate || null,
        closeMessage: settings.responses?.closeMessage || defaultSettings.responses.closeMessage,
        showThankYouPage: Boolean(settings.responses?.showThankYouPage ?? defaultSettings.responses.showThankYouPage),
        thankYouMessage: settings.responses?.thankYouMessage || defaultSettings.responses.thankYouMessage,
        redirectUrl: settings.responses?.redirectUrl || null,
      },
      notifications: {
        emailOnResponse: Boolean(settings.notifications?.emailOnResponse ?? defaultSettings.notifications.emailOnResponse),
        emailRecipients: Array.isArray(settings.notifications?.emailRecipients) ? settings.notifications.emailRecipients : [],
        dailyDigest: Boolean(settings.notifications?.dailyDigest ?? defaultSettings.notifications.dailyDigest),
        weeklyReport: Boolean(settings.notifications?.weeklyReport ?? defaultSettings.notifications.weeklyReport),
      },
      cipher: {
        enabled: Boolean(settings.cipher?.enabled ?? defaultSettings.cipher.enabled),
        // NEW: Tier system (1-5)
        tier: typeof settings.cipher?.tier === 'number'
          ? Math.min(5, Math.max(1, Math.round(settings.cipher.tier))) as 1 | 2 | 3 | 4 | 5
          : defaultSettings.cipher.tier,
        // Legacy sensitivity
        sensitivity: ['low', 'medium', 'high'].includes(settings.cipher?.sensitivity)
          ? settings.cipher.sensitivity
          : defaultSettings.cipher.sensitivity,
        // Advanced mode
        advancedMode: Boolean(settings.cipher?.advancedMode ?? defaultSettings.cipher.advancedMode),
        advancedChecks: typeof settings.cipher?.advancedChecks === 'object' && settings.cipher?.advancedChecks !== null
          ? settings.cipher.advancedChecks
          : defaultSettings.cipher.advancedChecks,
        // Session persistence
        sessionResume: Boolean(settings.cipher?.sessionResume ?? defaultSettings.cipher.sessionResume),
        resumeWindowHours: typeof settings.cipher?.resumeWindowHours === 'number'
          ? Math.min(168, Math.max(1, settings.cipher.resumeWindowHours)) // 1 hour to 1 week
          : defaultSettings.cipher.resumeWindowHours,
        // Thresholds (0-1 scale)
        flagThreshold: typeof settings.cipher?.flagThreshold === 'number'
          ? Math.min(1, Math.max(0, settings.cipher.flagThreshold))
          : defaultSettings.cipher.flagThreshold,
        blockThreshold: typeof settings.cipher?.blockThreshold === 'number'
          ? Math.min(1, Math.max(0, settings.cipher.blockThreshold))
          : defaultSettings.cipher.blockThreshold,
        minResponseTimeMs: typeof settings.cipher?.minResponseTimeMs === 'number'
          ? Math.max(1000, settings.cipher.minResponseTimeMs)
          : defaultSettings.cipher.minResponseTimeMs,
        // Legacy individual checks (kept for backwards compatibility)
        detectBots: Boolean(settings.cipher?.detectBots ?? defaultSettings.cipher.detectBots),
        detectVpn: Boolean(settings.cipher?.detectVpn ?? defaultSettings.cipher.detectVpn),
        detectDuplicates: Boolean(settings.cipher?.detectDuplicates ?? defaultSettings.cipher.detectDuplicates),
        detectProxies: Boolean(settings.cipher?.detectProxies ?? defaultSettings.cipher.detectProxies),
        blockSuspicious: Boolean(settings.cipher?.blockSuspicious ?? defaultSettings.cipher.blockSuspicious),
        requireMinTime: Boolean(settings.cipher?.requireMinTime ?? defaultSettings.cipher.requireMinTime),
        minTimeSeconds: typeof settings.cipher?.minTimeSeconds === 'number'
          ? Math.max(5, settings.cipher.minTimeSeconds)
          : defaultSettings.cipher.minTimeSeconds,
        detectStraightLining: Boolean(settings.cipher?.detectStraightLining ?? defaultSettings.cipher.detectStraightLining),
        detectSpeedsters: Boolean(settings.cipher?.detectSpeedsters ?? defaultSettings.cipher.detectSpeedsters),
      },
      advanced: {
        enableCaptcha: Boolean(settings.advanced?.enableCaptcha ?? defaultSettings.advanced.enableCaptcha),
        preventBotResponses: Boolean(settings.advanced?.preventBotResponses ?? defaultSettings.advanced.preventBotResponses),
        allowEditResponses: Boolean(settings.advanced?.allowEditResponses ?? defaultSettings.advanced.allowEditResponses),
        savePartialResponses: Boolean(settings.advanced?.savePartialResponses ?? defaultSettings.advanced.savePartialResponses),
        randomizeQuestions: Boolean(settings.advanced?.randomizeQuestions ?? defaultSettings.advanced.randomizeQuestions),
        randomizeOptions: Boolean(settings.advanced?.randomizeOptions ?? defaultSettings.advanced.randomizeOptions),
      },
    };

    // Update project settings
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        settings: sanitizedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select('id, settings')
      .single();

    if (updateError) {
      console.error('Error updating project settings:', updateError);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: updatedProject.settings,
    });
  } catch (error) {
    console.error('Error in PUT /api/projects/[id]/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
