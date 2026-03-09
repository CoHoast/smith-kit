# SmithKit Cron Setup

## Uptime Monitoring Cron

The uptime monitoring system needs a cron job to periodically check all active monitors.

### Endpoint

```
GET https://smith-kit-production.up.railway.app/api/cron/uptime?token=YOUR_CRON_SECRET
```

or

```
POST https://smith-kit-production.up.railway.app/api/cron/uptime
Authorization: Bearer YOUR_CRON_SECRET
```

### Option 1: Free External Cron (Recommended)

Use [cron-job.org](https://cron-job.org) (free for up to 60 cron jobs):

1. Sign up at https://cron-job.org
2. Create a new cron job:
   - **URL:** `https://smith-kit-production.up.railway.app/api/cron/uptime?token=YOUR_CRON_SECRET`
   - **Schedule:** Every 5 minutes (`*/5 * * * *`)
   - **Method:** GET
3. Enable the cron job

### Option 2: Railway Cron Service

Add a cron service in Railway that runs:

```bash
curl -X GET "https://smith-kit-production.up.railway.app/api/cron/uptime?token=$CRON_SECRET"
```

### Option 3: Supabase pg_cron

If using Supabase Pro, you can use pg_cron:

```sql
SELECT cron.schedule(
  'uptime-check',
  '*/5 * * * *',
  $$
  SELECT net.http_get(
    'https://smith-kit-production.up.railway.app/api/cron/uptime?token=YOUR_CRON_SECRET'
  );
  $$
);
```

### Environment Variable

Set in Railway dashboard:

```
CRON_SECRET=your-secret-token-here
```

Generate a secure secret:
```bash
openssl rand -hex 32
```

### Testing

Test the endpoint manually:

```bash
curl "https://smith-kit-production.up.railway.app/api/cron/uptime?token=YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "checked": 2,
  "successful": 2,
  "failed": 0,
  "duration_ms": 1234
}
```

## Check Frequency

Recommended intervals:
- **Free tier:** Every 5 minutes
- **Pro tier:** Every 1 minute
- **Premium tier:** Every 30 seconds (requires multiple cron jobs)
