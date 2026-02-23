import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// GET /api/webhooks/endpoints - List user's endpoints
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: endpoints, error } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get request counts for each endpoint
  const endpointsWithCounts = await Promise.all(
    (endpoints || []).map(async (endpoint) => {
      const { count } = await supabase
        .from('webhook_requests')
        .select('*', { count: 'exact', head: true })
        .eq('endpoint_id', endpoint.id);
      
      // Get last request time
      const { data: lastRequest } = await supabase
        .from('webhook_requests')
        .select('received_at')
        .eq('endpoint_id', endpoint.id)
        .order('received_at', { ascending: false })
        .limit(1)
        .single();
      
      return { 
        ...endpoint, 
        request_count: count || 0,
        last_request_at: lastRequest?.received_at || null,
      };
    })
  );

  return NextResponse.json({ endpoints: endpointsWithCounts });
}

// POST /api/webhooks/endpoints - Create a new endpoint
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, forward_url, response_status, response_body } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Generate unique slug
  const slug = crypto.randomBytes(8).toString('hex');

  const { data: endpoint, error: createError } = await supabase
    .from('webhook_endpoints')
    .insert({
      user_id: user.id,
      name,
      slug,
      description: description || null,
      forward_url: forward_url || null,
      response_status: response_status || 200,
      response_body: response_body || '{"success": true}',
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  return NextResponse.json({ endpoint }, { status: 201 });
}
