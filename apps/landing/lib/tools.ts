/**
 * SMITHKIT TOOL REGISTRY
 * 
 * All 12 tools in one powerful suite.
 * One subscription. Zero compromise.
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
  gradient: string;
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
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    gradient: 'from-purple-500 to-indigo-600',
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
    tagline: 'Site monitoring that actually works',
    description: 'Add a URL, get instant monitoring. Multi-region checks, smart alerts, and beautiful status pages when things go down.',
    status: 'live',
    icon: 'activity',
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    gradient: 'from-green-500 to-emerald-600',
    features: [
      '1-minute check intervals',
      'Multi-region monitoring',
      'SSL expiry alerts',
      'Email, Slack, webhook alerts',
      'Response time tracking',
      'Incident history',
    ],
  },
  {
    id: 'commitbot',
    name: 'CommitBot',
    tagline: 'AI writes your commits',
    description: 'Never write a commit message again. CommitBot analyzes your staged changes and generates perfect conventional commits.',
    status: 'live',
    icon: 'git-commit',
    color: 'bg-gradient-to-br from-orange-500 to-amber-600',
    gradient: 'from-orange-500 to-amber-600',
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
    id: 'togglebox',
    name: 'ToggleBox',
    tagline: 'Feature flags without the $400/mo',
    description: 'LaunchDarkly charges $400/mo. We charge $39. Simple feature flags for teams that ship fast.',
    status: 'live',
    icon: 'toggle',
    color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    gradient: 'from-cyan-500 to-blue-600',
    features: [
      '5-minute setup',
      'Simple SDK integration',
      'Instant toggle updates',
      'Multiple environments',
      'Kill switch for emergencies',
      'A/B testing ready',
    ],
  },
  {
    id: 'statuskit',
    name: 'StatusKit',
    tagline: 'Public status pages',
    description: 'Beautiful, branded status pages for your services. Keep customers informed during incidents automatically.',
    status: 'live',
    icon: 'status',
    color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    gradient: 'from-yellow-500 to-orange-600',
    features: [
      'Automatic incident detection',
      'Custom branding',
      'Subscriber notifications',
      'Scheduled maintenance',
      'Uptime history',
      'Custom domain',
    ],
  },
  {
    id: 'eventlog',
    name: 'EventLog',
    tagline: 'Real-time event tracking',
    description: 'Track what matters. User signups, payments, errors — see it all in real-time with beautiful dashboards.',
    status: 'live',
    icon: 'zap',
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    gradient: 'from-pink-500 to-rose-600',
    features: [
      'Real-time event stream',
      'Custom event channels',
      'Rich event metadata',
      'Searchable history',
      'Webhook notifications',
      'API & SDK support',
    ],
  },
  {
    id: 'cronpilot',
    name: 'CronPilot',
    tagline: 'Scheduled jobs, zero infra',
    description: 'Cron jobs without the server. Add a URL and schedule — we handle the rest. Retries, alerts, logging included.',
    status: 'live',
    icon: 'clock',
    color: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    gradient: 'from-teal-500 to-emerald-600',
    features: [
      'HTTP endpoint scheduling',
      'Visual job dashboard',
      'Automatic retries',
      'Failure alerts',
      'Execution logs',
      'Timezone support',
    ],
  },
  {
    id: 'webhooklab',
    name: 'WebhookLab',
    tagline: 'Debug webhooks instantly',
    description: 'Inspect, debug, replay, and forward webhooks during development. Your webhook debugger in the cloud.',
    status: 'live',
    icon: 'webhook',
    color: 'bg-gradient-to-br from-violet-500 to-purple-600',
    gradient: 'from-violet-500 to-purple-600',
    features: [
      'Instant webhook URLs',
      'Request inspector',
      'Forward to localhost',
      'Replay requests',
      'Share with team',
      'Filter & search',
    ],
  },
  {
    id: 'llm',
    name: 'LLM Analytics',
    tagline: 'Track your AI spend',
    description: 'Monitor AI/LLM API usage, costs, and performance across OpenAI, Anthropic, and more. Stop the surprise bills.',
    status: 'live',
    icon: 'brain',
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    gradient: 'from-blue-500 to-indigo-600',
    features: [
      'Cost tracking per model',
      'Token usage analytics',
      'Latency monitoring',
      'Multi-provider support',
      'Budget alerts',
      'Team cost allocation',
    ],
  },
  {
    id: 'errorwatch',
    name: 'ErrorWatch',
    tagline: 'Error tracking that doesn\'t cost $500',
    description: 'Catch, track, and fix errors before users complain. Like Sentry, but you can actually afford it.',
    status: 'live',
    icon: 'alert',
    color: 'bg-gradient-to-br from-red-500 to-rose-600',
    gradient: 'from-red-500 to-rose-600',
    features: [
      'Automatic error grouping',
      'Stack trace analysis',
      'Release tracking',
      'User impact analysis',
      'Slack & email alerts',
      'Browser & Node.js SDKs',
    ],
  },
  {
    id: 'vaultkit',
    name: 'VaultKit',
    tagline: 'Secrets & env manager',
    description: 'Stop sharing .env files in Slack. Encrypted secrets management with team access controls and audit logs.',
    status: 'live',
    icon: 'lock',
    color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    gradient: 'from-amber-500 to-orange-600',
    features: [
      'AES-256 encryption',
      'Team access controls',
      'Environment management',
      'Audit logs',
      'CLI & SDK support',
      'Secret rotation',
    ],
  },
  {
    id: 'depwatch',
    name: 'DepWatch',
    tagline: 'Dependency security scanner',
    description: 'Know when your dependencies have vulnerabilities. Automatic scanning with fix suggestions.',
    status: 'live',
    icon: 'shield',
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    gradient: 'from-emerald-500 to-teal-600',
    features: [
      'Automatic vulnerability scanning',
      'Severity ratings',
      'Fix recommendations',
      'GitHub integration',
      'Slack alerts',
      'License compliance',
    ],
  },
];

// Helper functions
export const getLiveTools = () => TOOLS.filter(t => t.status === 'live');
export const getComingSoonTools = () => TOOLS.filter(t => t.status === 'soon' || t.status === 'beta');
export const getToolById = (id: string) => TOOLS.find(t => t.id === id);
export const getToolCount = () => TOOLS.length;
export const getLiveToolCount = () => getLiveTools().length;

// Pricing configuration
export const PRICING = {
  free: {
    name: 'Free',
    price: 0,
    description: 'For side projects & testing',
    cta: 'Start Building',
    features: [
      'All 12 tools included',
      '1 project per tool',
      'Basic usage limits',
      '7-day data retention',
      'Community support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 39,
    description: 'For serious indie hackers',
    cta: 'Start Free Trial',
    popular: true,
    features: [
      'All 12 tools, unlimited',
      '10 projects per tool',
      'Higher API limits',
      '30-day data retention',
      'Custom domains',
      'Priority support',
      'Early access to new tools',
    ],
  },
  premium: {
    name: 'Premium',
    price: 99,
    description: 'For growing startups',
    cta: 'Start Free Trial',
    features: [
      'Everything in Pro',
      '50 projects per tool',
      'Unlimited API calls',
      '90-day data retention',
      'Up to 10 team members',
      'SSO & audit logs',
      'Dedicated support',
    ],
  },
};

// Competitor comparison
export const COMPETITORS = [
  { name: 'LaunchDarkly', price: '$400+', category: 'Feature Flags' },
  { name: 'Sentry', price: '$26+', category: 'Error Tracking' },
  { name: 'Beamer', price: '$49+', category: 'Changelog' },
  { name: 'Better Uptime', price: '$20+', category: 'Monitoring' },
  { name: 'LogSnag', price: '$16+', category: 'Event Tracking' },
  { name: 'Inngest', price: '$25+', category: 'Background Jobs' },
];

// Total competitor cost for comparison
export const COMPETITOR_TOTAL = '$550+/mo';
export const SMITHKIT_PRICE = '$39/mo';
