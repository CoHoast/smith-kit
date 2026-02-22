import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

interface RouteProps {
  params: Promise<{ username: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const style = searchParams.get('style') || 'flat';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Find user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .or(`github_username.eq.${username},email.ilike.${username}%`)
    .single();

  if (!profile) {
    return new NextResponse(generateBadge('uptime', 'unknown', '#666', style), {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=300' },
    });
  }

  // Get checks from last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: monitors } = await supabase
    .from('uptime_monitors')
    .select('id')
    .eq('user_id', profile.id)
    .eq('is_active', true);

  const monitorIds = monitors?.map(m => m.id) || [];

  const { data: checks } = await supabase
    .from('uptime_checks')
    .select('status')
    .in('monitor_id', monitorIds)
    .gte('checked_at', thirtyDaysAgo);

  const totalChecks = checks?.length || 0;
  const upChecks = checks?.filter(c => c.status === 'up').length || 0;
  const uptimePercent = totalChecks > 0 ? ((upChecks / totalChecks) * 100).toFixed(1) : '100.0';

  // Determine color based on uptime
  const uptime = parseFloat(uptimePercent);
  const color = uptime >= 99.9 ? '#22c55e' : 
                uptime >= 99 ? '#84cc16' :
                uptime >= 95 ? '#eab308' :
                '#ef4444';

  return new NextResponse(generateBadge('uptime', `${uptimePercent}%`, color, style), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  });
}

function generateBadge(label: string, value: string, color: string, style: string): string {
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = labelWidth + valueWidth;

  if (style === 'for-the-badge') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28">
      <rect width="${totalWidth}" height="28" rx="4" fill="#1e1e2e"/>
      <rect x="${labelWidth}" width="${valueWidth}" height="28" rx="4" fill="${color}"/>
      <rect x="${labelWidth}" width="4" height="28" fill="${color}"/>
      <text x="${labelWidth/2}" y="18" fill="#fff" font-family="system-ui,sans-serif" font-size="11" font-weight="600" text-anchor="middle" text-transform="uppercase">${label.toUpperCase()}</text>
      <text x="${labelWidth + valueWidth/2}" y="18" fill="#fff" font-family="system-ui,sans-serif" font-size="11" font-weight="600" text-anchor="middle">${value}</text>
    </svg>`;
  }

  // Flat style (default)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="a">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#a)">
      <rect width="${labelWidth}" height="20" fill="#555"/>
      <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
      <rect width="${totalWidth}" height="20" fill="url(#b)"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11">
      <text x="${labelWidth/2}" y="14">${label}</text>
      <text x="${labelWidth + valueWidth/2}" y="14">${value}</text>
    </g>
  </svg>`;
}
