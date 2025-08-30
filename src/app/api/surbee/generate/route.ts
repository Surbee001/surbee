import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { description, userId, projectId, conversationId } =
      await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 },
      );
    }

    // Simplified placeholder endpoint: echo back a basic survey without DB
    const userProfile = { id: userId || 'anon' }

    // Get or create project
    let project;
    if (projectId) {
      project = { id: projectId, project_id: projectId, title: `Survey Project: ${description.substring(0, 30)}...` }
    }

    if (!project) {
      // Generate unique project ID
      const uniqueProjectId = `project-${Date.now()}`;

      // Create new project
      project = { id: uniqueProjectId, project_id: uniqueProjectId, user_id: userProfile.id, title: `Survey Project: ${description.substring(0, 30)}...`, description, project_type: 'survey' } as any
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = { id: conversationId, title: `Survey: ${description.substring(0, 50)}...` } as any
    }

    if (!conversation) {
      conversation = { id: `conv-${Date.now()}`, project_id: project.id, user_id: userProfile.id, title: `Survey: ${description.substring(0, 50)}...`, description } as any
    }

    // Log user message
    // Skip DB messages

    // Track project event
    // Skip analytics

    // Generate survey with AI
    const aiResponse = {
      dnaMix: { Academic: 40, Minimalist: 30, Corporate: 20, TypeformPro: 5, Playful: 5 },
      rationale: 'Balanced academic/minimalist design',
      thinkingProcess: 'N/A',
      surveyAtoms: [
        { type: 'text', content: 'What is your age?', placeholder: 'Enter your age', required: true, position: 1, style: {} },
        { type: 'multiple_choice', content: 'How satisfied are you?', options: ['Very', 'Somewhat', 'Not'], required: true, position: 2, style: {} },
      ],
    }

    // Create survey in database
    const survey = { id: `s-${Date.now()}`, title: `Survey: ${description.substring(0, 50)}...`, description, dna_mix: aiResponse.dnaMix, generated_style: aiResponse.dnaMix }

    // Create survey atoms
    // Skip atom persistence

    // Log AI response
    // Skip assistant message persistence

    // Track successful survey creation
    // Skip analytics

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        dnaMix: aiResponse.dnaMix,
        generatedStyle: aiResponse.dnaMix,
        surveyAtoms: aiResponse.surveyAtoms,
        rationale: aiResponse.rationale,
        thinkingProcess: aiResponse.thinkingProcess,
      },
      project: {
        id: project.id,
        projectId: project.project_id,
        title: project.title,
        url: `/projects/${project.project_id}`,
      },
      conversation: {
        id: conversation.id,
        title: conversation.title,
      },
    });
  } catch (error) {
    console.error('Survey Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate survey' },
      { status: 500 },
    );
  }
}
