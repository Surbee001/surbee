import OpenAI from 'openai';
import { db } from '../supabase/client';
import type { DNAMix, AtomStyle, SurveyAtom } from './types';
import { generateStyle, mockAIResponse } from './dna-engine';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AISurveyRequest {
  description: string;
  userId: string;
  projectId: string;
  conversationId?: string;
}

interface AISurveyResponse {
  dnaMix: DNAMix;
  rationale: string;
  surveyAtoms: SurveyAtom[];
  thinkingProcess: string;
  projectId: string;
}

interface TrainingJob {
  jobType: 'fine_tune' | 'retrain' | 'optimize';
  modelName: string;
  trainingDataCount: number;
  accuracyBefore?: number;
  accuracyAfter?: number;
  trainingConfig: any;
}

export class AIService {
  static async generateSurvey(
    request: AISurveyRequest,
  ): Promise<AISurveyResponse> {
    try {
      // Get the active trained model
      const activeModel = await this.getActiveTrainedModel();

      // Track analytics event
      await db.analytics.trackEvent(
        request.projectId,
        request.userId,
        'survey_generation_started',
        {
          description: request.description,
          model_used: activeModel?.model_path || 'gpt-4',
          timestamp: new Date().toISOString(),
        },
      );

      // Log the interaction for learning with priority based on project type
      const priority = await this.calculateTrainingPriority(request.projectId);
      const interactionId = await db.aiLearning.logInteraction(
        request.description,
        { dna_mix: mockAIResponse(request.description) },
        undefined,
        priority,
      );

      // Use trained model if available, otherwise fallback to base model
      const modelToUse = activeModel?.model_path || 'gpt-4';

      // Generate AI prompt for DNA analysis
      const dnaPrompt = this.buildDNAPrompt(request.description);

      // Call OpenAI for DNA analysis
      const dnaResponse = await openai.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `You are Surbee, an AI survey designer that analyzes user descriptions and generates optimal design DNA profiles. 
            You understand survey design principles and can match user intent with appropriate visual styles.
            
            Return only valid JSON with the following structure:
            {
              "dna_mix": {
                "Academic": 0-100,
                "TypeformPro": 0-100,
                "Corporate": 0-100,
                "Minimalist": 0-100,
                "Playful": 0-100
              },
              "rationale": "Explanation of design choices",
              "thinking_process": "Step-by-step analysis"
            }`,
          },
          {
            role: 'user',
            content: dnaPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const dnaResult = JSON.parse(
        dnaResponse.choices[0]?.message?.content || '{}',
      );
      const dnaMix: DNAMix =
        dnaResult.dna_mix || mockAIResponse(request.description);
      const rationale =
        dnaResult.rationale ||
        'AI-generated design based on survey requirements';
      const thinkingProcess =
        dnaResult.thinking_process || 'Analysis completed';

      // Generate survey atoms based on DNA
      const surveyAtoms = await this.generateSurveyAtoms(
        request.description,
        dnaMix,
        modelToUse,
      );

      // Update AI learning with actual response
      await db.aiLearning.updateFeedback(interactionId.data, 'thumbs_up');

      // Track successful generation
      await db.analytics.trackEvent(
        request.projectId,
        request.userId,
        'survey_generation_completed',
        {
          atomCount: surveyAtoms.length,
          dnaMix,
          rationale,
          model_used: modelToUse,
        },
      );

      return {
        dnaMix,
        rationale,
        surveyAtoms,
        thinkingProcess,
        projectId: request.projectId,
      };
    } catch (error) {
      console.error('AI Survey Generation Error:', error);

      // Track error
      await db.analytics.trackEvent(
        request.projectId,
        request.userId,
        'survey_generation_error',
        {
          error: error.message,
        },
      );

      // Fallback to mock response
      const fallbackDNA = mockAIResponse(request.description);
      return {
        dnaMix: fallbackDNA,
        rationale: 'Fallback response due to AI service error',
        surveyAtoms: this.generateFallbackAtoms(
          request.description,
          fallbackDNA,
        ),
        thinkingProcess: 'Fallback processing',
        projectId: request.projectId,
      };
    }
  }

  private static async getActiveTrainedModel() {
    try {
      const { data: activeModel } = await db.aiTraining.getActiveModel();
      return activeModel;
    } catch (error) {
      console.error('Error getting active model:', error);
      return null;
    }
  }

