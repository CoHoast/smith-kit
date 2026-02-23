import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/cron/execute - Execute due cron jobs (called by external scheduler)
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find jobs due to run
  const now = new Date().toISOString();
  const { data: dueJobs, error: fetchError } = await supabase
    .from('cron_jobs')
    .select('*')
    .eq('is_active', true)
    .lte('next_run_at', now)
    .limit(10);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const results = [];

  for (const job of dueJobs || []) {
    const executionStart = Date.now();
    
    // Create execution record
    const { data: execution } = await supabase
      .from('cron_executions')
      .insert({
        job_id: job.id,
        status: 'running',
      })
      .select()
      .single();

    let status = 'success';
    let responseStatus = null;
    let responseBody = null;
    let errorMessage = null;

    try {
      // Execute the job
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), job.timeout_seconds * 1000);

      const response = await fetch(job.url, {
        method: job.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SmithKit-CronPilot/1.0',
          ...job.headers,
        },
        body: job.method !== 'GET' && job.body ? job.body : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      responseStatus = response.status;
      responseBody = await response.text().catch(() => null);

      if (!response.ok) {
        status = 'failed';
        errorMessage = `HTTP ${response.status}`;
      }
    } catch (error) {
      status = 'failed';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          status = 'timeout';
          errorMessage = `Timeout after ${job.timeout_seconds}s`;
        } else {
          errorMessage = error.message;
        }
      }
    }

    const durationMs = Date.now() - executionStart;

    // Update execution record
    if (execution) {
      await supabase
        .from('cron_executions')
        .update({
          status,
          completed_at: new Date().toISOString(),
          duration_ms: durationMs,
          response_status: responseStatus,
          response_body: responseBody?.substring(0, 10000), // Limit stored response
          error_message: errorMessage,
        })
        .eq('id', execution.id);
    }

    // Calculate next run time (simple: add 1 minute for now)
    // In production, use proper cron parser
    const nextRun = new Date();
    nextRun.setMinutes(nextRun.getMinutes() + 1);

    // Update job
    await supabase
      .from('cron_jobs')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: nextRun.toISOString(),
      })
      .eq('id', job.id);

    results.push({
      job_id: job.id,
      job_name: job.name,
      status,
      duration_ms: durationMs,
    });
  }

  return NextResponse.json({ 
    executed: results.length,
    results 
  });
}

// GET - Manual trigger for a specific job
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');
  const secret = searchParams.get('secret');
  
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!jobId) {
    return NextResponse.json({ error: 'job_id required' }, { status: 400 });
  }

  // Trigger single job execution
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: job } = await supabase
    .from('cron_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Execute immediately
  const executionStart = Date.now();
  let status = 'success';
  let responseStatus = null;
  let errorMessage = null;

  try {
    const response = await fetch(job.url, {
      method: job.method,
      headers: { 'User-Agent': 'SmithKit-CronPilot/1.0', ...job.headers },
      body: job.method !== 'GET' && job.body ? job.body : undefined,
    });
    responseStatus = response.status;
    if (!response.ok) {
      status = 'failed';
      errorMessage = `HTTP ${response.status}`;
    }
  } catch (error) {
    status = 'failed';
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  // Log execution
  await supabase.from('cron_executions').insert({
    job_id: job.id,
    status,
    completed_at: new Date().toISOString(),
    duration_ms: Date.now() - executionStart,
    response_status: responseStatus,
    error_message: errorMessage,
  });

  return NextResponse.json({ status, job_id: jobId });
}
