import { supabase } from '@/lib/supabase';
import type { Project, ChatMessage } from '@/types/database';

export class ProjectsService {
  static async createProject(data: {
    title: string;
    description?: string;
    user_id: string;
  }): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert([{
          title: data.title,
          description: data.description,
          user_id: data.user_id,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getUserProjects(userId: string): Promise<{ data: Project[] | null; error: Error | null }> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { data: projects, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getProject(projectId: string, userId: string): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async updateProject(
    projectId: string, 
    userId: string, 
    updates: Partial<Pick<Project, 'title' | 'description' | 'status'>>
  ): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async deleteProject(projectId: string, userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async duplicateProject(projectId: string, userId: string): Promise<{ data: Project | null; error: Error | null }> {
    try {
      // First get the original project
      const { data: originalProject, error: fetchError } = await this.getProject(projectId, userId);
      if (fetchError || !originalProject) {
        throw fetchError || new Error('Project not found');
      }

      // Create a duplicate
      const { data: duplicatedProject, error: createError } = await this.createProject({
        title: `${originalProject.title} (Copy)`,
        description: originalProject.description,
        user_id: userId
      });

      if (createError) throw createError;
      return { data: duplicatedProject, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Chat messages for projects
  static async getProjectMessages(projectId: string, userId: string): Promise<{ data: ChatMessage[] | null; error: Error | null }> {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: messages, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async addProjectMessage(data: {
    project_id: string;
    user_id: string;
    content: string;
    is_user: boolean;
    metadata?: any;
  }): Promise<{ data: ChatMessage | null; error: Error | null }> {
    try {
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return { data: message, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getRecentChats(userId: string, limit = 10): Promise<{ data: Array<{
    id: string;
    title: string;
    projectId: string;
    timestamp: string;
  }> | null; error: Error | null }> {
    try {
      // Get recent chat messages with project info
      const { data: recentMessages, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          project_id,
          created_at,
          projects!inner (
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .eq('is_user', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const chats = recentMessages?.map(message => ({
        id: message.id,
        title: (message as any).projects.title,
        projectId: message.project_id,
        timestamp: message.created_at
      })) || [];

      return { data: chats, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}