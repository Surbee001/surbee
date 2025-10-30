import { router, publicProcedure } from './trpc'
import { z } from 'zod'
import { runSurveyGenerationPipeline } from '@/lib/surbee/pipeline'

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
  generateSurvey: publicProcedure
    .input(
      z.object({
        userPrompt: z.string().min(4),
        userId: z.string(),
        contextData: z
          .object({
            industry: z.string().optional(),
            targetAudience: z.string().optional(),
            surveyType: z
              .enum(['marketing', 'research', 'feedback', 'academic'])
              .optional(),
            brandColors: z.array(z.string()).optional(),
          })
          .optional(),
        projectId: z.string().optional(),
        conversationId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const survey = await runSurveyGenerationPipeline(input)
      return survey
    }),
})

export type AppRouter = typeof appRouter

