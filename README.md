# SubKit

A small PWA for tracking recurring subscriptions and bills — renewal dates, monthly totals, and reminder emails, all from a single static page that you can host on Vercel (or anywhere else) for free.

It's a single-file app with no build step, no framework, and no tracking. Your data lives in your browser by default and syncs to your own Supabase project if you opt in.

## Features

- 📺 Subscriptions, bills, and one-off costs in one list, with a separate "bills" view for non-renewing charges
- 🎮 Smart icons and categories so Netflix, Spotify, AWS, and your electricity bill don't all look the same
- 💸 Multi-currency totals with a live exchange-rate fetch (cached for an hour)
- ☁️ Optional Supabase cloud sync — sign in once and your data follows you across devices
- ✉️ Email reminders via EmailJS (browser-side, no server needed) or via the included `send-reminders` Edge Function
- 📱 Telegram reminders through your own bot, sent from the browser with one tap
- 📎 Invoice attachments — PDF or image, stored in a private Supabase Storage bucket, scoped per user
- 🌗 Dark / light / system theme, plus 5 font pickers
- 📅 Calendar view of upcoming due dates
- 📊 Monthly cost breakdown by category
- 📲 Installable PWA — add to home screen on iOS/Android, runs offline (app shell is cached)

## Quick start

1. Clone the repo and `cd` into it:
   ```bash
   git clone https://github.com/Chai-saengnual/subkit.git
   cd subkit
   ```
