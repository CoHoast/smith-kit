# AlertFlow — Incident Management for SmithKit

**Status:** Proposed (Replaces CronPilot)
**Author:** Zero Cool + Ted
**Date:** 2026-03-06

---

## Executive Summary

Replace CronPilot (commodity cron, free everywhere) with AlertFlow — a PagerDuty-lite incident management system that:

1. **Completes the incident lifecycle:** Uptime detects → AlertFlow pages → StatusKit informs
2. **High perceived value:** PagerDuty is $21/user/mo
3. **Drives team upgrades:** Solo devs don't need on-call, teams do
4. **Differentiator:** Most dev tool bundles don't include incident management

---

## The Problem AlertFlow Solves

**Current state:** SmithKit can detect problems (Uptime, ErrorWatch) but can't answer:
- Who should be notified?
- What if they don't respond?
- How do we track the incident lifecycle?
- How do we learn from incidents?

**With AlertFlow:**
```
Uptime detects site down
       ↓
AlertFlow checks who's on-call
       ↓
Sends Slack/Discord/Email alert
       ↓
If no response in 5 min → escalates
       ↓
Creates incident timeline
       ↓
StatusKit auto-updates public page
       ↓
Incident resolved → postmortem created
```

---

## Core Features (MVP)

### 1. On-Call Schedules

**What it does:**
- Define who's on-call and when
- Support daily/weekly rotations
- Allow temporary overrides ("I'm on vacation")

**UI:**
```
┌─────────────────────────────────────────────┐
│ On-Call Schedule: Production                │
├─────────────────────────────────────────────┤
│ Rotation: Weekly (every Monday 9am)         │
│                                             │
│ Current On-Call: Sarah Chen                 │
│ Next: Marcus Rodriguez (in 3 days)          │
│                                             │
│ Team Members:                               │
│ 1. Sarah Chen      ✉️ sarah@team.com       │
│ 2. Marcus Rodriguez ✉️ marcus@team.com     │
│ 3. Jamie Park      ✉️ jamie@team.com       │
│                                             │
│ [+ Add Member]  [Override Now]  [Edit]      │
└─────────────────────────────────────────────┘
```

**API:**
```
POST   /api/alertflow/schedules           Create schedule
GET    /api/alertflow/schedules           List schedules
GET    /api/alertflow/schedules/:id       Get schedule
PUT    /api/alertflow/schedules/:id       Update schedule
DELETE /api/alertflow/schedules/:id       Delete schedule

GET    /api/alertflow/oncall              Who's on call now?
POST   /api/alertflow/oncall/override     Temporary override
```

---

### 2. Alert Routing

**What it does:**
- When Uptime/ErrorWatch triggers, check on-call schedule
- Send notifications via configured channels
- Track acknowledgment

**Notification Channels (MVP):**
- ✅ Slack (webhook)
- ✅ Discord (webhook)
- ✅ Email
- 🔮 SMS (v2 - Twilio)
- 🔮 Phone call (v2 - Twilio)
- 🔮 Mobile push (v2)

**Alert Flow:**
```
1. Uptime detects issue
2. Creates incident in AlertFlow
3. Looks up on-call schedule
4. Sends notification to on-call person
5. Waits for acknowledgment
6. If not acked in X minutes → escalate
```

**Notification Message Example (Slack):**
```
🚨 INCIDENT: Production API Down

Site: api.myapp.com
Status: DOWN (was UP)
Duration: 2 minutes
Monitor: Production API

[Acknowledge] [View Details]

Assigned to: @sarah
Escalates in: 5 minutes
```

---

### 3. Escalation Policies

**What it does:**
- Define what happens if no one responds
- Multiple escalation levels
- Configurable timeouts

**Example Policy:**
```
Level 1: On-call person (5 min timeout)
   ↓ no response
Level 2: Backup on-call (5 min timeout)
   ↓ no response
Level 3: Team lead (always notified)
```

**UI:**
```
┌─────────────────────────────────────────────┐
│ Escalation Policy: Critical Alerts         │
├─────────────────────────────────────────────┤
│ Step 1: Notify on-call                     │
│         Timeout: 5 minutes                  │
│                                             │
│ Step 2: Notify backup on-call              │
│         Timeout: 5 minutes                  │
│                                             │
│ Step 3: Notify @marcus (always)            │
│         Timeout: None (final)               │
│                                             │
│ [+ Add Step]                   [Save]       │
└─────────────────────────────────────────────┘
```

**API:**
```
POST   /api/alertflow/policies            Create policy
GET    /api/alertflow/policies            List policies
GET    /api/alertflow/policies/:id        Get policy
PUT    /api/alertflow/policies/:id        Update policy
DELETE /api/alertflow/policies/:id        Delete policy
```

---

### 4. Incident Timeline

**What it does:**
- Auto-create incident when alert fires
- Track full lifecycle: detected → acked → resolved
- Add notes/updates
- Calculate duration metrics

