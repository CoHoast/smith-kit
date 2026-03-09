import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/uptime/monitors/[id] - Get monitor with recent checks
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

  const { data: monitor, error } = await supabase
    .from('uptime_monitors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }

  // Get recent checks (last 24 hours)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: checks } = await supabase
    .from('uptime_checks')
    .select('*')
    .eq('monitor_id', id)
    .gte('checked_at', yesterday)
    .order('checked_at', { ascending: false });

  // Calculate uptime percentage
  const totalChecks = checks?.length || 0;
  const upChecks = checks?.filter(c => c.status === 'up').length || 0;
  const uptimePercent = totalChecks > 0 ? Math.round((upChecks / totalChecks) * 100) : 100;

  // Calculate average response time
  const avgResponseTime = totalChecks > 0
    ? Math.round(checks!.reduce((sum, c) => sum + (c.response_time_ms || 0), 0) / totalChecks)
    : 0;

  return NextResponse.json({ 
    monitor, 
    checks: checks || [],
    stats: {
      uptime_percent: uptimePercent,
      avg_response_time: avgResponseTime,
      total_checks: totalChecks,
    }
  });
}

// DELETE /api/uptime/monitors/[id] - Delete a monitor
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
    .from('uptime_monitors')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/uptime/monitors/[id] - Update a monitor
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
  const allowedFields = ['name', 'url', 'method', 'interval_seconds', 'timeout_seconds', 'expected_status', 'headers', 'is_active', 'alert_channels'];
  
  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const { data: monitor, error } = await supabase
    .from('uptime_monitors')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ monitor });
}
