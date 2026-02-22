/**
 * Survey Bridge - Communication Protocol
 *
 * Defines the bidirectional message protocol between surveys (in iframes)
 * and the parent application for real-time data exchange.
 */

import type { CipherTier } from './cipher/tier-config';
import type { BehavioralMetrics } from './cipher/cipher-tracker';

// ============================================
// MESSAGE TYPES: Survey → Parent
// ============================================

/** Survey is loaded and ready to receive messages */
export interface SurveyReadyMessage {
  type: 'SURVEY_READY';
  sessionId: string;
  timestamp: number;
}

/** Survey has been completed with all responses and metrics */
export interface SurveyCompleteMessage {
  type: 'SURVEY_COMPLETE';
  responses: Record<string, any>;
  behavioralMetrics: BehavioralMetrics;
  sessionId: string;
  timestamp: number;
}

/** Periodic metrics update from survey */
export interface MetricsUpdateMessage {
  type: 'METRICS_UPDATE';
  metrics: Partial<BehavioralMetrics>;
  sessionId: string;
  timestamp: number;
}

/** User answered a question */
export interface QuestionAnsweredMessage {
  type: 'QUESTION_ANSWERED';
  questionId: string;
  questionIndex: number;
  answer: any;
  timing: number; // ms spent on question
  sessionId: string;
  timestamp: number;
}

/** User navigated to a new page/section */
export interface PageChangeMessage {
  type: 'PAGE_CHANGE';
  pageIndex: number;
  previousPage: number;
  sessionId: string;
  timestamp: number;
}

/** Previous session was restored */
export interface SessionResumedMessage {
  type: 'SESSION_RESUMED';
  sessionId: string;
  resumedFromIndex: number;
  timestamp: number;
}

/** Cipher metrics from tracker */
export interface CipherMetricsMessage {
  type: 'CIPHER_METRICS';
  metrics: BehavioralMetrics;
  timestamp: number;
}

/** Session was restored by cipher tracker */
export interface CipherSessionRestoredMessage {
  type: 'CIPHER_SESSION_RESTORED';
  questionIndex: number;
  sessionId: string;
  timestamp: number;
}

/** Union type for all survey-to-parent messages */
export type SurveyToParentMessage =
  | SurveyReadyMessage
  | SurveyCompleteMessage
  | MetricsUpdateMessage
  | QuestionAnsweredMessage
  | PageChangeMessage
  | SessionResumedMessage
  | CipherMetricsMessage
  | CipherSessionRestoredMessage;

// ============================================
// MESSAGE TYPES: Parent → Survey
// ============================================

/** Updated cipher settings to apply */
export interface SettingsUpdateMessage {
  type: 'SETTINGS_UPDATE';
  settings: CipherSettings;
  timestamp: number;
}

/** Request current metrics immediately */
export interface RequestMetricsMessage {
  type: 'REQUEST_METRICS';
  timestamp: number;
}

/** Force terminate the survey session */
export interface TerminateSessionMessage {
  type: 'TERMINATE_SESSION';
  reason: string;
  timestamp: number;
}

/** Sync survey state (for resumption) */
export interface SyncStateMessage {
  type: 'SYNC_STATE';
  state: SurveyState;
  timestamp: number;
}

/** Hot update for preview mode */
export interface HotUpdateMessage {
  type: 'hot-update';
  code: string;
  timestamp: number;
}

/** Union type for all parent-to-survey messages */
export type ParentToSurveyMessage =
  | SettingsUpdateMessage
  | RequestMetricsMessage
  | TerminateSessionMessage
  | SyncStateMessage
  | HotUpdateMessage;

// ============================================
// SHARED TYPES
// ============================================

/** Cipher configuration settings */
export interface CipherSettings {
  enabled: boolean;
  tier: CipherTier;
  sessionResume?: boolean;
  resumeWindowHours?: number;
  flagThreshold?: number;
  blockThreshold?: number;
  advancedChecks?: Record<string, boolean>;
}

/** Current survey state for syncing */
export interface SurveyState {
  currentPage: number;
  currentQuestionIndex: number;
  responses: Record<string, any>;
  startedAt: number;
  lastActiveAt: number;
}