**Incident Statuses:**
- `triggered` — Alert fired, awaiting response
- `acknowledged` — Someone is working on it
- `resolved` — Issue fixed

**UI:**
```
┌─────────────────────────────────────────────┐
│ Incident #42: Production API Down          │
│ Status: RESOLVED  Severity: Critical       │
├─────────────────────────────────────────────┤
│ Duration: 12 minutes                        │
│ Time to Acknowledge: 2 minutes              │
│ Time to Resolve: 10 minutes                 │
├─────────────────────────────────────────────┤
│ Timeline:                                   │
│                                             │
│ 10:00:00  🔴 Triggered                     │
│           Source: Uptime Monitor           │
│           api.myapp.com returned 500       │
│                                             │
│ 10:02:15  👤 Acknowledged by Sarah         │
│           "Looking into it now"            │
│                                             │
│ 10:05:00  💬 Note by Sarah                 │
│           "Database connection pool full"  │
│                                             │
│ 10:12:00  ✅ Resolved by Sarah             │
│           "Increased pool size, deployed"  │
│                                             │
│ [Add Note]  [Generate Postmortem]          │
└─────────────────────────────────────────────┘
```

**API:**
```
POST   /api/alertflow/incidents            Create (manual)
GET    /api/alertflow/incidents            List incidents
GET    /api/alertflow/incidents/:id        Get incident
POST   /api/alertflow/incidents/:id/ack    Acknowledge
POST   /api/alertflow/incidents/:id/resolve Resolve
POST   /api/alertflow/incidents/:id/note   Add note
```

---

### 5. Integrations

**Auto-create incidents from:**
- ✅ Uptime (site down/degraded)
- ✅ ErrorWatch (error spike)
- 🔮 LLM Analytics (cost spike)
- 🔮 DepWatch (critical vulnerability)

**Auto-update:**
- ✅ StatusKit (incident → status page update)

**Integration Flow:**
```javascript
// When Uptime detects DOWN
async function onUptimeAlert(monitor, status) {
  // Check if AlertFlow is enabled
  const schedule = await getOnCallSchedule(monitor.project_id);
  if (!schedule) return;
  
  // Create incident
  const incident = await createIncident({
    project_id: monitor.project_id,
    title: `${monitor.name} is ${status}`,
    severity: status === 'down' ? 'critical' : 'warning',
    source: 'uptime',
    source_id: monitor.id,
  });
  
  // Notify on-call
  await notifyOnCall(incident, schedule);
  
  // Update StatusKit
  await updateStatusPage(monitor.project_id, {
    status: status === 'down' ? 'major_outage' : 'degraded',
    incident_id: incident.id,
  });
}
```

---

## Database Schema

```sql
-- On-call schedules
CREATE TABLE alertflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID,
  name TEXT NOT NULL,
  rotation_type TEXT NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'custom'
  rotation_time TIME DEFAULT '09:00:00',
  rotation_day INTEGER DEFAULT 1, -- 1=Monday for weekly
  timezone TEXT DEFAULT 'UTC',
  members JSONB NOT NULL DEFAULT '[]', -- [{user_id, name, email, slack_id, order}]
  current_index INTEGER DEFAULT 0,
  last_rotated_at TIMESTAMP,
  override_user_id UUID,
  override_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Escalation policies
CREATE TABLE alertflow_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  steps JSONB NOT NULL DEFAULT '[]', -- [{delay_minutes, target: 'oncall'|'user', user_id?, notify_channels}]
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Incidents
CREATE TABLE alertflow_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'warning', -- 'critical', 'warning', 'info'
  status TEXT NOT NULL DEFAULT 'triggered', -- 'triggered', 'acknowledged', 'resolved'
  source TEXT, -- 'uptime', 'errorwatch', 'manual', 'api'
  source_id UUID,
  schedule_id UUID REFERENCES alertflow_schedules(id),
  policy_id UUID REFERENCES alertflow_policies(id),
  assigned_to UUID,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP,
  resolved_by UUID,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Incident timeline/notes
CREATE TABLE alertflow_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES alertflow_incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'triggered', 'acknowledged', 'escalated', 'note', 'resolved'
  user_id UUID,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification log
CREATE TABLE alertflow_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES alertflow_incidents(id) ON DELETE CASCADE,
  user_id UUID,
  channel TEXT NOT NULL, -- 'slack', 'discord', 'email', 'sms'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'acknowledged'
  sent_at TIMESTAMP,
  acknowledged_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alertflow_incidents_user ON alertflow_incidents(user_id);
CREATE INDEX idx_alertflow_incidents_status ON alertflow_incidents(status);
CREATE INDEX idx_alertflow_incidents_created ON alertflow_incidents(created_at DESC);
CREATE INDEX idx_alertflow_timeline_incident ON alertflow_timeline(incident_id);
```

---

## UI Pages

