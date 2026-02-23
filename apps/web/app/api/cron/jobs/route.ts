import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Parse cron expression and calculate next run time
function getNextRunTime(cronExpression: string, timezone: string = 'UTC'): Date {
  // Simple implementation - in production use a proper cron parser
  // For now, just return next minute as placeholder
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
}

// GET /api/cron/jobs - List user's cron jobs
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: jobs, error } = await supabase
    .from('cron_jobs')
    .select(`
      *,
      cron_executions (
        id,
        status,
        started_at,
        duration_ms,
        response_status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get last 5 executions per job
  const jobsWithStats = jobs?.map(job => {
    const executions = job.cron_executions || [];
    const recentExecutions = executions.slice(0, 5);
    const successCount = executions.filter((e: { status: string }) => e.status === 'success').length;
    const failureCount = executions.filter((e: { status: string }) => e.status === 'failed').length;
    
    return {
      ...job,
      recent_executions: recentExecutions,
      success_count: successCount,
      failure_count: failureCount,
      cron_executions: undefined,
    };
  });

  return NextResponse.json({ jobs: jobsWithStats });
}

// POST /api/cron/jobs - Create a new cron job
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    name, 
    description, 
    url, 
    method = 'GET', 
    headers = {}, 
    body: requestBody,
    schedule,
    timezone = 'UTC',
    retry_count = 3,
    timeout_seconds = 30
  } = body;

  if (!name || !url || !schedule) {
    return NextResponse.json({ error: 'name, url, and schedule are required' }, { status: 400 });
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Calculate next run time
  const nextRunAt = getNextRunTime(schedule, timezone);

  const { data: job, error: createError } = await supabase
    .from('cron_jobs')
    .insert({
      user_id: user.id,
      name,
      description: description || null,
      url,
      method,
      headers,
      body: requestBody || null,
      schedule,
      timezone,
      retry_count,
      timeout_seconds,
      next_run_at: nextRunAt.toISOString(),
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  return NextResponse.json({ job }, { status: 201 });
}
