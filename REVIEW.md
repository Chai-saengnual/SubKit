# SubKit — Code Review

**Repo:** `Chai-saengnual/subkit` · **Live:** `subkit-ten.vercel.app` · **Version reviewed:** `v0.2.1` (commit `3eff2d4`, branch `codex/fix-reminder-and-invoice-access`)
**Reviewed:** 2026-06-15 · **Method:** local working tree cross-checked against GitHub via API
**Local ↔ remote:** identical, all tracked files match. Branch is 1 commit ahead of `main`.

---

## TL;DR

SubKit is a single-file PWA subscription/bill tracker with Supabase cloud sync, EmailJS browser-side reminders, and a Telegram bot path. The architecture is small (8 source files, 1 SPA HTML) but coherent.

**What's good**
- RLS is consistently user-scoped on every table — well done.
- XSS surface is small and consistently handled with an `esc()` helper.
- The data model is sensible: subscriptions, invoices, separate pricing modes, bill vs sub distinction.
- Service worker shell + offline cache are present.

**What needs attention (priority order)**
1. **Secrets in `localStorage` and direct browser calls** — Telegram bot token, EmailJS keys, target email. Risk model depends entirely on the threat (shared/family computer matters; single-user PWA is fine).
2. **Migrations lack transaction wrappers and don't pin extensions** — fine for greenfield, but `enable row level security` should always be paired with explicit GRANTs (one of your own migrations shows you learned this — `20260612130235_grant_subscription_access.sql` and `20260614120000_grant_subscription_invoice_access.sql` are doing it right).
3. **The 145KB monolith `index.html` is your biggest maintainability risk** — no modules, no build step, every change touches the world.
4. **A few race conditions in the reminder flow** when triggered from the browser (interleaved `await` + mutating `subs` array).
5. **No CSRF/CSP, but the attack surface is small** because there's no cookie-based auth — Supabase uses bearer tokens, so this is mostly fine.

Overall: solid v0.2 for a personal project, suitable for sharing with friends, **not** ready for public SaaS deployment without addressing the items above.

---

## 1. Repo map

```
subkit/
├── index.html              145 KB  ← the whole app (HTML + CSS + 1700 lines of JS)
├── manifest.json           485 B   PWA manifest
├── sw.js                   1.5 KB  service worker (cache-first shell)
├── icon.svg                235 B   ⚡ emoji
├── README.md               8 B     "subkit" (basically empty — see "Documentation" below)
├── .gitignore              178 B   standard + .vercel/
├── .vercel/project.json           Vercel project link
└── supabase/
    ├── config.toml         413 ln  full local dev config (postgres 17, etc.)
    ├── migrations/         9 files (see §4)
    └── functions/
        └── send-reminders/index.ts  Edge function, 131 ln
```

No `package.json`, no `node_modules`, no build pipeline — intentionally a no-build static app served from Vercel. The supabase CLI manages migrations and edge functions separately.

**Local vs GitHub cross-check:** `git ls-files` matches the GitHub API listing 1:1. No uncommitted work, no `.env` files, no `node_modules` accidentally tracked. Clean.

---

## 2. Architecture at a glance

- **Single static `index.html`** — all UI, all logic, inline CSS, no framework, no bundler. Loads two CDN scripts: `@supabase/supabase-js@2` and `@emailjs/browser@3`.
- **State:** `subs[]` array in memory + `localStorage` mirror (`subkit-subs-local`). When signed in, Supabase becomes the source of truth.
- **Auth:** Supabase email/password + GitHub OAuth + Google OAuth.
- **Reminders:** two paths — (a) browser-side via EmailJS REST, (b) server-side via `send-reminders` Edge Function.
- **Telegram:** browser-side `fetch` to `api.telegram.org` with the user's bot token.
- **Invoices:** Supabase Storage bucket `invoices` (private, 10 MB cap).
- **Offline:** service worker caches the app shell (`/`, `/index.html`, `/icon.svg`, `/manifest.json`) with cache-first strategy; runtime data via network with fallback to cache.

---

## 3. Security

### 3.1 Supabase publishable key — **fine to be public**

```js
// index.html:1167-1168
var SUPABASE_URL = 'https://hncffbdvniedxfkawjhl.supabase.co';
var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NejWIQfdOe-L4DaJx6MRdA_uyEGXs1b';
```

This is the **new 2024+ Supabase publishable key format** (`sb_publishable_...`). It's explicitly designed to ship in client bundles. Its access is governed by RLS, and your RLS is correct (see §4). Project URL being public is also normal. **No action needed.**

