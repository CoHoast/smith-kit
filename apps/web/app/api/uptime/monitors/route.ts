import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/uptime/monitors - List user's monitors
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: monitors, error } = await supabase
    .from('uptime_monitors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ monitors });
}

// POST /api/uptime/monitors - Create a new monitor
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    name, 
    url, 
    method = 'GET', 
    interval_seconds = 60,
    timeout_seconds = 30,
    expected_status = 200,
    headers = {},
  } = body;

  if (!name || !url) {
    return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Check usage limits
  const { count } = await supabase
    .from('uptime_monitors')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const limits: Record<string, number> = { free: 3, pro: 50, team: 200 };
  const plan = subscription?.plan || 'free';
  const limit = limits[plan] || 3;

  if ((count || 0) >= limit) {
    return NextResponse.json({ 
      error: `You've reached the ${plan} plan limit of ${limit} monitors. Upgrade to add more.` 
    }, { status: 403 });
  }

  // Create the monitor
  const { data: monitor, error } = await supabase
    .from('uptime_monitors')
    .insert({
      user_id: user.id,
      name,
      url,
      method,
      interval_seconds,
      timeout_seconds,
      expected_status,
      headers,
      is_active: true,
      current_status: 'unknown',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Run first check immediately
  await runCheck(monitor.id, url, method, timeout_seconds, expected_status, supabase);

  return NextResponse.json({ monitor }, { status: 201 });
}

// Helper to run a check
async function runCheck(
  monitorId: string, 
  url: string, 
  method: string, 
  timeoutSeconds: number,
  expectedStatus: number,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

    const response = await fetch(url, {
      method,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - startTime;
    const status = response.status === expectedStatus ? 'up' : 'degraded';

    // Save check result
    await supabase.from('uptime_checks').insert({
      monitor_id: monitorId,
      status,
      response_time_ms: responseTime,
      status_code: response.status,
      region: 'us-east',
    });

    // Update monitor status
    await supabase
      .from('uptime_monitors')
      .update({ 
        current_status: status,
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', monitorId);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Save failed check
    await supabase.from('uptime_checks').insert({
      monitor_id: monitorId,
      status: 'down',
      response_time_ms: responseTime,
      error_message: errorMessage,
      region: 'us-east',
    });

    // Update monitor status
    await supabase
      .from('uptime_monitors')
      .update({ 
        current_status: 'down',
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', monitorId);
  }
}
