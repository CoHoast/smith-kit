import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import https from 'https';
import { TLSSocket } from 'tls';
import { sendEmail, getDowntimeAlertEmail, getUptimeRecoveryEmail, getSSLExpiryEmail } from '@/lib/email';
import { sendUptimeAlert } from '@/lib/webhooks';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

// SSL expiry alert thresholds (days)
const SSL_ALERT_THRESHOLDS = [30, 14, 7];

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

// Check SSL certificate and return days until expiry
async function checkSSL(hostname: string): Promise<{ daysLeft: number | null; error?: string }> {
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
        resolve({ daysLeft: null, error: 'No certificate found' });
        return;
      }

      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysLeft = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      resolve({ daysLeft });
    });

    req.on('error', (error) => {
      resolve({ daysLeft: null, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ daysLeft: null, error: 'Connection timeout' });
    });

    req.end();
  });
}

// Get user's notification settings (webhook URLs)
async function getUserNotificationSettings(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, discord_webhook_url, slack_webhook_url, ssl_alert_sent_days')
    .eq('id', userId)
    .single();
  
  return profile || { email: null, discord_webhook_url: null, slack_webhook_url: null, ssl_alert_sent_days: null };
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
  supabase: ReturnType<typeof createClient>
) {
  const startTime = Date.now();
  
  // Get user notification settings
  const notificationSettings = await getUserNotificationSettings(supabase, monitor.user_id);
  
  // Check SSL certificate for HTTPS URLs
  let sslDaysLeft: number | null = null;
  try {
    const parsedUrl = new URL(monitor.url);
    if (parsedUrl.protocol === 'https:') {
      const sslResult = await checkSSL(parsedUrl.hostname);
      sslDaysLeft = sslResult.daysLeft;
      
      // Check if we should send SSL expiry alerts
      if (sslDaysLeft !== null) {
        const alreadySentDays: number[] = notificationSettings.ssl_alert_sent_days || [];
        
        for (const threshold of SSL_ALERT_THRESHOLDS) {
          if (sslDaysLeft <= threshold && !alreadySentDays.includes(threshold)) {
            // Send SSL expiry alert
            await sendSSLExpiryAlerts(
              monitor.name,
              monitor.url,
              sslDaysLeft,
              notificationSettings
            );
            
            // Track that we sent this threshold alert
            const newSentDays = [...alreadySentDays, threshold];
            await supabase
              .from('profiles')
              .update({ ssl_alert_sent_days: newSentDays })
              .eq('id', monitor.user_id);
            
            break; // Only send one alert per check
          }
        }
        
        // Reset tracking if SSL is renewed (more than 30 days)
        if (sslDaysLeft > 30 && alreadySentDays.length > 0) {
          await supabase
            .from('profiles')
            .update({ ssl_alert_sent_days: [] })
            .eq('id', monitor.user_id);
        }
      }
    }
  } catch (e) {
    console.error('SSL check error:', e);
  }
  
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

    // Save check result with SSL info
    await supabase.from('uptime_checks').insert({
      monitor_id: monitor.id,
      status: newStatus,
      response_time_ms: responseTime,
      status_code: response.status,
      region: 'us-east',
      ssl_days_left: sslDaysLeft,
    });

    // Check for status change (for incident tracking)
    const statusChanged = monitor.current_status !== newStatus;

    // Update monitor status
    await supabase
      .from('uptime_monitors')
      .update({ 
        current_status: newStatus,
        last_checked_at: new Date().toISOString(),
        ssl_days_left: sslDaysLeft,
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
        
        const downDuration = incident?.started_at 
          ? formatDuration(new Date(incident.started_at), new Date())
          : 'unknown duration';
        
        // Resolve any ongoing incidents
        await supabase
          .from('uptime_incidents')
          .update({ 
            status: 'resolved',
            resolved_at: new Date().toISOString(),
          })
          .eq('monitor_id', monitor.id)
          .eq('status', 'ongoing');
        
        // Send recovery notifications (email + webhooks)
        await sendRecoveryAlerts(monitor.name, monitor.url, downDuration, notificationSettings);
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
      ssl_days_left: sslDaysLeft,
    });

    // Check for status change
    if (monitor.current_status !== 'down') {
      // Create incident
      await supabase.from('uptime_incidents').insert({
        monitor_id: monitor.id,
        status: 'ongoing',
        cause: isTimeout ? 'timeout' : 'connection_error',
      });
      
      // Send downtime alerts (email + webhooks)
      await sendDowntimeAlerts(monitor.name, monitor.url, notificationSettings);
    }

    // Update monitor status
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

// Send downtime alerts via all channels
async function sendDowntimeAlerts(
  siteName: string,
  url: string,
  settings: { email?: string | null; discord_webhook_url?: string | null; slack_webhook_url?: string | null }
) {
  const promises: Promise<unknown>[] = [];
  
  // Email
  if (settings.email) {
    const { subject, html } = getDowntimeAlertEmail(siteName, url, new Date());
    promises.push(sendEmail({ to: settings.email, subject, html }));
  }
  
  // Discord & Slack webhooks
  promises.push(sendUptimeAlert('down', siteName, url, settings));
  
  await Promise.allSettled(promises);
}

// Send recovery alerts via all channels
async function sendRecoveryAlerts(
  siteName: string,
  url: string,
  downtime: string,
  settings: { email?: string | null; discord_webhook_url?: string | null; slack_webhook_url?: string | null }
) {
  const promises: Promise<unknown>[] = [];
  
  // Email
  if (settings.email) {
    const { subject, html } = getUptimeRecoveryEmail(siteName, url, downtime);
    promises.push(sendEmail({ to: settings.email, subject, html }));
  }
  
  // Discord & Slack webhooks
  promises.push(sendUptimeAlert('up', siteName, url, settings, { downtime }));
  
  await Promise.allSettled(promises);
}

// Send SSL expiry alerts via all channels
async function sendSSLExpiryAlerts(
  siteName: string,
  url: string,
  daysLeft: number,
  settings: { email?: string | null; discord_webhook_url?: string | null; slack_webhook_url?: string | null }
) {
  const promises: Promise<unknown>[] = [];
  
  // Email
  if (settings.email) {
    const { subject, html } = getSSLExpiryEmail(siteName, url, daysLeft);
    promises.push(sendEmail({ to: settings.email, subject, html }));
  }
  
  // Discord & Slack webhooks
  promises.push(sendUptimeAlert('ssl', siteName, url, settings, { sslDaysLeft: daysLeft }));
  
  await Promise.allSettled(promises);
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