2. Open `index.html` in a modern browser. That's it — the app works locally with browser-only storage.
3. (Optional) Create a free [Supabase](https://supabase.com) project if you want cloud sync and server-side reminders. See [Configuration](#configuration) below.
4. (Optional) Sign up for [EmailJS](https://www.emailjs.com) if you want email reminders from the browser.
5. (Optional) Create a [Telegram](https://t.me/BotFather) bot if you want Telegram reminders.
6. Open the in-app **Settings** screen and paste the keys you have. The ones you skip stay disabled.

To deploy, drag the repo to Vercel or run `vercel deploy` from the project root. No build command needed — it's a static site.

## Architecture

SubKit is one `index.html` file (HTML + inline CSS + ~1700 lines of vanilla JS) plus a service worker, an SVG icon, a PWA manifest, the Supabase migrations, and a single Edge Function. State lives in memory and is mirrored to `localStorage`; when you sign in, Supabase becomes the source of truth. Email and Telegram reminders are sent from the browser via EmailJS and the Telegram Bot API; an optional Edge Function lets you send the same emails server-side (useful if you want to run them on a schedule without keeping a tab open).

```
            ┌──────────────┐
            │   Browser    │
            │  (index.html)│
            └──┬─────┬─────┘
               │     │     │
   ┌───────────┘     │     └──────────────┐
   │                 │                    │
   ▼                 ▼                    ▼
┌──────────┐   ┌──────────┐         ┌──────────┐
│ Supabase │   │  EmailJS │         │ Telegram │
│ Postgres │   │  REST    │         │ Bot API  │
│ +Storage │   └──────────┘         └──────────┘
└──────────┘
   ▲
   │  (HTTPS, bearer token)
   │
┌──────────────┐
│   Supabase   │
│Edge Function │
│send-reminders│ ──▶  EmailJS REST
└──────────────┘
```

The Edge Function reads subscriptions the same way the browser does (with the caller's JWT, so RLS still applies) and pushes reminder emails through EmailJS on the server side.

## Configuration

SubKit works out of the box with zero configuration — the only thing embedded in the HTML is a public Supabase URL and publishable key, which is by design (see [Security model](#security-model)). To unlock the optional features, configure each of the following.

### 1. Supabase (cloud sync + server-side reminders + invoice storage)

1. Create a project at [supabase.com](https://supabase.com).
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and link it:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
3. Apply the migrations:
   ```bash
   supabase db push
   ```
4. Edit the two constants at the top of `index.html` (around line 1167) — `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`:
   ```js
   var SUPABASE_URL = 'https://<your-project-ref>.supabase.co';
   var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_...';
   ```
   You can find both in Supabase Dashboard → **Project Settings → API**.
5. Deploy the `send-reminders` Edge Function:
   ```bash
   supabase functions deploy send-reminders
   ```
6. In Supabase Dashboard → **Authentication → Providers**, enable Email and any social providers you want (GitHub, Google). For Google/GitHub, paste the OAuth client ID/secret — these stay in the dashboard, never in the repo.

### 2. EmailJS (browser-side email reminders)

1. Create a free account at [emailjs.com](https://www.emailjs.com).
2. Add an **Email Service** (Gmail, Outlook, custom SMTP, etc.) — note the Service ID.
3. Create an **Email Template** with these variables: `{{to_email}}`, `{{to_name}}`, `{{sub_name}}`, `{{sub_price}}`, `{{sub_date}}`, `{{days_left}}`. Note the Template ID.
4. Copy the **Public Key** from **Account → API Keys**.
5. In the app: **Settings → Email Reminders** and paste the four values. They are stored in your browser's `localStorage`.

### 3. Telegram (browser-side Telegram reminders)

1. Open [@BotFather](https://t.me/BotFather) on Telegram and run `/newbot`. Save the bot token.
2. Start a chat with your bot and send any message — this is how the bot learns your `chat_id`.
3. In the app: **Settings → Telegram Reminders** and paste the bot token and chat ID. Both are stored in your browser's `localStorage`.
4. Tap **Send Test Message** to confirm it works.

> **⚠️ Read the [Security model](#security-model) section before you start pasting keys around.** The Telegram bot token and EmailJS IDs end up in your browser's localStorage. That's a deliberate trade-off — it keeps the app zero-backend for those features — but it has implications.

## Development

There's no build step. Open `index.html` in your browser, edit, refresh. For anything more elaborate, use a static server:

```bash
# Python
python3 -m http.server 8000

# or with the Vercel CLI (matches production)
vercel dev
```

### Adding a database migration

Migrations live in `supabase/migrations/` with a timestamp prefix (`YYYYMMDDhhmmss_description.sql`). Create a new file:

```bash
supabase migration new add_my_field
```

Write your SQL — wrap multi-statement changes in `BEGIN; ... COMMIT;` explicitly. The Supabase CLI runs each file as a single implicit transaction, but an explicit wrapper is safer if you ever run them by hand. Pair `enable row level security` with explicit `GRANT`s to the `authenticated` role (see `20260612130235_grant_subscription_access.sql` and `20260614120000_grant_subscription_invoice_access.sql` for the pattern).

Then apply it:

```bash
supabase db push            # pushes to the linked remote
# or for local dev:
supabase db reset           # resets and re-applies all migrations
```

### Updating the Edge Function

The `send-reminders` function lives in `supabase/functions/send-reminders/`. Edit and deploy with:

```bash
supabase functions deploy send-reminders
```

It reads the caller's `Authorization` header, queries the user's subscriptions through RLS, and sends an EmailJS request per due subscription. Logs to the Supabase dashboard under **Edge Functions → Logs**.

### Deploying

The static parts deploy to any static host. Vercel is configured in `.vercel/project.json`:

```bash
vercel deploy --prod
```

For other hosts, just upload `index.html`, `sw.js`, `manifest.json`, and `icon.svg` to the web root.

### Service worker cache

When you change the app shell, bump the cache name at the top of `sw.js` (e.g. `subkit-v2` → `subkit-v3`) and the user's browser will pick up the new version on the next visit.

## Security model

Read this section before you put SubKit on a shared device or share the URL with anyone.

- The Supabase publishable key (`sb_publishable_...`) embedded in `index.html` is **intentionally public**. Supabase designed the new key format for client-side shipping. The real access control is **Row Level Security** on every table — and every table in this project is correctly scoped to `auth.uid() = user_id`. Don't disable RLS, don't ship a `service_role` or `sb_secret_` key, and you're fine.
- Telegram bot token and EmailJS service IDs are stored in browser `localStorage`. **Don't use this app on a device you don't trust.** Anyone with browser access to your device can read the bot token and impersonate the bot, or read the EmailJS public key and send mail through your EmailJS account. The trade-off is "no backend needed for these features." If you want to harden it, proxy Telegram through the Edge Function instead of calling `api.telegram.org` from the browser.
- Auth is bearer-token only (Supabase), so CSRF is not a concern. There is no cookie-based session.
- The XSS surface is small: every user-supplied string flows through an `esc()` helper before being interpolated into `innerHTML`. No `eval`, no `new Function`, no `document.write`.
- A `Content-Security-Policy` meta tag is **not** currently set, because the no-build approach with 88 inline `onclick` handlers and inline theme bootstrap forces `'unsafe-inline'` for `script-src` and `style-src`. Adding a real CSP is part of the v1.0 refactor (see [Roadmap](#roadmap)).

## Roadmap

- **v1.0 — refactor `index.html` into modules.** Pull HTML into a shell, CSS into `styles.css`, JS into `app.js` (then split renderers into `renderers/home.js`, `renderers/calendar.js`, etc. once we're on ESM). Add a real `Content-Security-Policy` once inline `onclick` handlers are gone. Optional tiny build step (esbuild) for minification.
- **A test or two for the pure helpers.** `effectiveAmount` and `advanceDate` are the kind of functions that quietly drift — a single Vitest file with ~20 assertions would catch most regressions.
- **Stale-rates indicator.** If `open.er-api.com` is down, the multi-currency totals silently show yesterday's numbers. A small footer note would be friendlier.
- **Idempotency hardening for `send-reminders`.** Add a unique partial index on `(id, last_remind)` (or `SELECT ... FOR UPDATE` in the loop) to prevent double-sends when two devices trigger the function at the same time.
- **Audit logging.** Right now `send-reminders` doesn't log who triggered the reminder batch. A `reminder_runs` table would make "why did I get three emails for the same subscription?" debuggable.

## License

MIT — Copyright (c) 2026 Chai Saengnual
