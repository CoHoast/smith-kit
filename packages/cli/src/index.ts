#!/usr/bin/env node

import { Command } from 'commander';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.commitbot.json');
const API_URL = 'https://smith-kit-production.up.railway.app/api/commitbot/generate';

interface Config {
  apiKey?: string;
}

function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch {
    // Ignore errors
  }
  return {};
}

function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function generateCommitMessage(diff: string, apiKey: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ diff }),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to generate commit message');
  }

  const data = await response.json() as { message: string };
  return data.message;
}

function getGitDiff(): string {
  try {
    // Get staged changes
    const staged = execSync('git diff --cached', { encoding: 'utf-8' });
    if (staged.trim()) {
      return staged;
    }
    
    // If no staged changes, get unstaged changes
    const unstaged = execSync('git diff', { encoding: 'utf-8' });
    if (unstaged.trim()) {
      return unstaged;
    }
    
    throw new Error('No changes to commit. Stage your changes with `git add` first.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('No changes')) {
      throw error;
    }
    throw new Error('Not a git repository or git is not installed.');
  }
}

const program = new Command();

program
  .name('commitbot')
  .description('AI-powered commit message generator by SmithKit')
  .version('0.1.0');

program
  .command('login')
  .description('Configure your API key')
  .argument('<api-key>', 'Your CommitBot API key from smithkit.ai')
  .action((apiKey: string) => {
    saveConfig({ apiKey });
    console.log('✅ API key saved! You can now use `commitbot` to generate commit messages.');
  });

program
  .command('generate', { isDefault: true })
  .description('Generate a commit message from your staged changes')
  .option('-c, --commit', 'Automatically commit with the generated message')
  .option('-y, --yes', 'Skip confirmation when using --commit')
  .action(async (options) => {
    const config = loadConfig();
    
    if (!config.apiKey) {
      console.error('❌ No API key configured.');
      console.error('   Run: commitbot login <your-api-key>');
      console.error('   Get your API key at: https://smithkit.ai/dashboard/commitbot');
      process.exit(1);
    }

    console.log('🔍 Analyzing your changes...\n');

    try {
      const diff = getGitDiff();
      const message = await generateCommitMessage(diff, config.apiKey);
      
      console.log('📝 Generated commit message:\n');
      console.log(`   ${message}\n`);

      if (options.commit) {
        if (!options.yes) {
          const readline = await import('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const answer = await new Promise<string>((resolve) => {
            rl.question('Commit with this message? (y/n) ', resolve);
          });
          rl.close();

          if (answer.toLowerCase() !== 'y') {
            console.log('Commit cancelled.');
            process.exit(0);
          }
        }

        execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
        console.log('\n✅ Committed!');
      } else {
        console.log('💡 To commit with this message, run:');
        console.log(`   git commit -m "${message}"`);
        console.log('\n   Or use: commitbot -c (to auto-commit)');
      }
    } catch (error) {
      console.error(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('logout')
  .description('Remove your API key')
  .action(() => {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
      console.log('✅ API key removed.');
    } else {
      console.log('No API key configured.');
    }
  });

program.parse();
