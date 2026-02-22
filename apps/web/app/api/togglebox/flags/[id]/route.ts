import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

  // Verify flag ownership through project
  const { data: existingFlag } = await supabase
    .from('togglebox_flags')
    .select(`
      id,
      togglebox_projects!inner(user_id)
    `)
    .eq('id', id)
    .single();

  if (!existingFlag || (existingFlag.togglebox_projects as { user_id: string }).user_id !== user.id) {
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

  // Verify flag ownership through project
  const { data: existingFlag } = await supabase
    .from('togglebox_flags')
    .select(`
      id,
      togglebox_projects!inner(user_id)
    `)
    .eq('id', id)
    .single();

  if (!existingFlag || (existingFlag.togglebox_projects as { user_id: string }).user_id !== user.id) {
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
