# SubKit — Google Play Store Metadata

## App Name
SubKit — Subscription Tracker

## Short Description (80 chars)
The honest subscription tracker. No bank linking. One monthly number.

## Full Description (up to 4000 chars)
**Your subscriptions, one number you can trust.**

SubKit is the subscription and bill tracker for people who don't want their bank connected. Track everything in 5 seconds, see one honest monthly total normalized across every billing cycle, and get a heads-up before anything renews.

**Why SubKit:**

• No bank linking — manual entry only. Your financial data is yours.
• One honest number — your monthly total, normalized across weekly, monthly, quarterly, and yearly billing cycles. No more mental math.
• Real reminders — get an email or Telegram ping 3 days before any subscription renews. Not just a visual dot.
• Multi-device sync (Pro) — add a sub from your phone, see it on your laptop 5 seconds later. End-to-end encrypted, Supabase-backed.
• Multi-currency — track subscriptions in their native currency, see your total in USD/EUR/THB/JPY/GBP/etc. with live exchange rates.
• Free for up to 5 subscriptions, forever. No credit card. Works offline.
• Pro unlocks unlimited subscriptions, multi-device sync, full analytics, and invoice attachments. $4.99/month or $39/year.

**Privacy by design:**
• Free users: all data lives on your device. Nothing is sent to our servers.
• Pro users: data syncs to our Supabase project, scoped to your user ID with row-level security.
• We never sell your data. We never share it with advertisers. We never train AI on it.

Built by one person in Thailand. Open roadmap. Open pricing.

## Short Description (additional, for Play Store cards)
Track subscriptions. No bank. Real reminders.

## Category
Finance

## Tags
subscription tracker, finance, budget, money, reminders, productivity, recurring payments

## Contact Email
support@subkit.app

## Privacy Policy
https://subkit.app/privacy

## App Icon
512x512 PNG (use `scripts/build-icons.mjs` to generate from icon.svg)
Adaptive icon: 432x432 PNG with safe zone (use `scripts/build-icons.mjs --maskable`)

## Feature Graphic
1024x500 PNG — "SubKit" wordmark on dark background. Generate with:
```
npx playwright screenshot --viewport-size=1024,500 https://subkit-ten.vercel.app/og.svg feature.png
```
Or use a screenshot of `/og.svg` rendered in a 1024x500 viewport.

## Phone Screenshots (16:9 or 9:16, at least 2)
Generate with:
```
npx playwright screenshot --device="Pixel 7" --full-page https://subkit-ten.vercel.app/ screenshot-1.png
npx playwright screenshot --device="Pixel 7" --full-page https://subkit-ten.vercel.app/app screenshot-2.png
```

## Content Rating
Everyone

## Target API Level
34 (Android 14)

## Data Safety Form
- Does your app collect or share any of the required user data types? **Yes** (email, if user signs in)
- Is all of the user data collected by your app encrypted in transit? **Yes** (HTTPS / WSS)
- Do you provide a way for users to request that their data is deleted? **Yes** (Settings → Delete account)

## Target Audience
- Primary: 25-45, tech-savvy, privacy-conscious
- Secondary: Freelancers / small business owners

## Release Strategy
- Internal testing → Closed alpha (10 testers) → Closed beta (100 testers) → Production
- First 48 hours: monitor for crashes via Play Console
- First week: respond to reviews within 24h