```
/dashboard/alertflow
├── /                    Overview (active incidents, who's on-call)
├── /incidents           Incident list with filters
├── /incidents/:id       Incident detail + timeline
├── /schedules           On-call schedule management
├── /schedules/:id       Schedule detail
├── /policies            Escalation policy management
└── /settings            Notification preferences
```

---

## Implementation Plan

### Phase 1: Foundation (2 days)
- [ ] Database migrations
- [ ] Basic API routes (CRUD for schedules, policies, incidents)
- [ ] AlertFlow dashboard UI shell

### Phase 2: On-Call Schedules (2 days)
- [ ] Schedule creation UI
- [ ] Rotation logic (daily/weekly)
- [ ] Override functionality
- [ ] "Who's on call?" API

### Phase 3: Incident Management (2 days)
- [ ] Incident creation (manual + API)
- [ ] Incident timeline UI
- [ ] Acknowledge/Resolve actions
- [ ] Add notes functionality

### Phase 4: Integrations (1 day)
- [ ] Uptime → AlertFlow trigger
- [ ] ErrorWatch → AlertFlow trigger
- [ ] AlertFlow → StatusKit update

### Phase 5: Notifications (1 day)
- [ ] Slack webhook notifications
- [ ] Discord webhook notifications
- [ ] Email notifications
- [ ] Escalation timer logic

### Phase 6: Polish (1 day)
- [ ] Mobile-responsive UI
- [ ] Empty states
- [ ] Error handling
- [ ] Documentation

**Total: ~9 days**

---

## Future Enhancements (v2+)

- [ ] SMS/Voice alerts (Twilio integration)
- [ ] Mobile app push notifications
- [ ] Incident templates
- [ ] Runbooks attached to services
- [ ] Post-incident review workflow
- [ ] SLA tracking and reporting
- [ ] Public incident history page
- [ ] Slack app (vs just webhooks)
- [ ] PagerDuty/Opsgenie import

---

## Pricing Impact

AlertFlow is a **team feature** that drives upgrades:

| Plan | AlertFlow Limits |
|------|------------------|
| Free | 1 schedule, 3 incidents/mo |
| Pro | 5 schedules, unlimited incidents |
| Premium | Unlimited schedules, SLA tracking, SMS |

---

## Competitive Analysis

| Feature | PagerDuty | Opsgenie | AlertFlow |
|---------|-----------|----------|-----------|
| Price | $21/user/mo | $9/user/mo | Included |
| On-call schedules | ✅ | ✅ | ✅ |
| Escalation | ✅ | ✅ | ✅ |
| Slack/Discord | ✅ | ✅ | ✅ |
| SMS/Voice | ✅ | ✅ | v2 |
| Integrated monitoring | ❌ | ❌ | ✅ |
| Status page | ❌ | ❌ | ✅ |

**AlertFlow advantage:** Bundled with monitoring + status pages. No separate tool needed.

---

## Open Questions

1. **Should incidents auto-resolve when Uptime recovers?**
   - Pro: Less manual work
   - Con: Might want to investigate before closing

2. **Should we support multiple schedules per project?**
   - e.g., "Critical" schedule vs "Warning" schedule

3. **How do we handle schedule conflicts?**
   - Same person on multiple schedules?

4. **Mobile app priority?**
   - Push notifications are valuable for on-call
   - Could be v2

---

## Success Metrics

- **Adoption:** % of Pro/Premium users with AlertFlow enabled
- **Engagement:** Incidents created per user per month
- **Upgrade driver:** % of upgrades mentioning AlertFlow
- **Retention:** Churn rate for AlertFlow users vs non-users

---

## Appendix: Notification Templates

### Slack
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {"type": "plain_text", "text": "🚨 INCIDENT: Production API Down"}
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*Status:* DOWN"},
        {"type": "mrkdwn", "text": "*Severity:* Critical"},
        {"type": "mrkdwn", "text": "*Duration:* 2 minutes"},
        {"type": "mrkdwn", "text": "*Assigned:* @sarah"}
      ]
    },
    {
      "type": "actions",
      "elements": [
        {"type": "button", "text": {"type": "plain_text", "text": "Acknowledge"}, "style": "primary"},
        {"type": "button", "text": {"type": "plain_text", "text": "View Details"}}
      ]
    }
  ]
}
```

### Discord
```json
{
  "embeds": [{
    "title": "🚨 INCIDENT: Production API Down",
    "color": 15158332,
    "fields": [
      {"name": "Status", "value": "DOWN", "inline": true},
      {"name": "Severity", "value": "Critical", "inline": true},
      {"name": "Assigned", "value": "@sarah", "inline": true}
    ],
    "footer": {"text": "Escalates in 5 minutes"}
  }]
}
```

### Email
```
Subject: 🚨 [CRITICAL] Production API Down - Incident #42

Production API is DOWN

Status: DOWN (was UP)
Duration: 2 minutes
Severity: Critical

Acknowledge this incident:
https://app.smithkit.dev/alertflow/incidents/42/ack

This incident will escalate in 5 minutes if not acknowledged.
```
