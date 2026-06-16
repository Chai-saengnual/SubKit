# Product Hunt Launch — SubKit

**Launch date target:** Tuesday or Wednesday, 8:00 AM Pacific (the window where PH traffic peaks and tech Twitter overlaps with PH hunters).

## Tagline (60 char max)
Your subscriptions, one number you can trust.

## Name
SubKit

## Topics (pick 3 max)
- Productivity
- Finance
- Subscription Management

## Gallery assets (need 4-5)

PH requires these uploaded as the first-message media. Order matters — first 3 are shown above the fold.

1. **Hero shot** — `https://subkit-ten.vercel.app/` rendered in a 1280x800 browser screenshot, with the SubKit wordmark + tagline overlay. Use Playwright to capture.
2. **Dashboard view** — Screenshot of `https://subkit-ten.vercel.app/app` with 5 sample subscriptions visible. The point: "look how clean this is."
3. **Analytics view** — Screenshot of the analytics tab with 12-month projection visible. Shows the math is real.
4. **Paywall modal** — Screenshot showing the Pro upgrade modal with monthly/yearly cards. Shows the business model.
5. **Onboarding step 1** — Screenshot of the currency picker. Shows the polish for first-time users.

## Description (PH has 260 char limit for the tagline + unlimited description)

**SubKit** is the subscription and bill tracker for people who don't want their bank connected.

✓ Manual entry — no bank linking
✓ One honest monthly total, normalized across every billing cycle
✓ Real reminders (email + Telegram) 3 days before anything renews
✓ Multi-device sync for Pro users
✓ Multi-currency with live exchange rates
✓ Free for up to 5 subscriptions, forever

Built by one person in Thailand. Open roadmap. Open pricing. No data selling.

→ https://subkit-ten.vercel.app

## First-comment (Maker's note — pin this to the top)

**Hey Product Hunt! 👋 I'm Chai, the solo builder of SubKit.**

I built this because I was tired of subscription trackers that want my bank login. That's a 10-foot pole no thank you.

So SubKit is the opposite:
- **No bank OAuth.** Manual entry, takes 5 seconds per item.
- **Free for up to 5 subscriptions, forever.** The free tier is actually useful.
- **Pro ($4.99/mo or $39/yr)** only unlocks things that NEED server-side state: multi-device sync, unlimited invoice attachments, full analytics. No "premium themes" or "remove ads" nonsense.

A few things I'm proud of:
- **The 5-sub free-tier limit is enforced by a Postgres trigger**, not by the frontend. Try to bypass it with curl — you can't.
- **Reminders go through both EmailJS (browser) and Telegram bot**, depending on what the user prefers. No lock-in to one channel.
- **Multi-currency is real** — track a ¥1,200 Netflix JP subscription and a $15 Netflix US subscription in the same account, see the total in THB.

What's coming:
- iOS + Android native builds (Capacitor + TWA, no native rewrite)
- Household sharing (two people splitting Netflix/Spotify)
- AI-powered "you spent 30% more on streaming this quarter" insights

**AMA about the build, the architecture, the pricing, anything.** I'll be on this thread all day.

→ https://subkit-ten.vercel.app

## Pre-launch checklist

- [ ] Create Product Hunt maker account (https://www.producthunt.com/)
- [ ] Reserve your launch slot 5-7 days ahead (PH "scheduled launches" page)
- [ ] Upload all 5 gallery images to your PH draft
- [ ] Have a 30-second demo video ready (optional but +20% upvotes): https://www.loom.com/ or QuickTime screen recording
- [ ] Brief 5-10 friends with PH accounts to upvote at launch (NOT comment — comments come from strangers)
- [ ] Set up email auto-reply: "I won't be checking PH DMs for 24h, email me at support@subkit.app"

## Launch-day timing (Pacific Time)

- **8:00 AM** — Product Hunt launch goes live
- **8:00-8:30 AM** — Reply to every comment within 5 minutes (engagement drives ranking)
- **9:00 AM** — Twitter thread goes out (link to PH)
- **9:30 AM** — Hacker News Show HN post (don't link to PH, link directly to subkit.app)
- **12:00 PM** — IndieHackers post
- **2:00 PM** — r/SaaS post
- **4:00 PM** — r/productivity post
- **6:00 PM** — Email to personal network
- **End of day** — Check ranking. Top 5 of the day = amazing. Top 10 = great. Top 20 = solid. Just be online for comments.

## Worst-case plan

If the launch flops: don't panic. IndieHackers and Reddit threads keep getting traffic for weeks. The PH badge is nice but the real metric is "did 50+ people sign up for Pro in the first week." That's the number to optimize for, not the upvote count.
