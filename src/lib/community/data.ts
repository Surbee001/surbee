export type CommunityContentType = 'templates' | 'surveys';

export interface CommunityCategory {
  slug: string;
  title: string;
  description: string;
  accent: string;
  previewImages: string[];
  contentType: CommunityContentType | 'both';
  keywords?: string[];
}

export interface CommunitySurvey {
  id: string;
  title: string;
  description: string;
  category: string;
  responseCount: number;
  createdAt: string;
  previewImage?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags?: string[];
  author?: string;
}

export interface CommunityTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  remixCount: number;
  createdAt: string;
  previewImage?: string;
  tags: string[];
  framework: string;
  likes?: number;
  author?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

const DEFAULT_PREVIEW =
  '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png';

export const communityCategories: CommunityCategory[] = [
  {
    slug: 'customer-experience',
    title: 'Customer Experience',
    description: 'Win loyalty with research-backed journeys and customer success playbooks.',
    accent: 'from-orange-500/20 to-pink-500/20',
    previewImages: [DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW],
    contentType: 'both',
    keywords: ['Customer Success', 'Customer'],
  },
  {
    slug: 'product-insights',
    title: 'Product Insights',
    description: 'Turn qualitative feedback into prioritised roadmaps and experiments.',
    accent: 'from-indigo-500/20 to-blue-500/20',
    previewImages: [DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW],
    contentType: 'both',
    keywords: ['Product', 'Research'],
  },
  {
    slug: 'people-ops',
    title: 'People Ops',
    description: 'Support your team with onboarding flows, pulse surveys, and culture loops.',
    accent: 'from-emerald-500/20 to-amber-500/20',
    previewImages: [DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW],
    contentType: 'both',
    keywords: ['HR', 'People Ops'],
  },
  {
    slug: 'growth-loops',
    title: 'Growth Loops',
    description: 'Campaign blueprints, lifecycle plays, and conversion-focused flows.',
    accent: 'from-sky-500/20 to-violet-500/20',
    previewImages: [DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW],
    contentType: 'templates',
    keywords: ['Growth', 'Lifecycle'],
  },
  {
    slug: 'research-labs',
    title: 'Research Labs',
    description: 'Advanced studies that surface trends, personas, and market validation.',
    accent: 'from-purple-500/20 to-rose-500/20',
    previewImages: [DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW],
    contentType: 'surveys',
    keywords: ['Research', 'Insights'],
  },
  {
    slug: 'events-and-experiences',
    title: 'Events & Experiences',
    description: 'Collect feedback before, during, and after your flagship experiences.',
    accent: 'from-amber-500/20 to-orange-500/20',
    previewImages: [DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW, DEFAULT_PREVIEW],
    contentType: 'surveys',
    keywords: ['Events'],
  },
];

