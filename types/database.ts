export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          user_id: string
          status: 'draft' | 'published' | 'archived'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          user_id: string
          status?: 'draft' | 'published' | 'archived'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          user_id?: string
          status?: 'draft' | 'published' | 'archived'
        }
      }
      chat_messages: {
        Row: {
          id: string
          created_at: string
          project_id: string
          user_id: string
          content: string
          is_user: boolean
          metadata?: any
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          user_id: string
          content: string
          is_user?: boolean
          metadata?: any
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          content?: string
          is_user?: boolean
          metadata?: any
        }
      }
      survey_questions: {
        Row: {
          id: string
          created_at: string
          project_id: string
          question_text: string
          question_type: 'multiple_choice' | 'text_input' | 'rating' | 'yes_no'
          order_index: number
          options?: string[]
          required: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          question_text: string
          question_type?: 'multiple_choice' | 'text_input' | 'rating' | 'yes_no'
          order_index?: number
          options?: string[]
          required?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          question_text?: string
          question_type?: 'multiple_choice' | 'text_input' | 'rating' | 'yes_no'
          order_index?: number
          options?: string[]
          required?: boolean
        }
      }
      survey_responses: {
        Row: {
          id: string
          created_at: string
          survey_id: string
          user_id?: string
          responses: Record<string, any>
          mouse_data?: any
          keystroke_data?: any
          timing_data?: any
          device_data?: any
          fraud_score?: number
          is_flagged?: boolean
          flag_reasons?: string[]
          respondent_id?: string
          completed_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          survey_id: string
          user_id?: string
          responses: Record<string, any>
          mouse_data?: any
          keystroke_data?: any
          timing_data?: any
          device_data?: any
          fraud_score?: number
          is_flagged?: boolean
          flag_reasons?: string[]
          respondent_id?: string
          completed_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          survey_id?: string
          user_id?: string
          responses?: Record<string, any>
          mouse_data?: any
          keystroke_data?: any
          timing_data?: any
          device_data?: any
          fraud_score?: number
          is_flagged?: boolean
          flag_reasons?: string[]
          respondent_id?: string
          completed_at?: string
        }
      }
      ai_feedback: {
        Row: {
          id: string
          created_at: string
          project_id?: string
          user_id?: string
          message_id: string
          kind: 'copy' | 'thumbs_up' | 'thumbs_down' | 'retry'
        }
        Insert: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          message_id: string
          kind?: 'copy' | 'thumbs_up' | 'thumbs_down' | 'retry'
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          message_id?: string
          kind?: 'copy' | 'thumbs_up' | 'thumbs_down' | 'retry'
        }
      }
      checkpoints: {
        Row: {
          id: string
          created_at: string
          project_id?: string
          user_id?: string
          snapshot: any
        }
        Insert: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          snapshot: any
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          snapshot?: any
        }
      }
    }
  }
}
