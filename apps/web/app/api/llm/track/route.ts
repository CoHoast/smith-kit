import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/llm/track - Track an LLM request
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find project by API key
  const { data: project, error: projectError } = await supabase
    .from('llm_projects')
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
    provider,
    model,
    request_type = 'completion',
    prompt_tokens,
    completion_tokens,
    total_tokens,
    latency_ms,
    status = 'success',
    error_message,
    user_id,
    session_id,
    metadata = {},
  } = body;

  if (!provider || !model) {
    return NextResponse.json({ error: 'provider and model are required' }, { status: 400 });
  }

  // Calculate cost from pricing table
  let costCents = null;
  if (prompt_tokens || completion_tokens) {
    const { data: pricing } = await supabase
      .from('llm_pricing')
      .select('input_cost_per_1k, output_cost_per_1k')
      .eq('provider', provider)
      .eq('model', model)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (pricing) {
      const inputCost = ((prompt_tokens || 0) / 1000) * Number(pricing.input_cost_per_1k);
      const outputCost = ((completion_tokens || 0) / 1000) * Number(pricing.output_cost_per_1k);
      costCents = (inputCost + outputCost) * 100; // Convert to cents
    }
  }

  // Insert request
  const { data: llmRequest, error: insertError } = await supabase
    .from('llm_requests')
    .insert({
      project_id: project.id,
      provider,
      model,
      request_type,
      prompt_tokens: prompt_tokens || null,
      completion_tokens: completion_tokens || null,
      total_tokens: total_tokens || (prompt_tokens || 0) + (completion_tokens || 0),
      cost_cents: costCents,
      latency_ms: latency_ms || null,
      status,
      error_message: error_message || null,
      user_id_ext: user_id || null,
      session_id: session_id || null,
      metadata,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Update daily stats (upsert)
  const today = new Date().toISOString().split('T')[0];
  
  await supabase.rpc('upsert_llm_daily_stats', {
    p_project_id: project.id,
    p_date: today,
    p_provider: provider,
    p_model: model,
    p_tokens: total_tokens || (prompt_tokens || 0) + (completion_tokens || 0),
    p_cost: costCents || 0,
    p_latency: latency_ms || 0,
    p_is_error: status === 'error',
  }).catch(() => {
    // RPC might not exist yet, that's OK
  });

  return NextResponse.json({
    success: true,
    request_id: llmRequest.id,
    cost_cents: costCents,
  });
}
