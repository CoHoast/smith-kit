import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/alertflow/policies - List policies
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: policies, error } = await supabase
    .from('alertflow_policies')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ policies: policies || [] });
}

// POST /api/alertflow/policies - Create policy
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    name,
    description = '',
    is_default = false,
    steps = [],
  } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // If this is marked as default, unset other defaults
  if (is_default) {
    await supabase
      .from('alertflow_policies')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data: policy, error } = await supabase
    .from('alertflow_policies')
    .insert({
      user_id: user.id,
      name,
      description,
      is_default,
      steps,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ policy }, { status: 201 });
}

// PUT /api/alertflow/policies - Update policy
export async function PUT(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
  }

  // If setting as default, unset others first
  if (updates.is_default) {
    await supabase
      .from('alertflow_policies')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .neq('id', id);
  }

  const allowedFields = ['name', 'description', 'is_default', 'steps'];
  const filteredUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  const { data: policy, error } = await supabase
    .from('alertflow_policies')
    .update(filteredUpdates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ policy });
}

// DELETE /api/alertflow/policies - Delete policy
export async function DELETE(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('alertflow_policies')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
