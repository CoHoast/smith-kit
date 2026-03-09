import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/statuskit/incidents/[id] - Get incident details
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: incident, error } = await supabase
    .from('incidents')
    .select(`
      *,
      incident_updates (
        id,
        status,
        message,
        created_at
      ),
      incident_monitors (
        monitor:uptime_monitors (
          id,
          name,
          url
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
  }

  return NextResponse.json({ incident });
}

// PATCH /api/statuskit/incidents/[id] - Update incident status
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { status, message, severity } = body;

  // Update incident
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (severity) updates.severity = severity;
  if (status === 'resolved') updates.resolved_at = new Date().toISOString();

  const { data: incident, error: updateError } = await supabase
    .from('incidents')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Add update to timeline if message provided
  if (message) {
    await supabase.from('incident_updates').insert({
      incident_id: id,
      status: status || incident.status,
      message,
    });
  }

  return NextResponse.json({ incident });
}

// DELETE /api/statuskit/incidents/[id] - Delete incident
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('incidents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
