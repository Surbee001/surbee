import type { Project, ChatMessage } from '@/types/database';

// In-memory storage for projects (replaces Supabase)
const projectsStore = new Map<string, Project>();
const messagesStore = new Map<string, ChatMessage[]>();

export class ProjectsService {
  static async createProject(data: {
    title: string;
    description?: string;
    user_id: string;
  }): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const project: Project = {
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: data.title,
        description: data.description,
        user_id: data.user_id,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      projectsStore.set(project.id, project);
      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getUserProjects(userId: string): Promise<{ data: Project[] | null; error: Error | null }> {
    try {
      const projects = Array.from(projectsStore.values())
        .filter(p => p.user_id === userId)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      return { data: projects, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getProject(projectId: string, userId: string): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const project = projectsStore.get(projectId);

      if (!project || project.user_id !== userId) {
        return { data: null, error: null };
      }

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
      const project = projectsStore.get(projectId);

      if (!project || project.user_id !== userId) {
        return { data: null, error: null };
      }

      const updatedProject = {
        ...project,
        ...updates,
        updated_at: new Date().toISOString()
      };

      projectsStore.set(projectId, updatedProject);
      return { data: updatedProject, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async deleteProject(projectId: string, userId: string): Promise<{ error: Error | null }> {
    try {
      const project = projectsStore.get(projectId);

      if (!project || project.user_id !== userId) {
        return { error: new Error('Project not found') };
      }

      projectsStore.delete(projectId);
      messagesStore.delete(projectId);
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
      const messages = messagesStore.get(projectId) || [];
      const userMessages = messages.filter(m => m.user_id === userId);
      return { data: userMessages, error: null };
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
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        project_id: data.project_id,
        user_id: data.user_id,
        content: data.content,
        is_user: data.is_user,
        metadata: data.metadata,
        created_at: new Date().toISOString()
      };

      const projectMessages = messagesStore.get(data.project_id) || [];
      projectMessages.push(message);
      messagesStore.set(data.project_id, projectMessages);

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
      // Get all messages for the user
      const allMessages: Array<{message: ChatMessage, projectTitle: string}> = [];

      for (const [projectId, messages] of messagesStore.entries()) {
        const project = projectsStore.get(projectId);
        if (!project || project.user_id !== userId) continue;

        const userMessages = messages.filter(m => m.user_id === userId && m.is_user);
        userMessages.forEach(msg => {
          allMessages.push({
            message: msg,
            projectTitle: project.title
          });
        });
      }

      // Sort by timestamp and take the most recent
      const sortedMessages = allMessages
        .sort((a, b) => new Date(b.message.created_at).getTime() - new Date(a.message.created_at).getTime())
        .slice(0, limit);

      const chats = sortedMessages.map(({ message, projectTitle }) => ({
        id: message.id,
        title: projectTitle,
        projectId: message.project_id,
        timestamp: message.created_at
      }));

      return { data: chats, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}