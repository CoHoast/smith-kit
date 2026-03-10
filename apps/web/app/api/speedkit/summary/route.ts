import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/speedkit/summary - Dashboard summary
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all URLs
  const { data: urls, error: urlsError } = await supabase
    .from('speedkit_urls')
    .select('*')
    .eq('user_id', user.id);

  if (urlsError) {
    return NextResponse.json({ error: urlsError.message }, { status: 500 });
  }

  if (!urls || urls.length === 0) {
    return NextResponse.json({
      totalUrls: 0,
      avgDesktopScore: null,
      avgMobileScore: null,
      urlsNeedingAttention: 0,
      recentScans: 0,
    });
  }

  // Get latest results for all URLs
  const urlIds = urls.map(u => u.id);
  const { data: latestResults } = await supabase
    .from('speedkit_results')
    .select('*')
    .in('url_id', urlIds)
    .order('scanned_at', { ascending: false });

  // Get unique latest result per URL per device
  const latestByUrlDevice = new Map<string, typeof latestResults[0]>();
  (latestResults || []).forEach(result => {
    const key = `${result.url_id}-${result.device}`;
    if (!latestByUrlDevice.has(key)) {
      latestByUrlDevice.set(key, result);
    }
  });

  const latest = Array.from(latestByUrlDevice.values());
  
  // Calculate averages
  const desktopScores = latest
    .filter(r => r.device === 'desktop' && r.performance_score)
    .map(r => r.performance_score as number);
  
  const mobileScores = latest
    .filter(r => r.device === 'mobile' && r.performance_score)
    .map(r => r.performance_score as number);

  const avgDesktop = desktopScores.length > 0
    ? Math.round(desktopScores.reduce((a, b) => a + b, 0) / desktopScores.length)
    : null;

  const avgMobile = mobileScores.length > 0
    ? Math.round(mobileScores.reduce((a, b) => a + b, 0) / mobileScores.length)
    : null;

  // Count URLs needing attention (score < 80)
  const urlsNeedingAttention = urls.filter(url => {
    const desktopResult = latest.find(r => r.url_id === url.id && r.device === 'desktop');
    const mobileResult = latest.find(r => r.url_id === url.id && r.device === 'mobile');
    
    const threshold = url.alert_threshold || 80;
    
    return (desktopResult && desktopResult.performance_score < threshold) ||
           (mobileResult && mobileResult.performance_score < threshold);
  }).length;

  // Count recent scans (last 24 hours)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const { count: recentScans } = await supabase
    .from('speedkit_results')
    .select('*', { count: 'exact', head: true })
    .in('url_id', urlIds)
    .gte('scanned_at', oneDayAgo.toISOString());

  return NextResponse.json({
    totalUrls: urls.length,
    avgDesktopScore: avgDesktop,
    avgMobileScore: avgMobile,
    urlsNeedingAttention,
    recentScans: recentScans || 0,
    urls: urls.map(url => {
      const desktopResult = latest.find(r => r.url_id === url.id && r.device === 'desktop');
      const mobileResult = latest.find(r => r.url_id === url.id && r.device === 'mobile');
      
      return {
        ...url,
        latest_desktop: desktopResult || null,
        latest_mobile: mobileResult || null,
      };
    }),
  });
}
