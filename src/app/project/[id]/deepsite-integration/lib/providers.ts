import { AIProvider, AIModel } from '../types';

// Provider configuration for OpenAI
export const PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: "OpenAI",
    max_tokens: 8192,
    id: "openai",
  },
};

// Model options
export const MODELS: AIModel[] = [
  {
    value: "gpt-5",
    label: "GPT-5",
    providers: ["openai"],
    autoProvider: "openai",
  },
  {
    value: "gpt-4.1",
    label: "GPT-4.1",
    providers: ["openai"],
    autoProvider: "openai",
  },
];

// Default model selection
export const DEFAULT_MODEL = MODELS[0].value;
export const DEFAULT_PROVIDER = "openai";

// OpenAI configuration (for completeness)
export const DEEPSEEK_CONFIG = {
  baseURL: "https://api.openai.com/v1",
  model: DEFAULT_MODEL,
  maxTokens: 8192,
};
