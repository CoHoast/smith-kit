import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// POST /api/commitbot/generate - Generate commit message from diff
export async function POST(request: Request) {
  // Get API key from header
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  const apiKey = authHeader.substring(7);

  // Use service role to validate API key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find the API key (in production, we'd hash and compare)
  const keyPrefix = apiKey.substring(0, 12);
  const { data: keyRecord, error: keyError } = await supabase
    .from('commitbot_api_keys')
    .select('*, profiles!inner(*)')
    .eq('key_prefix', keyPrefix)
    .single();

  if (keyError || !keyRecord) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // In production: compare hashed key
  // For now, we'll do a simple check (NOT SECURE - demo only)
  if (keyRecord.key_hash !== apiKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const userId = keyRecord.user_id;

  // Check usage limits
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: usage } = await supabase
    .from('usage')
    .select('count')
    .eq('user_id', userId)
    .eq('tool', 'commitbot')
    .eq('metric', 'commits')
    .gte('period_start', startOfMonth.toISOString().split('T')[0])
    .single();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const limits: Record<string, number> = { free: 30, pro: 500, premium: 2000 };
  const plan = subscription?.plan || 'free';
  const limit = limits[plan] || 30;
  const currentUsage = usage?.count || 0;

  if (currentUsage >= limit) {
    return NextResponse.json({ 
      error: `Monthly limit of ${limit} commits reached. Upgrade for more.`,
      usage: { current: currentUsage, limit }
    }, { status: 403 });
  }

  // Get user preferences
  const { data: preferences } = await supabase
    .from('commitbot_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  const style = preferences?.style || 'conventional';
  const includeScope = preferences?.include_scope ?? true;
  const includeBody = preferences?.include_body ?? false;
  const maxLength = preferences?.max_subject_length || 72;

  // Get diff from request
  const body = await request.json();
  const { diff, repo_name } = body;

  if (!diff) {
    return NextResponse.json({ error: 'Missing diff' }, { status: 400 });
  }

  // Truncate diff if too long
  const maxDiffLength = 8000;
  const truncatedDiff = diff.length > maxDiffLength 
    ? diff.substring(0, maxDiffLength) + '\n... (truncated)'
    : diff;

  // Build prompt based on style
  const styleInstructions = {
    conventional: `Use conventional commits format: type(scope): subject
Types: feat, fix, docs, style, refactor, test, chore
${includeScope ? 'Include a scope in parentheses when clear' : 'Do not include scope'}`,
    simple: 'Write a simple, plain English commit message. No prefixes or special format.',
    detailed: `Write a detailed commit message with:
- A short subject line (max ${maxLength} chars)
- A blank line
- A detailed body explaining what and why`,
    emoji: `Use gitmoji format: :emoji: subject
Emojis: ✨ feat, 🐛 fix, 📝 docs, 💄 style, ♻️ refactor, ✅ test, 🔧 chore`,
  };

  const prompt = `You are a developer writing a git commit message based on this diff.

Style: ${style}
${styleInstructions[style as keyof typeof styleInstructions]}
Max subject length: ${maxLength} characters
${includeBody ? 'Include a body with more details.' : 'Do not include a body, just the subject line.'}

Diff:
\`\`\`
${truncatedDiff}
\`\`\`

Write ONLY the commit message, nothing else. No explanations.`;

  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    let message: string;
    
    if (!anthropicKey) {
      // Fallback: generate simple message from diff
      message = generateSimpleMessage(truncatedDiff);
    } else {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 256,
          messages: [
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('AI generation failed');
      }

      const aiResult = await response.json();
      message = aiResult.content[0]?.text?.trim() || generateSimpleMessage(truncatedDiff);
    }

    // Update last used timestamp
    await supabase
      .from('commitbot_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyRecord.id);

    // Track usage
    await supabase.from('usage').upsert({
      user_id: userId,
      tool: 'commitbot',
      metric: 'commits',
      count: currentUsage + 1,
      period_start: startOfMonth.toISOString().split('T')[0],
    }, {
      onConflict: 'user_id,tool,metric,period_start',
    });

    // Save to history (optional)
    await supabase.from('commitbot_commits').insert({
      user_id: userId,
      repo_name,
      generated_message: message,
    });

    return NextResponse.json({ 
      message,
      usage: { current: currentUsage + 1, limit }
    });

  } catch (error) {
    console.error('CommitBot error:', error);
    return NextResponse.json({ error: 'Failed to generate commit message' }, { status: 500 });
  }
}

function generateSimpleMessage(diff: string): string {
  // Very basic fallback
  const lines = diff.split('\n');
  const addedFiles = lines.filter(l => l.startsWith('+++ b/')).map(l => l.replace('+++ b/', ''));
  const deletedFiles = lines.filter(l => l.startsWith('--- a/')).map(l => l.replace('--- a/', ''));
  
  const changedFiles = [...new Set([...addedFiles, ...deletedFiles])].filter(f => f !== '/dev/null');
  
  if (changedFiles.length === 0) {
    return 'Update files';
  } else if (changedFiles.length === 1) {
    return `Update ${changedFiles[0]}`;
  } else {
    return `Update ${changedFiles.length} files`;
  }
}
