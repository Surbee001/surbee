import { generateSurveyComponents } from '@/lib/ai/survey-generator'
import { validateGeneratedCode } from '@/lib/security/code-validator'

describe('Survey Generation', () => {
  it('generates valid React components', async () => {
    const result = await generateSurveyComponents({
      prompt: 'Create a customer satisfaction survey for a restaurant',
      context: { surveyType: 'marketing', targetAudience: 'customers' },
      userId: 'test-user',
    })

    expect(Array.isArray(result.components)).toBe(true)
    expect(result.components.length).toBeGreaterThan(0)

    for (const component of result.components as any[]) {
      if (component?.code) {
        const validation = validateGeneratedCode(component.code)
        expect(validation.isValid).toBe(true)
        expect(validation.errors.length).toBe(0)
      }
    }
  })

  it('applies appropriate design themes', async () => {
    const marketingResult = await generateSurveyComponents({
      prompt: 'Fun quiz about coffee preferences',
      context: { surveyType: 'marketing' },
      userId: 'test-user',
    })

    const academicResult = await generateSurveyComponents({
      prompt: 'Research study on learning preferences',
      context: { surveyType: 'academic' },
      userId: 'test-user',
    })

    const m = JSON.stringify(marketingResult.theme)
    const a = JSON.stringify(academicResult.theme)
    expect(/vibrant|colorful|engaging|gradient|rounded/i.test(m)).toBe(true)
    expect(/minimal|professional|clean|serif|monochrome/i.test(a)).toBe(true)
  })
})

