import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/depwatch/dependencies?project_id=xxx
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  // Verify user owns this project
  const { data: project } = await supabase
    .from('depwatch_projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data: dependencies, error } = await supabase
    .from('depwatch_dependencies')
    .select('*')
    .eq('project_id', projectId)
    .order('vulnerability_severity', { ascending: false, nullsFirst: false })
    .order('is_outdated', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(dependencies);
}
