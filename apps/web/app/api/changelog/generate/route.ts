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

  // Format commits for AI
  const commitList = commits.map((c: { message: string; sha: string; author?: string }) => 
    `- ${c.message} (${c.sha?.substring(0, 7)})`
  ).join('\n');

  // Generate changelog with AI
  const prompt = `You are a technical writer creating a changelog entry for a software release.

Repository: ${repo.github_repo_name}
Version: ${version}
Commits since last release:
${commitList}

Write a clear, concise changelog entry. Group changes into these categories (only include categories that have changes):
- ✨ New Features
- 🐛 Bug Fixes
- ⚡ Improvements
- 🔧 Maintenance

Rules:
- Use plain language that users can understand
- Be specific about what changed and why it matters
- Don't include commit hashes or author names
- Keep each item to 1-2 sentences
- If a commit is a merge commit or trivial (typo fix, formatting), you can skip it

Output format: Markdown`;

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
