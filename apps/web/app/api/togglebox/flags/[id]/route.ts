import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Helper to verify flag ownership
async function verifyFlagOwnership(supabase: Awaited<ReturnType<typeof createClient>>, flagId: string, userId: string) {
  const { data: flag } = await supabase
    .from('togglebox_flags')
    .select('id, project_id')
    .eq('id', flagId)
    .single();

  if (!flag) return false;

  const { data: project } = await supabase
    .from('togglebox_projects')
    .select('user_id')
    .eq('id', flag.project_id)
    .single();

  return project?.user_id === userId;
}

// PATCH /api/togglebox/flags/[id] - Update flag (toggle, rename, etc.)
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
  const { name, description, enabled } = body;

  // Verify flag ownership
  const isOwner = await verifyFlagOwnership(supabase, id, user.id);
  if (!isOwner) {
    return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  }

  const updates: { 
    name?: string; 
    description?: string; 
    enabled?: boolean; 
    updated_at: string 
  } = {
    updated_at: new Date().toISOString(),
  };

  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (enabled !== undefined) updates.enabled = enabled;

  const { data: flag, error } = await supabase
    .from('togglebox_flags')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flag });
}

// DELETE /api/togglebox/flags/[id] - Delete flag
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

  // Verify flag ownership
  const isOwner = await verifyFlagOwnership(supabase, id, user.id);
  if (!isOwner) {
    return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('togglebox_flags')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
