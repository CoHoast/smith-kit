/**
 * SMITHKIT TOOL REGISTRY
 * 
 * To add a new tool:
 * 1. Add an entry to the TOOLS array below
 * 2. That's it. The landing page, dashboard, and pricing all update automatically.
 * 
 * Tool status:
 * - 'live'    → Available now, shows "Live" badge
 * - 'beta'    → In beta, shows "Beta" badge
 * - 'soon'    → Coming soon, shows "Coming Soon" badge
 */

export type ToolStatus = 'live' | 'beta' | 'soon';

export interface Tool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: ToolStatus;
  icon: string;
  color: string;
  features: string[];
}

export const TOOLS: Tool[] = [
  {
    id: 'changelog',
    name: 'Changelog',
    tagline: 'AI-powered release notes',
    description: 'Connect your GitHub repo. AI reads your commits and generates beautiful, human-readable release notes automatically.',
    status: 'live',
    icon: 'scroll',
    color: 'tool-icon-changelog',
    features: [
      'AI writes release notes from commits',
      'Auto-updates on new releases',
      'Beautiful hosted changelog page',
      'Email & Slack notifications',
      'Embeddable widget',
      'Custom domain support',
    ],
  },
  {
    id: 'uptime',
    name: 'Uptime',
    tagline: 'Simple uptime monitoring',
    description: 'Add a URL, get instant monitoring. Beautiful status pages, multi-region checks, and smart alerts when things go down.',
    status: 'live',
    icon: 'activity',
    color: 'tool-icon-uptime',
    features: [
      '1-minute check intervals',
      'Multi-region monitoring',
      'Beautiful status pages',
      'SSL expiry alerts',
      'Email, Slack, webhook alerts',
      'Response time tracking',
    ],
  },
  {
    id: 'commits',
    name: 'CommitBot',
    tagline: 'AI commit messages',
    description: 'Never write a commit message again. CommitBot analyzes your staged changes and generates perfect conventional commits.',
    status: 'live',
    icon: 'git-commit',
    color: 'tool-icon-commits',
    features: [
      'Analyzes your code diff',
      'Conventional commit format',
      'VS Code extension',
      'CLI tool included',
      'Learns your style',
      'Team conventions',
    ],
  },
  {
    id: 'webhooks',
    name: 'WebhookLab',
    tagline: 'Debug webhooks instantly',
    description: 'Inspect, debug, replay, and forward webhooks during development. Like Postman for webhooks.',
    status: 'soon',
    icon: 'webhook',
    color: 'tool-icon-webhooks',
    features: [
      'Instant webhook URL',
      'Request/response inspector',
      'Forward to localhost',
      'Replay with modifications',
      'Share with teammates',
      'Pre-built templates',
    ],
  },
  {
    id: 'flags',
    name: 'ToggleBox',
    tagline: 'Simple feature flags',
    description: 'LaunchDarkly costs $400/mo. ToggleBox costs a fraction. Simple feature flags for teams that build fast.',
    status: 'live',
    icon: 'toggle',
    color: 'tool-icon-flags',
    features: [
      '5-minute setup',
      'Simple API integration',
      'Instant toggle updates',
      'Multiple projects',
      'Kill switch',
      'Copy-paste code examples',
    ],
  },
  {
    id: 'cron',
    name: 'CronPilot',
    tagline: 'Background jobs made easy',
    description: 'Simple scheduled tasks. URL + schedule = done. No infrastructure, no complexity, just cron jobs that work.',
    status: 'soon',
    icon: 'clock',
    color: 'tool-icon-cron',
    features: [
      'URL or deploy a function',
      'Visual job dashboard',
      'Automatic retries',
      'Failure alerts',
      'One-click pause/resume',
      'Execution logs',
    ],
  },
];

// Helper functions
export const getLiveTools = () => TOOLS.filter(t => t.status === 'live');
export const getComingSoonTools = () => TOOLS.filter(t => t.status === 'soon' || t.status === 'beta');
export const getToolById = (id: string) => TOOLS.find(t => t.id === id);
export const getToolCount = () => TOOLS.length;
export const getLiveToolCount = () => getLiveTools().length;

// Pricing configuration - Bundle only, all tools included
export const PRICING = {
  free: {
    name: 'Free',
    price: 0,
    description: 'For side projects',
    cta: 'Get Started',
    features: [
      'All 4 tools included',
      '1 repo (Changelog)',
      '3 monitors (Uptime)',
      '30 commits/mo (CommitBot)',
      '1 project, 5 flags (ToggleBox)',
      '7-day history',
    ],
  },
  pro: {
    name: 'Pro',
    price: 39,
    description: 'For serious builders',
    cta: 'Start Free Trial',
    popular: true,
    features: [
      'All current + future tools',
      '10 repos (Changelog)',
      '50 monitors (Uptime)',
      '500 commits/mo (CommitBot)',
      '10 projects, 50 flags (ToggleBox)',
      '30-day history',
      '1 custom domain',
    ],
  },
  team: {
    name: 'Team',
    price: 99,
    description: 'For growing teams',
    cta: 'Start Free Trial',
    features: [
      'All current + future tools',
      '50 repos (Changelog)',
      '200 monitors (Uptime)',
      '2,000 commits/mo (CommitBot)',
      '50 projects, 200 flags (ToggleBox)',
      'Up to 5 team members',
      '90-day history',
      '10 custom domains',
    ],
  },
};

// Competitor comparison (for landing page)
export const COMPETITORS = [
  { name: 'LaunchDarkly', price: '$400+/mo', category: 'Feature Flags' },
  { name: 'Beamer', price: '$49+/mo', category: 'Changelog' },
  { name: 'Better Uptime', price: '$20+/mo', category: 'Monitoring' },
  { name: 'Inngest', price: '$25+/mo', category: 'Background Jobs' },
];
