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

One `index.html` (HTML + inline CSS + ~1700 lines of vanilla JS) plus a service worker, PWA manifest, Supabase migrations, and one Edge Function. State in memory, mirrored to `localStorage`; Supabase becomes the source of truth when signed in. Reminders go out from the browser to EmailJS and Telegram; the optional Edge Function sends the same reminder emails server-side using the caller's JWT (RLS still applies).

```
Browser → Supabase Postgres+Storage  (sync, invoices)
Browser → EmailJS                    (browser-side reminders)
Browser → Telegram Bot API           (browser-side messages)
Edge Function → EmailJS              (server-side reminders, with RLS)
```

## Configuration

The only thing embedded in `index.html` is a Supabase URL and a publishable key — public by design (see [Security model](#security-model)). Optional features need three services: Supabase for cloud sync, EmailJS for browser-side email, Telegram bot for browser-side messages. Per-service walkthroughs are in [`docs/configuration.md`](docs/configuration.md). Read [Security model](#security-model) before you start pasting keys.

## Development

No build step. Open `index.html`, edit, refresh. For migrations, name files `supabase/migrations/YYYYMMDDhhmmss_description.sql`; pair `enable row level security` with explicit `GRANT`s to the `authenticated` role (see `20260612130235_grant_subscription_access.sql`); apply with `supabase db push`. Edge Function: edit `supabase/functions/send-reminders/index.ts`, then `supabase functions deploy send-reminders`. Service worker: bump the cache name at the top of `sw.js` (e.g. `subkit-v3` → `subkit-v4`) when you change the app shell.

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
