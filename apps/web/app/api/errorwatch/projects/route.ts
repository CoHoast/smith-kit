import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// GET /api/errorwatch/projects - List user's projects
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: projects, error } = await supabase
    .from('errorwatch_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get stats for each project
  const projectsWithStats = await Promise.all(
    (projects || []).map(async (project) => {
      const { count: errorCount } = await supabase
        .from('errorwatch_errors')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);
      
      const { count: unresolvedCount } = await supabase
        .from('errorwatch_issues')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('status', 'unresolved');
      
      return { 
        ...project, 
        error_count: errorCount || 0,
        unresolved_count: unresolvedCount || 0
      };
    })
  );

  return NextResponse.json({ projects: projectsWithStats });
}

// POST /api/errorwatch/projects - Create a new project
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, platform } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
  }

  // Generate API key
  const apiKey = `ew_${crypto.randomBytes(24).toString('hex')}`;

  const { data: project, error: createError } = await supabase
    .from('errorwatch_projects')
    .insert({
      user_id: user.id,
      name,
      slug,
      api_key: apiKey,
      platform: platform || 'javascript',
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
