# SpeedKit — Performance Monitoring for SmithKit

**Status:** Proposed (New Tool #12)
**Author:** Zero Cool
**Date:** 2026-03-08
**Estimated Time:** 3-4 days

---

## Executive Summary

SpeedKit monitors website performance using Google's PageSpeed Insights API (FREE, 25k requests/day). It answers the question Uptime can't: **"Is it fast?"**

**Value Proposition:**
- Uptime: "Is it up?" ✓
- SpeedKit: "Is it fast?" ✓
- Together: Complete availability + performance monitoring

**Why it matters:**
- Google ranks sites on Core Web Vitals (SEO impact)
- Slow sites lose users (53% abandon if >3s load)
- Performance regressions often go unnoticed until users complain

---

## Core Features (MVP)

### 1. URL Monitoring

**What it does:**
- Add URLs to monitor (homepage, key pages)
- Schedule daily/weekly Lighthouse scans
- Track scores over time
- Mobile AND desktop scores

**UI:**
```
┌─────────────────────────────────────────────────────────┐
│ Monitored URLs                              [+ Add URL] │
├─────────────────────────────────────────────────────────┤
│ ● https://myapp.com              Desktop: 92  Mobile: 78│
│   Last scan: 2 hours ago         ↑3 from last week      │
├─────────────────────────────────────────────────────────┤
│ ● https://myapp.com/dashboard    Desktop: 85  Mobile: 71│
│   Last scan: 2 hours ago         ↓5 from last week  ⚠️  │
├─────────────────────────────────────────────────────────┤
│ ○ https://myapp.com/pricing      Desktop: 94  Mobile: 82│
│   Last scan: 2 hours ago         — no change            │
└─────────────────────────────────────────────────────────┘
```

### 2. Performance Scores

**Lighthouse Categories:**
- **Performance** (0-100) — Load speed, interactivity
- **Accessibility** (0-100) — A11y compliance
- **Best Practices** (0-100) — Security, modern standards
- **SEO** (0-100) — Search engine optimization

**Core Web Vitals:**
- **LCP** (Largest Contentful Paint) — Loading performance
- **FID** (First Input Delay) — Interactivity
- **CLS** (Cumulative Layout Shift) — Visual stability

### 3. Score History & Trends

**Chart showing scores over time:**
```
Performance Score (30 days)
100 ┤
 90 ┤    ╭──╮    ╭────────╮
 80 ┤───╯  ╰────╯        ╰──
 70 ┤
 60 ┼────────────────────────
    Jan 1        Jan 15      Feb 1
```

### 4. Alerts

**Trigger alerts when:**
- Performance score drops below threshold (e.g., <80)
- Core Web Vital fails (LCP >2.5s, CLS >0.1)
- Score drops by X points from baseline

**Alert destinations:**
- Email
- Slack webhook
- Discord webhook
- (Integrates with AlertFlow when built)

### 5. On-Demand Scan

**Quick scan any URL:**
```
┌─────────────────────────────────────────────────────────┐
│ Quick Scan                                              │
├─────────────────────────────────────────────────────────┤
│ URL: [https://example.com________________] [Scan Now]   │
│                                                         │
│ ○ Mobile  ● Desktop  ○ Both                            │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Monitored URLs
CREATE TABLE speedkit_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name VARCHAR(255),
  scan_frequency VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  alert_threshold INTEGER DEFAULT 80,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan results
CREATE TABLE speedkit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES speedkit_urls(id) ON DELETE CASCADE,
  device VARCHAR(10) NOT NULL, -- 'mobile' or 'desktop'
  
  -- Lighthouse scores (0-100)
  performance_score INTEGER,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  seo_score INTEGER,
  
  -- Core Web Vitals
  lcp_ms INTEGER,           -- Largest Contentful Paint (milliseconds)
  fid_ms INTEGER,           -- First Input Delay (milliseconds)
  cls DECIMAL(5,3),         -- Cumulative Layout Shift (decimal)
  
  -- Raw data
  raw_response JSONB,       -- Full PageSpeed API response
  
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_speedkit_results_url ON speedkit_results(url_id);
CREATE INDEX idx_speedkit_results_scanned ON speedkit_results(scanned_at DESC);
CREATE INDEX idx_speedkit_urls_project ON speedkit_urls(project_id);

-- Alerts config
CREATE TABLE speedkit_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES speedkit_urls(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'score_below', 'score_drop', 'cwv_fail'
  threshold INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### URLs

```
GET    /api/speedkit/urls              - List monitored URLs
POST   /api/speedkit/urls              - Add URL to monitor
GET    /api/speedkit/urls/:id          - Get URL details + recent results
PUT    /api/speedkit/urls/:id          - Update URL settings
DELETE /api/speedkit/urls/:id          - Remove URL from monitoring
```

### Scans

```
POST   /api/speedkit/scan              - Run on-demand scan
GET    /api/speedkit/results/:urlId    - Get scan history for URL
GET    /api/speedkit/results/:urlId/latest - Get most recent scan
```

### Alerts

```
GET    /api/speedkit/alerts            - List alert configs
POST   /api/speedkit/alerts            - Create alert rule
PUT    /api/speedkit/alerts/:id        - Update alert rule
DELETE /api/speedkit/alerts/:id        - Delete alert rule
```

### Summary

```
GET    /api/speedkit/summary           - Dashboard summary (all URLs, avg scores)
```

---

## API Request/Response Examples

### Add URL to Monitor

```bash
POST /api/speedkit/urls
{
  "url": "https://myapp.com",
  "name": "Homepage",
  "scanFrequency": "daily",
  "alertThreshold": 80
}

# Response
{
  "id": "uuid",
  "url": "https://myapp.com",
  "name": "Homepage",
  "scanFrequency": "daily",
  "alertThreshold": 80,
  "createdAt": "2026-03-08T..."
}
```

### Run On-Demand Scan

```bash
POST /api/speedkit/scan
{
  "url": "https://myapp.com",
  "device": "both"  // "mobile", "desktop", or "both"
}

# Response
{
  "desktop": {
    "performanceScore": 92,
    "accessibilityScore": 98,
    "bestPracticesScore": 100,
    "seoScore": 91,
    "coreWebVitals": {
      "lcp": 1240,
      "fid": 12,
      "cls": 0.02
    }
  },
  "mobile": {
    "performanceScore": 78,
    "accessibilityScore": 98,
    "bestPracticesScore": 100,
    "seoScore": 89,
    "coreWebVitals": {
      "lcp": 2890,
      "fid": 45,
      "cls": 0.08
    }
  }
}
```

---

## Google PageSpeed Insights API

### Setup

1. Get API key from Google Cloud Console (free)
2. Enable PageSpeed Insights API
3. Add to environment: `PAGESPEED_API_KEY=xxx`

### API Call

```javascript
const url = encodeURIComponent('https://myapp.com');
const apiKey = process.env.PAGESPEED_API_KEY;
const strategy = 'desktop'; // or 'mobile'

const response = await fetch(
  `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`
);

const data = await response.json();

// Extract scores
const scores = {
  performance: data.lighthouseResult.categories.performance.score * 100,
  accessibility: data.lighthouseResult.categories.accessibility.score * 100,
  bestPractices: data.lighthouseResult.categories['best-practices'].score * 100,
  seo: data.lighthouseResult.categories.seo.score * 100,
};

// Extract Core Web Vitals
const audits = data.lighthouseResult.audits;
const cwv = {
  lcp: audits['largest-contentful-paint'].numericValue,
  fid: audits['max-potential-fid']?.numericValue || 0,
  cls: audits['cumulative-layout-shift'].numericValue,
};
```

### Rate Limits

- **Free tier:** 25,000 requests/day (plenty)
- **Per request:** ~3-10 seconds (Lighthouse runs in Google's cloud)

---

## UI Pages

### 1. SpeedKit Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ SpeedKit — Performance Monitoring                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ Avg Score   │ │ URLs        │ │ Alerts      │            │
│ │    87       │ │    5        │ │    1 ⚠️     │            │
│ │ Desktop     │ │ Monitored   │ │ Triggered   │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│ Monitored URLs                              [+ Add URL]     │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ URL                    Desktop  Mobile   Last Scan    │  │
│ ├───────────────────────────────────────────────────────┤  │
│ │ myapp.com                 92      78     2 hours ago  │  │
│ │ myapp.com/dashboard       85      71 ⚠️  2 hours ago  │  │
│ │ myapp.com/pricing         94      82     2 hours ago  │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ [Quick Scan] Enter any URL for instant results             │
└─────────────────────────────────────────────────────────────┘
```

### 2. URL Detail Page

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back    myapp.com                          [Run Scan]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Latest Results (Desktop)          Latest Results (Mobile)   │
│ ┌─────────────────────────┐      ┌─────────────────────────┐│
│ │ Performance:  92 ████▓  │      │ Performance:  78 ███▓   ││
│ │ Accessibility: 98 █████ │      │ Accessibility: 98 █████ ││
│ │ Best Practices: 100 ████│      │ Best Practices: 100 ████││
│ │ SEO:          91 ████▓  │      │ SEO:          89 ████▓  ││
│ └─────────────────────────┘      └─────────────────────────┘│
│                                                             │
│ Core Web Vitals                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ LCP    1.24s  ✓ Good     │  2.89s  ⚠️ Needs Work     │  │
│ │ FID    12ms   ✓ Good     │  45ms   ✓ Good            │  │
│ │ CLS    0.02   ✓ Good     │  0.08   ✓ Good            │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ Performance History (30 days)                               │
│ ┌───────────────────────────────────────────────────────┐  │
│ │  100│                                                 │  │
│ │   90│──Desktop────────────────────────────────────────│  │
│ │   80│                                                 │  │
│ │   70│──Mobile─────────────────────────────────────────│  │
│ │   60│                                                 │  │
│ │     └─────────────────────────────────────────────────│  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ Alert Settings                                              │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ ☑ Alert when performance drops below: [80]            │  │
│ │ ☑ Alert when LCP exceeds: [2.5] seconds               │  │
│ │ ☐ Alert when score drops by: [10] points              │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Day 1: Backend Foundation

**Morning:**
- [ ] Create database tables (migrations)
- [ ] Set up PageSpeed API integration
- [ ] Build `/api/speedkit/scan` endpoint (on-demand scan)
- [ ] Test API responses, extract scores

**Afternoon:**
- [ ] Build URL CRUD endpoints
- [ ] Build results storage and retrieval
- [ ] Add to background worker (scheduled scans)

### Day 2: Frontend

**Morning:**
- [ ] Create SpeedKit dashboard page
- [ ] Build URL list component
- [ ] Build "Add URL" modal
- [ ] Quick scan UI

**Afternoon:**
- [ ] URL detail page
- [ ] Score history chart (use existing chart library)
- [ ] Core Web Vitals display
- [ ] Mobile/Desktop toggle

### Day 3: Alerts & Polish

**Morning:**
- [ ] Alert configuration UI
- [ ] Alert trigger logic in background worker
- [ ] Connect to notification system (email, Slack, Discord)

**Afternoon:**
- [ ] Testing & bug fixes
- [ ] Landing page updates (add SpeedKit)
- [ ] Documentation

### Day 4: Buffer / Launch

- Edge cases and polish
- Integration testing
- Deploy to production

---

## Landing Page Copy

**Tool Name:** SpeedKit

**Tagline:** "Know if your site is fast, not just up"

**Description:**
```
Track Lighthouse scores and Core Web Vitals over time. 
Get alerted when performance drops. See mobile vs desktop.
Powered by Google PageSpeed Insights.
```

**Benefit-focused one-liner:**
"Find out your site is slow before Google does"

---

## Integration Points

### With Uptime
- Both monitor URLs — could share URL list
- Uptime checks availability, SpeedKit checks speed
- Combined view: "Site is UP and FAST ✓"

### With AlertFlow (future)
- SpeedKit triggers → AlertFlow incident
- On-call person gets paged for performance regression

### With StatusKit (future)
- Display current performance scores on status page
- "Current Performance: 92/100"

---

## Pricing Tier Limits

| Feature | Free | Pro ($39) | Premium ($99) |
|---------|------|-----------|---------------|
| Monitored URLs | 3 | 20 | 100 |
| Scan frequency | Weekly | Daily | Hourly |
| History retention | 7 days | 30 days | 90 days |
| Alerts | Email only | + Slack/Discord | + AlertFlow |

---

## Success Metrics

- URLs monitored per user (engagement)
- Scans per day (usage)
- Alert click-through rate
- User retention after adding SpeedKit

---

## Competitive Analysis

| Tool | Price | Features |
|------|-------|----------|
| SpeedCurve | $12+/mo | Deep RUM, but expensive |
| Calibre | $45+/mo | Performance monitoring |
| DebugBear | $99+/mo | Lighthouse monitoring |
| Lighthouse CI | Free | Self-hosted, no UI |
| **SpeedKit** | Included | Simple, integrated, free API |

**Advantage:** SpeedKit is included in SmithKit — no extra cost, no extra login.

---

## Open Questions

1. **Scan frequency limits?**
   - PageSpeed API is slow (3-10s per scan)
   - Recommend daily for most users, hourly for Premium

2. **Store full Lighthouse report?**
   - Option A: Just scores + CWV (smaller, faster)
   - Option B: Full JSON (allows deep analysis later)
   - **Recommendation:** Store full JSON, display summary

3. **Competitor URL scanning?**
   - Could let users add competitor URLs to compare
   - Nice-to-have for v2

---

## Checklist

- [ ] Database migrations
- [ ] PageSpeed API integration
- [ ] URL CRUD endpoints
- [ ] Scan endpoint (on-demand)
- [ ] Results storage
- [ ] Background worker integration
- [ ] Dashboard UI
- [ ] URL detail page
- [ ] Score history chart
- [ ] Alert configuration
- [ ] Alert triggers
- [ ] Notification integration
- [ ] Landing page update
- [ ] Documentation
- [ ] Testing