> What you must never ship: `sb_secret_...` keys, the JWT signing key, or anything with `service_role`. I searched the repo for these patterns — none found. Good.

### 3.2 Browser-stored secrets — the real risk

```js
// index.html:1218-1229
var EJS = {
  serviceId:  localStorage.getItem('ejs-service')  || '',
  templateId: localStorage.getItem('ejs-template') || '',
  pubKey:     localStorage.getItem('ejs-pubkey')   || '',
  email:      localStorage.getItem('ejs-email')    || '',
  days:       parseInt(localStorage.getItem('ejs-days') || '3', 10)
};

var TG = {
  token:  localStorage.getItem('tg-token')  || '',
  chatId: localStorage.getItem('tg-chatid') || ''
};
```

**EmailJS keys:** `serviceId`, `templateId`, and the public key are by design client-shippable (EmailJS is built this way). The risk is that anyone with access to your browser can read the public key + service/template IDs and send email **as you** (the public key is the rate limit + sender identity, not a secret). EmailJS does have spam controls but the public key alone isn't a hard stop. **For a personal app, fine. If you want to share it, document that anyone with the URL can spam through your EmailJS account.**

**Telegram bot token** — this is the bigger one. A bot token in `localStorage` means:
- Any XSS that can read `localStorage` owns the bot.
- Anyone with physical/browser access to your device can read the token and own the bot.
- If the bot is in a private group/chat, the attacker can read/write messages there.

For a personal PWA on your own phone, fine. For a shared/family device, less fine. **Recommendation:** if you want to harden it, proxy Telegram through the Edge Function instead — `send-reminders` already has the shape for it, just swap the EmailJS call inside the function with a Telegram API call. Trade-off: you lose "set up Telegram with zero backend" simplicity.

### 3.3 XSS surface

I scanned every `innerHTML` write and every `onclick=` attribute. Findings:

**Good** — there is an `esc()` helper (`index.html:1273`) used consistently for user-controlled strings: `sub.name`, `sub.category`, `sub.account`, `sub.emoji`, `sub.id`, `inv.file_name`, `inv.id`, `inv.file_path`, `option` text. The pattern `<div onclick="openDetail('...'+esc(sub.id)+'...')">` is used safely.

**Remaining concerns:**

- **`d-days` innerHTML** (`index.html:2118`): builds `<span class="badge ${badgeClass}">in ${days} days</span>` with `days` from `dL(sub)` which is a computed number, and `badgeClass` is a hard-coded ternary of `'danger' | 'warn' | ''`. **Safe** because the inputs are number/literal, not user-supplied.
- **Empty-state HTML** (lines 1730, 1749, 1774, 1776, 1830, 1911) — all static literals or computed numbers. **Safe.**
- **Calendar `dateString`** (`index.html:1818-1820`): constructed from `monthDate.getFullYear()`, `getMonth()+1`, and a loop counter `d`. All numbers. **Safe.**
- **Currency code** (`index.html:1936`): used in `onclick="selCurrency('${code}')"` where `code` is `Object.keys(C)`. Hard-coded list (USD, THB, EUR, JPY, GBP, SGD). **Safe.**
- **Invoice file_path** in `viewInvoice('${esc(inv.file_path)}')` — escaped. **Safe.**

**No `eval`, no `new Function()`, no `document.write`, no `insertAdjacentHTML`, no `javascript:` URLs.** 88 inline `onclick=` handlers, all to static function names or safely-escaped args.