export const communityTemplates: CommunityTemplate[] = [
  {
    id: 'tmpl-nps-pro',
    title: 'NPS Survey Suite',
    description: 'Holistic NPS survey with automated follow-up workflows and cohort analytics.',
    category: 'Customer Success',
    remixCount: 2847,
    createdAt: '2024-01-10T08:00:00Z',
    previewImage: DEFAULT_PREVIEW,
    tags: ['NPS', 'Customer', 'Analytics'],
    framework: 'Lifecycle',
    likes: 1289,
    author: 'Studio Athena',
    difficulty: 'beginner',
  },
  {
    id: 'tmpl-onboarding',
    title: 'Employee Onboarding Framework',
    description: 'Step-by-step onboarding journey with checklists, surveys, and automations.',
    category: 'HR',
    remixCount: 1923,
    createdAt: '2024-01-12T10:30:00Z',
    previewImage: DEFAULT_PREVIEW,
    tags: ['Onboarding', 'HR', 'Automation'],
    framework: 'People Ops',
    likes: 973,
    author: 'MetaFlow',
    difficulty: 'intermediate',
  },
  {
    id: 'tmpl-product-voice',
    title: 'Voice of Customer Hub',
    description: 'Unified template to capture, cluster, and act on product feedback.',
    category: 'Product',
    remixCount: 2411,
    createdAt: '2024-01-18T12:00:00Z',
    previewImage: DEFAULT_PREVIEW,
    tags: ['Voice of Customer', 'Insights', 'Product'],
    framework: 'Product Ops',
    likes: 1164,
    author: 'SignalNorth',
    difficulty: 'advanced',
  },
  {
    id: 'tmpl-marketplay',
    title: 'Market Research Studio',
    description: 'Modular research workspace with personas, surveys, and insight boards.',
    category: 'Research',
    remixCount: 1782,
    createdAt: '2024-02-02T09:45:00Z',
    previewImage: DEFAULT_PREVIEW,
    tags: ['Research', 'Persona', 'Insights'],
    framework: 'Growth',
    likes: 842,
    author: 'Orbital Labs',
    difficulty: 'intermediate',
  },
  {
    id: 'tmpl-user-testing',
    title: 'User Testing Protocol',
    description: 'Comprehensive user testing framework with task analysis and heatmaps.',
    category: 'UX Research',
    remixCount: 1456,
    createdAt: '2024-01-25T14:20:00Z',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png',
    tags: ['UX', 'Testing', 'Research'],
    framework: 'Product Design',
    likes: 723,
    author: 'DesignFlow',
    difficulty: 'intermediate',
  },
  {
    id: 'tmpl-customer-journey',
    title: 'Customer Journey Mapping',
    description: 'Visual mapping tool for customer touchpoints and pain points.',
    category: 'Customer Success',
    remixCount: 2156,
    createdAt: '2024-02-01T11:15:00Z',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_abf323ce-3d0a-417d-8ce7-b307c8e84258.png',
    tags: ['Journey', 'Mapping', 'Customer'],
    framework: 'Lifecycle',
    likes: 1156,
    author: 'JourneyMappers',
    difficulty: 'beginner',
  },
  {
    id: 'tmpl-feedback-collection',
    title: 'Feedback Collection System',
    description: 'Multi-channel feedback collection with sentiment analysis.',
    category: 'Product',
    remixCount: 1892,
    createdAt: '2024-01-28T16:45:00Z',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__423e2f06-d2d7-4c2c-bd7b-9aec2b6c1fbe.png',
    tags: ['Feedback', 'Sentiment', 'Product'],
    framework: 'Product Ops',
    likes: 934,
    author: 'FeedbackCo',
    difficulty: 'advanced',
  },
  {
    id: 'tmpl-survey-builder',
    title: 'Advanced Survey Builder',
    description: 'Drag-and-drop survey builder with advanced logic and analytics.',
    category: 'Research',
    remixCount: 3247,
    createdAt: '2024-01-05T09:30:00Z',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
    tags: ['Survey', 'Builder', 'Logic'],
    framework: 'Growth',
    likes: 1547,
    author: 'SurveyCraft',
    difficulty: 'intermediate',
  },
  {
    id: 'tmpl-employee-pulse',
    title: 'Employee Pulse Surveys',
    description: 'Regular pulse surveys to monitor employee satisfaction and engagement.',
    category: 'HR',
    remixCount: 1278,
    createdAt: '2024-02-10T13:20:00Z',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png',
    tags: ['Pulse', 'HR', 'Engagement'],
    framework: 'People Ops',
    likes: 678,
    author: 'CultureMetrics',
    difficulty: 'beginner',
  },
  {
    id: 'tmpl-product-roadmap',
    title: 'Product Roadmap Prioritization',
    description: 'Framework for prioritizing features based on customer feedback and business impact.',
    category: 'Product',
    remixCount: 2678,
    createdAt: '2024-01-22T10:10:00Z',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_abf323ce-3d0a-417d-8ce7-b307c8e84258.png',
    tags: ['Roadmap', 'Prioritization', 'Product'],
    framework: 'Product Strategy',
    likes: 1345,
    author: 'RoadmapPro',
    difficulty: 'advanced',
  },
  {
    id: 'tmpl-market-analysis',
    title: 'Market Analysis Toolkit',
    description: 'Comprehensive toolkit for market research and competitive analysis.',
    category: 'Research',
    remixCount: 1456,
    createdAt: '2024-02-05T15:30:00Z',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__423e2f06-d2d7-4c2c-bd7b-9aec2b6c1fbe.png',
    tags: ['Market', 'Analysis', 'Research'],
    framework: 'Growth',
    likes: 789,
    author: 'MarketInsight',
    difficulty: 'intermediate',
  },
  {
    id: 'tmpl-customer-segmentation',
    title: 'Customer Segmentation Framework',
    description: 'Advanced segmentation framework for targeted marketing and product development.',
    category: 'Marketing',
    remixCount: 1987,
    createdAt: '2024-01-30T12:45:00Z',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png',
    tags: ['Segmentation', 'Marketing', 'Customer'],
    framework: 'Growth',
    likes: 967,
    author: 'SegmentFlow',
    difficulty: 'advanced',
  },
];