  private static async calculateTrainingPriority(
    projectId: string,
  ): Promise<number> {
    try {
      // Get project analytics to determine priority
      const { data: analytics } =
        await db.analytics.getProjectAnalytics(projectId);

      if (!analytics || analytics.length === 0) {
        return 1; // Default priority
      }

      // Calculate priority based on project activity
      const totalEvents = analytics.reduce(
        (sum, event) => sum + Number(event.event_count),
        0,
      );
      const hasFeedback = analytics.some(
        (event) => event.event_type === 'feedback_given',
      );
      const hasPublishing = analytics.some(
        (event) => event.event_type === 'survey_published',
      );

      let priority = 1;
      if (totalEvents > 10) priority += 2;
      if (hasFeedback) priority += 3;
      if (hasPublishing) priority += 2;

      return Math.min(priority, 10); // Max priority of 10
    } catch (error) {
      console.error('Error calculating training priority:', error);
      return 1;
    }
  }

  private static buildDNAPrompt(description: string): string {
    return `Analyze this survey description and return an optimal DNA mix:

Description: "${description}"

Consider these design profiles:
- Academic: Clean, professional, serif fonts, minimal color (for research, education)
- TypeformPro: Modern, engaging, gradients, rounded UI (for marketing, engagement)
- Corporate: Professional, trustworthy, blue tones (for business, B2B)
- Minimalist: Clean, distraction-free, black/white (for focus, simplicity)
- Playful: Energetic, creative, bright colors (for fun, entertainment)

Return a JSON object with DNA percentages that total 100% and match the survey's purpose and audience.`;
  }

  private static async generateSurveyAtoms(
    description: string,
    dnaMix: DNAMix,
    modelName: string = 'gpt-4',
  ): Promise<SurveyAtom[]> {
    try {
      const style = generateStyle(dnaMix);

      const atomPrompt = `Based on this survey description: "${description}"
      Generate 3-5 survey questions that would be appropriate for this survey.
      
      Return only valid JSON array with this structure:
      [
        {
          "type": "text-input|rating|multiple-choice|slider|textarea",
          "content": "Question text",
          "options": ["option1", "option2"] (only for multiple-choice),
          "placeholder": "Placeholder text" (optional),
          "required": true/false
        }
      ]`;

      const atomResponse = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content:
              'You are a survey design expert. Generate appropriate questions based on the survey description.',
          },
          {
            role: 'user',
            content: atomPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 800,
      });

      const atomsData = JSON.parse(
        atomResponse.choices[0]?.message?.content || '[]',
      );

