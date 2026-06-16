# IndieHackers — "Show IH" Post

**Timing:** Tuesday or Wednesday, 12:00 PM Pacific (after the PH launch peaks, before HN dies down).

**Where:** https://www.indiehackers.com/post/new — tag the post with `subscriptions`, `productivity`, `launch`.

## Title

I built a subscription tracker that refuses to link to your bank. Here's the 4-week build, the pricing, and what I'd do differently.

## Body

Hey IH — Chai from Bangkok.

I just shipped v1.0 of SubKit: a manual subscription tracker that explicitly does NOT integrate with your bank. PWA, free for 5 subs, Pro is $4.99/mo for multi-device sync + full analytics.

**Why I built it:**

Every subscription tracker I tried wanted my bank login. That's a 10-foot pole no thank you. There are 2 types of people in the world: people who are fine with Plaid and people who aren't. The second group is the one I want as customers.

**The numbers I'm starting with (real, no vanity):**

- 4 weeks of evenings and weekends, solo
- $0 spent on tools (Supabase free tier, Vercel free tier, Stripe test mode)
- ~4000 lines of vanilla JS in a single HTML file (no React, no build step, no framework)
- 1 paying customer (myself) before launch

**Revenue model:**

- 5-sub free tier enforced by a Postgres BEFORE INSERT trigger
- Pro at $4.99/mo or $39/yr unlocks: multi-device sync, unlimited subs, unlimited invoice attachments, full analytics
- Target: 2-5% free → Pro conversion based on the competitor's data

**What I learned the hard way:**

1. **The 25-min worker timeout is real** for editing a 4000-line file. I had to break up the work into smaller pieces. Some of the bigger features I had to write myself in a single pass because the worker kept timing out.
2. **Stripe webhooks are fiddly with Deno.** The signature verification needs the raw body, not parsed JSON. The Deno esm.sh stripe package has some sharp edges around types.
3. **The web app being the native app is the right call** for a one-person team. Capacitor + TWA = one codebase, one deploy, two stores. The alternative (React Native or Flutter) would have doubled the dev time.
4. **Free-tier enforcement at the DB level is non-negotiable.** I tried doing it in the frontend first and realized anyone could bypass it with curl. Moved the logic to a Postgres trigger.

**What's next:**

- iOS / Android native builds (Capacitor scaffold done, waiting on me to pay Apple $99/yr)
- Household sharing
- AI-powered "you're spending more on streaming this quarter" insights

Happy to answer any questions about the build, the stack, the pricing, or what I'd do differently next time.

→ https://subkit-ten.vercel.app
→ https://github.com/Chai-saengnual/SubKit
