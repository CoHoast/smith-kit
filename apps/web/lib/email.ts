// Email service using Resend
// Set RESEND_API_KEY environment variable

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Use Resend's default domain until smithkit.ai is verified
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SmithKit <onboarding@resend.dev>';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - email not sent');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// Email templates
export function getDowntimeAlertEmail(siteName: string, url: string, downSince: Date): { subject: string; html: string } {
  return {
    subject: `🔴 ${siteName} is DOWN`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Downtime Alert</h1>
        </div>
        <div style="background: #1a1a25; padding: 24px; border-radius: 0 0 12px 12px; color: #e5e5e5;">
          <p style="font-size: 18px; margin-bottom: 16px;">
            <strong>${siteName}</strong> is not responding.
          </p>
          <div style="background: #12121a; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0; color: #a1a1b5;">URL: <a href="${url}" style="color: #6366f1;">${url}</a></p>
            <p style="margin: 8px 0 0 0; color: #a1a1b5;">Down since: ${downSince.toLocaleString()}</p>
          </div>
          <a href="https://smith-kit-production.up.railway.app/dashboard/uptime" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            View Dashboard
          </a>
        </div>
        <p style="text-align: center; color: #6b6b80; font-size: 12px; margin-top: 16px;">
          Sent by SmithKit Uptime Monitoring
        </p>
      </div>
    `,
  };
}

export function getUptimeRecoveryEmail(siteName: string, url: string, downDuration: string): { subject: string; html: string } {
  return {
    subject: `🟢 ${siteName} is back UP`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Recovery Alert</h1>
        </div>
        <div style="background: #1a1a25; padding: 24px; border-radius: 0 0 12px 12px; color: #e5e5e5;">
          <p style="font-size: 18px; margin-bottom: 16px;">
            <strong>${siteName}</strong> is back online!
          </p>
          <div style="background: #12121a; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0; color: #a1a1b5;">URL: <a href="${url}" style="color: #6366f1;">${url}</a></p>
            <p style="margin: 8px 0 0 0; color: #a1a1b5;">Was down for: ${downDuration}</p>
          </div>
          <a href="https://smith-kit-production.up.railway.app/dashboard/uptime" 
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            View Dashboard
          </a>
        </div>
        <p style="text-align: center; color: #6b6b80; font-size: 12px; margin-top: 16px;">
          Sent by SmithKit Uptime Monitoring
        </p>
      </div>
    `,
  };
}

export function getSSLExpiryEmail(siteName: string, url: string, daysLeft: number): { subject: string; html: string } {
  const urgency = daysLeft <= 7 ? '🚨 URGENT' : '⚠️ Warning';
  return {
    subject: `${urgency}: SSL certificate expires in ${daysLeft} days - ${siteName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, ${daysLeft <= 7 ? '#ef4444, #dc2626' : '#f59e0b, #d97706'}); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔒 SSL Certificate Expiring</h1>
        </div>
        <div style="background: #1a1a25; padding: 24px; border-radius: 0 0 12px 12px; color: #e5e5e5;">
          <p style="font-size: 18px; margin-bottom: 16px;">
            The SSL certificate for <strong>${siteName}</strong> expires in <strong>${daysLeft} days</strong>.
          </p>
          <div style="background: #12121a; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0; color: #a1a1b5;">URL: <a href="${url}" style="color: #6366f1;">${url}</a></p>
          </div>
          <p style="color: #a1a1b5; margin-bottom: 16px;">
            Renew your certificate before it expires to avoid security warnings for your users.
          </p>
          <a href="https://smith-kit-production.up.railway.app/dashboard/uptime" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            View Dashboard
          </a>
        </div>
        <p style="text-align: center; color: #6b6b80; font-size: 12px; margin-top: 16px;">
          Sent by SmithKit Uptime Monitoring
        </p>
      </div>
    `,
  };
}

export function getNewReleaseEmail(repoName: string, version: string, changelog: string, changelogUrl: string): { subject: string; html: string } {
  return {
    subject: `🚀 New Release: ${repoName} ${version}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚀 New Release Published</h1>
        </div>
        <div style="background: #1a1a25; padding: 24px; border-radius: 0 0 12px 12px; color: #e5e5e5;">
          <p style="font-size: 18px; margin-bottom: 16px;">
            <strong>${repoName}</strong> version <strong>${version}</strong> is now available!
          </p>
          <div style="background: #12121a; padding: 16px; border-radius: 8px; margin-bottom: 16px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
${changelog.substring(0, 1000)}${changelog.length > 1000 ? '...' : ''}
          </div>
          <a href="${changelogUrl}" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            View Full Changelog
          </a>
        </div>
        <p style="text-align: center; color: #6b6b80; font-size: 12px; margin-top: 16px;">
          Sent by SmithKit Changelog
        </p>
      </div>
    `,
  };
}
