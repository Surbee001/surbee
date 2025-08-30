import { supabase } from './supabase'
import type { Database } from './database.types'

type Project = Database['public']['Tables']['projects']['Row']
type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type SurveyQuestion = Database['public']['Tables']['survey_questions']['Row']

export async function createProject(userId: string, title: string, description?: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title,
      description,
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return null
  }

  return data
}

export async function getProject(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data
}

export async function saveChatMessage(
  projectId: string, 
  userId: string, 
  content: string, 
  isUser: boolean,
  metadata?: any
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      project_id: projectId,
      user_id: userId,
      content,
      is_user: isUser,
      metadata
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving chat message:', error)
    return null
  }

  return data
}

export async function getChatMessages(projectId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching chat messages:', error)
    return []
  }

  return data || []
}

export async function saveSurveyQuestion(
  projectId: string,
  questionText: string,
  questionType: 'multiple_choice' | 'text_input' | 'rating' | 'yes_no',
  orderIndex: number,
  options?: string[],
  required: boolean = false
): Promise<SurveyQuestion | null> {
  const { data, error } = await supabase
    .from('survey_questions')
    .insert({
      project_id: projectId,
      question_text: questionText,
      question_type: questionType,
      order_index: orderIndex,
      options,
      required
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving survey question:', error)
    return null
  }

  return data
}

export async function getSurveyQuestions(projectId: string): Promise<SurveyQuestion[]> {
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching survey questions:', error)
    return []
  }

  return data || []
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return null
  }

  return data
} 

// ---- AI Feedback & Checkpoints (tables must exist in Supabase) ----
export async function recordAIFeedback(projectId: string | null, messageId: string, kind: 'copy' | 'thumbs_up' | 'thumbs_down' | 'retry') {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('ai_feedback')
      .insert({ project_id: projectId, message_id: messageId, kind, user_id: user?.id || null })
    if (error) console.warn('recordAIFeedback error:', error.message)
  } catch (e) {
    console.warn('recordAIFeedback failed:', e)
  }
}

export async function saveCheckpoint(projectId: string, checkpoint: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('checkpoints')
      .insert({ project_id: projectId, snapshot: checkpoint, user_id: user?.id || null })
    if (error) console.warn('saveCheckpoint error:', error.message)
  } catch (e) {
    console.warn('saveCheckpoint failed:', e)
  }
}

export async function listCheckpoints(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('checkpoints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (error) {
      console.warn('listCheckpoints error:', error.message)
      return []
    }
    return data || []
  } catch (e) {
    console.warn('listCheckpoints failed:', e)
    return []
  }
}