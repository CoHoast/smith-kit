import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// Handle all HTTP methods for webhook capture
async function handleWebhook(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find endpoint by slug
  const { data: endpoint, error: endpointError } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (endpointError || !endpoint) {
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  }

  // Parse request details
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;
  const queryParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // Get headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Get body
  let body: string | null = null;
  let bodyJson: unknown = null;
  
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await request.text();
      if (body) {
        try {
          bodyJson = JSON.parse(body);
        } catch {
          // Not JSON, that's fine
        }
      }
    } catch {
      // No body
    }
  }

  // Get source IP
  const sourceIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') ||
                   'unknown';

  // Store the request
  const { data: webhookRequest, error: insertError } = await supabase
    .from('webhook_requests')
    .insert({
      endpoint_id: endpoint.id,
      method,
      path,
      query_params: queryParams,
      headers,
      body,
      body_json: bodyJson,
      source_ip: sourceIp,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to store webhook:', insertError);
  }

  // Forward if configured
  if (endpoint.forward_url && webhookRequest) {
    const forwardStart = Date.now();
    let forwardStatus = 'success';
    let forwardResponseStatus = null;
    let forwardResponseBody = null;
    let forwardError = null;

    try {
      const forwardResponse = await fetch(endpoint.forward_url, {
        method,
        headers: {
          ...headers,
          'X-Webhook-Request-Id': webhookRequest.id,
          'X-Forwarded-From': 'SmithKit-WebhookLab',
        },
        body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
      });

      forwardResponseStatus = forwardResponse.status;
      forwardResponseBody = await forwardResponse.text().catch(() => null);
      
      if (!forwardResponse.ok) {
        forwardStatus = 'failed';
      }
    } catch (error) {
      forwardStatus = 'failed';
      forwardError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Log forward attempt
    await supabase.from('webhook_forwards').insert({
      request_id: webhookRequest.id,
      forward_url: endpoint.forward_url,
      status: forwardStatus,
      response_status: forwardResponseStatus,
      response_body: forwardResponseBody?.substring(0, 10000),
      duration_ms: Date.now() - forwardStart,
      error_message: forwardError,
    });
  }

  // Return configured response
  const responseHeaders = new Headers(endpoint.response_headers || {});
  
  return new NextResponse(endpoint.response_body || '{"success": true}', {
    status: endpoint.response_status || 200,
    headers: responseHeaders,
  });
}

export const GET = handleWebhook;
export const POST = handleWebhook;
export const PUT = handleWebhook;
export const PATCH = handleWebhook;
export const DELETE = handleWebhook;
