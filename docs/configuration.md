# Configuration

This document covers the per-service setup for SubKit's optional features. The app works out of the box with browser-only storage — you only need the steps below if you want cloud sync, email reminders, or Telegram reminders.

SubKit works out of the box with zero configuration — the only thing embedded in `index.html` is a public Supabase URL and publishable key, which is by design (see the README's [Security model](../README.md#security-model) section). To unlock the optional features, configure each of the following.

## 1. Supabase (cloud sync + server-side reminders + invoice storage)

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

## 2. EmailJS (browser-side email reminders)

1. Create a free account at [emailjs.com](https://www.emailjs.com).
2. Add an **Email Service** (Gmail, Outlook, custom SMTP, etc.) — note the Service ID.
3. Create an **Email Template** with these variables: `{{to_email}}`, `{{to_name}}`, `{{sub_name}}`, `{{sub_price}}`, `{{sub_date}}`, `{{days_left}}`. Note the Template ID.
4. Copy the **Public Key** from **Account → API Keys**.
5. In the app: **Settings → Email Reminders** and paste the four values. They are stored in your browser's `localStorage`.

## 3. Telegram (browser-side Telegram reminders)

1. Open [@BotFather](https://t.me/BotFather) on Telegram and run `/newbot`. Save the bot token.
2. Start a chat with your bot and send any message — this is how the bot learns your `chat_id`.
3. In the app: **Settings → Telegram Reminders** and paste the bot token and chat ID. Both are stored in your browser's `localStorage`.
4. Tap **Send Test Message** to confirm it works.

> **Read the README's [Security model](../README.md#security-model) section before you start pasting keys around.** The Telegram bot token and EmailJS IDs end up in your browser's `localStorage`. That's a deliberate trade-off — it keeps the app zero-backend for those features — but it has implications. Don't use this app on a device you don't trust.
