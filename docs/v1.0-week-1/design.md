# SubKit v1.0 Week 1 — Shared Design Doc

**Branch convention:** All work lands on a single feature branch `codex/v1.0-week-1`, based on `main` (which now has the v0.2.x remediation merged). Branch is cut fresh, do NOT touch the in-flight `codex/fix-reminder-and-invoice-access` branch.

**Repo:** `https://github.com/Chai-saengnual/SubKit`
**Local workspace:** `/Users/chalermpolsaengnual/Library/CloudStorage/OneDrive-Personal/01-CHAI_WORKSPACE/01-CHAI PROJECTS/Dev-Projects/Project-Subkit`
**Reference PRD:** `docs/v1.0-prd.md` (at repo root)
**Live app:** `https://subkit-ten.vercel.app/`
**Supabase project:** `hncffbdvniedxfkawjhl.supabase.co`

## What this week covers (from PRD §11)

Tasks 1-7 of Week 1, **minus** the Capacitor/Bubblewrap native packaging (deferred — needs Apple/Google accounts user doesn't have yet):

1. **Visual redesign** — port the v1.0 dark+minimax CSS into the real `index.html`. Add grid/list view toggle. Accessibility test.
2. **`users` table** — new migration. RLS-friendly plan check trigger.
3. **5-sub free tier enforcement** — trigger function. Paywall modal UI. Error handling.
4. **Stripe Checkout** — `create-checkout` and `stripe-webhook` edge functions. Test mode. Env var setup.
5. **Pro upgrade flow in Settings** — "Upgrade to Pro" button, Stripe redirect, webhook → plan update.
6. **Marketing site at `/` + app at `/app`** — new landing page, move app, redirects.
7. **Polish + tests** — browser test, mobile responsive, smoke.

## Assumptions baked in (from "proceed" with no overrides)

- Pricing: **$4.99/mo, $39/yr** (Stripe tier ID created at runtime, not hardcoded)
- Free tier: **5 subs + 5 bills** (enforced server-side via trigger)
- Stripe: **TEST MODE** — `STRIPE_SECRET_KEY=sk_test_...`, webhook endpoint receives test events from Stripe CLI
- iOS: **skip for v1.0** (user has no Apple Developer account)
- Marketing domain: **`subkit-ten.vercel.app/`** with app at `/app`
- Tagline: "Your subscriptions, one number you can trust"

## Worker conventions (same as remediation plan)

- No `push` to remote. Commit locally, report commit hash in `deliverable.md`.
- Branch: `codex/v1.0-week-1` (create from `origin/main` if it doesn't exist).
- Format `deliverable.md` like the previous plan.
- Match existing `var` / no-semicolon / 2-space-indent style in `index.html`. Don't modernize.

## Code style constraints

- The existing `index.html` is 2900 lines, single file. We're porting visual CSS (~600 lines new) into the existing `<style>` block. Do NOT split into separate file (out of scope for Week 1).
- The 88 inline `onclick=` handlers stay. We're not adding a build step.
- The `esc()` helper at `index.html:1273` is the canonical sanitizer — reuse it.

## Test framework

- Deno tests for edge functions (already set up from v0.2.x remediation)
- No new framework for the front-end; smoke test in headless Chrome like before
- Manual test plan for paywall flows (5-sub limit, upgrade, downgrade)

## What this plan does NOT include

- iOS/Android packaging (Capacitor, Bubblewrap) — needs user accounts
- Real Stripe live keys — needs user account
- App Store / Play Store listing — needs paid accounts
- Marketing site copy / SEO polish — Week 2
- Multi-language i18n — never, not in v1.0
- Home screen widgets — v1.1