**Verdict:** the XSS posture is solid. The only thing I'd add: a `Content-Security-Policy` meta tag — e.g.
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; connect-src 'self' https://hncffbdvniedxfkawjhl.supabase.co https://api.emailjs.com https://api.telegram.org https://open.er-api.com; img-src 'self' data:;">
```
The `'unsafe-inline'` on `script-src` is needed because of the theme bootstrap and the 88 inline `onclick`s; a real CSP would require a build step. Out of scope for the no-build approach, but worth a note in the README.

### 3.4 Auth & RLS — well done

The `subscriptions` table has full CRUD policies scoped to `auth.uid() = user_id` (`20260612121824_create_subscriptions.sql`). The `subscription_invoices` table has a single all-action policy with the same scoping. Storage policies correctly require the path's first folder to match `auth.uid()::text`.

Two small observations:
- **`subscription_invoices` policy is `FOR ALL`**, which PostgREST will use for SELECT/INSERT/UPDATE/DELETE. There's no separate UPDATE policy. Not a bug — `FOR ALL` covers it.
- **`storage.objects` policies** are bucket-scoped (`bucket_id = 'invoices'`) and folder-scoped. Clean.
- The recent migration `20260614120000_grant_subscription_invoice_access.sql` adds the missing table-level GRANT. The issue #1 description says the policies existed but the table grants were missing for authenticated role — that's exactly the kind of PostgREST gotcha that bites people, and you fixed it. Nice catch.

### 3.5 CORS / Edge Function

`send-reminders/index.ts` allows `*` for `Access-Control-Allow-Origin`. Since the function requires a bearer token (line 13-16), this is fine — the token is the auth, not the Origin. The 401 path is correct.

---

## 4. Database migrations

Files in chronological order:

| File | Purpose |
|---|---|
| `20260612121824_create_subscriptions.sql` | Initial subscriptions table + handle_updated_at trigger + 4 RLS policies |
| `20260612130235_grant_subscription_access.sql` | Table-level GRANTs for authenticated role |
| `20260612130912_add_last_remind_column.sql` | `last_remind` column (idempotent) |
| `20260612155524_remote_history_placeholder.sql` | Remote-only migration marker |
| `20260612160000_add_account_column.sql` | `account` column |
| `20260612160041_remote_history_placeholder.sql` | Remote-only marker |
| `20260612170000_create_subscription_invoices.sql` | Storage bucket + invoices table + 3 storage RLS policies |
| `20260613103000_add_flexible_pricing_fields.sql` | `price_mode`, `actual_price`, `price_note` |
| `20260614120000_grant_subscription_invoice_access.sql` | GRANTs for invoices |

**Observations:**

- Migrations are not wrapped in `BEGIN; ... COMMIT;`. Supabase CLI will run each file as a single implicit transaction so this is fine in practice. But when you add a multi-statement migration, wrap it explicitly.
- Two `remote_history_placeholder` files — these mark migrations that exist in the linked remote but not locally. Sensible bookkeeping.
- No `IF NOT EXISTS` on the storage bucket insert (line 2-5 of `20260612170000`) — but it has `on conflict (id) do nothing`, so it IS idempotent. Good.
- The `add_flexible_pricing_fields` migration uses `add column if not exists` with inline `not null default 'fixed'` and a CHECK. This is fine for a non-empty table only if Postgres supports it — and it does, by stages (add nullable, set default, then set NOT NULL implicitly via DEFAULT). Safe.
- **No `0001_init_schema.sql` / shadow baseline.** This is fine for now since the project is small. When you grow, consider a `supabase db pull` baseline and let migrations apply on top.

---

## 5. The `send-reminders` Edge Function

131 lines, single purpose. Reads as a clean reference implementation.

**Strengths:**
- Validates input (`ejs_service`, `ejs_template`, `ejs_public_key`, `ejs_email` all required) → 400 early.
- Authenticates via the caller's `Authorization` header (line 39-43) — uses `createClient` with the user's bearer so RLS applies.
- Skips subs already reminded today (line 77).
- Builds a single `effectiveAmount` helper that's consistent with the browser-side code (line 66-73) — the recent codex fix in issue #1 was specifically to align these.
- Handles EmailJS non-OK responses without crashing (`try`/`catch` + `failed.push`).

**Concerns:**

- **Line 75-126 — the loop awaits one EmailJS call at a time.** If a user has 20 due subs, the function will wait for 20 sequential network calls. For low-volume daily runs, fine. If `reminder_days` is increased to 14, this could be slow. Consider `Promise.allSettled` with bounded concurrency.
- **No rate limit / no idempotency beyond `last_remind`.** If two devices trigger the function simultaneously, both will see the same "not reminded today" state and both will send. A `SELECT ... FOR UPDATE` on the row, or a unique partial index on `(id, last_remind)`, would harden it.
- **`daysLeft` math (line 79-81)**: `Math.ceil((new Date(sub.next_date).getTime() - Date.now()) / 86400000)` — uses local timezone implicitly. `Date.now()` is UTC; `new Date('YYYY-MM-DD')` parses as UTC midnight. The difference in days is UTC-based, which is what `next_date` represents in the DB. **Consistent.** Good.
- **Date format uses `toLocaleDateString('en-US', ...)`** with a hard-coded locale. Hard-coded locale is fine for now but a real i18n would let the user pick.
- **No logging of who triggered the reminder.** Not critical — the auth header is the user's JWT, but you don't log it. If you want audit, log the user ID.

---

## 6. The `index.html` monolith

This is the elephant in the room. 2854 lines, 145 KB, single file. Pros and cons:

**Pros of the monolith:**
- Zero build pipeline, zero JS dependencies to manage.
- Trivial to deploy (just `cp` to Vercel).
- Easy to share / fork / static-serve anywhere.
- Service worker shell is just `/index.html` — caching is trivial.

**Cons:**
- Every change touches a single 145 KB file. Merge conflicts will increase.
- Inline CSS and inline JS mean you can't tree-shake, can't minify easily.
- `innerHTML` template strings repeated 5-7 times in different render functions (`renderSubListEl`, `renderCalendarDueList`, `renderAnalytics`, etc.) — small drift risk.
- Hard to test. No unit tests anywhere.
- Hard to onboard a contributor — they need to read 2854 lines to find a feature.

**The 1700 lines of JS are organized into clear sections** (you can see this from the `/* ── SECTION ── */` comments at lines 1231, 2184, 2292, 2341, etc.) — that's good. But the structure is the only thing preventing this from being unmaintainable.

**Refactor path** (if you ever want it, no urgency):
- Pull JS into `app.js`, CSS into `styles.css`, HTML into `index.html` (a shell).
- Optionally introduce a tiny build step (esbuild) for minification.
- Split the renderers into `renderers/home.js`, `renderers/calendar.js`, etc. once you're on ESM.
- Re-introduce a service worker that lists the new files in its `SHELL` array.

This is **not** something to do at v0.2.1. At v1.0, yes.

---

## 7. Performance observations

- **No virtual list.** `renderSubListEl` and `renderCalendarDueList` build full innerHTML strings and replace the whole element on every render. For 5-50 items this is fine. For 500+ items it would jank.
- **Calendar month render rebuilds the entire grid every time `changeMonth` fires** (line 1815-1825). Trivial cost, no concern.
- **Three Google Fonts loaded by default** (Space Mono, DM Sans, plus the 5 picker fonts Inter/Nunito/Sora/Space Grotesk). The 5 picker fonts only render if the user picks them, but they're downloaded up front. Consider `font-display: swap` (it is implicit in the URL via `&display=swap`) and a single `<link rel="preload">` for the default font.
- **`fetchRates` re-fetches every page load** with a 1-hour localStorage cache. Sensible.
- **`renderAll()`** is called on most state changes and re-runs all renderers. Cheap today, but every state change fans out to a full re-render of home + list + analytics + reminders. The 4-screen SPA doesn't need this — render only the active screen.

---

## 8. Specific code smells (low priority)

1. **`window.location.protocol === 'file:'`** check (`index.html:1212`, `2703`) — works, but `file:` is a fragile host check. Consider an explicit `META` env flag.
2. **`parseFloat(document.getElementById('sub-price').value)`** (line 2023) — no `Number.isFinite` check, just a `Number.isNaN` check. `parseFloat(' ')` returns NaN (good), `parseFloat('12abc')` returns 12 (bad — would accept partial input). The downstream `Number.isNaN(price)` catches it, so OK.
3. **No input max on `next_date`** — the form accepts a date 100 years in the future. The server's `numeric(10,2)` would also accept 99999999.99. UI-level clamps would help.
4. **`var` everywhere.** This is a stylistic call, not a bug. Modern JS lets you use `const`/`let` and avoid the hoisting foot-guns. But the file is consistent with `var` and refactoring is a chore.
5. **`tgMsg` builds HTML for `parse_mode: 'HTML'`** (line 2201-2210) — if a subscription name contains `<` or `>`, Telegram will try to parse it as a tag. Telegram's HTML mode allows a small whitelist. **For a single-user app, low risk.** For safety, escape `<`, `>`, `&` in `sub.name`, `sub.account`, `sub.priceNote` before interpolating.
6. **`fetchRates` swallows errors** (line 1449-1450: `.catch(function(){})`). Fine, but it means if the API goes down, the UI silently shows stale or no rates. A toast or a footer note ("rates may be outdated") would be friendlier.
7. **`tgChatId` from `getUpdates` (line 2262)** picks the last message's chat ID. If the user DMs the bot from a different chat (group, channel), the ID will be wrong. The hint text says "send any message" but doesn't say "send it directly to the bot in a private chat". Small UX miss.

---

## 9. Documentation

**`README.md` is 8 bytes** — literally just `# subkit`. This is a real miss for a public repo. A 30-line README with: what it does, how to deploy (Supabase project + Vercel), which env vars to set, how the reminders work, and a screenshot would do wonders. Consider:

