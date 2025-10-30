export interface User {
  fullname: string;
  avatarUrl: string;
  name: string;
  isLocalUse?: boolean;
  isPro: boolean;
  id: string;
  token?: string;
}

export interface HtmlHistory {
  html: string;
  createdAt: Date;
  prompt: string;
}

export interface Project {
  title: string;
  html: string;
  prompts: string[];
  user_id: string;
  space_id: string;
  _id?: string;
  _updatedAt?: Date;
  _createdAt?: Date;
}

export interface DeepSiteState {
  html: string;
  htmlHistory: HtmlHistory[];
  prompts: string[];
  isAiWorking: boolean;
  isThinking: boolean;
  provider: string;
  model: string;
  controller: AbortController | null;
  previousPrompt: string;
}

export interface AIProvider {
  name: string;
  max_tokens: number;
  id: string;
}

export interface AIModel {
  value: string;
  label: string;
  providers: string[];
  autoProvider: string;
  isThinker?: boolean;
  isNew?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface DeepSiteConfig {
  defaultHtml: string;
  maxRequestsPerIp: number;
  searchStart: string;
  divider: string;
  replaceEnd: string;
  initialSystemPrompt: string;
  followUpSystemPrompt: string;
}
