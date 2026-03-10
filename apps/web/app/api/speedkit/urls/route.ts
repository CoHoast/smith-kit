import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/speedkit/urls - List user's monitored URLs
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get URLs with their latest scores
  const { data: urls, error } = await supabase
    .from('speedkit_urls')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get latest results for each URL
  const urlsWithScores = await Promise.all(
    (urls || []).map(async (url) => {
      const { data: results } = await supabase
        .from('speedkit_results')
        .select('*')
        .eq('url_id', url.id)
        .order('scanned_at', { ascending: false })
        .limit(2); // Get latest mobile and desktop

      const desktop = results?.find(r => r.device === 'desktop');
      const mobile = results?.find(r => r.device === 'mobile');

      return {
        ...url,
        latest_desktop: desktop || null,
        latest_mobile: mobile || null,
      };
    })
  );

  return NextResponse.json({ urls: urlsWithScores });
}

// POST /api/speedkit/urls - Add a URL to monitor
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    url, 
    name,
    scan_frequency = 'daily',
    alert_threshold = 80,
  } = body;

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Check usage limits
  const { count } = await supabase
    .from('speedkit_urls')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const limits: Record<string, number> = { free: 3, pro: 20, premium: 100 };
  const plan = subscription?.plan || 'free';
  const limit = limits[plan] || 3;

  if ((count || 0) >= limit) {
    return NextResponse.json({ 
      error: `You've reached the ${plan} plan limit of ${limit} URLs. Upgrade to add more.` 
    }, { status: 403 });
  }

  // Create the URL
  const { data: newUrl, error } = await supabase
    .from('speedkit_urls')
    .insert({
      user_id: user.id,
      url,
      name: name || new URL(url).hostname,
      scan_frequency,
      alert_threshold,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: newUrl }, { status: 201 });
}

// DELETE /api/speedkit/urls - Delete a URL
export async function DELETE(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'URL ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('speedkit_urls')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PUT /api/speedkit/urls - Update a URL
export async function PUT(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, scan_frequency, alert_threshold, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: 'URL ID is required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (scan_frequency !== undefined) updates.scan_frequency = scan_frequency;
  if (alert_threshold !== undefined) updates.alert_threshold = alert_threshold;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data: updatedUrl, error } = await supabase
    .from('speedkit_urls')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: updatedUrl });
}
