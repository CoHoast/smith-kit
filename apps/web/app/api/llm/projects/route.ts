import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// GET /api/llm/projects - List user's LLM projects
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: projects, error } = await supabase
    .from('llm_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get stats for each project
  const projectsWithStats = await Promise.all(
    (projects || []).map(async (project) => {
      // Get total requests
      const { count: requestCount } = await supabase
        .from('llm_requests')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      // Get today's stats
      const today = new Date().toISOString().split('T')[0];
      const { data: todayStats } = await supabase
        .from('llm_requests')
        .select('total_tokens, cost_cents')
        .eq('project_id', project.id)
        .gte('created_at', today);

      const todayTokens = todayStats?.reduce((sum, r) => sum + (r.total_tokens || 0), 0) || 0;
      const todayCost = todayStats?.reduce((sum, r) => sum + (Number(r.cost_cents) || 0), 0) || 0;

      return {
        ...project,
        total_requests: requestCount || 0,
        today_tokens: todayTokens,
        today_cost_cents: todayCost,
      };
    })
  );

  return NextResponse.json({ projects: projectsWithStats });
}

// POST /api/llm/projects - Create a new project
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens' }, { status: 400 });
  }

  const apiKey = `llm_${crypto.randomBytes(24).toString('hex')}`;

  const { data: project, error: createError } = await supabase
    .from('llm_projects')
    .insert({
      user_id: user.id,
      name,
      slug,
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
