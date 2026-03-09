import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

interface RouteProps {
  params: Promise<{ owner: string; repo: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  const { owner, repo } = await params;
  const fullRepoName = `${owner}/${repo}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smith-kit-production.up.railway.app';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Find the repo
  const { data: repoData } = await supabase
    .from('changelog_repos')
    .select('id, github_repo_name')
    .eq('github_repo_name', fullRepoName)
    .single();

  if (!repoData) {
    return new NextResponse('Repository not found', { status: 404 });
  }

  // Get published changelogs
  const { data: changelogs } = await supabase
    .from('changelogs')
    .select('*')
    .eq('repo_id', repoData.id)
    .eq('is_published', true)
    .order('release_date', { ascending: false })
    .limit(50);

  // Build RSS XML
  const items = (changelogs || []).map(log => `
    <item>
      <title>${escapeXml(log.version)}${log.title ? ` - ${escapeXml(log.title)}` : ''}</title>
      <link>${baseUrl}/changelog/${owner}/${repo}#${log.version}</link>
      <guid isPermaLink="true">${baseUrl}/changelog/${owner}/${repo}#${log.version}</guid>
      <pubDate>${new Date(log.release_date).toUTCString()}</pubDate>
      <description><![CDATA[${log.content}]]></description>
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(fullRepoName)} Changelog</title>
    <link>${baseUrl}/changelog/${owner}/${repo}</link>
    <description>Latest updates and releases for ${escapeXml(fullRepoName)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/changelog/${owner}/${repo}/rss" rel="self" type="application/rss+xml"/>
    <generator>SmithKit</generator>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
