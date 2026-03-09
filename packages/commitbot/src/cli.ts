#!/usr/bin/env node

import { program } from 'commander';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const API_URL = 'https://smith-kit-production.up.railway.app/api/commitbot/generate';

interface Config {
  apiKey?: string;
}

function loadConfig(): Config {
  // Check environment variable first
  if (process.env.SMITHKIT_API_KEY) {
    return { apiKey: process.env.SMITHKIT_API_KEY };
  }

  // Check .commitbotrc file
  const rcPath = join(process.cwd(), '.commitbotrc');
  if (existsSync(rcPath)) {
    try {
      const content = readFileSync(rcPath, 'utf-8');
      const config = JSON.parse(content);
      return config;
    } catch {
      // Ignore parse errors
    }
  }

  // Check home directory
  const homeRcPath = join(process.env.HOME || '', '.commitbotrc');
  if (existsSync(homeRcPath)) {
    try {
      const content = readFileSync(homeRcPath, 'utf-8');
      const config = JSON.parse(content);
      return config;
    } catch {
      // Ignore parse errors
    }
  }

  return {};
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
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.message;
}

function getStagedDiff(): string {
  try {
    return execSync('git diff --cached', { encoding: 'utf-8' });
  } catch {
    throw new Error('Failed to get staged changes. Are you in a git repository?');
  }
}

function commitWithMessage(message: string): void {
  try {
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { 
      encoding: 'utf-8',
      stdio: 'inherit'
    });
  } catch {
    throw new Error('Failed to commit. Check git status.');
  }
}

program
  .name('commitbot')
  .description('AI-powered commit message generator')
  .version('1.0.0');

program
  .command('generate', { isDefault: true })
  .description('Generate a commit message from staged changes')
  .option('-c, --commit', 'Automatically commit with the generated message')
  .option('-k, --key <apiKey>', 'API key (or set SMITHKIT_API_KEY env var)')
  .action(async (options) => {
    const config = loadConfig();
    const apiKey = options.key || config.apiKey;

    if (!apiKey) {
      console.log(chalk.red('✗ No API key found'));
      console.log();
      console.log('Set your API key using one of these methods:');
      console.log(chalk.gray('  1. Environment variable:'), 'export SMITHKIT_API_KEY=sk_...');
      console.log(chalk.gray('  2. Config file:'), 'echo \'{"apiKey":"sk_..."}\' > ~/.commitbotrc');
      console.log(chalk.gray('  3. Command flag:'), 'commitbot -k sk_...');
      console.log();
      console.log(chalk.cyan('Get your API key at: https://smith-kit-production.up.railway.app/dashboard/commitbot'));
      process.exit(1);
    }

    // Get staged diff
    const spinner = ora('Getting staged changes...').start();
    let diff: string;
    
    try {
      diff = getStagedDiff();
    } catch (error) {
      spinner.fail((error as Error).message);
      process.exit(1);
    }

    if (!diff.trim()) {
      spinner.fail('No staged changes found');
      console.log(chalk.gray('Stage your changes first: git add <files>'));
      process.exit(1);
    }

    // Generate commit message
    spinner.text = 'Generating commit message...';
    
    try {
      const message = await generateCommitMessage(diff, apiKey);
      spinner.succeed('Generated commit message');
      
      console.log();
      console.log(chalk.green('─'.repeat(50)));
      console.log(chalk.bold(message));
      console.log(chalk.green('─'.repeat(50)));
      console.log();

      if (options.commit) {
        const commitSpinner = ora('Committing...').start();
        try {
          commitWithMessage(message);
          commitSpinner.succeed('Committed successfully!');
        } catch (error) {
          commitSpinner.fail((error as Error).message);
          process.exit(1);
        }
      } else {
        console.log(chalk.gray('Run with -c to auto-commit, or copy the message above.'));
        console.log(chalk.gray(`Or run: git commit -m "${message}"`));
      }
    } catch (error) {
      spinner.fail((error as Error).message);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize CommitBot in this project')
  .option('-k, --key <apiKey>', 'API key')
  .action((options) => {
    if (!options.key) {
      console.log(chalk.yellow('Tip: Run with -k <apiKey> to save your key'));
      console.log(chalk.cyan('Get your API key at: https://smith-kit-production.up.railway.app/dashboard/commitbot'));
      return;
    }

    const rcPath = join(process.cwd(), '.commitbotrc');
    const content = JSON.stringify({ apiKey: options.key }, null, 2);
    
    try {
      require('fs').writeFileSync(rcPath, content);
      console.log(chalk.green('✓ Created .commitbotrc'));
      console.log(chalk.gray('Add .commitbotrc to your .gitignore to keep your key private'));
    } catch (error) {
      console.log(chalk.red('Failed to create config file'));
      process.exit(1);
    }
  });

program.parse();
