import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/errorwatch/issues - List issues for a project
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const status = searchParams.get('status') || 'unresolved';
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  // Verify user owns project
  const { data: project } = await supabase
    .from('errorwatch_projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  let query = supabase
    .from('errorwatch_issues')
    .select('*')
    .eq('project_id', projectId)
    .order('last_seen', { ascending: false })
    .limit(limit);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: issues, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ issues: issues || [] });
}

// PATCH /api/errorwatch/issues - Update issue status
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { issue_id, status } = body;

  if (!issue_id || !status) {
    return NextResponse.json({ error: 'issue_id and status are required' }, { status: 400 });
  }

  if (!['unresolved', 'resolved', 'ignored'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Verify user owns the issue's project
  const { data: issue } = await supabase
    .from('errorwatch_issues')
    .select('project_id')
    .eq('id', issue_id)
    .single();

  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }

  const { data: project } = await supabase
    .from('errorwatch_projects')
    .select('id')
    .eq('id', issue.project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data: updatedIssue, error: updateError } = await supabase
    .from('errorwatch_issues')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', issue_id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ issue: updatedIssue });
}
