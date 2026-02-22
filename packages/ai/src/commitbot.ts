import { generateText } from './client';

interface CommitBotOptions {
  diff: string;
  style?: 'conventional' | 'simple' | 'detailed';
  includeScope?: boolean;
  includeBody?: boolean;
  maxLength?: number;
}

const COMMITBOT_SYSTEM_PROMPT = `You are a developer writing git commit messages.

Follow the Conventional Commits format:
type(scope): subject

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, semicolons, etc)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Build process or auxiliary tool changes

Rules:
- Subject line max 72 characters
- Use imperative mood ("add" not "added")
- No period at the end of subject
- Be specific but concise
- Focus on WHAT changed and WHY

Output ONLY the commit message, nothing else.`;

export async function generateCommitMessage(options: CommitBotOptions): Promise<string> {
  const { diff, style = 'conventional', includeScope = true, includeBody = false, maxLength = 72 } = options;
  
  // Truncate diff if too long
  const truncatedDiff = diff.length > 8000 ? diff.slice(0, 8000) + '\n...(truncated)' : diff;
  
  let styleInstructions = '';
  switch (style) {
    case 'simple':
      styleInstructions = 'Use a simple format without type prefix.';
      break;
    case 'detailed':
      styleInstructions = 'Include a detailed body explaining the changes.';
      break;
    default:
      styleInstructions = 'Use conventional commits format: type(scope): subject';
  }
  
  const prompt = `Analyze this git diff and write a commit message.

${styleInstructions}
${includeScope ? 'Include scope when relevant.' : 'Do not include scope.'}
${includeBody ? 'Include a body with more details.' : 'Subject line only.'}
Max subject length: ${maxLength} characters.

Diff:
\`\`\`
${truncatedDiff}
\`\`\``;

  const message = await generateText(prompt, {
    systemPrompt: COMMITBOT_SYSTEM_PROMPT,
    maxTokens: 256,
    temperature: 0.2,
  });

  // Clean up the response
  return message.trim().replace(/^["']|["']$/g, '');
}

export async function analyzeCodeChanges(diff: string): Promise<{
  summary: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}> {
  // Parse diff stats
  const lines = diff.split('\n');
  const additions = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
  const deletions = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;
  const filesChanged = (diff.match(/^diff --git/gm) || []).length;
  
  const prompt = `Summarize these code changes in one sentence (max 80 chars):
\`\`\`
${diff.slice(0, 4000)}
\`\`\``;

  const summary = await generateText(prompt, {
    maxTokens: 100,
    temperature: 0.2,
  });

  return {
    summary: summary.trim(),
    filesChanged,
    additions,
    deletions,
  };
}
