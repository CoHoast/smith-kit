import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY;

interface PageSpeedResult {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  rawResponse?: unknown;
}

async function runPageSpeedScan(url: string, strategy: 'mobile' | 'desktop'): Promise<PageSpeedResult | null> {
  try {
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = PAGESPEED_API_KEY
      ? `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&key=${PAGESPEED_API_KEY}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`
      : `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;

    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error('PageSpeed API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    
    // Extract scores (they come as 0-1, we want 0-100)
    const categories = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};

    return {
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
      bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      coreWebVitals: {
        lcp: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
        fid: Math.round(audits['max-potential-fid']?.numericValue || audits['total-blocking-time']?.numericValue || 0),
        cls: parseFloat((audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3)),
        fcp: Math.round(audits['first-contentful-paint']?.numericValue || 0),
        ttfb: Math.round(audits['server-response-time']?.numericValue || 0),
      },
      rawResponse: data,
    };
  } catch (error) {
    console.error('PageSpeed scan error:', error);
    return null;
  }
}

// POST /api/speedkit/scan - Run an on-demand scan
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { url, url_id, device = 'both' } = body;

  if (!url && !url_id) {
    return NextResponse.json({ error: 'URL or URL ID is required' }, { status: 400 });
  }

  let targetUrl = url;
  let urlRecord = null;

  // If url_id provided, fetch the URL record
  if (url_id) {
    const { data: urlData, error } = await supabase
      .from('speedkit_urls')
      .select('*')
      .eq('id', url_id)
      .eq('user_id', user.id)
      .single();

    if (error || !urlData) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    targetUrl = urlData.url;
    urlRecord = urlData;
  }

  // Validate URL
  try {
    new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const results: { desktop?: PageSpeedResult | null; mobile?: PageSpeedResult | null } = {};

  // Run scans based on device preference
  if (device === 'desktop' || device === 'both') {
    results.desktop = await runPageSpeedScan(targetUrl, 'desktop');
  }

  if (device === 'mobile' || device === 'both') {
    results.mobile = await runPageSpeedScan(targetUrl, 'mobile');
  }

  // If we have a url_id, save results to database
  if (url_id && urlRecord) {
    const now = new Date().toISOString();

    if (results.desktop) {
      await supabase.from('speedkit_results').insert({
        url_id,
        device: 'desktop',
        performance_score: results.desktop.performanceScore,
        accessibility_score: results.desktop.accessibilityScore,
        best_practices_score: results.desktop.bestPracticesScore,
        seo_score: results.desktop.seoScore,
        lcp_ms: results.desktop.coreWebVitals.lcp,
        fid_ms: results.desktop.coreWebVitals.fid,
        cls: results.desktop.coreWebVitals.cls,
        fcp_ms: results.desktop.coreWebVitals.fcp,
        ttfb_ms: results.desktop.coreWebVitals.ttfb,
        raw_response: results.desktop.rawResponse,
        scanned_at: now,
      });
    }

    if (results.mobile) {
      await supabase.from('speedkit_results').insert({
        url_id,
        device: 'mobile',
        performance_score: results.mobile.performanceScore,
        accessibility_score: results.mobile.accessibilityScore,
        best_practices_score: results.mobile.bestPracticesScore,
        seo_score: results.mobile.seoScore,
        lcp_ms: results.mobile.coreWebVitals.lcp,
        fid_ms: results.mobile.coreWebVitals.fid,
        cls: results.mobile.coreWebVitals.cls,
        fcp_ms: results.mobile.coreWebVitals.fcp,
        ttfb_ms: results.mobile.coreWebVitals.ttfb,
        raw_response: results.mobile.rawResponse,
        scanned_at: now,
      });
    }

    // Update last_scanned_at
    await supabase
      .from('speedkit_urls')
      .update({ last_scanned_at: now, updated_at: now })
      .eq('id', url_id);
  }

  return NextResponse.json({
    url: targetUrl,
    desktop: results.desktop ? {
      performanceScore: results.desktop.performanceScore,
      accessibilityScore: results.desktop.accessibilityScore,
      bestPracticesScore: results.desktop.bestPracticesScore,
      seoScore: results.desktop.seoScore,
      coreWebVitals: results.desktop.coreWebVitals,
    } : null,
    mobile: results.mobile ? {
      performanceScore: results.mobile.performanceScore,
      accessibilityScore: results.mobile.accessibilityScore,
      bestPracticesScore: results.mobile.bestPracticesScore,
      seoScore: results.mobile.seoScore,
      coreWebVitals: results.mobile.coreWebVitals,
    } : null,
  });
}
