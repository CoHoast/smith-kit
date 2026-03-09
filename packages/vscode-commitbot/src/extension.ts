import * as vscode from 'vscode';
import { execSync } from 'child_process';

const API_URL = 'https://smith-kit-production.up.railway.app/api/commitbot/generate';

export function activate(context: vscode.ExtensionContext) {
  console.log('SmithKit CommitBot is now active!');

  // Register commands
  const generateCommand = vscode.commands.registerCommand('commitbot.generate', () => {
    generateCommitMessage(false);
  });

  const generateAndCommitCommand = vscode.commands.registerCommand('commitbot.generateAndCommit', () => {
    generateCommitMessage(true);
  });

  const setApiKeyCommand = vscode.commands.registerCommand('commitbot.setApiKey', async () => {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your SmithKit API key',
      password: true,
      placeHolder: 'sk_...',
    });

    if (apiKey) {
      const config = vscode.workspace.getConfiguration('commitbot');
      await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('API key saved successfully!');
    }
  });

  context.subscriptions.push(generateCommand, generateAndCommitCommand, setApiKeyCommand);
}

async function generateCommitMessage(autoCommit: boolean) {
  const config = vscode.workspace.getConfiguration('commitbot');
  const apiKey = config.get<string>('apiKey');

  if (!apiKey) {
    const action = await vscode.window.showErrorMessage(
      'CommitBot: No API key configured',
      'Set API Key',
      'Get API Key'
    );

    if (action === 'Set API Key') {
      vscode.commands.executeCommand('commitbot.setApiKey');
    } else if (action === 'Get API Key') {
      vscode.env.openExternal(vscode.Uri.parse('https://smith-kit-production.up.railway.app/dashboard/commitbot'));
    }
    return;
  }

  // Get the git extension
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (!gitExtension) {
    vscode.window.showErrorMessage('Git extension not found');
    return;
  }

  const git = gitExtension.exports.getAPI(1);
  const repo = git.repositories[0];

  if (!repo) {
    vscode.window.showErrorMessage('No git repository found');
    return;
  }

  // Get staged diff
  let diff: string;
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }

    diff = execSync('git diff --cached', {
      cwd: workspaceFolder.uri.fsPath,
      encoding: 'utf-8',
    });
  } catch (error) {
    vscode.window.showErrorMessage('Failed to get staged changes');
    return;
  }

  if (!diff.trim()) {
    vscode.window.showWarningMessage('No staged changes found. Stage your changes first (git add)');
    return;
  }

  // Show progress
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'CommitBot',
      cancellable: false,
    },
    async (progress) => {
      progress.report({ message: 'Generating commit message...' });

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            diff,
            style: config.get('style', 'conventional'),
            includeScope: config.get('includeScope', true),
            includeBody: config.get('includeBody', false),
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(error.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        const message = data.message;

        if (autoCommit) {
          // Set the message in the SCM input box
          repo.inputBox.value = message;
          
          // Commit
          await repo.commit(message);
          vscode.window.showInformationMessage(`✓ Committed: ${message}`);
        } else {
          // Just set the message in the input box
          repo.inputBox.value = message;
          vscode.window.showInformationMessage('Commit message generated! Review and commit when ready.');
          
          // Focus the SCM view
          vscode.commands.executeCommand('workbench.view.scm');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`CommitBot: ${errorMessage}`);
      }
    }
  );
}

export function deactivate() {}
