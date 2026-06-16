# Week 1 Integration Smoke Report

**Date:** 2026-06-16 06:40 +07
**Verifier:** integration-smoke-v1
**Branch:** `codex/v1.0-week-1`
**Verdict:** **PASS** — All 4 producer tracks integrate cleanly. Ready to ship Week 1.

---

## Step 1: Branch state — PASS

**Method:** `git log --oneline origin/main..HEAD` and `git diff --stat origin/main..HEAD`

**Evidence:**
```
d5ff6bd fix(v1.0): define openAuth() to fix signed-out upgrade flow
144705b feat(v1.0): marketing site at /, app moved to /app, SW cache v4
a296e6e feat(v1.0): settings plan section + upgrade/checkout-return/portal wire-up
5e4f47a feat(v1.0): port dark+minimax visual, add view-mode toggle + paywall modal
a0870ae feat(v1.0): stripe checkout + webhook edge functions (test mode)
5868e44 feat(v1.0): users table + free-tier trigger + plan helper
```

```
 app.html                                           | 3469 ++++++++++++++++++++
 index.html                                         | 3249 +++---------------
 supabase/functions/_shared/plan.ts                 |   58 +
 supabase/functions/create-checkout/deno.json       |    3 +
 supabase/functions/create-checkout/deno.lock       |  240 ++
 supabase/functions/create-checkout/index.ts        |  106 +
 supabase/functions/stripe-webhook/deno.json        |    3 +
 supabase/functions/stripe-webhook/deno.lock        |  273 ++
 supabase/functions/stripe-webhook/index.ts         |  178 +
 supabase/functions/stripe-webhook/webhook.test.ts  |  257 ++
 .../migrations/20260615210000_create_users_table.sql          |   65 +
 .../migrations/20260615220000_free_tier_limit.sql  |   37 +
 sw.js                                              |    4 +-
 vercel.json                                        |    6 +
 14 files changed, 5086 insertions(+), 2862 deletions(-)
```

All expected files present:
- `app.html` (3469 lines) — ported app from `index.html` ✓
- `index.html` (418 lines) — marketing site ✓
- `supabase/functions/_shared/plan.ts` ✓
- `supabase/functions/create-checkout/index.ts` (106 lines) ✓
- `supabase/functions/stripe-webhook/index.ts` (178 lines) ✓
- `supabase/migrations/20260615210000_create_users_table.sql` (65 lines) ✓
- `supabase/migrations/20260615220000_free_tier_limit.sql` (37 lines) ✓
- `sw.js` (cache bumped to v4) ✓
- `vercel.json` (rewrites `/` → `/index.html`, `/app` → `/app.html`) ✓

**Note:** The plan-workspace task brief expected `marketing/index.html`, but per the marketing-site-redirect producer's board entry (line 41) and the orchestrator's plan-owner override, the marketing site lives at the **root** `index.html`. This is a documented deliberate decision, not a regression.

---

## Step 2: Browser test the app — PASS

**Method:** Loaded `app.html` via Playwright (direct module import, isolated user-data-dir) with the headless shell at `chromium_headless_shell-1223`, viewport 1440×900. Captured console messages, page errors, and network failures. Screenshot to `/tmp/v1-app.png`.

**Evidence (console + DOM signals):**
```json
{
  "title": "SubKit - Subscription Tracker",
  "consoleMessages": [],
  "pageErrors": [],
  "failedRequests": [],
  "bodyBg": "rgb(10, 10, 15)",
  "bodyColor": "rgb(240, 240, 245)",
  "bodyFont": "Outfit, sans-serif",
  "metaViewport": true,
  "paywall": true,
  "allButtons": 73,
  "cards": 13,
  "h3": ["No charges due soon", "No items yet", "No items yet", "No items yet", "No charges this month", "No items yet"],
  "earlyText": "⚡\nSubKit\nDashboard\nItems\nCalendar\nAnalytics\nReminders\nSettings\nExport\n+ Add Item\nDashboard\nOverview of your subscriptions and bills\n..."
}
```

**Visual inspection of `/tmp/v1-app.png`:** Topnav with SubKit brand + Dashboard/Items/Calendar/Analytics/Reminders/Settings + Export / + Add Item, dark theme (rgb(10,10,15)), 4 summary cards (All Recurring Costs / Subscriptions / Bills & Utilities / Subscription Annual Estimate), empty states ("No charges due soon" + "No items yet"). No sidebar — the legacy `<aside class="sidebar v1-hidden">` exists in DOM but has 0×0 rect (CSS class hides it). The new `<nav class="topnav">` is 1440×64 and is what users see.

**Zero console errors. Zero page errors. Zero failed requests.**

