import { createTRPCRouter } from './trpc'
import { surveyRouter } from './routers/survey'
import { analyticsRouter } from './routers/analytics'
import { userRouter } from './routers/user'
import { communityRouter } from './routers/community'
import { projectRouter } from './routers/project'

export const appRouter = createTRPCRouter({
  survey: surveyRouter,
  analytics: analyticsRouter,
  user: userRouter,
  community: communityRouter,
  project: projectRouter,
})

export type AppRouter = typeof appRouter

