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
  preview_image_url?: string;
  last_preview_generated_at?: Date;
  response_count?: number;
}
