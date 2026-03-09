import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/statuskit/incidents - List user's incidents
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status_page_id = searchParams.get('status_page_id');
  const status = searchParams.get('status');

  let query = supabase
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
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (status_page_id) {
    query = query.eq('status_page_id', status_page_id);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data: incidents, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ incidents });
}

// POST /api/statuskit/incidents - Create a new incident
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, status, severity, status_page_id, monitor_ids, message } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  // Create incident
  const { data: incident, error: createError } = await supabase
    .from('incidents')
    .insert({
      user_id: user.id,
      title,
      status: status || 'investigating',
      severity: severity || 'minor',
      status_page_id: status_page_id || null,
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  // Add initial update if message provided
  if (message) {
    await supabase.from('incident_updates').insert({
      incident_id: incident.id,
      status: incident.status,
      message,
    });
  }

  // Link affected monitors
  if (monitor_ids && monitor_ids.length > 0) {
    const monitorLinks = monitor_ids.map((monitor_id: string) => ({
      incident_id: incident.id,
      monitor_id,
    }));
    await supabase.from('incident_monitors').insert(monitorLinks);
  }

  return NextResponse.json({ incident }, { status: 201 });
}
