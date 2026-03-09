import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// POST /api/errorwatch/track - Track an error
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
  }

  const apiKey = authHeader.replace('Bearer ', '');

  // Use service role for API key validation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Validate API key and get project
  const { data: project, error: projectError } = await supabase
    .from('errorwatch_projects')
    .select('id, is_active')
    .eq('api_key', apiKey)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  if (!project.is_active) {
    return NextResponse.json({ error: 'Project is inactive' }, { status: 403 });
  }

  const body = await request.json();
  const {
    error_type,
    message,
    stack_trace,
    level = 'error',
    url,
    user_id,
    user_email,
    browser,
    os,
    device,
    release,
    environment = 'production',
    tags = {},
    extra = {},
  } = body;

  if (!error_type || !message) {
    return NextResponse.json({ error: 'error_type and message are required' }, { status: 400 });
  }

  // Generate fingerprint for grouping similar errors
  const fingerprintData = `${error_type}:${message.substring(0, 200)}:${stack_trace?.split('\n')[0] || ''}`;
  const fingerprint = crypto.createHash('md5').update(fingerprintData).digest('hex');

  // Upsert issue (create or update)
  const { data: existingIssue } = await supabase
    .from('errorwatch_issues')
    .select('id, event_count, status')
    .eq('project_id', project.id)
    .eq('fingerprint', fingerprint)
    .single();

  let issueId: string;

  if (existingIssue) {
    // Update existing issue
    const isRegression = existingIssue.status === 'resolved';
    
    const { data: updatedIssue, error: updateError } = await supabase
      .from('errorwatch_issues')
      .update({
        last_seen: new Date().toISOString(),
        event_count: existingIssue.event_count + 1,
        is_regression: isRegression,
        status: isRegression ? 'unresolved' : existingIssue.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingIssue.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update issue:', updateError);
    }
    issueId = existingIssue.id;
  } else {
    // Create new issue
    const { data: newIssue, error: createError } = await supabase
      .from('errorwatch_issues')
      .insert({
        project_id: project.id,
        fingerprint,
        error_type,
        message: message.substring(0, 1000),
        level,
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create issue:', createError);
      return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
    }
    issueId = newIssue.id;
  }

  // Insert error event
  const { data: error, error: insertError } = await supabase
    .from('errorwatch_errors')
    .insert({
      project_id: project.id,
      issue_id: issueId,
      error_type,
      message,
      stack_trace,
      fingerprint,
      level,
      url,
      user_id_ext: user_id,
      user_email,
      browser,
      os,
      device,
      release_version: release,
      environment,
      tags,
      extra,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to insert error:', insertError);
    return NextResponse.json({ error: 'Failed to track error' }, { status: 500 });
  }

  // Update daily stats (best effort, don't fail if this errors)
  const today = new Date().toISOString().split('T')[0];
  try {
    await supabase
      .from('errorwatch_daily_stats')
      .upsert({
        project_id: project.id,
        date: today,
        error_count: 1,
      }, {
        onConflict: 'project_id,date',
      });
  } catch {
    // Ignore stats errors
  }

  return NextResponse.json({ 
    success: true, 
    error_id: error.id,
    issue_id: issueId,
  });
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