export const trendingTemplates = communityTemplates.slice(0, 3);

export const communitySurveys: CommunitySurvey[] = [
  {
    id: 'srv-csat',
    title: 'Customer Satisfaction Pulse',
    description: 'Measure satisfaction across touchpoints with quick follow-up actions.',
    category: 'Customer Success',
    responseCount: 1247,
    createdAt: '2024-01-15T10:00:00Z',
    previewImage: DEFAULT_PREVIEW,
    difficulty: 'beginner',
    estimatedTime: '5 min',
    tags: ['CSAT', 'Retention'],
    author: 'Flowbase',
  },
  {
    id: 'srv-engagement',
    title: 'Employee Engagement Assessment',
    description: 'Track morale, alignment, and enablement across teams.',
    category: 'HR',
    responseCount: 892,
    createdAt: '2024-01-20T14:30:00Z',
    previewImage: DEFAULT_PREVIEW,
    difficulty: 'intermediate',
    estimatedTime: '8 min',
    tags: ['HR', 'Engagement'],
    author: 'Culture Shift',
  },
  {
    id: 'srv-product-feedback',
    title: 'Product Feedback Loop',
    description: 'Capture feature sentiment, prioritise feedback, and close the loop.',
    category: 'Product',
    responseCount: 2156,
    createdAt: '2024-01-25T09:15:00Z',
    previewImage: DEFAULT_PREVIEW,
    difficulty: 'beginner',
    estimatedTime: '6 min',
    tags: ['Product', 'Feedback'],
    author: 'LoopedIn',
  },
  {
    id: 'srv-market',
    title: 'Market Validation Survey',
    description: 'Understand audience needs, pricing signals, and concept resonance.',
    category: 'Research',
    responseCount: 3421,
    createdAt: '2024-02-01T16:45:00Z',
    previewImage: DEFAULT_PREVIEW,
    difficulty: 'advanced',
    estimatedTime: '12 min',
    tags: ['Research', 'Validation'],
    author: 'Insight Partners',
  },
  {
    id: 'srv-event',
    title: 'Event Impact Review',
    description: 'Post-event evaluation to surface highlights and opportunities.',
    category: 'Events',
    responseCount: 567,
    createdAt: '2024-02-05T11:20:00Z',
    previewImage: DEFAULT_PREVIEW,
    difficulty: 'beginner',
    estimatedTime: '4 min',
    tags: ['Events', 'Feedback'],
    author: 'Gatherly',
  },
];

export const trendingSurveys = communitySurveys.slice(0, 3);

export function getTemplateById(id: string) {
  return communityTemplates.find((template) => template.id === id);
}

export function getRelatedTemplates(templateId: string, take = 3) {
  const current = getTemplateById(templateId);
  if (!current) return communityTemplates.slice(0, take);
  return communityTemplates
    .filter((template) => template.id !== templateId && template.category === current.category)
    .concat(
      communityTemplates.filter(
        (template) => template.id !== templateId && template.category !== current.category,
      ),
    )
    .slice(0, take);
}
