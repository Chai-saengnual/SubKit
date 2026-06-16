# SubKit — iOS App Store Metadata

## App Name
SubKit

## Subtitle (30 chars)
Subscription Tracker

## Promotional Text (170 chars, can be updated anytime)
The honest subscription tracker. No bank linking, no data selling. See your monthly total in one number, get reminded before anything renews.

## Description (up to 4000 chars)
**Your subscriptions, one number you can trust.**

SubKit is the subscription and bill tracker for people who don't want their bank connected. Track everything in 5 seconds, see one honest monthly total normalized across every billing cycle, and get a heads-up before anything renews.

**Why SubKit:**

- **No bank linking** — manual entry only. Your financial data is yours.
- **One honest number** — your monthly total, normalized across weekly, monthly, quarterly, and yearly billing cycles. No more mental math.
- **Real reminders** — get an email or Telegram ping 3 days before any subscription renews. Not just a visual dot.
- **Multi-device sync** (Pro) — add a sub from your phone, see it on your laptop 5 seconds later. End-to-end encrypted, Supabase-backed.
- **Multi-currency** — track subscriptions in their native currency, see your total in USD/EUR/THB/JPY/GBP/etc. with live exchange rates.
- **Free for up to 5 subscriptions, forever.** No credit card. Works offline.
- **Pro** unlocks unlimited subscriptions, multi-device sync, full analytics, and invoice attachments. $4.99/month or $39/year.

**Privacy by design:**
- Free users: all data lives on your device. Nothing is sent to our servers.
- Pro users: data syncs to our Supabase project, scoped to your user ID with row-level security.
- We never sell your data. We never share it with advertisers. We never train AI on it.

**What's not here (intentionally):**
- No bank OAuth (we don't want your bank credentials)
- No team / household sharing (yet)
- No home screen widgets (yet)
- No AI "cancel suggestion" creep (yet)

Built by one person in Thailand. Open roadmap. Open pricing. Open feedback loop at support@subkit.app.

## Keywords (100 chars, comma-separated)
subscription,tracker,billing,reminder,finance,budget,recurring,cost,money,expense

## Categories
- Primary: Finance
- Secondary: Productivity

## Age Rating
4+

## Support URL
https://subkit.app/support

## Marketing URL
https://subkit.app

## Privacy Policy URL
https://subkit.app/privacy

## What's New in Version 1.0.0
First public release. Manual subscription tracking with multi-currency, real reminders, and a Pro tier for multi-device sync.

## Required App Preview
(iPhone 6.7" / 6.5" / 5.5" — record 3-30 second clips in Xcode Simulator or with `xcrun simctl io booted recordVideo`)

Suggested 3 screens:
1. **Home dashboard** — show the monthly total + 3 subscription cards
2. **Tracked items grid** — show 5-6 cards with different categories
3. **Settings → Plan** — show the "Upgrade to Pro" CTA

## Required Screenshots
(iPhone 6.7" 1290x2796, iPhone 6.5" 1284x2778, iPad 12.9" 2048x2732 — at least 3 each)

Generate with `npx playwright screenshot --device="iPhone 15 Pro" --full-page https://subkit-ten.vercel.app/ app-store-1.png` (do this after the native build is up).