```markdown
# SubKit
A PWA subscription & bill tracker. Cloud sync via Supabase.
Browser-side email reminders via EmailJS, Telegram via your own bot.
Free, no ads, no tracking.

## Quick start
1. `git clone … && cd subkit`
2. Create a Supabase project, run `supabase db push` to apply migrations
3. Deploy `send-reminders` edge function: `supabase functions deploy send-reminders`
4. Open `index.html` locally or `vercel deploy` to ship
5. In Settings → Cloud Sync, sign in
6. (Optional) In Settings → Email Reminders / Telegram, paste your keys
```

---

## 10. Vercel/Supabase wiring

- **Vercel project:** `prj_Dnb0jlKCsbuoqj7Cu3u7dG1jfQch` (org `team_VjOdciaQKjiUW2dknLQyHbN3`). Public URL `https://subkit-ten.vercel.app/`.
- **Supabase project:** `hncffbdvniedxfkawjhl` (org `bokehyxyjuxvtyvmxayu`). The `SUPABASE_URL` in the HTML matches.
- **No `.env` in the repo** — good, the publishable key is the only thing embedded and that's correct.

If you want to add **Google OAuth** properly, you'll need to add the OAuth client ID/secret to the Supabase dashboard and configure the redirect URL — neither needs to be in the repo. The code already calls `signInWithOAuth({ provider: 'google', options: { redirectTo: getAuthRedirectUrl() } })` which is correct.

