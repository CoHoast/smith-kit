// CommitBot - AI-powered commit message generator
// Library exports for programmatic usage

const API_URL = 'https://smith-kit-production.up.railway.app/api/commitbot/generate';

export interface CommitBotOptions {
  apiKey: string;
}

export interface GenerateOptions {
  diff: string;
  style?: 'conventional' | 'simple';
  includeScope?: boolean;
  includeBody?: boolean;
}

export async function generateCommitMessage(
  options: GenerateOptions,
  config: CommitBotOptions
): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      diff: options.diff,
      style: options.style || 'conventional',
      includeScope: options.includeScope ?? true,
      includeBody: options.includeBody ?? false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.message;
}

export default { generateCommitMessage };
