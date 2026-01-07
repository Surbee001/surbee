export interface ShareSettings {
  customSlug?: string;
  isPublic: boolean;
  allowResponses: boolean;
  showProgressBar: boolean;
  collectEmail: boolean;
  requireAuth: boolean;
}

export interface ShareStats {
  views: number;
  responses: number;
  completionRate: number;
  isLive: boolean;
}

export interface SocialPlatform {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface ShareTabData {
  projectId: string;
  publishedUrl?: string | null;
  settings?: ShareSettings;
  stats?: ShareStats;
}
