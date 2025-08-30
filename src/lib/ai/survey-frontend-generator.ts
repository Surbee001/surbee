import { aiModelManager } from './model-config'
import { SurveyAnalysis, UIDesignSystem, SurveyArchitecture } from './multi-model-pipeline'
import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'
import fs from 'fs/promises'
import path from 'path'

export interface SurveyFrontendConfig {
  analysis: SurveyAnalysis
  designSystem: UIDesignSystem
  architecture: SurveyArchitecture
  surveyData: AIGenerationOutput
  styleDirection?: string // For iterative refinement like "Make it lighter and more pastel"
  referenceImage?: string // Base64 encoded image for visual reference
}

export class SurveyFrontendGenerator {
  
  // Generate complete HTML/CSS/JS frontend like the GPT-5 example
  async generateCompleteSurveyFrontend(config: SurveyFrontendConfig): Promise<string> {
    const model = aiModelManager.getModel('design');
    const isGPT5 = aiModelManager.isGPT5Available();
    
    console.log(`🎨 Generating complete survey frontend with ${model}${isGPT5 ? ' (GPT-5 advanced reasoning)' : ''}...`);

    const frontendPrompt = this.createFrontendPrompt(config);
    
    let htmlCode: string;
    
    if (isGPT5) {
      // Use GPT-5 with potential image input and advanced reasoning
      let input: any;
      
      if (config.referenceImage) {
        // Multimodal input with image reference
        console.log('🖼️ Using image reference for design inspiration...');
        input = [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: frontendPrompt },
              { 
                type: 'input_image', 
                image_url: `data:image/png;base64,${config.referenceImage}`, 
                detail: 'auto' 
              }
            ]
          }
        ];
      } else {
        // Text-only input
        input = frontendPrompt;
      }
      
      const result = await aiModelManager.generateWithReasoning(
        input,
        'design',
        {
          reasoning: 'high', // Maximum reasoning for complex frontend
          verbosity: 'high', // Detailed code output
          temperature: 0.3,
          maxTokens: 8000 // Large token count for complete HTML/CSS/JS
        }
      );
      htmlCode = result.content;
    } else {
      // Fallback to GPT-4o
      const response = await aiModelManager.createChatCompletion([
        {
          role: 'system',
          content: `You are a world-class frontend developer specializing in survey interfaces. Generate complete, production-ready HTML files with embedded CSS and JavaScript.
          
          REQUIREMENTS:
          - Single HTML file with embedded CSS and JavaScript
          - Modern, responsive design using CSS Grid and Flexbox
          - Beautiful animations and micro-interactions
          - Mobile-first responsive design
          - Accessibility compliant (WCAG 2.1 AA)
          - No external dependencies (self-contained)
          - Survey state management in vanilla JavaScript
          - Progress tracking and validation
          - Beautiful, conversion-optimized UI
          
          OUTPUT: Return ONLY the complete HTML code in a code block.`
        },
        {
          role: 'user',
          content: frontendPrompt
        }
      ], 'design', {
        temperature: 0.3,
        max_tokens: 8000
      });
      htmlCode = response.choices[0]?.message?.content || '';
    }

    // Extract HTML from response
    const extractedHtml = this.extractHtmlFromText(htmlCode);
    console.log('✅ Complete survey frontend generated');
    
    return extractedHtml;
  }

  private createFrontendPrompt(config: SurveyFrontendConfig): string {
    const { analysis, designSystem, architecture, surveyData, styleDirection, referenceImage } = config;
    
    return `Generate a complete, self-contained HTML survey frontend using this design system and architecture:

📊 SURVEY CONTEXT:
- Type: ${analysis.surveyType}
- Title: ${surveyData.survey?.title || 'Survey'}
- Description: ${surveyData.survey?.description || 'Please complete this survey'}
- Target Audience: ${analysis.targetAudience}
- Industry: ${analysis.industry}
- Tone: ${analysis.tone}
- Complexity: ${analysis.complexity}

🎨 DESIGN SYSTEM:
Colors:
- Primary: ${designSystem.colorPalette.primary}
- Secondary: ${designSystem.colorPalette.secondary}
- Accent: ${designSystem.colorPalette.accent}
- Background: ${designSystem.colorPalette.background}
- Surface: ${designSystem.colorPalette.surface}
- Text: ${designSystem.colorPalette.text}
- Success: ${designSystem.colorPalette.success}
- Error: ${designSystem.colorPalette.error}

Typography:
- Font Family: ${designSystem.typography.fontFamily}
- Heading Sizes: ${JSON.stringify(designSystem.typography.headingSizes)}
- Text Sizes: ${JSON.stringify(designSystem.typography.textSizes)}
- Font Weights: ${JSON.stringify(designSystem.typography.fontWeights)}

Spacing & Layout:
- Spacing Scale: ${JSON.stringify(designSystem.spacing)}
- Border Radius: ${JSON.stringify(designSystem.borderRadius)}
- Shadows: ${JSON.stringify(designSystem.shadows)}

Animation:
- Duration: ${JSON.stringify(designSystem.animations.duration)}
- Easing: ${JSON.stringify(designSystem.animations.easing)}
- Effects: ${designSystem.animations.effects.join(', ')}

🏗️ SURVEY ARCHITECTURE:
${this.formatSurveyQuestions(surveyData)}

🎯 FRONTEND REQUIREMENTS:
1. **Single HTML File**: Complete self-contained HTML with embedded CSS and JavaScript
2. **Design System Implementation**: Use ALL the design system tokens extensively
3. **Responsive Design**: Mobile-first, works perfectly on all screen sizes
4. **Progressive Enhancement**: Beautiful animations and micro-interactions
5. **Survey Logic**: 
   - Multi-page navigation with smooth transitions
   - Progress indicator showing completion percentage
   - Real-time validation with beautiful error states
   - Local storage for response persistence
   - Form submission handling
6. **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels
7. **Performance**: Optimized CSS and JavaScript, smooth 60fps animations
8. **Conversion Optimization**: 
   - Trust indicators and progress motivation
   - Reduction of cognitive load through design
   - Clear visual hierarchy and call-to-action buttons

🚀 ADVANCED FEATURES:
- Smooth page transitions with CSS animations
- Interactive progress bar with completion milestones
- Beautiful form validation with inline feedback
- Hover states and focus indicators
- Loading states and submission feedback
- Responsive typography that scales perfectly
- Advanced CSS Grid layouts for complex question types
- Custom form controls that match the design system

Generate a complete, production-ready survey frontend that rivals the quality of top survey platforms like Typeform, but customized to this specific design system and survey requirements.

${styleDirection ? `

🎨 STYLE DIRECTION:
${styleDirection}

Apply this style direction throughout the design, adjusting colors, typography, spacing, and overall aesthetic to match this vision. Think about how this direction affects:
- Color palette adjustments (lighter, darker, more vibrant, pastel, etc.)
- Typography choices (playful vs serious, modern vs classic)
- Layout spacing and visual hierarchy
- Animation styles and micro-interactions
- Overall mood and user experience

` : ''}

${referenceImage ? `

🖼️ VISUAL REFERENCE:
Use the provided reference image as inspiration for the visual style, layout patterns, color schemes, and overall aesthetic direction. Adapt the design elements that work well for a survey interface while maintaining the visual language and mood of the reference.

` : ''}

Generate a complete, production-ready survey frontend that incorporates all the above requirements and style directions.

Return ONLY the complete HTML code in a code block - no explanations, just the code.`;
  }

  private formatSurveyQuestions(surveyData: AIGenerationOutput): string {
    if (!surveyData.survey?.pages) return 'No questions available';
    
    return surveyData.survey.pages.map((page, pageIndex) => {
      const questions = page.components?.map((q, qIndex) => 
        `  Question ${qIndex + 1}: ${q.label} (${q.type})${q.required ? ' *required' : ''}`
      ).join('\n') || 'No questions';
      
      return `Page ${pageIndex + 1}: ${page.name || page.title || `Page ${pageIndex + 1}`}
${questions}`;
    }).join('\n\n');
  }

  private extractHtmlFromText(text: string): string {
    // Extract HTML code block from GPT response
    const htmlBlock = text.match(/```html\s*([\s\S]*?)\s*```/i);
    if (htmlBlock) {
      return htmlBlock[1];
    }
    
    // Try any code block
    const anyBlock = text.match(/```\s*([\s\S]*?)\s*```/);
    if (anyBlock) {
      return anyBlock[1];
    }
    
    // Return full text if no code block found
    return text;
  }

  // Save HTML to file system (like the example)
  async saveHtmlToFile(html: string, filename: string = 'survey.html'): Promise<string> {
    try {
      const outputsDir = path.join(process.cwd(), 'outputs');
      await fs.mkdir(outputsDir, { recursive: true });
      
      const filePath = path.join(outputsDir, filename);
      await fs.writeFile(filePath, html, 'utf-8');
      
      console.log(`✅ Survey frontend saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('❌ Failed to save HTML file:', error);
      throw error;
    }
  }

  // Generate and save complete survey frontend (main function like the example)
  async generateAndSaveSurveyFrontend(
    config: SurveyFrontendConfig,
    filename: string = `survey-${Date.now()}.html`
  ): Promise<{ html: string; filePath: string }> {
    console.log('🚀 Starting complete survey frontend generation...');
    
    const html = await this.generateCompleteSurveyFrontend(config);
    const filePath = await this.saveHtmlToFile(html, filename);
    
    console.log('🎉 Complete survey frontend generated and saved!');
    
    return { html, filePath };
  }

  // Generate a preview URL that can be opened in browser
  generatePreviewUrl(filePath: string): string {
    return `file://${path.resolve(filePath)}`;
  }

  // Refine existing survey with style direction (like the GPT-5 example)
  async refineSurveyFrontend(
    existingConfig: SurveyFrontendConfig,
    styleDirection: string,
    referenceImage?: string,
    filename?: string,
    saveToFile: boolean = true
  ): Promise<{ html: string; filePath?: string }> {
    console.log(`🎨 Refining survey frontend with direction: "${styleDirection}"`)
    
    const refinedConfig = {
      ...existingConfig,
      styleDirection,
      referenceImage
    }
    
    const html = await this.generateCompleteSurveyFrontend(refinedConfig)
    
    if (saveToFile) {
      const filePath = await this.saveHtmlToFile(
        html, 
        filename || `survey-refined-${Date.now()}.html`
      )
      console.log(`✅ Refined survey frontend saved: ${filePath}`)
      return { html, filePath }
    }
    
    return { html }
  }

  // Utility function to encode image to base64 (like the GPT-5 example)
  async encodeImageToBase64(imagePath: string): Promise<string> {
    try {
      const imageBuffer = await fs.readFile(imagePath)
      return imageBuffer.toString('base64')
    } catch (error) {
      console.error('❌ Failed to encode image:', error)
      throw error
    }
  }
}