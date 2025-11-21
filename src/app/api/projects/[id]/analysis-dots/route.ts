import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AnalysisDot } from '@/types/database';

// GET - Fetch all analysis dots for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 403 });
    }

    // Fetch analysis dots
    const { data: dots, error: dotsError } = await supabaseAdmin
      .from('analysis_dots')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (dotsError) {
      throw dotsError;
    }

    return NextResponse.json({ dots: dots || [] });
  } catch (error) {
    console.error('Error fetching analysis dots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis dots' },
      { status: 500 }
    );
  }
}

// POST - Create a new analysis dot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { userId, ...dotData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 403 });
    }

    // Create analysis dot
    const { data: dot, error: dotError } = await supabaseAdmin
      .from('analysis_dots')
      .insert({
        project_id: projectId,
        user_id: userId,
        position_x: dotData.position_x || 50,
        position_y: dotData.position_y || 50,
        label: dotData.label,
        component_id: dotData.component_id,
      })
      .select()
      .single();

    if (dotError) {
      throw dotError;
    }

    return NextResponse.json({ dot }, { status: 201 });
  } catch (error) {
    console.error('Error creating analysis dot:', error);
    return NextResponse.json(
      { error: 'Failed to create analysis dot' },
      { status: 500 }
    );
  }
}

// PATCH - Update an analysis dot position
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { userId, dotId, position_x, position_y, label, component_id } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    if (!dotId) {
      return NextResponse.json({ error: 'dotId is required' }, { status: 400 });
    }

    // Update the dot
    const updateData: any = {};
    if (position_x !== undefined) updateData.position_x = position_x;
    if (position_y !== undefined) updateData.position_y = position_y;
    if (label !== undefined) updateData.label = label;
    if (component_id !== undefined) updateData.component_id = component_id;

    const { data: dot, error: dotError } = await supabaseAdmin
      .from('analysis_dots')
      .update(updateData)
      .eq('id', dotId)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (dotError) {
      throw dotError;
    }

    return NextResponse.json({ dot });
  } catch (error) {
    console.error('Error updating analysis dot:', error);
    return NextResponse.json(
      { error: 'Failed to update analysis dot' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an analysis dot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const dotId = searchParams.get('dotId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    if (!dotId) {
      return NextResponse.json({ error: 'dotId is required' }, { status: 400 });
    }

    // Delete the dot
    const { error: deleteError } = await supabaseAdmin
      .from('analysis_dots')
      .delete()
      .eq('id', dotId)
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis dot:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis dot' },
      { status: 500 }
    );
  }
}
