/**
 * SMITHKIT TOOL REGISTRY
 * 
 * To add a new tool:
 * 1. Add an entry to the TOOLS array below
 * 2. Create database tables
 * 3. Create API routes
 * 4. Create dashboard pages
 * 5. Done — landing page updates automatically
 */

export type ToolStatus = 'live' | 'beta' | 'soon';

export interface ToolConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: ToolStatus;
  icon: string;
  color: string;
  features: string[];
  routes: {
    dashboard: string;
    api: string;
    docs?: string;
  };
  limits: {
    free: Record<string, number>;
    pro: Record<string, number>;
    team: Record<string, number>;
  };
}

export const TOOLS: ToolConfig[] = [
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
    routes: {
      dashboard: '/dashboard/changelog',
      api: '/api/changelog',
      docs: '/docs/changelog',
    },
    limits: {
      free: { repos: 1, changelogs_per_month: 5 },
      pro: { repos: 10, changelogs_per_month: -1 },
      team: { repos: 50, changelogs_per_month: -1 },
    },
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
    routes: {
      dashboard: '/dashboard/uptime',
      api: '/api/uptime',
      docs: '/docs/uptime',
    },
    limits: {
      free: { monitors: 3 },
      pro: { monitors: 50 },
      team: { monitors: 200 },
    },
  },
  {
    id: 'commitbot',
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
    routes: {
      dashboard: '/dashboard/commitbot',
      api: '/api/commitbot',
      docs: '/docs/commitbot',
    },
    limits: {
      free: { commits_per_month: 30 },
      pro: { commits_per_month: 500 },
      team: { commits_per_month: 2000 },
    },
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
    routes: {
      dashboard: '/dashboard/webhooks',
      api: '/api/webhooks',
    },
    limits: {
      free: { requests_per_day: 100 },
      pro: { requests_per_day: -1 },
      team: { requests_per_day: -1 },
    },
  },
  {
    id: 'eventlog',
    name: 'EventLog',
    tagline: 'Real-time event tracking',
    description: 'Track signups, purchases, errors, and more. Real-time dashboard with push notifications.',
    status: 'live',
    icon: 'zap',
    color: 'tool-icon-eventlog',
    features: [
      'Track any event via API',
      'Real-time event feed',
      'Channel organization',
      'User journey tracking',
      'Push notifications',
      'Webhook integrations',
    ],
    routes: {
      dashboard: '/dashboard/eventlog',
      api: '/api/eventlog',
    },
    limits: {
      free: { projects: 1, events_per_month: 5000 },
      pro: { projects: 10, events_per_month: 100000 },
      team: { projects: -1, events_per_month: -1 },
    },
  },
  {
    id: 'statuskit',
    name: 'StatusKit',
    tagline: 'Public status pages',
    description: 'Beautiful status pages with incident management. Keep your users informed when things go wrong.',
    status: 'live',
    icon: 'status',
    color: 'tool-icon-status',
    features: [
      'Beautiful public status pages',
      'Incident management & timeline',
      'Subscriber notifications',
      'Custom branding & domain',
      'Automatic monitor integration',
      'Historical incident log',
    ],
    routes: {
      dashboard: '/dashboard/statuskit',
      api: '/api/statuskit',
    },
    limits: {
      free: { status_pages: 1, subscribers: 100 },
      pro: { status_pages: 5, subscribers: 1000 },
      team: { status_pages: 20, subscribers: -1 },
    },
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
      'Edge-deployed (fast everywhere)',
      'Gradual rollouts',
      'User segments',
      'Kill switch',
      'Stale flag detection',
    ],
    routes: {
      dashboard: '/dashboard/flags',
      api: '/api/flags',
    },
    limits: {
      free: { flags: 5, evaluations_per_month: 10000 },
      pro: { flags: 100, evaluations_per_month: 1000000 },
      team: { flags: -1, evaluations_per_month: -1 },
    },
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
    routes: {
      dashboard: '/dashboard/cron',
      api: '/api/cron',
    },
    limits: {
      free: { jobs: 5, runs_per_month: 100 },
      pro: { jobs: 50, runs_per_month: 5000 },
      team: { jobs: -1, runs_per_month: -1 },
    },
  },
];

// Helper functions
export const getToolById = (id: string) => TOOLS.find(t => t.id === id);
export const getLiveTools = () => TOOLS.filter(t => t.status === 'live');
export const getComingSoonTools = () => TOOLS.filter(t => t.status === 'soon' || t.status === 'beta');
export const getToolCount = () => TOOLS.length;
export const getLiveToolCount = () => getLiveTools().length;
