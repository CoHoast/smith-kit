import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/statuskit/pages - List user's status pages
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: pages, error } = await supabase
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
          current_status
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pages });
}

// POST /api/statuskit/pages - Create a new status page
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, description, logo_url, primary_color, monitor_ids } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
  }

  // Create status page
  const { data: page, error: createError } = await supabase
    .from('status_pages')
    .insert({
      user_id: user.id,
      name,
      slug,
      description: description || null,
      logo_url: logo_url || null,
      primary_color: primary_color || '#6366f1',
    })
    .select()
    .single();

  if (createError) {
    if (createError.code === '23505') {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 400 });
    }
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  // Link monitors if provided
  if (monitor_ids && monitor_ids.length > 0) {
    const monitorLinks = monitor_ids.map((monitor_id: string, index: number) => ({
      status_page_id: page.id,
      monitor_id,
      display_order: index,
    }));

    await supabase.from('status_page_monitors').insert(monitorLinks);
  }

  return NextResponse.json({ page }, { status: 201 });
}
