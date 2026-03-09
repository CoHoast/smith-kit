# @smithkit/commitbot

AI-powered commit message generator. Let AI write your commit messages based on your staged changes.

## Installation

```bash
npm install -g @smithkit/commitbot
# or
npx @smithkit/commitbot
```

## Quick Start

1. Get your API key from [SmithKit Dashboard](https://smith-kit-production.up.railway.app/dashboard/commitbot)

2. Set up your API key:
```bash
# Option 1: Environment variable
export SMITHKIT_API_KEY=sk_your_key_here

# Option 2: Config file
commitbot init -k sk_your_key_here
```

3. Stage your changes and generate a commit message:
```bash
git add .
commitbot
```

4. Auto-commit with the generated message:
```bash
commitbot -c
```

## Usage

```bash
# Generate commit message (default)
commitbot

# Generate and auto-commit
commitbot -c
commitbot --commit

# Use a specific API key
commitbot -k sk_your_key_here

# Initialize config in current project
commitbot init -k sk_your_key_here
```

## Configuration

CommitBot looks for your API key in these locations (in order):

1. `SMITHKIT_API_KEY` environment variable
2. `.commitbotrc` file in current directory
3. `.commitbotrc` file in home directory

### Config file format

```json
{
  "apiKey": "sk_your_key_here"
}
```

## Programmatic Usage

```typescript
import { generateCommitMessage } from '@smithkit/commitbot';

const message = await generateCommitMessage(
  { diff: 'your git diff here' },
  { apiKey: 'sk_your_key_here' }
);

console.log(message);
// Output: "feat(auth): add login functionality"
```

## Features

- 🤖 AI-powered commit message generation
- 📝 Conventional commit format support
- 🔧 Customizable via config file
- 🚀 Works with any git repository
- 💡 Smart scope detection

## License

MIT
