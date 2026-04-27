# SmithKit Marketing Site - Required Fixes

**Audit Date:** 2026-03-16
**Status:** 🚨 CRITICAL - Multiple inconsistencies found

---

## 🔥 CRITICAL FIXES NEEDED

### 1. Update tools.ts - Replace CronPilot with AlertFlow + SpeedKit

**Current (WRONG):**
```typescript
{
  id: 'cronpilot',
  name: 'CronPilot',
  tagline: 'Scheduled jobs, zero infra',
  // ... CronPilot details
}
```

**Should be:**
```typescript
{
  id: 'alertflow',
  name: 'AlertFlow', 
  tagline: 'Incident management & on-call',
  description: 'Manage incidents, coordinate on-call schedules, and track resolution times.',
  status: 'live',
  icon: 'alert-triangle',
  color: 'bg-gradient-to-br from-red-500 to-rose-600',
  gradient: 'from-red-500 to-rose-600',
  features: [
    'Incident detection & alerts',
    'On-call schedule management', 
    'Escalation workflows',
    'Post-mortem templates',
    'Slack/PagerDuty integration',
    'SLA tracking'
  ]
},
{
  id: 'speedkit',
  name: 'SpeedKit',
  tagline: 'Performance monitoring',
  description: 'Track page speed, Core Web Vitals, and performance metrics across your sites.',
  status: 'live', 
  icon: 'zap',
  color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  gradient: 'from-blue-500 to-cyan-600',
  features: [
    'Core Web Vitals tracking',
    'PageSpeed monitoring',
    'Performance budgets',
    'Mobile & desktop tests',
    'Historical trends', 
    'Lighthouse integration'
  ]
}
```

### 2. Fix Hero Section Pricing

**Current (CONFUSING):**
"One login. $39/mo"

**Should be:**
"One login. $49/mo" 
OR
"One login. From $39/mo" (to indicate annual pricing)

### 3. Update Tool Categories on Landing Page

**File:** `apps/landing/app/page.tsx`

**Current "Automation" category has CronPilot - REMOVE ENTIRELY**

**Update other categories:**
```typescript
{
  name: "Incident & Performance", 
  description: "Stay ahead of issues",
  color: "red",
  tools: [
    { name: "AlertFlow", desc: "Manage incidents before they become outages" },
    { name: "SpeedKit", desc: "Monitor performance and Core Web Vitals" },
    { name: "ErrorWatch", desc: "Catch errors before your users tweet about them" },
  ],
},
```

### 4. Fix Free Plan Description

**Current:**
"All 3 tools included"

**Should be:**
"All 12 tools included"

### 5. Update Competitor Comparison

**Remove/Update:**
- "Inngest" (was for background jobs/CronPilot)

**Add:** 
- "PagerDuty" ($25+) for AlertFlow
- "SpeedCurve" ($30+) for SpeedKit

---

## 🎯 PRICING STANDARDIZATION

**Recommended approach:**

**Hero section:** "From $39/mo" (emphasizes best annual price)
**Pricing section:** Keep current (shows both monthly/annual clearly)

OR

**Hero section:** "$49/mo" (standard monthly price)
**Add subtitle:** "or $39/mo paid annually"

---

## 📝 CONTENT UPDATES

### Tool Descriptions Need Review:

1. **CommitBot** - Check if "VS Code extension" is actually built
2. **StatusKit** - Verify "automatic incident detection" works
3. **ToggleBox** - Confirm "A/B testing ready" features exist
4. **VaultKit** - Check "secret rotation" is implemented

---

## 🚀 LAUNCH-BLOCKING ISSUES

**Must fix before launch:**
1. ✅ CronPilot → AlertFlow + SpeedKit (CRITICAL)
2. ✅ Free plan description (user confusion)
3. ✅ Pricing consistency (marketing confusion)
4. ✅ Tool category updates (dead links)

**Nice to have:**
- Tool description accuracy verification
- Competitor list updates
- Hero pricing clarification

---

## 📋 FILES TO UPDATE

| Priority | File | Issue |
|----------|------|-------|
| 🔥 HIGH | `apps/landing/lib/tools.ts` | Replace CronPilot with AlertFlow + SpeedKit |
| 🔥 HIGH | `apps/landing/app/page.tsx` | Update tool categories, fix free plan text |
| 🔥 HIGH | Hero section | Fix pricing "$39/mo" confusion |
| 🟡 MED | Competitor list | Add PagerDuty, SpeedCurve; remove Inngest |

---

**Estimated fix time:** 2-3 hours for critical issues
**Blocks launch:** YES - users will click on non-existent tools