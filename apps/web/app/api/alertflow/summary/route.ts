import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/alertflow/summary - Dashboard overview
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get active incidents
  const { data: activeIncidents } = await supabase
    .from('alertflow_incidents')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['triggered', 'acknowledged'])
    .order('created_at', { ascending: false });

  // Get recent resolved incidents (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: recentResolved } = await supabase
    .from('alertflow_incidents')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'resolved')
    .gte('resolved_at', sevenDaysAgo.toISOString())
    .order('resolved_at', { ascending: false })
    .limit(10);

  // Get schedules with current on-call
  const { data: schedules } = await supabase
    .from('alertflow_schedules')
    .select('*')
    .eq('user_id', user.id);

  const schedulesWithOnCall = (schedules || []).map(schedule => {
    const members = schedule.members as Array<{ name: string; email: string }>;
    const currentIndex = schedule.current_index || 0;
    
    let currentOnCall = null;
    let isOverride = false;
    
    if (schedule.override_until && new Date(schedule.override_until) > new Date()) {
      isOverride = true;
    }
    
    if (members.length > 0) {
      currentOnCall = members[currentIndex % members.length];
    }

    return {
      id: schedule.id,
      name: schedule.name,
      current_oncall: currentOnCall,
      is_override: isOverride,
      member_count: members.length,
    };
  });

  // Get stats
  const { data: stats } = await supabase.rpc('get_alertflow_stats', {
    p_user_id: user.id,
    p_days: 30,
  });

  // Count by status
  const triggered = (activeIncidents || []).filter(i => i.status === 'triggered').length;
  const acknowledged = (activeIncidents || []).filter(i => i.status === 'acknowledged').length;

  return NextResponse.json({
    active_incidents: activeIncidents || [],
    recent_resolved: recentResolved || [],
    schedules: schedulesWithOnCall,
    stats: stats?.[0] || {
      total_incidents: 0,
      active_incidents: 0,
      avg_time_to_ack_minutes: null,
      avg_time_to_resolve_minutes: null,
      incidents_by_severity: { critical: 0, warning: 0, info: 0 },
    },
    counts: {
      triggered,
      acknowledged,
      total_active: triggered + acknowledged,
    },
  });
}
