/**
 * Surbee SDK
 * Official SDK for AI-powered survey generation
 *
 * @packageDocumentation
 */

export { SurbeeClient, createClient } from './client';
export * from './types';
export * from './tools';
export * from './providers';
export * as prompts from './prompts';

// Re-export commonly used types
export type {
  SurveySpec,
  QuestionBlock,
  GenerateOptions,
  GenerateResult,
  AccuracyScore,
  SurbeeConfig,
} from './types';
