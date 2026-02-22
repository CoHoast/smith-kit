import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/changelog/repos - List user's connected repos
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: repos, error } = await supabase
    .from('changelog_repos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ repos });
}

// POST /api/changelog/repos - Connect a new GitHub repo
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { github_repo_id, github_repo_name, default_branch = 'main' } = body;

  if (!github_repo_id || !github_repo_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check usage limits
  const { count } = await supabase
    .from('changelog_repos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get user's plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const limits: Record<string, number> = { free: 1, pro: 10, team: 50 };
  const plan = subscription?.plan || 'free';
  const limit = limits[plan] || 1;

  if ((count || 0) >= limit) {
    return NextResponse.json({ 
      error: `You've reached the ${plan} plan limit of ${limit} repos. Upgrade to add more.` 
    }, { status: 403 });
  }

  // Insert the repo
  const { data: repo, error } = await supabase
    .from('changelog_repos')
    .insert({
      user_id: user.id,
      github_repo_id,
      github_repo_name,
      default_branch,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Repo already connected' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ repo }, { status: 201 });
}