      return atomsData.map((atom: any, index: number) => ({
        id: `atom-${Date.now()}-${index}`,
        type: atom.type,
        content: atom.content,
        options: atom.options || [],
        placeholder: atom.placeholder,
        required: atom.required || false,
        position: index + 1,
        style,
      }));
    } catch (error) {
      console.error('Atom Generation Error:', error);
      return this.generateFallbackAtoms(description, dnaMix);
    }
  }

  private static generateFallbackAtoms(
    description: string,
    dnaMix: DNAMix,
  ): SurveyAtom[] {
    const style = generateStyle(dnaMix);

    return [
      {
        id: `atom-${Date.now()}-1`,
        type: 'text-input',
        content: 'What is your name?',
        placeholder: 'Enter your full name',
        required: true,
        position: 1,
        style,
      },
      {
        id: `atom-${Date.now()}-2`,
        type: 'rating',
        content: 'How would you rate your experience?',
        required: false,
        position: 2,
        style,
      },
      {
        id: `atom-${Date.now()}-3`,
        type: 'multiple-choice',
        content: 'Which option best describes your preference?',
        options: ['Option A', 'Option B', 'Option C'],
        required: true,
        position: 3,
        style,
      },
    ];
  }

  static async suggestAlternatives(
    currentDNA: DNAMix,
    description: string,
  ): Promise<DNAMix[]> {
    try {
      const prompt = `Given this current DNA mix: ${JSON.stringify(currentDNA)}
      And this survey description: "${description}"
      
      Suggest 3 alternative DNA mixes that would work well for this survey.
      Each should be different but still appropriate.
      
      Return only valid JSON array with 3 DNA mix objects.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a survey design expert. Suggest alternative design approaches.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 600,
      });

      const alternatives = JSON.parse(
        response.choices[0]?.message?.content || '[]',
      );
      return alternatives.slice(0, 3);
    } catch (error) {
      console.error('Alternative Generation Error:', error);

      // Fallback alternatives
      return [
        { ...currentDNA, Academic: Math.min(100, currentDNA.Academic + 20) },
        {
          ...currentDNA,
          TypeformPro: Math.min(100, currentDNA.TypeformPro + 20),
        },
        { ...currentDNA, Playful: Math.min(100, currentDNA.Playful + 20) },
      ];
    }
  }

  static async analyzeUserFeedback(
    surveyId: string,
    feedback: 'thumbs_up' | 'thumbs_down',
    reason?: string,
  ) {
    try {
      // Log feedback for learning
      await db.feedback.create({
        survey_id: surveyId,
        feedback_type: feedback,
        feedback_reason: reason,
      });

      // Update AI learning data
      const { data: survey } = await db.surveys.getById(surveyId);
      if (survey) {
        await db.aiLearning.updateFeedback(survey.id, feedback);
      }
    } catch (error) {
      console.error('Feedback Analysis Error:', error);
    }
  }

  // Phase 3: Learning System Methods
  static async getTrainingData(limit?: number) {
    try {
      const { data, error } = await db.aiLearning.getTrainingData(limit);
      if (error) throw error;

      return (
        data?.map((item) => ({
          prompt: item.prompt,
          completion: item.completion,
          feedback: item.feedback,
          priority: item.priority,
        })) || []
      );
    } catch (error) {
      console.error('Training Data Error:', error);
      return [];
    }
  }

  static async startTrainingJob(job: TrainingJob) {
    try {
      const { data, error } = await db.aiLearning.createTrainingJob({
        job_type: job.jobType,
        model_name: job.modelName,
        training_data_count: job.trainingDataCount,
        accuracy_before: job.accuracyBefore,
        accuracy_after: job.accuracyAfter,
        training_config: job.trainingConfig,
        status: 'pending',
      });

      if (error) throw error;

      // Simulate training process (in real implementation, this would call OpenAI's fine-tuning API)
      await this.simulateTrainingProcess(data.id);

      return { data, error: null };
    } catch (error) {
      console.error('Training Job Error:', error);
      return { data: null, error };
    }
  }

  private static async simulateTrainingProcess(jobId: string) {
    // Simulate training process
    setTimeout(async () => {
      await db.aiLearning.updateTrainingJob(jobId, {
        status: 'running',
        started_at: new Date().toISOString(),
      });

      // Simulate completion after 30 seconds
      setTimeout(async () => {
        await db.aiLearning.updateTrainingJob(jobId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          accuracy_after: 0.85, // Simulated improvement
        });
      }, 30000);
    }, 1000);
  }

  // Phase 4: Optimization Methods
  static async getPerformanceMetrics(projectId: string) {
    try {
      const { data, error } =
        await db.analytics.getPerformanceMetrics(projectId);
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Performance Metrics Error:', error);
      return [];
    }
  }

  static async optimizeModel(projectId: string) {
    try {
      // Get project analytics
      const metrics = await this.getPerformanceMetrics(projectId);

      // Analyze performance patterns
      const optimization = this.analyzeOptimizationOpportunities(metrics);

      // Create optimization training job
      const job: TrainingJob = {
        jobType: 'optimize',
        modelName: 'surbee-optimized-v1',
        trainingDataCount: metrics.length,
        trainingConfig: optimization,
      };

      return await this.startTrainingJob(job);
    } catch (error) {
      console.error('Model Optimization Error:', error);
      return { data: null, error };
    }
  }

  private static analyzeOptimizationOpportunities(metrics: any[]) {
    // Analyze metrics to determine optimization opportunities
    const feedbackEvents = metrics.filter(
      (m) => m.event_type === 'feedback_given',
    );
    const positiveFeedback = feedbackEvents.filter(
      (f) => f.event_data?.feedback_type === 'thumbs_up',
    ).length;
    const negativeFeedback = feedbackEvents.filter(
      (f) => f.event_data?.feedback_type === 'thumbs_down',
    ).length;

    return {
      positiveFeedbackRate:
        positiveFeedback / (positiveFeedback + negativeFeedback),
      totalInteractions: metrics.length,
      optimizationFocus:
        negativeFeedback > positiveFeedback ? 'accuracy' : 'speed',
    };
  }
}
