import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/changelog/generate - Generate changelog from commits using AI
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { repo_id, version, commits, release_url } = body;

  if (!repo_id || !version || !commits || !Array.isArray(commits)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Verify repo belongs to user
  const { data: repo } = await supabase
    .from('changelog_repos')
    .select('*')
    .eq('id', repo_id)
    .eq('user_id', user.id)
    .single();

  if (!repo) {
    return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
  }

  // Format commits for AI with author info
  const commitList = commits.map((c: { message: string; sha: string; author?: string }) => 
    `- ${c.message} (${c.sha?.substring(0, 7)})${c.author ? ` by @${c.author}` : ''}`
  ).join('\n');

  // Extract unique contributors
  const contributors = [...new Set(commits.map((c: { author?: string }) => c.author).filter(Boolean))];

  // Generate changelog with AI
  const prompt = `You are a technical writer creating a professional changelog entry for a software release.

Repository: ${repo.github_repo_name}
Version: ${version}
Contributors: ${contributors.length > 0 ? contributors.map(c => `@${c}`).join(', ') : 'Unknown'}

Commits since last release:
${commitList}

Create a comprehensive changelog entry using these sections (ONLY include sections that have relevant changes):

## ⚠️ Breaking Changes
For any changes that break backward compatibility, require migration, or change existing behavior significantly.

## 🔒 Security
For security patches, vulnerability fixes, or security-related improvements.

## ✨ New Features
For new functionality, capabilities, or user-facing features.

## ⚡ Improvements
For enhancements to existing features, performance improvements, or UX improvements.

## 🐛 Bug Fixes
For bug fixes, error corrections, or issue resolutions.

## 🔧 Maintenance
For dependency updates, refactoring, documentation, or internal changes.

## 📦 Deprecations
For features or APIs being phased out (mention what to use instead).

Rules:
- Write in clear, user-friendly language (not developer jargon)
- Be specific about what changed and why it matters to users
- Each item should be 1-2 sentences max
- Skip trivial commits (typo fixes, merge commits, formatting)
- If a section would be empty, omit it entirely
- Start each item with a verb (Added, Fixed, Improved, Updated, etc.)

At the end, add:
---
**Contributors:** ${contributors.length > 0 ? contributors.map(c => `@${c}`).join(', ') : 'Team'}

Output format: Clean Markdown`;

  try {
    // Call Anthropic API
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      // For now, generate a simple changelog without AI
      const simpleChangelog = generateSimpleChangelog(commits, version);
      
      const { data: changelog, error } = await supabase
        .from('changelogs')
        .insert({
          repo_id,
          version,
          title: `Release ${version}`,
          content: simpleChangelog,
          raw_commits: commits,
          release_url,
          is_published: true,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ changelog, ai_generated: false });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('AI generation failed');
    }

    const aiResult = await response.json();
    const generatedContent = aiResult.content[0]?.text || generateSimpleChangelog(commits, version);

    // Save the changelog
    const { data: changelog, error } = await supabase
      .from('changelogs')
      .insert({
        repo_id,
        version,
        title: `Release ${version}`,
        content: generatedContent,
        raw_commits: commits,
        release_url,
        is_published: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    await supabase.rpc('increment_usage', {
      p_user_id: user.id,
      p_tool: 'changelog',
      p_metric: 'changelogs_generated',
      p_period_start: startOfMonth.toISOString().split('T')[0],
    });

    return NextResponse.json({ changelog, ai_generated: true });
  } catch (error) {
    console.error('Changelog generation error:', error);
    return NextResponse.json({ error: 'Failed to generate changelog' }, { status: 500 });
  }
}

function generateSimpleChangelog(commits: Array<{ message: string }>, version: string): string {
  const lines = [`## ${version}\n`];
  
  const features: string[] = [];
  const fixes: string[] = [];
  const other: string[] = [];

  for (const commit of commits) {
    const msg = commit.message.split('\n')[0]; // First line only
    if (msg.startsWith('feat') || msg.includes('add') || msg.includes('new')) {
      features.push(`- ${cleanCommitMessage(msg)}`);
    } else if (msg.startsWith('fix') || msg.includes('bug') || msg.includes('patch')) {
      fixes.push(`- ${cleanCommitMessage(msg)}`);
    } else if (!msg.startsWith('Merge') && !msg.startsWith('chore')) {
      other.push(`- ${cleanCommitMessage(msg)}`);
    }
  }

  if (features.length > 0) {
    lines.push('### ✨ New Features\n');
    lines.push(...features, '\n');
  }
  if (fixes.length > 0) {
    lines.push('### 🐛 Bug Fixes\n');
    lines.push(...fixes, '\n');
  }
  if (other.length > 0) {
    lines.push('### 🔧 Other Changes\n');
    lines.push(...other, '\n');
  }

  return lines.join('\n');
}

function cleanCommitMessage(msg: string): string {
  // Remove conventional commit prefixes
  return msg
    .replace(/^(feat|fix|docs|style|refactor|test|chore)(\(.+?\))?:\s*/i, '')
    .replace(/^(feat|fix|docs|style|refactor|test|chore):\s*/i, '');
}
