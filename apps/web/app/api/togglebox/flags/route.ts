import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/togglebox/flags?project_id=xxx - List flags for project
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

  // Verify project ownership
  const { data: project } = await supabase
    .from('togglebox_projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data: flags, error } = await supabase
    .from('togglebox_flags')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flags });
}

// POST /api/togglebox/flags - Create flag
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { project_id, name, key, description, enabled } = body;

  if (!project_id || !name || !key) {
    return NextResponse.json({ error: 'project_id, name, and key are required' }, { status: 400 });
  }

  // Validate key format (lowercase, no spaces, alphanumeric + underscores)
  if (!/^[a-z][a-z0-9_]*$/.test(key)) {
    return NextResponse.json({ 
      error: 'Key must start with a letter and contain only lowercase letters, numbers, and underscores' 
    }, { status: 400 });
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('togglebox_projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data: flag, error } = await supabase
    .from('togglebox_flags')
    .insert({
      project_id,
      name,
      key,
      description: description || null,
      enabled: enabled || false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A flag with this key already exists in this project' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flag }, { status: 201 });
}
