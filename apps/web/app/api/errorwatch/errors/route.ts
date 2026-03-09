import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/errorwatch/errors - List errors for a project or issue
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const issueId = searchParams.get('issue_id');
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!projectId && !issueId) {
    return NextResponse.json({ error: 'project_id or issue_id is required' }, { status: 400 });
  }

  // Verify user owns project
  if (projectId) {
    const { data: project } = await supabase
      .from('errorwatch_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
  }

  let query = supabase
    .from('errorwatch_errors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  if (issueId) {
    query = query.eq('issue_id', issueId);
  }

  const { data: errors, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ errors: errors || [] });
}
