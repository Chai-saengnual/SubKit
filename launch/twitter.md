# X / Twitter — Build-in-Public Thread (8 tweets)

**Timing:** Tuesday morning, 9:00 AM Pacific (right after PH goes live so the link in the thread drives PH traffic).

**Format:** Each tweet is a separate numbered item. Paste them in order. Each one ends with a hook to the next.

---

**1/8**

I just shipped a subscription tracker that explicitly refuses to link your bank account.

It's called SubKit. PWA. Free for 5 subs. Pro is $4.99/mo for multi-device sync.

Here's how I built it in 4 weeks, solo, $0 spent on tools 🧵

→ https://subkit-ten.vercel.app

---

**2/8**

The starting insight:

Every subscription tracker I tried wanted my bank login via Plaid.

Mint is dead. Copilot is $10/mo. The competitor (subkit.chuongle.dev) is on-device only.

There's a category of person who'd pay for a tracker that does NOT have bank access. That's the bet.

---

**3/8**

Stack:

- Single-file PWA. One index.html + one app.html. ~4000 lines of vanilla JS. No React, no build step.
- Supabase for auth + Postgres + storage. $0 (free tier).
- Stripe Checkout for the paywall. Test mode at launch, live later.
- Deno edge functions for the Stripe webhook.
- Vercel for static hosting. $0 (free tier).

Total tools cost: $0.

---

**4/8**

The hardest part was the 5-sub free-tier limit.

First version: enforced in the frontend.
Realized anyone could bypass it with curl.

Second version: enforced in a Postgres BEFORE INSERT trigger.

The DB-level check is the only honest way. The trigger reads users.plan at INSERT time, raises FREE_TIER_LIMIT_REACHED if the user is on Free and already has 5.

---

**5/8**

The 4-sub kill I hit hard:

Multi-device sync. I needed conflict resolution.

Final design: a client_updated_at column. On every save, the client stamps the time. The server only accepts the update if the existing client_updated_at is older. If it's newer, the save fails and the UI shows a conflict modal with "keep mine" / "use server" / "cancel".

The data never silently overwrites. Took me 2 days.

---

**6/8**

The web app IS the native app.

For iOS: Capacitor wraps the same Vercel URL in a WKWebView.
For Android: Bubblewrap makes it a Trusted Web Activity.

One codebase, one deploy, two stores. No native rewrite. No React Native. No Flutter.

The PWA approach is a superpower for solo builders.

---

**7/8**

What I learned:

1. Worker 25-min timeouts are real for editing 4000-line files. Break up the work.
2. Stripe webhooks are fiddly with Deno. Use raw body, not parsed JSON.
3. Free-tier enforcement belongs in the DB, not the frontend.
4. Ship ugly. The polish comes in v1.1.

---

**8/8**

SubKit is live. Free for 5 subs forever. Pro is $4.99/mo.

If you've ever been burned by Mint, by a tracker that wanted too much, or by a tracker that wasn't worth the subscription itself — this is for you.

→ https://subkit-ten.vercel.app

(And if you want to follow the next 90 days of building this in public, I'm @chaisaengnual.)

---

## Posting tips

- [ ] Post as the FIRST tweet of a thread — Twitter UI requires this for the "Show this thread" link
- [ ] Add a relevant image or video to tweet 1 — Twitter algo rewards media
- [ ] Reply to every comment within 1 hour
- [ ] Quote-tweet your own thread on launch day with: "Shipping day. The full story: ↓"
- [ ] Don't pin the thread — let it expire naturally
- [ ] If a big account engages, reply + thank them in a separate tweet

## Image for tweet 1 (recommended)

Screenshot of the marketing page with the SubKit wordmark visible, 1200x675 (16:9). Already in `public/og.svg` — render it in a 1200x675 viewport in Playwright to convert SVG to PNG.
