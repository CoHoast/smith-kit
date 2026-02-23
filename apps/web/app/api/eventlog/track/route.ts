import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/eventlog/track - Public API to track events
export async function POST(request: NextRequest) {
  // Get API key from header
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
    .from('eventlog_projects')
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
  const { channel, event, description, icon, tags, user_id, notify, metadata } = body;

  if (!channel || !event) {
    return NextResponse.json({ error: 'channel and event are required' }, { status: 400 });
  }

  // Find or create channel
  let channelRecord = await supabase
    .from('eventlog_channels')
    .select('id')
    .eq('project_id', project.id)
    .eq('name', channel)
    .single();

  if (!channelRecord.data) {
    const { data: newChannel } = await supabase
      .from('eventlog_channels')
      .insert({
        project_id: project.id,
        name: channel,
      })
      .select('id')
      .single();
    channelRecord = { data: newChannel, error: null };
  }

  // Create event
  const { data: eventRecord, error: eventError } = await supabase
    .from('eventlog_events')
    .insert({
      project_id: project.id,
      channel_id: channelRecord.data?.id,
      channel_name: channel,
      event,
      description: description || null,
      icon: icon || null,
      tags: tags || {},
      user_id_ext: user_id || null,
      notify: notify || false,
      metadata: metadata || {},
    })
    .select()
    .single();

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  // TODO: Send notifications if notify=true

  return NextResponse.json({ 
    success: true, 
    event_id: eventRecord.id 
  });
}

// Also support GET for simple tracking via URL
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('key');
  const channel = searchParams.get('channel');
  const event = searchParams.get('event');

  if (!apiKey || !channel || !event) {
    return NextResponse.json({ error: 'key, channel, and event are required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: project } = await supabase
    .from('eventlog_projects')
    .select('id, is_active')
    .eq('api_key', apiKey)
    .single();

  if (!project || !project.is_active) {
    return NextResponse.json({ error: 'Invalid or inactive project' }, { status: 401 });
  }

  // Find or create channel
  let channelRecord = await supabase
    .from('eventlog_channels')
    .select('id')
    .eq('project_id', project.id)
    .eq('name', channel)
    .single();

  if (!channelRecord.data) {
    const { data: newChannel } = await supabase
      .from('eventlog_channels')
      .insert({ project_id: project.id, name: channel })
      .select('id')
      .single();
    channelRecord = { data: newChannel, error: null };
  }

  await supabase.from('eventlog_events').insert({
    project_id: project.id,
    channel_id: channelRecord.data?.id,
    channel_name: channel,
    event,
    description: searchParams.get('description'),
    icon: searchParams.get('icon'),
    user_id_ext: searchParams.get('user_id'),
  });

  // Return 1x1 transparent GIF for pixel tracking
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  return new NextResponse(gif, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store',
    },
  });
}
