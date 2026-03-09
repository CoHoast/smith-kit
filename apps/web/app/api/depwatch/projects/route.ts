import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/depwatch/projects - List all depwatch projects
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: projects, error } = await supabase
    .from('depwatch_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get dependency counts and vulnerability counts for each project
  const projectsWithStats = await Promise.all(
    (projects || []).map(async (project) => {
      const { count: depCount } = await supabase
        .from('depwatch_dependencies')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);
      
      const { count: vulnCount } = await supabase
        .from('depwatch_dependencies')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .not('vulnerability_severity', 'is', null);
      
      const { count: outdatedCount } = await supabase
        .from('depwatch_dependencies')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('is_outdated', true);
      
      return { 
        ...project, 
        dependency_count: depCount || 0,
        vulnerability_count: vulnCount || 0,
        outdated_count: outdatedCount || 0,
      };
    })
  );

  return NextResponse.json(projectsWithStats);
}

// POST /api/depwatch/projects - Create a new depwatch project
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check plan limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const plan = subscription?.plan || 'free';
  const limits: Record<string, number> = { free: 1, pro: 10, premium: 50 };
  const limit = limits[plan] || 1;

  const { count } = await supabase
    .from('depwatch_projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count || 0) >= limit) {
    return NextResponse.json({ 
      error: `You've reached the ${plan} plan limit of ${limit} repos. Upgrade to add more.` 
    }, { status: 403 });
  }

  const { name, github_url, package_manager } = await request.json();

  if (!name || !github_url) {
    return NextResponse.json({ error: 'Name and GitHub URL are required' }, { status: 400 });
  }

  const { data: project, error } = await supabase
    .from('depwatch_projects')
    .insert({
      user_id: user.id,
      name,
      github_url,
      package_manager: package_manager || 'npm',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(project);
}
