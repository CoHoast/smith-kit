import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendEmail, getDowntimeAlertEmail, getUptimeRecoveryEmail } from '@/lib/email';

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
    name: string;
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
      } else if (newStatus === 'up' && monitor.current_status === 'down') {
        // Get the incident to calculate downtime
        const { data: incident } = await supabase
          .from('uptime_incidents')
          .select('started_at')
          .eq('monitor_id', monitor.id)
          .eq('status', 'ongoing')
          .single();
        
        // Resolve any ongoing incidents
        await supabase
          .from('uptime_incidents')
          .update({ 
            status: 'resolved',
            resolved_at: new Date().toISOString(),
          })
          .eq('monitor_id', monitor.id)
          .eq('status', 'ongoing');
        
        // Send recovery notification
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', monitor.user_id)
            .single();
          
          if (profile?.email) {
            const downDuration = incident?.started_at 
              ? formatDuration(new Date(incident.started_at), new Date())
              : 'unknown duration';
            
            const { subject, html } = getUptimeRecoveryEmail(
              monitor.name,
              monitor.url,
              downDuration
            );
            await sendEmail({ to: profile.email, subject, html });
          }
        } catch (emailError) {
          console.error('Failed to send recovery alert:', emailError);
        }
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
      
      // Send alert notification
      try {
        // Get user email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', monitor.user_id)
          .single();
        
        if (profile?.email) {
          const { subject, html } = getDowntimeAlertEmail(
            monitor.name,
            monitor.url,
            new Date()
          );
          await sendEmail({ to: profile.email, subject, html });
        }
      } catch (emailError) {
        console.error('Failed to send downtime alert:', emailError);
      }
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

// Helper function to format duration
function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
