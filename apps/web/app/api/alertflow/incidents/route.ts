import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/alertflow/incidents - List incidents
export async function GET(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // 'triggered', 'acknowledged', 'resolved', 'active' (triggered + acknowledged)
  const severity = searchParams.get('severity');
  const limit = parseInt(searchParams.get('limit') || '50');
  const includeTimeline = searchParams.get('include_timeline') === 'true';

  let query = supabase
    .from('alertflow_incidents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status === 'active') {
    query = query.in('status', ['triggered', 'acknowledged']);
  } else if (status) {
    query = query.eq('status', status);
  }

  if (severity) {
    query = query.eq('severity', severity);
  }

  const { data: incidents, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optionally include timeline for each incident
  let incidentsWithTimeline = incidents || [];
  if (includeTimeline && incidents && incidents.length > 0) {
    const incidentIds = incidents.map(i => i.id);
    const { data: timeline } = await supabase
      .from('alertflow_timeline')
      .select('*')
      .in('incident_id', incidentIds)
      .order('created_at', { ascending: true });

    const timelineByIncident = (timeline || []).reduce((acc, event) => {
      if (!acc[event.incident_id]) acc[event.incident_id] = [];
      acc[event.incident_id].push(event);
      return acc;
    }, {} as Record<string, typeof timeline>);

    incidentsWithTimeline = incidents.map(incident => ({
      ...incident,
      timeline: timelineByIncident[incident.id] || [],
    }));
  }

  // Get stats
  const { data: stats } = await supabase.rpc('get_alertflow_stats', {
    p_user_id: user.id,
    p_days: 30,
  });

  return NextResponse.json({ 
    incidents: incidentsWithTimeline,
    stats: stats?.[0] || null,
  });
}

// POST /api/alertflow/incidents - Create incident
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    title,
    description = '',
    severity = 'warning',
    source = 'manual',
    source_id,
    source_url,
    schedule_id,
    policy_id,
  } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  // Get current on-call person if schedule is specified
  let assigned_to = null;
  if (schedule_id) {
    const { data: schedule } = await supabase
      .from('alertflow_schedules')
      .select('*')
      .eq('id', schedule_id)
      .single();

    if (schedule) {
      const members = schedule.members as Array<{ name: string; email: string }>;
      const currentIndex = schedule.current_index || 0;
      if (members.length > 0) {
        assigned_to = members[currentIndex % members.length].email;
      }
    }
  }

  // Create incident
  const { data: incident, error } = await supabase
    .from('alertflow_incidents')
    .insert({
      user_id: user.id,
      title,
      description,
      severity,
      source,
      source_id,
      source_url,
      schedule_id,
      policy_id,
      assigned_to,
      status: 'triggered',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create initial timeline event
  await supabase.from('alertflow_timeline').insert({
    incident_id: incident.id,
    event_type: 'triggered',
    actor: 'system',
    content: `Incident created: ${title}`,
    metadata: { severity, source },
  });

  return NextResponse.json({ incident }, { status: 201 });
}

// PATCH /api/alertflow/incidents - Update incident (ack, resolve, add note)
export async function PATCH(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user email for attribution
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();
  const userEmail = profile?.email || user.email || 'Unknown';

  const body = await request.json();
  const { id, action, note, resolution_notes } = body;

  if (!id) {
    return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
  }

  // Get current incident
  const { data: incident, error: fetchError } = await supabase
    .from('alertflow_incidents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
  }

  const now = new Date();
  const updates: Record<string, unknown> = { updated_at: now.toISOString() };
  let timelineEvent: { event_type: string; content: string } | null = null;

  switch (action) {
    case 'acknowledge':
      if (incident.status !== 'triggered') {
        return NextResponse.json({ error: 'Can only acknowledge triggered incidents' }, { status: 400 });
      }
      updates.status = 'acknowledged';
      updates.acknowledged_by = userEmail;
      updates.acknowledged_at = now.toISOString();
      updates.time_to_ack_seconds = Math.floor((now.getTime() - new Date(incident.created_at).getTime()) / 1000);
      timelineEvent = { event_type: 'acknowledged', content: `Acknowledged by ${userEmail}` };
      break;

    case 'resolve':
      if (incident.status === 'resolved') {
        return NextResponse.json({ error: 'Incident already resolved' }, { status: 400 });
      }
      updates.status = 'resolved';
      updates.resolved_by = userEmail;
      updates.resolved_at = now.toISOString();
      updates.resolution_notes = resolution_notes || null;
      updates.time_to_resolve_seconds = Math.floor((now.getTime() - new Date(incident.created_at).getTime()) / 1000);
      timelineEvent = { 
        event_type: 'resolved', 
        content: resolution_notes ? `Resolved by ${userEmail}: ${resolution_notes}` : `Resolved by ${userEmail}` 
      };
      break;

    case 'note':
      if (!note) {
        return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
      }
      timelineEvent = { event_type: 'note', content: note };
      break;

    case 'reopen':
      if (incident.status !== 'resolved') {
        return NextResponse.json({ error: 'Can only reopen resolved incidents' }, { status: 400 });
      }
      updates.status = 'triggered';
      updates.resolved_at = null;
      updates.resolved_by = null;
      updates.resolution_notes = null;
      timelineEvent = { event_type: 'triggered', content: `Reopened by ${userEmail}` };
      break;

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  // Update incident if there are updates
  if (Object.keys(updates).length > 1) { // More than just updated_at
    const { error: updateError } = await supabase
      .from('alertflow_incidents')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // Add timeline event
  if (timelineEvent) {
    await supabase.from('alertflow_timeline').insert({
      incident_id: id,
      event_type: timelineEvent.event_type,
      actor: userEmail,
      content: timelineEvent.content,
    });
  }

  // Fetch updated incident with timeline
  const { data: updatedIncident } = await supabase
    .from('alertflow_incidents')
    .select('*')
    .eq('id', id)
    .single();

  const { data: timeline } = await supabase
    .from('alertflow_timeline')
    .select('*')
    .eq('incident_id', id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ 
    incident: { ...updatedIncident, timeline: timeline || [] }
  });
}

// DELETE /api/alertflow/incidents - Delete incident
export async function DELETE(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('alertflow_incidents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
