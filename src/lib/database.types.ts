export interface Database {
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
          metadata: any
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          user_id: string
          content: string
          is_user: boolean
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
          options: string[] | null
          required: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          question_text: string
          question_type: 'multiple_choice' | 'text_input' | 'rating' | 'yes_no'
          order_index: number
          options?: string[] | null
          required?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          question_text?: string
          question_type?: 'multiple_choice' | 'text_input' | 'rating' | 'yes_no'
          order_index?: number
          options?: string[] | null
          required?: boolean
        }
      }
    }
  }
} 