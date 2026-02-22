# SmithKit CommitBot for VS Code

AI-powered commit message generator that analyzes your staged changes and writes perfect commit messages.

![CommitBot Demo](https://smithkit.ai/images/commitbot-vscode-demo.gif)

## Features

- 🤖 **AI-Powered**: Analyzes your code changes to generate meaningful commit messages
- 📝 **Conventional Commits**: Follows the conventional commit format (feat, fix, chore, etc.)
- ⚡ **One-Click**: Generate a message with a single command
- 🎯 **Smart Scope**: Automatically detects the scope of your changes
- 🔧 **Customizable**: Configure style, scope inclusion, and more

## Installation

1. Install the extension from VS Code Marketplace
2. Get your API key from [SmithKit Dashboard](https://smithkit.ai/dashboard/commitbot)
3. Run `CommitBot: Set API Key` command and paste your key

## Usage

### Generate Commit Message

1. Stage your changes (`git add`)
2. Open Command Palette (`Cmd/Ctrl + Shift + P`)
3. Run `CommitBot: Generate Commit Message`
4. Review the message in the Source Control input box
5. Click the checkmark to commit

### Generate & Auto-Commit

1. Stage your changes
2. Run `CommitBot: Generate & Commit`
3. Done! Your changes are committed with an AI-generated message.

### Quick Access

Look for the ✨ sparkle icon in the Source Control title bar for quick access.

## Commands

| Command | Description |
|---------|-------------|
| `CommitBot: Generate Commit Message` | Generate a message and put it in the SCM input |
| `CommitBot: Generate & Commit` | Generate and immediately commit |
| `CommitBot: Set API Key` | Configure your SmithKit API key |

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `commitbot.apiKey` | Your SmithKit API key | - |
| `commitbot.style` | Message style (`conventional` or `simple`) | `conventional` |
| `commitbot.includeScope` | Include scope in message | `true` |
| `commitbot.includeBody` | Include detailed body | `false` |

## Examples

Input (staged diff):
```diff
+ function login(email, password) {
+   return auth.signIn(email, password);
+ }
```

Output:
```
feat(auth): add login functionality
```

## Requirements

- VS Code 1.85.0 or higher
- Git repository
- SmithKit API key ([Get one free](https://smithkit.ai))

## Privacy

Your code diffs are sent to SmithKit's API to generate commit messages. We do not store your code - diffs are processed and immediately discarded.

## Support

- [Documentation](https://smithkit.ai/docs)
- [Report Issues](https://github.com/CoHoast/smith-kit/issues)
- [Discord Community](https://discord.gg/smithkit)

## License

MIT
