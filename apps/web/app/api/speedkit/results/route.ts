import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/speedkit/results - Get scan history for a URL
export async function GET(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const urlId = searchParams.get('url_id');
  const device = searchParams.get('device'); // 'mobile', 'desktop', or null for both
  const limit = parseInt(searchParams.get('limit') || '30');
  const days = parseInt(searchParams.get('days') || '30');

  if (!urlId) {
    return NextResponse.json({ error: 'url_id is required' }, { status: 400 });
  }

  // Verify user owns this URL
  const { data: urlRecord, error: urlError } = await supabase
    .from('speedkit_urls')
    .select('*')
    .eq('id', urlId)
    .eq('user_id', user.id)
    .single();

  if (urlError || !urlRecord) {
    return NextResponse.json({ error: 'URL not found' }, { status: 404 });
  }

  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Build query
  let query = supabase
    .from('speedkit_results')
    .select('*')
    .eq('url_id', urlId)
    .gte('scanned_at', startDate.toISOString())
    .order('scanned_at', { ascending: false })
    .limit(limit);

  if (device) {
    query = query.eq('device', device);
  }

  const { data: results, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by device for charting
  const desktop = results?.filter(r => r.device === 'desktop') || [];
  const mobile = results?.filter(r => r.device === 'mobile') || [];

  // Calculate averages
  const calcAvg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  const desktopPerformance = desktop.map(r => r.performance_score).filter(Boolean) as number[];
  const mobilePerformance = mobile.map(r => r.performance_score).filter(Boolean) as number[];

  return NextResponse.json({
    url: urlRecord,
    results: results || [],
    desktop: {
      results: desktop,
      avgPerformance: calcAvg(desktopPerformance),
      latest: desktop[0] || null,
    },
    mobile: {
      results: mobile,
      avgPerformance: calcAvg(mobilePerformance),
      latest: mobile[0] || null,
    },
    stats: {
      totalScans: results?.length || 0,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
    },
  });
}
