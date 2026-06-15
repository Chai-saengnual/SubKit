# SubKit

A PWA for tracking subscriptions and bills — renewal dates, monthly totals, and reminders, in one static page you can host on Vercel (or anywhere) for free. No build step, no framework, no tracking. Data lives in your browser by default and syncs to your own Supabase project if you opt in.

## Features

- 📺 Subscriptions, bills, one-off costs in one list, separate view for non-renewing charges
- 🎮 Smart icons and categories so Netflix, Spotify, AWS, and your electricity bill don't all look the same
- 💸 Multi-currency totals with cached live exchange rates
- ☁️ Optional Supabase cloud sync — sign in once, your data follows you across devices
- ✉️ Email reminders via EmailJS (browser-side) or the included `send-reminders` Edge Function
- 📱 Telegram reminders through your own bot
- 📎 Invoice attachments (PDF/image) in a private per-user Supabase Storage bucket
- 🌗 Dark / light / system theme, 5 font pickers
- 📅 Calendar view, 📊 monthly breakdown, 📲 installable PWA with offline shell

## Quick start

```bash
git clone https://github.com/Chai-saengnual/subkit.git
cd subkit
# Open index.html in a modern browser. The app works locally with browser-only storage.
```

For the optional pieces (cloud sync, server-side reminders, deploy):

```bash
supabase link --project-ref <your-project-ref> && supabase db push
supabase functions deploy send-reminders
vercel deploy --prod
```

In the app's **Settings** screen, paste the keys you have. The ones you skip stay disabled. Per-service walkthroughs (Supabase / EmailJS / Telegram) live in [`docs/configuration.md`](docs/configuration.md).

## Architecture

One `index.html` (HTML + inline CSS + ~1700 lines of vanilla JS) plus a service worker, PWA manifest, Supabase migrations, and one Edge Function. State lives in memory, mirrored to `localStorage`; Supabase becomes the source of truth when signed in. EmailJS and Telegram calls go out from the browser; the optional Edge Function sends the same reminder emails server-side using the caller's JWT (RLS still applies).

```
            ┌──────────────┐
            │   Browser    │
            │  (index.html)│
            └──┬─────┬─────┘
               │     │     │
               ▼     ▼     ▼
        Supabase   EmailJS   Telegram
        Postgres   REST      Bot API
            ▲
            │  (HTTPS, bearer token)
            │
        Supabase Edge Function
        send-reminders ──▶ EmailJS REST
```

## Configuration

The only thing embedded in `index.html` is a Supabase URL and a publishable key — public by design (see [Security model](#security-model)). To unlock the optional features, set up the three services. Full per-service walkthroughs (project creation, where to find each key, what to paste where) are in [`docs/configuration.md`](docs/configuration.md). Short version: Supabase for cloud sync, EmailJS for browser-side email, Telegram bot for browser-side messages.

> Read the [Security model](#security-model) section before you start pasting keys. The Telegram bot token and EmailJS IDs end up in your browser's `localStorage` — that's a deliberate trade-off.

## Development

No build step. Open `index.html`, edit, refresh. Use `python3 -m http.server 8000` or `vercel dev` for a static server.

**Migrations.** New files in `supabase/migrations/` with a `YYYYMMDDhhmmss_description.sql` prefix. Pair `enable row level security` with explicit `GRANT`s to the `authenticated` role (see `20260612130235_grant_subscription_access.sql` for the pattern). Run with `supabase db push`.

**Edge Function.** Edit `supabase/functions/send-reminders/index.ts`, then `supabase functions deploy send-reminders`. Logs in **Edge Functions → Logs** in the Supabase dashboard.

**Service worker cache.** When you change the app shell, bump the cache name at the top of `sw.js` (e.g. `subkit-v2` → `subkit-v3`).

## Security model

Read this before sharing the URL or using SubKit on a shared device.

- The Supabase publishable key (`sb_publishable_...`) embedded in `index.html` is **intentionally public**. Supabase designed the new key format for client-side shipping. The real access control is **Row Level Security** on every table — every table here is correctly scoped to `auth.uid() = user_id`. Don't disable RLS, don't ship a `service_role` or `sb_secret_` key.
- **Telegram bot token and EmailJS service IDs are stored in browser `localStorage`. Don't use this app on a device you don't trust.** Anyone with browser access can read the bot token and impersonate the bot, or read the EmailJS public key and send mail through your account. The trade-off is "no backend needed." If you want to harden it, proxy Telegram through the Edge Function.
- Auth is bearer-token only (Supabase), so CSRF is not a concern.
- The XSS surface is small: every user-supplied string flows through an `esc()` helper before `innerHTML` interpolation. No `eval`, no `new Function`, no `document.write`.

## Roadmap

- **v1.0 — refactor `index.html` into modules.** Pull CSS into `styles.css`, JS into `app.js` (then split renderers). Add a real `Content-Security-Policy` once inline `onclick` handlers are gone.
- **Tests for the pure helpers.** `effectiveAmount` and `advanceDate` quietly drift; a single test file with ~20 assertions would catch most regressions.
- **Audit logging for `send-reminders`.** A `reminder_runs` table would make "why did I get three emails?" debuggable.

## License

MIT — Copyright (c) 2026 Chai Saengnual
