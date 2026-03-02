// Discord and Slack webhook utilities for SmithKit notifications

// ============ DISCORD ============

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number; // Decimal color value
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
  footer?: { text: string };
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<boolean> {
  if (!webhookUrl) return false;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'SmithKit',
        avatar_url: 'https://smith-kit-production.up.railway.app/favicon.ico',
        ...payload,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

// Discord colors (decimal values)
const DISCORD_COLORS = {
  red: 0xef4444,
  green: 0x22c55e,
  yellow: 0xf59e0b,
  purple: 0x6366f1,
  blue: 0x3b82f6,
};

export function getDiscordDowntimeAlert(siteName: string, url: string): DiscordWebhookPayload {
  return {
    embeds: [{
      title: '🔴 Site Down',
      description: `**${siteName}** is not responding`,
      color: DISCORD_COLORS.red,
      fields: [
        { name: 'URL', value: url, inline: true },
        { name: 'Status', value: 'DOWN', inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'SmithKit Uptime' },
    }],
  };
}

export function getDiscordRecoveryAlert(siteName: string, url: string, downtime: string): DiscordWebhookPayload {
  return {
    embeds: [{
      title: '🟢 Site Recovered',
      description: `**${siteName}** is back online!`,
      color: DISCORD_COLORS.green,
      fields: [
        { name: 'URL', value: url, inline: true },
        { name: 'Downtime', value: downtime, inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'SmithKit Uptime' },
    }],
  };
}

export function getDiscordSSLAlert(siteName: string, url: string, daysLeft: number): DiscordWebhookPayload {
  const isUrgent = daysLeft <= 7;
  return {
    embeds: [{
      title: isUrgent ? '🚨 SSL Expiring Soon!' : '⚠️ SSL Certificate Warning',
      description: `**${siteName}** SSL certificate expires in **${daysLeft} days**`,
      color: isUrgent ? DISCORD_COLORS.red : DISCORD_COLORS.yellow,
      fields: [
        { name: 'URL', value: url, inline: true },
        { name: 'Days Left', value: `${daysLeft}`, inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'SmithKit Uptime' },
    }],
  };
}

// ============ SLACK ============

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  elements?: { type: string; text: string }[];
  fields?: { type: string; text: string }[];
}

interface SlackWebhookPayload {
  text?: string;
  blocks?: SlackBlock[];
  username?: string;
  icon_emoji?: string;
}

export async function sendSlackWebhook(
  webhookUrl: string,
  payload: SlackWebhookPayload
): Promise<boolean> {
  if (!webhookUrl) return false;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'SmithKit',
        icon_emoji: ':hammer_and_wrench:',
        ...payload,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Slack webhook error:', error);
    return false;
  }
}

export function getSlackDowntimeAlert(siteName: string, url: string): SlackWebhookPayload {
  return {
    text: `🔴 ${siteName} is DOWN`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🔴 Site Down', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Site:*\n${siteName}` },
          { type: 'mrkdwn', text: `*Status:*\nDOWN` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*URL:* <${url}|${url}>` },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `⏰ ${new Date().toISOString()}` },
        ],
      },
    ],
  };
}

export function getSlackRecoveryAlert(siteName: string, url: string, downtime: string): SlackWebhookPayload {
  return {
    text: `🟢 ${siteName} is back UP`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🟢 Site Recovered', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Site:*\n${siteName}` },
          { type: 'mrkdwn', text: `*Downtime:*\n${downtime}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*URL:* <${url}|${url}>` },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `⏰ ${new Date().toISOString()}` },
        ],
      },
    ],
  };
}

export function getSlackSSLAlert(siteName: string, url: string, daysLeft: number): SlackWebhookPayload {
  const isUrgent = daysLeft <= 7;
  const emoji = isUrgent ? '🚨' : '⚠️';
  
  return {
    text: `${emoji} SSL expiring in ${daysLeft} days for ${siteName}`,
    blocks: [
      {
        type: 'header',
        text: { 
          type: 'plain_text', 
          text: isUrgent ? '🚨 SSL Expiring Soon!' : '⚠️ SSL Certificate Warning', 
          emoji: true 
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Site:*\n${siteName}` },
          { type: 'mrkdwn', text: `*Days Left:*\n${daysLeft}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*URL:* <${url}|${url}>` },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `Renew your certificate before it expires!` },
        ],
      },
    ],
  };
}

// ============ UNIFIED NOTIFICATION ============

interface NotificationSettings {
  discord_webhook_url?: string | null;
  slack_webhook_url?: string | null;
  email?: string | null;
}

export async function sendUptimeAlert(
  type: 'down' | 'up' | 'ssl',
  siteName: string,
  url: string,
  settings: NotificationSettings,
  extra?: { downtime?: string; sslDaysLeft?: number }
): Promise<void> {
  const promises: Promise<boolean>[] = [];

  // Discord
  if (settings.discord_webhook_url) {
    let payload: DiscordWebhookPayload;
    if (type === 'down') {
      payload = getDiscordDowntimeAlert(siteName, url);
    } else if (type === 'up') {
      payload = getDiscordRecoveryAlert(siteName, url, extra?.downtime || 'unknown');
    } else {
      payload = getDiscordSSLAlert(siteName, url, extra?.sslDaysLeft || 0);
    }
    promises.push(sendDiscordWebhook(settings.discord_webhook_url, payload));
  }

  // Slack
  if (settings.slack_webhook_url) {
    let payload: SlackWebhookPayload;
    if (type === 'down') {
      payload = getSlackDowntimeAlert(siteName, url);
    } else if (type === 'up') {
      payload = getSlackRecoveryAlert(siteName, url, extra?.downtime || 'unknown');
    } else {
      payload = getSlackSSLAlert(siteName, url, extra?.sslDaysLeft || 0);
    }
    promises.push(sendSlackWebhook(settings.slack_webhook_url, payload));
  }

  await Promise.allSettled(promises);
}
