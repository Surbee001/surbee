import type { Project, ChatMessage } from '@/types/database';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export class ProjectsService {
  static async createProject(data: {
    title: string;
    description?: string;
    user_id: string;
  }): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const db = await getDb();
      const now = new Date().toISOString();

      const projectData = {
        title: data.title,
        description: data.description || null,
        user_id: data.user_id,
        status: 'draft' as const,
        created_at: now,
        updated_at: now
      };

      const result = await db.collection('projects').insertOne(projectData);

      const project: Project = {
        id: result.insertedId.toString(),
        ...projectData
      };

      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getUserProjects(userId: string): Promise<{ data: Project[] | null; error: Error | null }> {
    try {
      const db = await getDb();
      const projects = await db.collection('projects')
        .find({ user_id: userId })
        .sort({ updated_at: -1 })
        .toArray();

      const mappedProjects = projects.map(p => ({
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        user_id: p.user_id,
        status: p.status,
        created_at: p.created_at,
        updated_at: p.updated_at,
        survey_schema: p.survey_schema,
        published_url: p.published_url,
        published_at: p.published_at
      } as Project));

      return { data: mappedProjects, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getProject(projectId: string, userId: string): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const db = await getDb();
      const project = await db.collection('projects').findOne({
        _id: new ObjectId(projectId),
        user_id: userId
      });

      if (!project) {
        return { data: null, error: null };
      }

      const mappedProject: Project = {
        id: project._id.toString(),
        title: project.title,
        description: project.description,
        user_id: project.user_id,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        survey_schema: project.survey_schema,
        published_url: project.published_url,
        published_at: project.published_at
      };

      return { data: mappedProject, error: null };
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
      const db = await getDb();
      const result = await db.collection('projects').findOneAndUpdate(
        { _id: new ObjectId(projectId), user_id: userId },
        {
          $set: {
            ...updates,
            updated_at: new Date().toISOString()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        return { data: null, error: null };
      }

      const mappedProject: Project = {
        id: result.value._id.toString(),
        title: result.value.title,
        description: result.value.description,
        user_id: result.value.user_id,
        status: result.value.status,
        created_at: result.value.created_at,
        updated_at: result.value.updated_at,
        survey_schema: result.value.survey_schema,
        published_url: result.value.published_url,
        published_at: result.value.published_at
      };

      return { data: mappedProject, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async deleteProject(projectId: string, userId: string): Promise<{ error: Error | null }> {
    try {
      const db = await getDb();
      const result = await db.collection('projects').deleteOne({
        _id: new ObjectId(projectId),
        user_id: userId
      });

      if (result.deletedCount === 0) {
        return { error: new Error('Project not found') };
      }

      // Also delete associated messages
      await db.collection('chat_messages').deleteMany({
        project_id: projectId,
        user_id: userId
      });

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
      const db = await getDb();
      const messages = await db.collection('chat_messages')
        .find({ project_id: projectId, user_id: userId })
        .sort({ created_at: 1 })
        .toArray();

      const mappedMessages = messages.map(m => ({
        id: m._id.toString(),
        project_id: m.project_id,
        user_id: m.user_id,
        content: m.content,
        is_user: m.is_user,
        metadata: m.metadata,
        created_at: m.created_at
      } as ChatMessage));

      return { data: mappedMessages, error: null };
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
      const db = await getDb();
      const messageData = {
        project_id: data.project_id,
        user_id: data.user_id,
        content: data.content,
        is_user: data.is_user,
        metadata: data.metadata,
        created_at: new Date().toISOString()
      };

      const result = await db.collection('chat_messages').insertOne(messageData);

      const message: ChatMessage = {
        id: result.insertedId.toString(),
        ...messageData
      };

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
      const db = await getDb();

      const messages = await db.collection('chat_messages')
        .find({ user_id: userId, is_user: true })
        .sort({ created_at: -1 })
        .limit(limit * 2)
        .toArray();

      const projectIds = [...new Set(messages.map(m => m.project_id))];
      const projects = await db.collection('projects')
        .find({ _id: { $in: projectIds.map(id => new ObjectId(id)) } })
        .toArray();

      const projectMap = new Map(projects.map(p => [p._id.toString(), p.title]));

      const chats = projectIds
        .slice(0, limit)
        .map(projectId => {
          const msg = messages.find(m => m.project_id === projectId);
          return {
            id: msg?._id.toString() || projectId,
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
      const db = await getDb();
      const random = Math.random().toString(36).substr(2, 6);
      const publishedUrl = projectId + '_' + random;

      const result = await db.collection('projects').findOneAndUpdate(
        { _id: new ObjectId(projectId), user_id: userId },
        {
          $set: {
            status: 'published',
            published_url: publishedUrl,
            published_at: new Date().toISOString(),
            survey_schema: surveySchema,
            updated_at: new Date().toISOString()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        return { data: null, error: new Error('Project not found') };
      }

      const mappedProject: Project = {
        id: result.value._id.toString(),
        title: result.value.title,
        description: result.value.description,
        user_id: result.value.user_id,
        status: result.value.status,
        created_at: result.value.created_at,
        updated_at: result.value.updated_at,
        survey_schema: result.value.survey_schema,
        published_url: result.value.published_url,
        published_at: result.value.published_at
      };

      return { data: mappedProject, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getPublishedProject(publishedUrl: string): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const db = await getDb();
      const project = await db.collection('projects').findOne({
        published_url: publishedUrl,
        status: 'published'
      });

      if (!project) {
        return { data: null, error: null };
      }

      const mappedProject: Project = {
        id: project._id.toString(),
        title: project.title,
        description: project.description,
        user_id: project.user_id,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        survey_schema: project.survey_schema,
        published_url: project.published_url,
        published_at: project.published_at
      };

      return { data: mappedProject, error: null };
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
      const db = await getDb();
      const result = await db.collection('projects').findOneAndUpdate(
        { _id: new ObjectId(projectId), user_id: userId },
        {
          $set: {
            survey_schema: surveySchema,
            updated_at: new Date().toISOString()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        return { data: null, error: null };
      }

      const mappedProject: Project = {
        id: result.value._id.toString(),
        title: result.value.title,
        description: result.value.description,
        user_id: result.value.user_id,
        status: result.value.status,
        created_at: result.value.created_at,
        updated_at: result.value.updated_at,
        survey_schema: result.value.survey_schema,
        published_url: result.value.published_url,
        published_at: result.value.published_at
      };

      return { data: mappedProject, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
