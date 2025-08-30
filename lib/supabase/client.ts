// Minimal supabase db facade to satisfy AI/analytics calls in development
// Replace with real implementations as tables are introduced

type Id = string

function ok<T>(data: T) {
  return Promise.resolve({ data, error: null as any })
}

export const db = {
  users: {
    getProfile: (userId: Id) => ok<any>({ id: userId }),
    createProfile: (data: any) => ok<any>({ id: `user_${Date.now()}`, ...data }),
  },
  projects: {
    getById: (id: Id) => ok<any>(null),
    create: (data: any) => ok<any>({ id: `proj_${Date.now()}`, project_id: data.project_id || `p_${Date.now()}`, ...data }),
    generateProjectId: () => ok<string>(`p_${Date.now()}`),
  },
  conversations: {
    getById: (id: Id) => ok<any>(null),
    create: (data: any) => ok<any>({ id: `conv_${Date.now()}`, ...data }),
  },
  messages: {
    create: (data: any) => ok<any>({ id: `msg_${Date.now()}`, ...data }),
  },
  analytics: {
    trackEvent: (projectId: Id, userId: Id, eventType: string, eventData?: any) => ok<any>({ projectId, userId, eventType, eventData }),
    getProjectAnalytics: (projectId: Id) => ok<any[]>([]),
    getPerformanceMetrics: (projectId: Id) => ok<any[]>([]),
  },
  surveys: {
    create: (data: any) => ok<any>({ id: `survey_${Date.now()}`, ...data }),
    getById: (id: Id) => ok<any>(null),
  },
  atoms: {
    create: (data: any) => ok<any>({ id: `atom_${Date.now()}`, ...data }),
  },
  aiLearning: {
    logInteraction: (prompt: string, completion: any, feedback?: any, priority?: number) => ok<string>(`ai_${Date.now()}`),
    updateFeedback: (id: Id, feedback: any) => ok<any>({ id, feedback }),
    getTrainingData: (limit?: number) => ok<any[]>([]),
    createTrainingJob: (data: any) => ok<any>({ id: `job_${Date.now()}`, ...data }),
    updateTrainingJob: (id: Id, data: any) => ok<any>({ id, ...data }),
  },
  aiTraining: {
    getActiveModel: () => ok<any>({ model_path: 'gpt-4o-mini' }),
  },
}

