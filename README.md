# SmithKit

**AI-Powered Dev Tools** — Tools forged for developers.

## 🔨 What is SmithKit?

SmithKit is a unified platform of AI-powered developer tools. One subscription, all tools included.

**Live:** https://smithkit.ai

## 🛠️ Tools

### Available Now
- **Changelog** — AI writes release notes from your GitHub commits
- **Uptime** — Simple URL monitoring with beautiful status pages
- **CommitBot** — AI generates perfect commit messages (CLI + VS Code)

### Coming Soon
- **WebhookLab** — Debug, replay, and forward webhooks
- **ToggleBox** — Simple feature flags
- **CronPilot** — Background job scheduling

## 💰 Pricing

| Plan | Price | What You Get |
|------|-------|--------------|
| Free | $0 | All tools, limited usage |
| Pro | $39/mo | Generous limits, all tools |
| Team | $99/mo | Unlimited, 5 team members |

## 🏗️ Project Structure

```
smithkit/
├── apps/
│   ├── landing/     # Marketing site (Next.js)
│   ├── web/         # Main dashboard (Next.js)
│   ├── cli/         # CommitBot CLI
│   └── vscode/      # CommitBot VS Code extension
├── packages/
│   ├── config/      # Shared configuration
│   ├── ui/          # Shared React components
│   ├── db/          # Database utilities
│   └── ai/          # AI utilities
└── supabase/        # Database migrations
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build all packages
npm run build
```

## 📦 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + GitHub OAuth
- **Payments:** Stripe
- **AI:** Anthropic Claude
- **Hosting:** Vercel

## 📄 License

Proprietary — © 2026 SmithKit
