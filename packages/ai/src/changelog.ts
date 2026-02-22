import { generateText } from './client';

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface ChangelogOptions {
  repoName: string;
  version: string;
  commits: Commit[];
  previousVersion?: string;
}

const CHANGELOG_SYSTEM_PROMPT = `You are a technical writer creating changelog entries for software releases.

Your job is to transform raw git commits into clear, user-friendly release notes.

Guidelines:
- Group changes into categories: ✨ New Features, 🐛 Bug Fixes, ⚡ Improvements, 🔧 Maintenance
- Use plain language that non-technical users can understand
- Be specific about what changed and why users should care
- Do not include commit hashes or author names unless notable
- Keep entries concise but informative
- Use bullet points for individual changes
- Lead with the most important changes`;

export async function generateChangelog(options: ChangelogOptions): Promise<string> {
  const { repoName, version, commits, previousVersion } = options;
  
  const commitList = commits
    .map(c => `- ${c.message} (${c.date})`)
    .join('\n');
  
  const prompt = `Generate a changelog entry for ${repoName}.

Version: ${version}
${previousVersion ? `Previous version: ${previousVersion}` : ''}

Commits since last release:
${commitList}

Write a clear, professional changelog entry in Markdown format.`;

  const changelog = await generateText(prompt, {
    systemPrompt: CHANGELOG_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.3,
  });

  return changelog;
}

export async function summarizeChanges(commits: Commit[]): Promise<string> {
  const commitList = commits.map(c => c.message).join('\n');
  
  const prompt = `Summarize these git commits in one sentence (max 100 chars):
${commitList}`;

  const summary = await generateText(prompt, {
    maxTokens: 100,
    temperature: 0.3,
  });

  return summary;
}
