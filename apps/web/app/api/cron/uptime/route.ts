import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import https from 'https';
import { TLSSocket } from 'tls';

// This endpoint is called by Railway cron or external cron services
// It checks all active monitors and updates their status

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for all checks

// Simple token verification - use a URL token for cron services
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow if no secret is set (for initial testing) or if token matches
  if (cronSecret && token !== cronSecret) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return runUptimeChecks();
}

// Also support POST for Railway cron
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return runUptimeChecks();
}

async function runUptimeChecks() {
  const startTime = Date.now();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all active monitors
  const { data: monitors, error } = await supabase
    .from('uptime_monitors')
    .select('*')
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!monitors || monitors.length === 0) {
    return NextResponse.json({ 
      message: 'No active monitors',
      checked: 0,
      duration_ms: Date.now() - startTime
    });
  }

  // Run all checks in parallel
  const results = await Promise.allSettled(
    monitors.map(monitor => checkMonitor(monitor, supabase))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return NextResponse.json({
    checked: monitors.length,
    successful,
    failed,
    duration_ms: Date.now() - startTime
  });
}

async function checkMonitor(
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
  supabase: ReturnType<typeof createClient>
) {
  const startTime = Date.now();
  
  // Check SSL for HTTPS URLs
  let sslDaysLeft: number | null = null;
  try {
    const parsedUrl = new URL(monitor.url);
    if (parsedUrl.protocol === 'https:') {
      sslDaysLeft = await checkSSL(parsedUrl.hostname);
    }
  } catch (e) {
    // Ignore SSL check errors
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), (monitor.timeout_seconds || 30) * 1000);

    const response = await fetch(monitor.url, {
      method: monitor.method || 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'SmithKit-Uptime/1.0',
      },
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - startTime;
    const expectedStatus = monitor.expected_status || 200;
    const newStatus = response.status === expectedStatus ? 'up' : 'degraded';

    // Save check result
    await supabase.from('uptime_checks').insert({
      monitor_id: monitor.id,
      status: newStatus,
      response_time_ms: responseTime,
      status_code: response.status,
      region: 'us-east',
      ssl_days_left: sslDaysLeft,
    });

    // Update monitor status
    await supabase
      .from('uptime_monitors')
      .update({ 
        current_status: newStatus,
        last_checked_at: new Date().toISOString(),
        ssl_days_left: sslDaysLeft,
      })
      .eq('id', monitor.id);

    // Handle incidents if status changed
    if (monitor.current_status !== newStatus) {
      if (newStatus === 'up' && (monitor.current_status === 'down' || monitor.current_status === 'degraded')) {
        // Resolve incidents
        await supabase
          .from('uptime_incidents')
          .update({ 
            status: 'resolved',
            resolved_at: new Date().toISOString(),
          })
          .eq('monitor_id', monitor.id)
          .eq('status', 'ongoing');
      } else if (newStatus === 'degraded') {
        // Create incident
        await supabase.from('uptime_incidents').insert({
          monitor_id: monitor.id,
          status: 'ongoing',
          cause: 'status_code',
        });
      }
    }

    return { monitor_id: monitor.id, status: newStatus, response_time: responseTime };

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
      ssl_days_left: sslDaysLeft,
    });

    // Update monitor status to down
    if (monitor.current_status !== 'down') {
      await supabase.from('uptime_incidents').insert({
        monitor_id: monitor.id,
        status: 'ongoing',
        cause: isTimeout ? 'timeout' : 'connection_error',
      });
    }

    await supabase
      .from('uptime_monitors')
      .update({ 
        current_status: 'down',
        last_checked_at: new Date().toISOString(),
        ssl_days_left: sslDaysLeft,
      })
      .eq('id', monitor.id);

    return { monitor_id: monitor.id, status: 'down', error: errorMessage };
  }
}

async function checkSSL(hostname: string): Promise<number | null> {
  return new Promise((resolve) => {
    const options = {
      hostname,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false,
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      const socket = res.socket as TLSSocket;
      const cert = socket.getPeerCertificate();
      
      if (!cert || Object.keys(cert).length === 0) {
        resolve(null);
        return;
      }

      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysLeft = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      resolve(daysLeft);
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}
