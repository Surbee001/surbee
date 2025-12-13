import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ProjectsService } from '@/lib/services/projects';

export async function GET() {
  // Basic auth check - you might want to adjust this based on how your app handles sessions
  // Using the existing isAuthenticated utility
  const userOrResponse = await isAuthenticated();

  // If it returned a response (error), return it
  if (userOrResponse instanceof NextResponse) {
    return userOrResponse;
  }
  
  const user = userOrResponse as any;

  if (!user || !user.id) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await ProjectsService.getUserProjects(user.id);

  if (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}
