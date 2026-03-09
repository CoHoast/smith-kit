import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/webhooks/requests/[id]/replay - Replay a webhook request
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the original request
  const { data: webhookRequest, error: fetchError } = await supabase
    .from('webhook_requests')
    .select(`
      *,
      endpoint:webhook_endpoints (
        user_id
      )
    `)
    .eq('id', id)
    .single();

  if (fetchError || !webhookRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  // Verify ownership
  if (webhookRequest.endpoint?.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { target_url, method, headers: customHeaders, body: customBody } = body;

  if (!target_url) {
    return NextResponse.json({ error: 'target_url is required' }, { status: 400 });
  }

  // Merge headers
  const replayHeaders: Record<string, string> = {
    ...(webhookRequest.headers || {}),
    ...(customHeaders || {}),
    'X-Replayed-From': 'SmithKit-WebhookLab',
    'X-Original-Request-Id': id,
  };

  // Remove hop-by-hop headers
  delete replayHeaders['host'];
  delete replayHeaders['connection'];
  delete replayHeaders['content-length'];

  const replayMethod = method || webhookRequest.method;
  const replayBody = customBody !== undefined ? customBody : webhookRequest.body;

  const startTime = Date.now();
  let responseStatus = null;
  let responseBody = null;
  let errorMessage = null;

  try {
    const response = await fetch(target_url, {
      method: replayMethod,
      headers: replayHeaders,
      body: replayMethod !== 'GET' && replayMethod !== 'HEAD' ? replayBody : undefined,
    });

    responseStatus = response.status;
    responseBody = await response.text();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  const durationMs = Date.now() - startTime;

  // Log the replay
  const { data: replay, error: insertError } = await supabase
    .from('webhook_replays')
    .insert({
      request_id: id,
      target_url,
      method: replayMethod,
      headers: replayHeaders,
      body: replayBody,
      response_status: responseStatus,
      response_body: responseBody?.substring(0, 50000),
      duration_ms: durationMs,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to log replay:', insertError);
  }

  return NextResponse.json({
    replay_id: replay?.id,
    status: responseStatus,
    body: responseBody,
    duration_ms: durationMs,
    error: errorMessage,
  });
}
