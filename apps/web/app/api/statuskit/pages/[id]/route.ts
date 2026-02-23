import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/statuskit/pages/[id] - Get a specific status page
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: page, error } = await supabase
    .from('status_pages')
    .select(`
      *,
      status_page_monitors (
        id,
        display_name,
        display_order,
        monitor:uptime_monitors (
          id,
          name,
          url,
          current_status,
          last_checked_at
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Status page not found' }, { status: 404 });
  }

  return NextResponse.json({ page });
}

// PATCH /api/statuskit/pages/[id] - Update a status page
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, logo_url, primary_color, is_public, show_uptime_chart, show_response_times, monitor_ids } = body;

  // Update status page
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (logo_url !== undefined) updates.logo_url = logo_url;
  if (primary_color !== undefined) updates.primary_color = primary_color;
  if (is_public !== undefined) updates.is_public = is_public;
  if (show_uptime_chart !== undefined) updates.show_uptime_chart = show_uptime_chart;
  if (show_response_times !== undefined) updates.show_response_times = show_response_times;

  const { data: page, error: updateError } = await supabase
    .from('status_pages')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Update monitor links if provided
  if (monitor_ids !== undefined) {
    // Remove existing links
    await supabase.from('status_page_monitors').delete().eq('status_page_id', id);
    
    // Add new links
    if (monitor_ids.length > 0) {
      const monitorLinks = monitor_ids.map((monitor_id: string, index: number) => ({
        status_page_id: id,
        monitor_id,
        display_order: index,
      }));
      await supabase.from('status_page_monitors').insert(monitorLinks);
    }
  }

  return NextResponse.json({ page });
}

// DELETE /api/statuskit/pages/[id] - Delete a status page
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('status_pages')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
