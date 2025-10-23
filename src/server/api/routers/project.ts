import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { supabase } from '@/lib/supabase';
import { TRPCError } from '@trpc/server';

export const projectRouter = createTRPCRouter({
  // Get share settings for a project
  getShareSettings: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabase
        .from('project_share_settings')
        .select('*')
        .eq('project_id', input.projectId)
        .eq('user_id', ctx.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching share settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch share settings',
        });
      }

      // Return default settings if none exist
      if (!data) {
        return {
          projectId: input.projectId,
          customSlug: null,
          ogTitle: null,
          ogDescription: null,
          ogImage: null,
          isPublic: true,
        };
      }

      return {
        projectId: data.project_id,
        customSlug: data.custom_slug,
        ogTitle: data.og_title,
        ogDescription: data.og_description,
        ogImage: data.og_image,
        isPublic: data.is_public,
      };
    }),

  // Update share settings for a project
  updateShareSettings: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      customSlug: z.string().optional(),
      ogTitle: z.string().max(60).optional(),
      ogDescription: z.string().max(155).optional(),
      ogImage: z.string().url().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { projectId, ...settings } = input;

      // Check if custom slug is available (if provided)
      if (settings.customSlug) {
        const { data: existing } = await supabase
          .from('project_share_settings')
          .select('project_id')
          .eq('custom_slug', settings.customSlug)
          .neq('project_id', projectId)
          .single();

        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This custom URL is already taken',
          });
        }
      }

      // Upsert settings
      const { data, error } = await supabase
        .from('project_share_settings')
        .upsert({
          project_id: projectId,
          user_id: ctx.user.id,
          custom_slug: settings.customSlug,
          og_title: settings.ogTitle,
          og_description: settings.ogDescription,
          og_image: settings.ogImage,
          is_public: settings.isPublic,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'project_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating share settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update share settings',
        });
      }

      return {
        projectId: data.project_id,
        customSlug: data.custom_slug,
        ogTitle: data.og_title,
        ogDescription: data.og_description,
        ogImage: data.og_image,
        isPublic: data.is_public,
      };
    }),

  // Check if custom slug is available
  checkSlugAvailability: protectedProcedure
    .input(z.object({
      slug: z.string(),
      projectId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const query = supabase
        .from('project_share_settings')
        .select('project_id')
        .eq('custom_slug', input.slug);

      if (input.projectId) {
        query.neq('project_id', input.projectId);
      }

      const { data } = await query.single();

      return {
        available: !data,
      };
    }),
});
