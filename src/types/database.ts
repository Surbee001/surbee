export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  user_id: string;
  status: 'draft' | 'published' | 'archived';
}

export interface ChatMessage {
  id: string;
  created_at: string;
  project_id: string;
  user_id: string;
  content: string;
  is_user: boolean;
  metadata?: any;
}

export interface SurveyQuestion {
  id: string;
  created_at: string;
  project_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'text_input' | 'rating' | 'yes_no';
  order_index: number;
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  id: string;
  created_at: string;
  survey_id: string;
  user_id?: string;
  responses: Record<string, any>;
  mouse_data?: any;
  keystroke_data?: any;
  timing_data?: any;
  device_data?: any;
  fraud_score?: number;
  is_flagged?: boolean;
  flag_reasons?: string[];
  respondent_id?: string;
  completed_at: string;
}

export interface AIFeedback {
  id: string;
  created_at: string;
  project_id?: string;
  user_id?: string;
  message_id: string;
  kind: 'copy' | 'thumbs_up' | 'thumbs_down' | 'retry';
}

export interface Checkpoint {
  id: string;
  created_at: string;
  project_id?: string;
  user_id?: string;
  snapshot: any;
}