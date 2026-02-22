/**
 * Contradiction Detection
 *
 * Detects inconsistent answers within a single survey response.
 * Flags responses where the user contradicts themselves.
 *
 * Detection Types:
 * 1. Direct contradictions (same question, different phrasing)
 * 2. Logical contradictions (incompatible answers)
 * 3. Semantic contradictions (conflicting sentiments)
 */

import type { CipherFeatures } from './types';

export interface ContradictionResult {
  hasContradictions: boolean;
  contradictions: Contradiction[];
  score: number; // 0-1, higher = more contradictions
  confidence: number;
}

export interface Contradiction {
  type: 'direct' | 'logical' | 'semantic' | 'temporal';
  questionIds: string[];
  answers: string[];
  reason: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface QuestionPair {
  q1Id: string;
  q2Id: string;
  relationshipType: 'same_topic' | 'opposite' | 'prerequisite' | 'temporal';
  checkFn: (a1: string, a2: string) => ContradictionCheck | null;
}

interface ContradictionCheck {
  isContradiction: boolean;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

/**
 * Common contradiction patterns for Likert scales
 */
const LIKERT_OPPOSITES: Record<string, string[]> = {
  'strongly agree': ['strongly disagree', 'disagree'],
  'agree': ['strongly disagree'],
  'strongly disagree': ['strongly agree', 'agree'],
  'disagree': ['strongly agree'],
  'very satisfied': ['very dissatisfied', 'dissatisfied'],
  'satisfied': ['very dissatisfied'],
  'very dissatisfied': ['very satisfied', 'satisfied'],
  'dissatisfied': ['very satisfied'],
  'always': ['never'],
  'never': ['always', 'usually'],
  'usually': ['never'],
  'very likely': ['very unlikely', 'unlikely'],
  'likely': ['very unlikely'],
  'very unlikely': ['very likely', 'likely'],
  'unlikely': ['very likely'],
  'excellent': ['poor', 'very poor'],
  'good': ['very poor'],
  'poor': ['excellent', 'good'],
  'very poor': ['excellent', 'good'],
};

/**
 * Sentiment keywords for semantic analysis
 */
const POSITIVE_KEYWORDS = new Set([
  'love', 'like', 'enjoy', 'great', 'good', 'best', 'happy', 'satisfied',
  'excellent', 'amazing', 'wonderful', 'fantastic', 'prefer', 'favorite',
  'recommend', 'positive', 'pleased', 'impressed', 'delighted',
]);

const NEGATIVE_KEYWORDS = new Set([
  'hate', 'dislike', 'terrible', 'bad', 'worst', 'unhappy', 'dissatisfied',
  'poor', 'awful', 'horrible', 'avoid', 'never', 'negative', 'disappointed',
  'frustrated', 'annoyed', 'angry', 'upset', 'regret',
]);

/**
 * Detect contradictions in survey responses
 */
export function detectContradictions(
  responses: Record<string, any>,
  questionMetadata?: QuestionMetadata[],
): ContradictionResult {
  const contradictions: Contradiction[] = [];

  // Get all question-answer pairs
  const answers = Object.entries(responses);

  // 1. Check for direct Likert scale contradictions
  for (let i = 0; i < answers.length; i++) {
    for (let j = i + 1; j < answers.length; j++) {
      const [q1Id, a1] = answers[i];
      const [q2Id, a2] = answers[j];

      // Skip non-string answers (like arrays for multi-select)
      if (typeof a1 !== 'string' || typeof a2 !== 'string') continue;

      const a1Lower = a1.toLowerCase().trim();
      const a2Lower = a2.toLowerCase().trim();

      // Check if same Likert response given to opposite questions
      const likertCheck = checkLikertContradiction(a1Lower, a2Lower, q1Id, q2Id, questionMetadata);
      if (likertCheck) {
        contradictions.push(likertCheck);
      }
    }
  }

  // 2. Check for semantic contradictions in open-ended responses
  const openEndedPairs = answers.filter(([_, v]) => typeof v === 'string' && v.length > 30);
  for (let i = 0; i < openEndedPairs.length; i++) {
    for (let j = i + 1; j < openEndedPairs.length; j++) {
      const [q1Id, a1] = openEndedPairs[i];
      const [q2Id, a2] = openEndedPairs[j];

      const semanticCheck = checkSemanticContradiction(
        a1 as string,
        a2 as string,
        q1Id,
        q2Id,
        questionMetadata,
      );
      if (semanticCheck) {
        contradictions.push(semanticCheck);
      }
    }
  }

  // 3. Check for temporal contradictions (if metadata indicates related questions)
  if (questionMetadata) {
    const temporalChecks = checkTemporalContradictions(responses, questionMetadata);
    contradictions.push(...temporalChecks);
  }

  // 4. Check for logical contradictions based on question relationships
  if (questionMetadata) {
    const logicalChecks = checkLogicalContradictions(responses, questionMetadata);
    contradictions.push(...logicalChecks);
  }

  // Calculate overall contradiction score
  const score = calculateContradictionScore(contradictions);

  return {
    hasContradictions: contradictions.length > 0,
    contradictions,
    score,
    confidence: contradictions.length > 0
      ? contradictions.reduce((sum, c) => sum + c.confidence, 0) / contradictions.length
      : 1.0,
  };
}

/**
 * Check if two Likert-scale answers contradict each other
 */
function checkLikertContradiction(
  a1: string,
  a2: string,
  q1Id: string,
  q2Id: string,
  metadata?: QuestionMetadata[],
): Contradiction | null {
  // Only check if questions are marked as related opposites
  if (metadata) {
    const q1Meta = metadata.find(q => q.id === q1Id);
    const q2Meta = metadata.find(q => q.id === q2Id);

    // Check if questions are marked as related
    const isRelated = q1Meta?.relatedQuestions?.includes(q2Id) ||
                     q2Meta?.relatedQuestions?.includes(q1Id);

    if (!isRelated) return null;
  }

  // Check for direct opposite answers
  const opposites = LIKERT_OPPOSITES[a1];
  if (opposites && opposites.includes(a2)) {
    return {
      type: 'direct',
      questionIds: [q1Id, q2Id],
      answers: [a1, a2],
      reason: `Contradictory Likert responses: "${a1}" vs "${a2}"`,
      severity: 'high',
      confidence: 0.9,
    };
  }

  return null;
}

/**
 * Check for semantic contradictions using sentiment analysis
 */
function checkSemanticContradiction(
  a1: string,
  a2: string,
  q1Id: string,
  q2Id: string,
  metadata?: QuestionMetadata[],
): Contradiction | null {
  // Only check if questions are about the same topic
  if (metadata) {
    const q1Meta = metadata.find(q => q.id === q1Id);
    const q2Meta = metadata.find(q => q.id === q2Id);

    if (q1Meta?.topic && q2Meta?.topic && q1Meta.topic !== q2Meta.topic) {
      return null; // Different topics, can't contradict
    }
  }

  const sentiment1 = analyzeSentiment(a1);
  const sentiment2 = analyzeSentiment(a2);

  // Check for strong opposite sentiments
  if (
    (sentiment1.score > 0.5 && sentiment2.score < -0.5) ||
    (sentiment1.score < -0.5 && sentiment2.score > 0.5)
  ) {
    // Look for common topic words
    const words1 = new Set(a1.toLowerCase().split(/\s+/));
    const words2 = new Set(a2.toLowerCase().split(/\s+/));
    const commonWords = [...words1].filter(w => words2.has(w) && w.length > 4);

    if (commonWords.length > 0) {
      return {
        type: 'semantic',
        questionIds: [q1Id, q2Id],
        answers: [truncateText(a1, 100), truncateText(a2, 100)],
        reason: `Opposing sentiments about: ${commonWords.slice(0, 3).join(', ')}`,
        severity: 'medium',
        confidence: Math.min(Math.abs(sentiment1.score), Math.abs(sentiment2.score)),
      };
    }
  }

  return null;
}

/**
 * Simple sentiment analyzer
 */
function analyzeSentiment(text: string): { score: number; positive: number; negative: number } {
  const words = text.toLowerCase().split(/\s+/);
  let positive = 0;
  let negative = 0;

  for (const word of words) {
    if (POSITIVE_KEYWORDS.has(word)) positive++;
    if (NEGATIVE_KEYWORDS.has(word)) negative++;
  }

  const total = positive + negative;
  const score = total > 0 ? (positive - negative) / total : 0;

  return { score, positive, negative };
}

/**
 * Check for temporal contradictions
 * E.g., "I started using this product 2 years ago" vs "I've never used this product"
 */
function checkTemporalContradictions(
  responses: Record<string, any>,
  metadata: QuestionMetadata[],
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Group questions by temporal relationship
  const temporalPairs = metadata.filter(q => q.temporalRelation);

  for (const q1 of temporalPairs) {
    const related = metadata.filter(q =>
      q.temporalRelation === q1.temporalRelation &&
      q.id !== q1.id
    );

    for (const q2 of related) {
      const a1 = responses[q1.id];
      const a2 = responses[q2.id];

      if (!a1 || !a2) continue;

      // Check for "never" contradictions
      const a1Str = String(a1).toLowerCase();
      const a2Str = String(a2).toLowerCase();

      if (
        (a1Str.includes('never') && hasTimeReference(a2Str)) ||
        (a2Str.includes('never') && hasTimeReference(a1Str))
      ) {
        contradictions.push({
          type: 'temporal',
          questionIds: [q1.id, q2.id],
          answers: [String(a1), String(a2)],
          reason: 'Temporal contradiction: "never" conflicts with time reference',
          severity: 'high',
          confidence: 0.85,
        });
      }
    }
  }

  return contradictions;
}

/**
 * Check if text contains a time reference
 */
function hasTimeReference(text: string): boolean {
  const timePatterns = [
    /\d+\s*(year|month|week|day|hour)/i,
    /\b(yesterday|today|tomorrow|recently|ago|since|before|after)\b/i,
    /\b(daily|weekly|monthly|yearly|annually)\b/i,
    /\b(often|sometimes|rarely|frequently|regularly)\b/i,
  ];

  return timePatterns.some(pattern => pattern.test(text));
}

/**
 * Check for logical contradictions based on prerequisite questions
 */
function checkLogicalContradictions(
  responses: Record<string, any>,
  metadata: QuestionMetadata[],
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  for (const q of metadata) {
    if (!q.prerequisite) continue;

    const prerequisiteAnswer = responses[q.prerequisite.questionId];
    const currentAnswer = responses[q.id];

    if (!prerequisiteAnswer || !currentAnswer) continue;

    // Check if prerequisite condition is violated
    const prereqValue = String(prerequisiteAnswer).toLowerCase();
    const expected = q.prerequisite.expectedValue.toLowerCase();

    if (prereqValue === expected && q.prerequisite.type === 'exclude') {
      // Should not have answered this question
      contradictions.push({
        type: 'logical',
        questionIds: [q.prerequisite.questionId, q.id],
        answers: [String(prerequisiteAnswer), String(currentAnswer)],
        reason: `Answered question that should have been skipped based on "${prereqValue}"`,
        severity: 'medium',
        confidence: 0.75,
      });
    }
  }

  return contradictions;
}

/**
 * Calculate overall contradiction score (0-1)
 */
function calculateContradictionScore(contradictions: Contradiction[]): number {
  if (contradictions.length === 0) return 0;

  // Weight by severity
  const severityWeights = { low: 0.2, medium: 0.5, high: 1.0 };

  let totalWeight = 0;
  for (const c of contradictions) {
    totalWeight += severityWeights[c.severity] * c.confidence;
  }

  // Normalize to 0-1 (cap at 3 high-severity contradictions = 1.0)
  return Math.min(totalWeight / 3, 1.0);
}

/**
 * Truncate text for display
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Question metadata for advanced contradiction detection
 */
export interface QuestionMetadata {
  id: string;
  topic?: string;
  relatedQuestions?: string[];
  temporalRelation?: string; // Group ID for temporal-related questions
  prerequisite?: {
    questionId: string;
    expectedValue: string;
    type: 'require' | 'exclude';
  };
  contradictionPairs?: Array<{
    questionId: string;
    contradictoryAnswers: Array<[string, string]>; // [thisAnswer, otherAnswer]
  }>;
}

/**
 * Build question metadata from survey definition
 */
export function buildQuestionMetadata(surveyDefinition: any): QuestionMetadata[] {
  const metadata: QuestionMetadata[] = [];

  if (!surveyDefinition?.questions) return metadata;

  for (const question of surveyDefinition.questions) {
    const meta: QuestionMetadata = {
      id: question.id,
    };

    // Extract topic from question text (simple keyword extraction)
    if (question.title) {
      const keywords = extractTopicKeywords(question.title);
      if (keywords.length > 0) {
        meta.topic = keywords[0];
      }
    }

    // Check for explicit related questions in settings
    if (question.settings?.relatedQuestions) {
      meta.relatedQuestions = question.settings.relatedQuestions;
    }

    // Check for attention check pairs (consistency checks)
    if (question.settings?.consistencyCheckFor) {
      meta.relatedQuestions = meta.relatedQuestions || [];
      meta.relatedQuestions.push(question.settings.consistencyCheckFor);
    }

    // Check for skip logic that implies prerequisites
    if (question.settings?.showIf) {
      const condition = question.settings.showIf;
      meta.prerequisite = {
        questionId: condition.questionId,
        expectedValue: condition.value,
        type: condition.operator === '!=' ? 'exclude' : 'require',
      };
    }

    metadata.push(meta);
  }

  return metadata;
}

/**
 * Extract topic keywords from question text
 */
function extractTopicKeywords(text: string): string[] {
  // Remove common words and extract nouns
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
    'because', 'until', 'while', 'about', 'against', 'which', 'who',
    'what', 'your', 'you', 'we', 'they', 'it', 'its', 'this', 'that',
    'these', 'those', 'i', 'me', 'my', 'myself', 'our', 'ours', 'please',
    'rate', 'rating', 'describe', 'think', 'feel', 'agree', 'disagree',
    'much', 'many', 'would', 'like', 'likely', 'often', 'how', 'overall',
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  return words;
}

/**
 * Update CipherFeatures with contradiction score
 */
export function updateFeaturesWithContradictions(
  features: Partial<CipherFeatures>,
  contradictionResult: ContradictionResult,
): Partial<CipherFeatures> {
  return {
    ...features,
    consistencyCheckScore: 1 - contradictionResult.score,
  };
}
