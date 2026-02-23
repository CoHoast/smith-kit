import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// GET /api/eventlog/projects - List user's projects
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: projects, error } = await supabase
    .from('eventlog_projects')
    .select(`
      *,
      eventlog_channels (
        id,
        name,
        emoji,
        color
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get event counts for each project
  const projectsWithCounts = await Promise.all(
    (projects || []).map(async (project) => {
      const { count } = await supabase
        .from('eventlog_events')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);
      
      return { ...project, event_count: count || 0 };
    })
  );

  return NextResponse.json({ projects: projectsWithCounts });
}

// POST /api/eventlog/projects - Create a new project
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, description } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
  }

  // Generate API key
  const apiKey = `el_${crypto.randomBytes(24).toString('hex')}`;

  const { data: project, error: createError } = await supabase
    .from('eventlog_projects')
    .insert({
      user_id: user.id,
      name,
      slug,
      description: description || null,
      api_key: apiKey,
    })
    .select()
    .single();

  if (createError) {
    if (createError.code === '23505') {
      return NextResponse.json({ error: 'Project slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  return NextResponse.json({ project }, { status: 201 });
}
