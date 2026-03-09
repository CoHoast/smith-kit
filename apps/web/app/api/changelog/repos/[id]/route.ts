import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/changelog/repos/[id] - Get a specific repo with its changelogs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: repo, error } = await supabase
    .from('changelog_repos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !repo) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
  }

  // Get changelogs for this repo
  const { data: changelogs } = await supabase
    .from('changelogs')
    .select('*')
    .eq('repo_id', id)
    .order('release_date', { ascending: false })
    .limit(50);

  return NextResponse.json({ repo, changelogs: changelogs || [] });
}

// DELETE /api/changelog/repos/[id] - Disconnect a repo
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('changelog_repos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/changelog/repos/[id] - Update repo settings
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { is_active, settings } = body;

  const updates: Record<string, unknown> = {};
  if (typeof is_active === 'boolean') updates.is_active = is_active;
  if (settings) updates.settings = settings;

  const { data: repo, error } = await supabase
    .from('changelog_repos')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ repo });
}