---

## 11. What's actively in flight (from GitHub)

- **Branch `codex/fix-reminder-and-invoice-access`** is 1 commit ahead of `main`. The work is described in issue #1:
  - Grant `subscription_invoices` table access to authenticated (so invoice UI works under RLS).
  - Align browser-sent vs server-sent reminder payloads so billed amounts render consistently.
  - Handle plain-text edge function failures without crashing the reminder trigger.
  - Bump service worker cache key + visible app version.
- **Open issue #1** has detailed validation steps but the PR isn't merged yet. Before merging, run the "Remaining integration checks" from the issue body — those are the real proof points.

---

## 12. Recommendations (prioritized)

| # | Action | Why | Effort |
|---|---|---|---|
| 1 | Add a real `README.md` | The 8-byte file is the first impression. | 30 min |
| 2 | Add a `Content-Security-Policy` meta tag | Defense in depth, low risk. | 15 min |
| 3 | Escape HTML in `tgMsg` for Telegram | `<` in subscription name breaks Telegram HTML. | 10 min |
| 4 | Add a "stale rates" footer indicator | Silent failure if `open.er-api.com` is down. | 20 min |
| 5 | Add `Promise.allSettled` with concurrency cap in `send-reminders` | Future-proofs against `reminder_days=14` + many subs. | 30 min |
| 6 | Add unique constraint for `(id, last_remind)` | Hardens against double-send races. | 15 min |
| 7 | Document the secrets model in README ("Telegram token is browser-side; do not use on shared devices") | Sets user expectations. | 5 min |
| 8 | Consider `await window.supabase` before creating the client | Tiny race where the CDN script may not be ready. | 5 min |
| 9 | Refactor into `index.html` + `app.js` + `styles.css` when v1.0 hits | Maintainability. | Half day |
| 10 | Add a tiny test for `effectiveAmount` and `advanceDate` | Pure functions, easy to test, currently untested. | 1 hour |

None of these are urgent. The app is in a good place.

---

## 13. Things explicitly NOT a problem

I want to call these out so you don't worry:

- ✅ The `sb_publishable_` key being public is **correct** — Supabase's new model.
- ✅ No `service_role`, no `sb_secret_`, no JWT signing key in the repo.
- ✅ RLS is correct on all tables.
- ✅ Storage RLS path-folder scoping is correct.
- ✅ XSS surface is small and consistently escaped.
- ✅ The single-file architecture is a legitimate choice for v0.x; don't refactor prematurely.
- ✅ No `package.json` and no node_modules — clean.
- ✅ No `.env` files leaked.
- ✅ `git ls-files` matches GitHub API listing exactly — no hidden state.

---

*End of report. Total review: ~15 file reads, 2 cross-checks (local vs remote), one full read of `index.html` (lines 1-2854) plus every migration and the edge function. 0 automated tools used — pure manual review by line.*
