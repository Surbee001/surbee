import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
// Hybrid generator (primary path)
import { hybridGenerator, HybridGenerationInput } from '@/lib/ai/hybrid-generator'
// Fast mode generator (fallback)
import { generateSurveyComponentsFast } from '@/lib/ai/survey-generator-fast'
import { computeSuspicionScore } from '@/features/survey/behavior/scoring'
import { getCachedComponents, cacheGeneratedComponents } from '../../../../lib/optimization/component-cache'
import { hashString } from '../../../../lib/utils/hash'
import { metrics } from '../../../../lib/monitoring/metrics'
import { supabase } from '@/lib/supabase'

export const surveyRouter = createTRPCRouter({
  // Test endpoint to compare hybrid vs pure AI approaches
  testApproaches: publicProcedure
    .input(z.object({
      prompt: z.string().min(1).max(200),
    }))
    .mutation(async ({ input }) => {
      console.log('=== TESTING BOTH APPROACHES ===')
      console.log('Prompt:', input.prompt)

      try {
        // Test hybrid approach
        const hybridResult = await hybridGenerator.generateSurvey({
          prompt: input.prompt,
          userId: 'test-user',
          mode: 'hybrid'
        })

        // Test pure AI approach  
        const pureAIResult = await hybridGenerator.generateSurvey({
          prompt: input.prompt,
          userId: 'test-user',
          mode: 'pure-ai'
        })

        // Test template-only approach
        const templateResult = await hybridGenerator.generateSurvey({
          prompt: input.prompt,
          userId: 'test-user',
          mode: 'template-only'
        })

        console.log('✅ All approaches tested successfully')

        return {
          approaches: {
            hybrid: {
              survey: hybridResult.survey,
              aiOutput: hybridResult,
              metadata: hybridResult.metadata
            },
            pureAI: {
              survey: pureAIResult.survey,
              aiOutput: pureAIResult,
              metadata: pureAIResult.metadata
            },
            template: {
              survey: templateResult.survey,
              aiOutput: templateResult,
              metadata: templateResult.metadata
            }
          },
          availableTemplates: hybridGenerator.getAvailableTemplates()
        }
      } catch (error) {
        console.error('❌ Approach testing failed:', error)
        throw new Error(`Testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }),

  // Test endpoint to verify enhanced renderer works
  generateTest: publicProcedure
    .input(z.object({
      prompt: z.string().min(1).max(200),
    }))
    .mutation(async ({ input }) => {
      console.log('=== TEST MUTATION CALLED ===')
      console.log('Prompt:', input.prompt)

      // Return static test data to verify the enhanced renderer
      const testAiOutput = {
        survey: {
          id: 'test-survey-' + Date.now(),
          title: 'Enhanced Test Survey',
          description: 'Testing the beautiful enhanced renderer with animations',
          pages: [
            {
              id: 'page_1',
              name: 'Test Questions',
              title: 'Sample Questions',
              position: 1,
              components: [
                {
                  id: 'q1',
                  type: 'text-input',
                  label: 'What do you think of our enhanced survey builder?',
                  required: true,
                  position: 1,
                  pageId: 'page_1'
                },
                {
                  id: 'q2',
                  type: 'scale',
                  label: 'How satisfied are you with the animations?',
                  required: true,
                  position: 2,
                  pageId: 'page_1',
                  props: { min: 1, max: 5, labels: ['Poor', 'Fair', 'Good', 'Great', 'Amazing'] }
                }
              ]
            }
          ],
          theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#6b7280',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            fontFamily: 'Inter, sans-serif',
            borderRadius: 12,
            spacing: 20,
            animations: true
          },
          settings: { showProgress: true, allowBack: true },
          analytics: {},
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            creatorId: 'test-user',
            version: '1.0',
            originalPrompt: input.prompt,
            tags: ['test', 'enhanced-renderer']
          }
        },
        components: [
          {
            id: 'q1',
            name: 'EnhancedTextInput',
            type: 'text-input',
            code: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function EnhancedTextInput() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['q1'] || '';
  
  return (
    <div className="space-y-4 p-6 bg-white rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <label className="block text-lg font-semibold text-gray-900">
        What do you think of our enhanced survey builder? 
        <span className="text-red-500">*</span>
      </label>
      <textarea
        value={value}
        placeholder="Share your thoughts about the new animations and design..."
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
        onChange={(e) => submitAnswer('q1', e.target.value)}
      />
      <div className="text-sm text-gray-500">
        {value.length}/500 characters
      </div>
    </div>
  );
}`,
            dependencies: ['react']
          },
          {
            id: 'q2',
            name: 'EnhancedScaleRating',
            type: 'scale',
            code: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function EnhancedScaleRating() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['q2'] || '';
  const labels = ['Poor', 'Fair', 'Good', 'Great', 'Amazing'];
  
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg">
      <label className="block text-lg font-semibold text-gray-900">
        How satisfied are you with the animations? 
        <span className="text-red-500">*</span>
      </label>
      <div className="flex justify-between items-center pt-4">
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating} className="flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={() => submitAnswer('q2', rating)}
              className={\`w-14 h-14 rounded-full border-3 transition-all duration-300 transform hover:scale-110 \${
                value === rating
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 shadow-md'
              }\`}
            >
              <span className="text-lg font-bold">{rating}</span>
            </button>
            <span className="text-xs text-gray-600 text-center max-w-16 leading-tight">
              {labels[rating - 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
            dependencies: ['react']
          }
        ],
        designSystem: {
          colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            background: '#ffffff',
            text: '#1f2937',
            error: '#ef4444',
            success: '#10b981'
          },
          typography: {
            fontSizes: { sm: '14px', md: '16px', lg: '18px' },
            fontWeights: { normal: 400, medium: 500, semibold: 600 },
            lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' }
          }
        },
        validationRules: {
          global: {},
          perComponent: {
            q1: {
              rules: ['required', 'minLength:10'],
              errorMessages: {
                required: 'Please share your thoughts',
                minLength: 'Please write at least 10 characters'
              }
            },
            q2: {
              rules: ['required'],
              errorMessages: {
                required: 'Please select a rating'
              }
            }
          }
        },
        analyticsConfig: {
          events: [],
          accuracyChecks: []
        },
        followUpSuggestions: [
          {
            id: 'add-more-questions',
            text: 'Add demographic questions to better understand your audience',
            action: 'add_question',
            priority: 'medium'
          },
          {
            id: 'enhance-design',
            text: 'Customize the color scheme to match your brand',
            action: 'modify_design',
            priority: 'low'
          }
        ]
      };

      return {
        survey: testAiOutput.survey,
        aiOutput: testAiOutput,
      };
    }),

  generate: publicProcedure
    .input(z.object({
      prompt: z.string().min(4).max(2000),
      projectId: z.string().optional(),
      conversationId: z.string().optional(),
      mode: z.enum(['hybrid', 'pure-ai', 'template-only', 'fast']).default('hybrid'),
      context: z.object({
        surveyType: z.enum(['marketing', 'research', 'feedback', 'academic']).optional(),
        targetAudience: z.string().optional(),
        industry: z.string().optional(),
        complexity: z.enum(['simple', 'professional', 'research', 'academic']).optional(),
        designStyle: z.enum(['minimal', 'modern', 'corporate', 'creative']).optional(),
        length: z.enum(['short', 'medium', 'long']).optional(),
      }).optional(),
      useTemplate: z.boolean().optional().default(true), // Use templates by default
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('=== HYBRID SURVEY GENERATION ===')
      console.log('Prompt:', input.prompt)
      console.log('Mode:', input.mode)
      console.log('Use Template:', input.useTemplate)
      console.log('Context:', input.context)

      const userId = (ctx as any)?.session?.user?.id || 'anonymous'

      try {
        let aiOutput;

        if (['hybrid', 'pure-ai', 'template-only'].includes(input.mode)) {
          // Use the new hybrid generator (primary path)
          console.log('🎯 Using Hybrid Generator (Template + AI)')

          const hybridInput: HybridGenerationInput = {
            prompt: input.prompt,
            context: input.context,
            userId,
            mode: input.mode as 'hybrid' | 'pure-ai' | 'template-only'
          }

          aiOutput = await hybridGenerator.generateSurvey(hybridInput)
        } else {
          // Fallback to fast generator for compatibility
          console.log('⚡ Using Fast Generator (Legacy Mode)')
          aiOutput = await generateSurveyComponentsFast({
            prompt: input.prompt,
            context: input.context,
            userId,
          })
        }

        console.log('✅ Survey generation successful')
        console.log('Generated components:', aiOutput.components?.length || 0)
        console.log('Survey pages:', aiOutput.survey?.pages?.length || 0)
        console.log('Generation mode:', aiOutput.metadata?.generationMode || 'unknown')

        return {
          survey: aiOutput.survey,
          aiOutput,
        }

      } catch (error) {
        console.error('❌ Generation failed, falling back to hybrid generator')
        console.error('Error:', error)

        // Fallback to hybrid generator
        try {
          const aiOutput = await hybridGenerator.generateSurvey({
            prompt: input.prompt,
            context: input.context,
            userId,
            mode: 'template-only' // Safe fallback
          })

          return {
            survey: aiOutput.survey,
            aiOutput,
          }
        } catch (fallbackError) {
          console.error('❌ Fallback also failed, using fast generator:', fallbackError)
          
          // Final fallback to fast generator
          const aiOutput = await generateSurveyComponentsFast({
            prompt: input.prompt,
            context: input.context,
            userId,
          })

          return {
            survey: aiOutput.survey,
            aiOutput,
          }
        }
      }
    }),

  submit: publicProcedure
    .input(z.object({
      surveyId: z.string(),
      responses: z.record(z.string(), z.any()),
      behavioralData: z.object({
        mouseData: z.array(z.any()).optional(),
        keystrokeData: z.array(z.any()).optional(),
        timingData: z.array(z.number()),
        deviceData: z.any(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { score, flags } = computeSuspicionScore({
        mouseMovements: input.behavioralData.mouseData || [],
        keystrokeDynamics: input.behavioralData.keystrokeData || [],
        scrollPattern: [],
        responseTime: input.behavioralData.timingData,
        focusEvents: [],
        deviceFingerprint: input.behavioralData.deviceData || { userAgent: '' },
        suspiciousFlags: [],
      })

      const { data: response } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: input.surveyId,
          responses: input.responses,
          mouse_data: input.behavioralData.mouseData,
          keystroke_data: input.behavioralData.keystrokeData,
          timing_data: input.behavioralData.timingData,
          device_data: input.behavioralData.deviceData,
          fraud_score: score,
          is_flagged: score >= 0.5,
          flag_reasons: flags.map((f) => f.code),
          respondent_id: ctx.session?.user?.id || null,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (score < 0.5 && ctx.session?.user?.id) {
        try {
          // Award credits for quality response
          const creditAmount = 1
          const { data: userRow } = await supabase.from('users').select('credits').eq('id', ctx.session.user.id).single()
          const newCredits = (userRow?.credits || 0) + creditAmount
          await supabase.from('users').update({ credits: newCredits }).eq('id', ctx.session.user.id)
          
          // Log credit transaction
          await supabase.from('credit_logs').insert({
            user_id: ctx.session.user.id,
            action: 'EARNED_RESPONSE',
            amount: creditAmount,
            description: 'Survey completion reward',
            metadata: { surveyId: input.surveyId, responseId: response?.id, qualityScore: 1 - score }
          })
        } catch {}
      }

      return { success: true, fraudScore: score }
    }),

})

