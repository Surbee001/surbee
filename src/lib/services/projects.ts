import type { Project, ChatMessage } from '@/types/database';
import { supabase } from '@/lib/supabase-server';

export class ProjectsService {
  // Generate a custom project ID
  private static generateProjectId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `project_${timestamp}_${random}`;
  }

  static async createProject(data: {
    id?: string;
    title: string;
    description?: string;
    user_id: string;
  }): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const projectId = data.id || this.generateProjectId();

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          id: projectId,
          title: data.title,
          description: data.description || null,
          user_id: data.user_id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) return { data: null, error: error as any };
      return { data: project as Project, error: null };
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

      if (error) return { data: null, error: error as any };
      return { data: projects as Project[], error: null };
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

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return { data: null, error: error as any };
      }

      return { data: project as Project, error: null };
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return { data: null, error: error as any };
      }

      return { data: project as Project, error: null };
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

      if (error) return { error: error as any };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async duplicateProject(projectId: string, userId: string): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const { data: originalProject, error: fetchError } = await this.getProject(projectId, userId);
      if (fetchError || !originalProject) {
        throw fetchError || new Error('Project not found');
      }

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

  static async getProjectMessages(projectId: string, userId: string): Promise<{ data: ChatMessage[] | null; error: Error | null }> {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) return { data: null, error: error as any };
      return { data: messages as ChatMessage[], error: null };
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
        .insert({
          project_id: data.project_id,
          user_id: data.user_id,
          content: data.content,
          role: data.is_user ? 'user' : 'assistant',
        })
        .select()
        .single();

      if (error) return { data: null, error: error as any };
      return { data: message as ChatMessage, error: null };
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
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, project_id, created_at')
        .eq('user_id', userId)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      if (messagesError) return { data: null, error: messagesError as any };

      const projectIds = [...new Set((messages || []).map(m => m.project_id))];

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title')
        .in('id', projectIds);

      if (projectsError) return { data: null, error: projectsError as any };

      const projectMap = new Map(projects?.map(p => [p.id, p.title]) || []);

      const chats = projectIds
        .slice(0, limit)
        .map((projectId) => {
          const msg = messages?.find(m => m.project_id === projectId);
          return {
            id: msg?.id || projectId,
            title: projectMap.get(projectId) || 'Untitled Project',
            projectId,
            timestamp: msg?.created_at || new Date().toISOString()
          };
        });

      return { data: chats, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async publishProject(
    projectId: string,
    userId: string,
    surveySchema?: any
  ): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const random = Math.random().toString(36).substring(2, 8);
      const publishedUrl = `${projectId.substring(0, 8)}_${random}`;

      const { data: project, error } = await supabase
        .from('projects')
        .update({
          status: 'published',
          published_url: publishedUrl,
          published_at: new Date().toISOString(),
          survey_schema: surveySchema,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return { data: null, error: error as any };
      return { data: project as Project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getPublishedProject(publishedUrl: string): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published_url', publishedUrl)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return { data: null, error: error as any };
      }

      return { data: project as Project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async updateSurveySchema(
    projectId: string,
    userId: string,
    surveySchema: any
  ): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .update({
          survey_schema: surveySchema,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return { data: null, error: error as any };
      }

      return { data: project as Project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
