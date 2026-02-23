import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateProjectKey, encryptProjectKey } from '@/lib/encryption';

// GET /api/vault/projects - List all vault projects
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: projects, error } = await supabase
    .from('vault_projects')
    .select('id, name, environment, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get secret counts for each project
  const projectsWithCounts = await Promise.all(
    (projects || []).map(async (project) => {
      const { count } = await supabase
        .from('vault_secrets')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);
      
      return { ...project, secret_count: count || 0 };
    })
  );

  return NextResponse.json(projectsWithCounts);
}

// POST /api/vault/projects - Create a new vault project
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
  const limits: Record<string, number> = { free: 2, pro: 10, premium: 50 };
  const limit = limits[plan] || 2;

  const { count } = await supabase
    .from('vault_projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count || 0) >= limit) {
    return NextResponse.json({ 
      error: `You've reached the ${plan} plan limit of ${limit} vault projects. Upgrade to add more.` 
    }, { status: 403 });
  }

  const { name, environment } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  // Generate and encrypt project key
  const projectKey = generateProjectKey();
  const encryptedKey = encryptProjectKey(projectKey);

  const { data: project, error } = await supabase
    .from('vault_projects')
    .insert({
      user_id: user.id,
      name,
      environment: environment || 'production',
      encrypted_key: encryptedKey,
    })
    .select('id, name, environment, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from('vault_access_logs').insert({
    project_id: project.id,
    user_id: user.id,
    action: 'project_created',
  });

  return NextResponse.json(project);
}
