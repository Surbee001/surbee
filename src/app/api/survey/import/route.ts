import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { ProjectsService } from '@/lib/services/projects'
import { scrapeUrl, extractSurveyContent } from '@/lib/web-scraper'

const ImportSurveySchema = z.object({
  url: z.string().url('Invalid URL'),
})

// Helper to get user from auth header
async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  return user
}


export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    console.log('Survey import - user:', user?.id || 'not found')

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('Survey import - URL:', body.url)
    const { url } = ImportSurveySchema.parse(body)

    // Step 1: Scrape the survey URL using our universal scraper
    console.log(`Scraping survey from: ${url}`)

    const scrapeResult = await scrapeUrl(url)
    console.log('Scrape result:', {
      success: scrapeResult.success,
      source: scrapeResult.source,
      contentLength: scrapeResult.content?.length || 0,
      title: scrapeResult.title,
    })

    // Extract survey-specific content
    const surveyContent = scrapeResult.success
      ? extractSurveyContent(scrapeResult.content)
      : { questions: [], hasOptions: false, estimatedQuestionCount: 0 }

    // Determine survey title
    const surveyTitle = scrapeResult.title ||
      `Imported Survey - ${new Date().toLocaleDateString()}`

    // Determine extraction quality
    const extractionQuality = scrapeResult.success
      ? (surveyContent.estimatedQuestionCount > 0 ? 'full' : 'partial')
      : 'minimal'

    // Step 2: Create a new project using ProjectsService
    console.log('Creating project for user:', user.id)

    const { data: project, error: projectError } = await ProjectsService.createProject({
      title: surveyTitle,
      description: scrapeResult.description || `Imported from: ${url}`,
      user_id: user.id,
    })

    if (projectError || !project) {
      console.error('Error creating project:', projectError)
      throw new Error(`Failed to create project: ${projectError?.message || 'Unknown error'}`)
    }

    const projectId = project.id
    console.log('Project created with ID:', projectId)

    // Step 3: Update the project with scraped survey data
    const { error: updateError } = await supabaseAdmin
      .from('projects')
      .update({
        survey_schema: {
          imported: true,
          imported_from: url,
          imported_at: new Date().toISOString(),
          extraction_quality: extractionQuality,
          scrape_source: scrapeResult.source,
          scraped_content: scrapeResult.content?.substring(0, 100000), // Store up to 100k chars
          detected_questions: surveyContent.questions,
          estimated_question_count: surveyContent.estimatedQuestionCount,
          has_options: surveyContent.hasOptions,
        }
      })
      .eq('id', projectId)

    if (updateError) {
      console.error('Error updating project with survey data:', updateError)
      // Don't fail - project was created, just missing imported data
    }

    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        title: surveyTitle,
      },
      extracted: {
        questions_count: surveyContent.estimatedQuestionCount,
        has_options: surveyContent.hasOptions,
        extraction_quality: extractionQuality,
        scrape_source: scrapeResult.source,
        content_length: scrapeResult.content?.length || 0,
      },
    })

  } catch (error: any) {
    console.error('Survey import error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || 'Invalid URL' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to import survey' },
      { status: 500 }
    )
  }
}
