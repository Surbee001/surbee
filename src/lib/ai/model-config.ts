import OpenAI from 'openai';

// Model configuration for different AI tasks
export interface ModelConfig {
  analysis: string;
  planning: string;
  design: string;
  components: string;
  validation: string;
}

// GPT-5 configuration (if available)
const GPT5_CONFIG: ModelConfig = {
  analysis: 'gpt-5',
  planning: 'gpt-5', 
  design: 'gpt-5', // Use full GPT-5 for complex design reasoning
  components: 'gpt-5',
  validation: 'gpt-5-mini' // Use mini for validation tasks
};

// Current stable configuration (GPT-4o)
const GPT4_CONFIG: ModelConfig = {
  analysis: 'gpt-4o',
  planning: 'gpt-4o',
  design: 'gpt-4o',
  components: 'gpt-4o', 
  validation: 'gpt-4o-mini'
};

export class AIModelManager {
  private openai: OpenAI;
  private config: ModelConfig;
  private gpt5Available: boolean = false;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    this.config = GPT4_CONFIG; // Default to stable
    this.checkGPT5Availability();
  }

  private async checkGPT5Availability() {
    try {
      // Check if GPT-5 models are available
      const models = await this.openai.models.list();
      const modelNames = models.data.map(m => m.id);
      
      const hasGPT5 = modelNames.some(name => name.includes('gpt-5'));
      
      if (hasGPT5) {
        console.log('🚀 GPT-5 detected! Upgrading to advanced models...');
        this.gpt5Available = true;
        this.config = GPT5_CONFIG;
      } else {
        console.log('📝 Using GPT-4o (most advanced available)');
        this.config = GPT4_CONFIG;
      }
    } catch (error) {
      console.warn('Could not check model availability, using GPT-4o');
      this.config = GPT4_CONFIG;
    }
  }

  // Get the best model for a specific task
  getModel(task: keyof ModelConfig): string {
    return this.config[task];
  }

  // Check if GPT-5 is available
  isGPT5Available(): boolean {
    return this.gpt5Available;
  }

  // GPT-5 style API call (with fallback to GPT-4)
  async generateWithReasoning(
    prompt: string, 
    task: keyof ModelConfig = 'design',
    options: {
      reasoning?: 'low' | 'medium' | 'high';
      verbosity?: 'low' | 'medium' | 'high';
      temperature?: number;
      maxTokens?: number;
      responseFormat?: any;
    } = {}
  ) {
    const model = this.getModel(task);
    
    if (this.gpt5Available && model.includes('gpt-5')) {
      // Use GPT-5 API if available
      try {
        // @ts-ignore - GPT-5 API might not be in types yet
        const result = await this.openai.responses?.create?.({
          model: model,
          input: prompt,
          reasoning: { effort: options.reasoning || 'medium' },
          text: { verbosity: options.verbosity || 'medium' },
          temperature: options.temperature || 0.3,
          max_tokens: options.maxTokens || 2000
        });
        
        // @ts-ignore
        return { content: result.output_text, model: model };
      } catch (error) {
        console.warn('GPT-5 API failed, falling back to GPT-4o:', error);
        // Fall through to GPT-4 API
      }
    }
    
    // Fallback to current GPT-4 API
    const response = await this.openai.chat.completions.create({
      model: model.replace('gpt-5', 'gpt-4o'), // Fallback mapping
      messages: [
        {
          role: 'system',
          content: 'You are a world-class AI assistant with advanced reasoning capabilities.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.3,
      max_tokens: options.maxTokens || 2000,
      response_format: options.responseFormat
    });

    return { 
      content: response.choices[0]?.message?.content || '',
      model: model.replace('gpt-5', 'gpt-4o')
    };
  }

  // Standard chat completion with automatic model selection
  async createChatCompletion(
    messages: any[],
    task: keyof ModelConfig = 'components',
    options: any = {}
  ) {
    const model = this.getModel(task);
    
    return await this.openai.chat.completions.create({
      model: model.replace('gpt-5', 'gpt-4o'), // Auto-fallback
      messages,
      ...options
    });
  }

  // Get current configuration summary
  getConfigSummary() {
    return {
      gpt5Available: this.gpt5Available,
      models: this.config,
      primaryModel: this.gpt5Available ? 'GPT-5' : 'GPT-4o'
    };
  }
}

// Singleton instance
export const aiModelManager = new AIModelManager();