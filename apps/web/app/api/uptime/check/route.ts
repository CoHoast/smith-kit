import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// POST /api/uptime/check - Run checks for all active monitors (called by cron)
export async function POST(request: Request) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role client for cron jobs
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all active monitors that need checking
  const { data: monitors, error } = await supabase
    .from('uptime_monitors')
    .select('*')
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = await Promise.allSettled(
    (monitors || []).map(monitor => runCheck(monitor, supabase))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return NextResponse.json({ 
    checked: monitors?.length || 0,
    successful,
    failed,
  });
}

async function runCheck(
  monitor: {
    id: string;
    url: string;
    method: string;
    timeout_seconds: number;
    expected_status: number;
    current_status: string;
    user_id: string;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
) {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), monitor.timeout_seconds * 1000);

    const response = await fetch(monitor.url, {
      method: monitor.method,
      signal: controller.signal,
      headers: {
        'User-Agent': 'SmithKit-Uptime/1.0',
      },
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - startTime;
    const newStatus: 'up' | 'degraded' | 'down' = response.status === monitor.expected_status ? 'up' : 'degraded';

    // Save check result
    await supabase.from('uptime_checks').insert({
      monitor_id: monitor.id,
      status: newStatus,
      response_time_ms: responseTime,
      status_code: response.status,
      region: 'us-east',
    });

    // Check for status change (for incident tracking)
    const statusChanged = monitor.current_status !== newStatus;

    // Update monitor status
    await supabase
      .from('uptime_monitors')
      .update({ 
        current_status: newStatus,
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', monitor.id);

    // Handle incident creation/resolution
    if (statusChanged) {
      if (newStatus === 'degraded') {
        // Create incident for degraded status
        await supabase.from('uptime_incidents').insert({
          monitor_id: monitor.id,
          status: 'ongoing',
          cause: 'status_code',
        });
      } else if (newStatus === 'up') {
        // Resolve any ongoing incidents
        await supabase
          .from('uptime_incidents')
          .update({ 
            status: 'resolved',
            resolved_at: new Date().toISOString(),
          })
          .eq('monitor_id', monitor.id)
          .eq('status', 'ongoing');
      }
    }

    return { monitor_id: monitor.id, status: newStatus };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('abort');

    // Save failed check
    await supabase.from('uptime_checks').insert({
      monitor_id: monitor.id,
      status: 'down',
      response_time_ms: responseTime,
      error_message: isTimeout ? 'Request timeout' : errorMessage,
      region: 'us-east',
    });

    // Check for status change
    if (monitor.current_status !== 'down') {
      // Create incident
      await supabase.from('uptime_incidents').insert({
        monitor_id: monitor.id,
        status: 'ongoing',
        cause: isTimeout ? 'timeout' : 'connection_error',
      });
      
      // TODO: Send alert notification
    }

    // Update monitor status
    await supabase
      .from('uptime_monitors')
      .update({ 
        current_status: 'down',
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', monitor.id);

    return { monitor_id: monitor.id, status: 'down', error: errorMessage };
  }
}

// Also support GET for easy testing
export async function GET(request: Request) {
  return POST(request);
}
