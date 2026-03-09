# CommitBot → Changelog Merge Spec

**Status:** Proposed
**Author:** Zero Cool
**Date:** 2026-03-08
**Estimated Time:** 2-3 days

---

## Summary

Merge CommitBot into Changelog. CommitBot as a standalone tool feels thin — "AI commit messages" is a 5-minute novelty, not a full product. Combined with Changelog, it becomes **"AI Release & Commit Assistant"**.

**Result:** Tool count stays at 12 (CronPilot → AlertFlow, CommitBot absorbed, SpeedKit added)

---

## Current State

### CommitBot (Standalone)
- Generate AI commit messages from diffs
- CLI tool: `npx commitbot`
- Simple UI: paste diff → get message
- API: `POST /api/commitbot/generate`

### Changelog (Standalone)
- Generate release notes from commits
- Connect to GitHub repos
- AI summarizes commits into changelog entries
- Publish to public changelog page
- API: `POST /api/changelog/generate`

---

## New State: Changelog (Combined)

### Renamed: "Changelog" → "Changelog" (keep name, expand scope)

**Tagline:** "AI-powered commits and release notes"

### Features (Combined)

```
Changelog (Enhanced)
├── Generate release notes from commits (existing)
├── AI commit message generator (from CommitBot)
├── Commit message templates/conventions
├── CLI: npx smithkit-changelog (or keep commitbot alias)
└── GitHub integration for both features
```

---

## UI Changes

### Dashboard Sidebar
```
Before:                     After:
├── Changelog               ├── Changelog
├── CommitBot               │   ├── Release Notes
│                           │   └── Commit Messages
```

### Changelog Page (Tabbed)

```
┌─────────────────────────────────────────────────────────┐
│ Changelog                                                │
├─────────────────────────────────────────────────────────┤
│ [Release Notes]  [Commit Messages]  [Settings]          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  (Tab content here)                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Tab 1: Release Notes** (existing Changelog UI)
- Connected repos
- Generate release notes
- Published changelogs

**Tab 2: Commit Messages** (moved from CommitBot)
- Paste diff → get AI message
- Recent generations
- Message style preferences (conventional commits, etc.)

**Tab 3: Settings**
- GitHub connection
- Default commit style
- Changelog publish settings

---

## API Changes

### Keep Both Endpoints (backward compatible)

```
# Existing (keep working)
POST /api/commitbot/generate     → redirect to changelog
POST /api/changelog/generate     → unchanged

# New unified endpoint (optional)
POST /api/changelog/commit-message
POST /api/changelog/release-notes
```

### CLI Changes

```bash
# Current CommitBot CLI
npx commitbot "generate commit message"

# After merge - keep alias working
npx commitbot → calls /api/changelog/commit-message

# New unified CLI (optional)
npx smithkit changelog commit
npx smithkit changelog release
```

---

## Database Changes

**None required.** CommitBot doesn't have persistent storage — it's stateless generation. Changelog already has its own tables for repos and entries.

Optional: Add `commit_generations` table to track usage:

```sql
CREATE TABLE commit_generations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  input_diff TEXT,
  generated_message TEXT,
  style VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Migration Steps

### Day 1: Backend
1. Move CommitBot API logic into Changelog module
2. Add redirect from `/api/commitbot/*` → `/api/changelog/*`
3. Update CLI to point to new endpoints
4. Test backward compatibility

### Day 2: Frontend
1. Add "Commit Messages" tab to Changelog page
2. Move CommitBot UI components into Changelog
3. Remove CommitBot from main tool grid
4. Update sidebar navigation

### Day 3: Cleanup
1. Remove standalone CommitBot page
2. Update landing page (11 tools → show combined description)
3. Update docs/help
4. Update onboarding flow

---

## Landing Page Copy

**Before:**
```
CommitBot
AI writes your commit messages
```

**After:**
```
Changelog
AI-powered commits and release notes
├── Generate commit messages from diffs
└── Turn commits into beautiful changelogs
```

---

## User Communication

For existing CommitBot users (if any):

```
Subject: CommitBot is now part of Changelog

Hey!

We've merged CommitBot into Changelog to give you a more 
complete release workflow:

✓ AI commit messages (same feature, same CLI)
✓ AI release notes (existing Changelog)
✓ One tool for your entire release process

Nothing breaks — your CLI commands and API calls still work.

Find it all under Changelog in your dashboard.
```

---

## Success Metrics

- CommitBot API calls continue (no regression)
- Changelog engagement increases
- User feedback positive on consolidation
- No support tickets about missing CommitBot

---

## Open Questions

1. **Keep "CommitBot" branding anywhere?** 
   - Option A: Fully rebrand to "Commit Messages" tab
   - Option B: Keep "CommitBot" as feature name within Changelog
   
2. **CLI naming?**
   - Keep `npx commitbot` working forever (alias)
   - Add `npx smithkit changelog commit` as canonical

**Recommendation:** Option A for branding, keep CLI alias forever.

---

## Checklist

- [ ] Backend: Move CommitBot logic to Changelog module
- [ ] Backend: Add API redirects for backward compatibility
- [ ] Frontend: Add Commit Messages tab to Changelog
- [ ] Frontend: Remove CommitBot from tool grid
- [ ] Frontend: Update sidebar navigation
- [ ] CLI: Update to use new endpoints (keep old command working)
- [ ] Landing: Update tool description
- [ ] Docs: Update help/documentation
- [ ] Test: Verify all existing integrations work