// ============================================
// BROADCAST CHANNEL MESSAGES
// ============================================

/** Settings changed in dashboard, broadcast to open surveys */
export interface CipherSettingsChangedMessage {
  type: 'CIPHER_SETTINGS_UPDATE';
  projectId: string;
  settings: CipherSettings;
  timestamp: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a survey-to-parent message with automatic timestamp
 */
export function createSurveyMessage<T extends SurveyToParentMessage['type']>(
  type: T,
  data: Omit<Extract<SurveyToParentMessage, { type: T }>, 'type' | 'timestamp'>
): Extract<SurveyToParentMessage, { type: T }> {
  return {
    type,
    timestamp: Date.now(),
    ...data,
  } as Extract<SurveyToParentMessage, { type: T }>;
}

/**
 * Create a parent-to-survey message with automatic timestamp
 */
export function createParentMessage<T extends ParentToSurveyMessage['type']>(
  type: T,
  data: Omit<Extract<ParentToSurveyMessage, { type: T }>, 'type' | 'timestamp'>
): Extract<ParentToSurveyMessage, { type: T }> {
  return {
    type,
    timestamp: Date.now(),
    ...data,
  } as Extract<ParentToSurveyMessage, { type: T }>;
}

/**
 * Type guard to check if a message is from survey
 */
export function isSurveyMessage(data: unknown): data is SurveyToParentMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as { type?: string };
  return [
    'SURVEY_READY',
    'SURVEY_COMPLETE',
    'METRICS_UPDATE',
    'QUESTION_ANSWERED',
    'PAGE_CHANGE',
    'SESSION_RESUMED',
    'CIPHER_METRICS',
    'CIPHER_SESSION_RESTORED',
  ].includes(msg.type || '');
}

/**
 * Type guard to check if a message is from parent
 */
export function isParentMessage(data: unknown): data is ParentToSurveyMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as { type?: string };
  return [
    'SETTINGS_UPDATE',
    'REQUEST_METRICS',
    'TERMINATE_SESSION',
    'SYNC_STATE',
    'hot-update',
  ].includes(msg.type || '');
}

/**
 * Get the BroadcastChannel name for a project
 */
export function getSurveyChannelName(projectId: string): string {
  return `survey-settings-${projectId}`;
}

/**
 * Create a BroadcastChannel for survey settings updates
 */
export function createSurveySettingsChannel(projectId: string): BroadcastChannel {
  return new BroadcastChannel(getSurveyChannelName(projectId));
}

/**
 * Broadcast cipher settings update to all open surveys
 */
export function broadcastSettingsUpdate(
  projectId: string,
  settings: CipherSettings
): void {
  const channel = createSurveySettingsChannel(projectId);
  const message: CipherSettingsChangedMessage = {
    type: 'CIPHER_SETTINGS_UPDATE',
    projectId,
    settings,
    timestamp: Date.now(),
  };
  channel.postMessage(message);
  channel.close();
}

/**
 * Subscribe to settings updates for a project
 */
export function subscribeToSettingsUpdates(
  projectId: string,
  callback: (settings: CipherSettings) => void
): () => void {
  const channel = createSurveySettingsChannel(projectId);

  const handler = (event: MessageEvent<CipherSettingsChangedMessage>) => {
    if (event.data?.type === 'CIPHER_SETTINGS_UPDATE') {
      callback(event.data.settings);
    }
  };

  channel.addEventListener('message', handler);

  // Return cleanup function
  return () => {
    channel.removeEventListener('message', handler);
    channel.close();
  };
}

/**
 * Post a message to the parent window (for use in iframe)
 */
export function postToParent(message: SurveyToParentMessage): void {
  try {
    window.parent.postMessage(message, '*');
  } catch (e) {
    console.warn('Failed to post message to parent:', e);
  }
}

/**
 * Post a message to an iframe (for use in parent)
 */
export function postToSurvey(
  iframe: HTMLIFrameElement,
  message: ParentToSurveyMessage
): void {
  try {
    iframe.contentWindow?.postMessage(message, '*');
  } catch (e) {
    console.warn('Failed to post message to survey iframe:', e);
  }
}