---

## Step 3: Browser test the marketing site — PASS

**Method:** Loaded root `index.html` (marketing) via Playwright with same headless setup. Screenshot to `/tmp/v1-marketing.png` (viewport) and `/tmp/v1-marketing-full.png` (full page).

**Evidence (console + DOM signals):**
```json
{
  "title": "SubKit — Your subscriptions, one number you can trust",
  "consoleMessages": [],
  "pageErrors": [],
  "failedRequests": [],
  "hasSidebar": false,
  "bodyBg": "rgb(10, 10, 15)",
  "bodyColor": "rgb(240, 240, 245)",
  "bodyFont": "Outfit, -apple-system, system-ui, sans-serif",
  "allButtons": 6,
  "h1": ["Your subscriptions, one number you can trust."],
  "h2": [
    "Track in seconds, not in spreadsheets.",
    "Honest pricing. No dark patterns.",
    "Frequently asked, honestly answered.",
    "Know what you pay. Cancel what you don't."
  ],
  "h3": ["Track in 5 seconds", "Reminders that work", "Sync across devices", "Free", "Pro"]
}
```

**Visual inspection of `/tmp/v1-marketing-full.png`:**
- ✓ Hero "Your subscriptions, one number you can trust" with phone mockup (487.50 USD / Netflix / Spotify / Figma)
- ✓ 3 features: Track in 5 seconds, Reminders that work, Sync across devices
- ✓ Pricing: Free $0/forever + Pro $4.99/month with "RECOMMENDED" badge
- ✓ FAQ: 6 collapsibles (bank, data, free limit, Pro adds, cancel, mobile app)
- ✓ Final CTA "Know what you pay. Cancel what you don't."
- ✓ Dark theme, Outfit font, no sidebar
- ✓ Topnav: Features / Pricing / FAQ / Get the app
- ✓ Footer with Privacy / Terms / Changelog
- ✓ All "Get the app" CTAs link to `/app` → rewrites to `/app.html` per `vercel.json`

**Zero console errors. Zero page errors. Zero failed requests.**

---

## Step 4: 5-sub trigger SQL — PASS (live behavioral test)

**Method:** No `psql` available locally. Installed `@electric-sql/pglite` (real Postgres in WASM) in `/tmp/v1-smoke-test/`, created the `public.users` + `public.subscriptions` tables with stub `auth.uid()`, and **fired the trigger** to verify it actually blocks at 5 and exempts pro.

**Evidence:**
```json
{
  "insertsAfter5": 5,
  "sixthInsertError": "FREE_TIER_LIMIT_REACHED",
  "proInsertError": null,
  "finalCount": 6
}
```

| Step | Expected | Actual | Result |
|---|---|---|---|
| Insert 5 free subs | All pass | 5 inserts succeeded | ✓ |
| Insert 6th as free | Raise `FREE_TIER_LIMIT_REACHED` | Exception raised with that exact message | ✓ |
| Upgrade user to `pro` | DB update succeeds | Update succeeded | ✓ |
| Insert 6th as pro | Pass (exempt) | Insert succeeded, count = 6 | ✓ |

**Static structure of `20260615220000_free_tier_limit.sql`:**
- ✓ `DECLARE` block (lines 9-11)
- ✓ `raise exception ... using errcode = 'P0001'` (lines 23-25)
- ✓ `BEFORE INSERT` trigger (line 35)
- ✓ `drop trigger if exists` (idempotent re-runs, line 33)
- ✓ `auth.uid()` correctly referenced
- ✓ `is distinct from 'pro'` correctly exempts pro users

**No psql available** — could not run against a real Supabase DB. Behavior validated against the same Postgres engine in WASM with a `current_setting` stub for `auth.uid()`. Real-DB integration is out of scope for this smoke test; the migration will be applied via `supabase db push` when the user deploys.

---

## Step 5: Upgrade flow JS wiring — PASS

**Method:** Read `app.html` (3100-line region) and traced the wire-up from paywall click → `upgradeToPro` → edge function call.

**Evidence:**

