/**
 * Session management for anonymous survey respondents
 */

const SESSION_ID_KEY = 'surbee_session_id';
const SESSION_STORAGE_KEY = 'surbee_session_data';

export interface SessionData {
  sessionId: string;
  createdAt: string;
  surveys: {
    [surveyId: string]: {
      startedAt: string;
      lastActivityAt: string;
      attempts: number;
    };
  };
}

/**
 * Get or create a unique session ID for the current user
 * Uses localStorage for persistence across page reloads
 */
export function getOrCreateSessionId(): string {
  // Try to get existing session ID from localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
      // Generate new session ID
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    
    return sessionId;
  }

  // Fallback for SSR or when localStorage is unavailable
  return generateSessionId();
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `session_` + timestamp + '_' + random;
}

/**
 * Track survey activity for a session
 */
export function trackSurveyActivity(surveyId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const sessionId = getOrCreateSessionId();
  const now = new Date().toISOString();

  // Get existing session data
  let sessionData: SessionData;
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);

  if (stored) {
    try {
      sessionData = JSON.parse(stored);
    } catch {
      sessionData = createNewSessionData(sessionId);
    }
  } else {
    sessionData = createNewSessionData(sessionId);
  }

  // Update survey tracking
  if (!sessionData.surveys[surveyId]) {
    sessionData.surveys[surveyId] = {
      startedAt: now,
      lastActivityAt: now,
      attempts: 1
    };
  } else {
    sessionData.surveys[surveyId].lastActivityAt = now;
    sessionData.surveys[surveyId].attempts += 1;
  }

  // Save updated session data
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
}

/**
 * Check if user has already attempted a survey
 */
export function hasAttemptedSurvey(surveyId: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) {
    return false;
  }

  try {
    const sessionData: SessionData = JSON.parse(stored);
    return !!sessionData.surveys[surveyId];
  } catch {
    return false;
  }
}

/**
 * Get survey attempt count
 */
export function getSurveyAttemptCount(surveyId: string): number {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 0;
  }

  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) {
    return 0;
  }

  try {
    const sessionData: SessionData = JSON.parse(stored);
    return sessionData.surveys[surveyId]?.attempts || 0;
  } catch {
    return 0;
  }
}

/**
 * Clear session data (on logout or explicit cleanup)
 */
export function clearSession(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

/**
 * Create new session data object
 */
function createNewSessionData(sessionId: string): SessionData {
  return {
    sessionId,
    createdAt: new Date().toISOString(),
    surveys: {}
  };
}

/**
 * Create headers for survey submission including session ID
 */
export function getSessionHeaders(): Record<string, string> {
  return {
    'X-Session-ID': getOrCreateSessionId(),
    'X-Client-IP': 'client'
  };
}