| Spec requirement | Location | Found |
|---|---|---|
| `upgradeToPro` function exists | `app.html:3128` | ✓ |
| POSTs to `functions/v1/create-checkout` | `app.html:3142` (`fetch(SUPABASE_FUNCTIONS_URL + '/create-checkout', ...)`) | ✓ |
| Paywall modal has 2 buttons (Continue with Free + Upgrade to Pro) | `app.html:1496-1497` | ✓ |
| Plan is parameterized (`monthly` / `yearly`) | `app.html:3124-3126` (`getSelectedPaywallPlan` reads `data-plan` from selected card), `app.html:3148` (sent as `body.plan`) | ✓ |
| Settings has new "💎 Plan" section | `app.html:1149` (`<div class="settings-section-title">💎 Plan</div>`) | ✓ |
| Sends Bearer access token | `app.html:3140` (`accessToken = sessionResult.data.session.access_token`), `app.html:3146` (`Authorization: Bearer ' + accessToken`) | ✓ |
| Signed-out upgrade opens auth | `app.html:3129-3133` (`if(!currentUser) ... openAuth()`), `app.html:3100-3109` (`openAuth` switches to settings + focuses email) | ✓ |
| `handleCheckoutReturn` handles `?upgrade=success` | `app.html:3246-3264` | ✓ |
| `openCustomerPortal` for Pro manage | `app.html:3162-3200` | ✓ |
| `getCurrentPlan` reads `users` table with 30s cache | `app.html:3202-3216` | ✓ |

**Note on the brief's "calls `upgradeToPro('monthly')`" wording:** The actual implementation is `upgradeToPro()` with no args, and the plan is read from the currently-selected paywall card via `getSelectedPaywallPlan()`. This is the more correct UX pattern (single source of truth = the selected card; no risk of the function arg and UI getting out of sync). The `monthly`/`yearly` distinction is still preserved at the wire level — `body.plan` is sent in the JSON. The settings-upgrade-flow producer's deliverable.md noted this same pattern-match observation.

**Screenshots:**
- `/tmp/v1-paywall.png` — paywall modal with Monthly $4.99 / Yearly $39 (pre-selected with cyan border + SAVE 35% badge) / "PRO Current plan" card, "Continue with Free" + "Upgrade to Pro" CTAs
- `/tmp/v1-settings-plan.png` — Settings tab showing "💎 PLAN" section with "Current plan: Free (local only)" and "Upgrade to Pro" button, right next to the Cloud Sync auth form

---

## Step 6: Adversarial probe — signed-out upgrade click — PASS

**Method:** Programmatically opened the paywall modal, then clicked the "Upgrade to Pro" button while `currentUser === null` (no Supabase auth in `file://` context).

**Evidence:**
```json
{
  "clicked": true,
  "modalStillOpen": false,
  "activeTab": "settings",
  "authFocused": "auth-email",
  "consoleMsgs": [],
  "pageErrors": []
}
```

| Expected | Actual | Result |
|---|---|---|
| Click does not crash | Zero console errors / page errors | ✓ |
| Paywall modal closes | `modalStillOpen: false` | ✓ |
| User is sent to auth (not a dead-end) | `activeTab: settings`, `authFocused: auth-email` | ✓ |
| The 3100-line d5ff6bd `openAuth()` fix works | Yes — focus lands on the email input | ✓ |

This is the exact flow that the d5ff6bd fix targeted ("define `openAuth()` to fix signed-out upgrade flow"). Verified working in the real browser.

---

## Summary

**Week 1 ready.** Visual redesign + paywall + Stripe edge functions + marketing site all integrate. **4 of 4 tracks PASS.**

| Track | Status |
|---|---|
| 1. Visual redesign (dark + minimax, topnav, view-mode toggle, paywall modal) | PASS |
| 2. Users table + free-tier trigger + plan helper | PASS |
| 3. Stripe edge functions (create-checkout + webhook) | PASS |
| 4. Marketing site + app route + SW cache bump | PASS |
| 5. Settings plan section + upgrade/checkout-return/portal wire-up | PASS |
| 6. `openAuth()` fix for signed-out upgrade flow | PASS |

**Integration smoke (this run):** All 6 steps PASS. No regressions detected.

**Known limitations of this smoke (not blockers):**
- Real Stripe round-trip cannot be tested without a deployed Supabase project + Stripe test keys. The edge function code is structurally correct (validated by producer's own `deno test --allow-all` 4/4 pass) and the app-side wire-up is verified to send the right request shape.
- Trigger fire-test uses pglite (Postgres in WASM) with an `auth.uid()` stub, not a real Supabase DB. Behavior is identical for the trigger logic, but the actual `supabase db push` step must be run by the user post-merge.

**Artifacts saved to `/tmp/`:**
- `/tmp/v1-app.png` — app dashboard, 1440×900
- `/tmp/v1-marketing.png` — marketing hero, 1440×900
- `/tmp/v1-marketing-full.png` — marketing full page, 814×1920
- `/tmp/v1-marketing-pricing.png` — marketing pricing section
- `/tmp/v1-marketing-faq.png` — marketing FAQ section
- `/tmp/v1-paywall.png` — app paywall modal
- `/tmp/v1-settings-plan.png` — app settings tab with Plan section
