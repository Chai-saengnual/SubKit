# Hacker News — Show HN

**Launch timing:** Tuesday or Wednesday, 9:00-10:00 AM Pacific (HN traffic peaks mid-morning US time).

## Title (HN title field — 80 char max, plain text)

```
Show HN: SubKit – Manual subscription tracker, no bank linking
```

Alternative titles if you want to test:
- `Show HN: I built a subscription tracker that refuses to touch your bank account`
- `Show HN: SubKit – PWA subscription tracker with a 5-free / $4.99-Pro model`
- `Show HN: We ship the same web app as iOS/Android via Capacitor + TWA wrappers`

## Body (HN text field — markdown, but HN's flavor)

```
Hi HN — Chai here, solo builder.

I built SubKit because every subscription tracker I tried wanted my bank login. That's
the deal-breaker for me, and probably for a lot of you.

So SubKit is the boring version:
- You add subscriptions manually (Netflix, ChatGPT, your gym — 5 seconds each)
- The app shows you one honest monthly total, normalized across weekly / monthly /
  quarterly / yearly cycles
- You get an email or Telegram ping 3 days before anything renews
- The free tier holds 5 subscriptions forever; Pro ($4.99/mo or $39/yr) adds
  multi-device sync, unlimited invoice attachments, full analytics, and unlimited subs

Stack if anyone cares:
- Single-file PWA (one index.html + one app.html, ~4000 lines of vanilla JS, no
  framework, no build step)
- Supabase for auth + Postgres + storage (users table, subscriptions table, free-tier
  limit enforced by a BEFORE INSERT trigger)
- Stripe Checkout (hosted) for the paywall + a stripe-webhook edge function that
  updates users.plan
- Deno edge functions for everything server-side, with deno test for the webhook
- Deployed on Vercel (static) — the iOS / Android shells will be Capacitor (iOS)
  and a TWA via Bubblewrap (Android) wrapping the same Vercel URL

Things I'm proud of:
1. The 5-sub free-tier limit is enforced by a Postgres BEFORE INSERT trigger, not
   by the frontend. You can't bypass it with curl.
2. Conflict resolution on multi-device sync is last-write-wins with a
   client_updated_at column + a conflict modal when a write detects the server
   has a fresher row. The data never silently overwrites.
3. The web app IS the native app. Same code, same Vercel URL, just inside a
   WKWebView (iOS) or Trusted Web Activity (Android). One deploy, both stores.

Things I learned the hard way:
1. Apple has been touchy about PWA-wrappers since EU DMA. The PRD says ship
   Android first, come back to iOS later.
2. The Deno deno.json needs an `imports` map. Without it, `deno check` from the
   project root fails on `npm:@types/node`.
3. Worker 25-min timeouts are real when editing a 4000-line file. Plan accordingly.

AMA about the architecture, the pricing, the build, anything.

→ https://subkit-ten.vercel.app
→ https://github.com/Chai-saengnual/SubKit
```

## Pre-launch checklist

- [ ] HN account has been active for 30+ days and has >10 karma (otherwise the post gets flagged)
- [ ] Title is < 80 chars
- [ ] URL is the Vercel live site, not a marketing landing page
- [ ] Don't link to the GitHub repo unless asked — HN doesn't like that
- [ ] Have the GitHub URL ready to paste in a follow-up reply when someone asks
- [ ] Don't say "I used AI to build this" — HN penalizes that

## Comment reply playbook (HN is unforgiving)

Be specific, technical, and humble. Don't be defensive. Don't say "great question."

**Q: "Why not just use a spreadsheet?"**
A: "You can. SubKit is for people who'd rather not maintain a spreadsheet. The reminders (email + Telegram) are the part a spreadsheet can't do well. Also: I have a bias against spreadsheets for recurring data because they never survive a phone-screen view."

**Q: "Supabase is overkill for this."**
A: "Probably true. I picked it because (a) the free tier covers me for 100+ users, (b) Realtime for multi-device sync is one line of code, and (c) I didn't want to write auth. If I were starting from $0 today I might use Pocketbase."

**Q: "Why no bank integration?"**
A: "Because I (and most of the people I'd want as users) don't trust anyone with our bank login. Mint shut down. Copilot Money exists but it's the same model. There's a category of person who'd pay for a tracker that explicitly does NOT have bank access. That's the bet."

**Q: "What about PocketSmith / Monarch / YNAB?"**
A: "PocketSmith and Monarch both have bank-linking as the primary path. YNAB is budgeting, not tracking. SubKit is closer to the competitor subkit.chuongle.dev (yes, same name) which is PWA-only, on-device only, no cloud. I added cloud sync because the pain point of "I added a sub on my phone and it's not on my laptop" is real for multi-device users."

**Q: "What's the take rate on Pro conversions?"**
A: "It's day 1, so zero data. I'll update this thread in 30 days with the actual number. Target is 2-5% free → Pro based on the competitor's data."

**Q: "How long did this take?"**
A: "4 weeks of evenings and weekends, solo. The biggest chunk was the Supabase schema + Stripe webhook edge function — that took a week alone because the stripe-webhook signature verification is fiddly and Deno's esm.sh has some sharp edges around Stripe types."

**Q: "Why $4.99/mo?"**
A: "I looked at three other trackers: the competitor (subkit.chuongle.dev) gates premium behind 'in the app' (no public price). PocketSmith starts at $9.95/mo. Copilot Money is $9.99/mo. The $4.99 is the cheapest I could go without looking desperate, and it puts the Pro tier at less than 2 Netflix subs / month — which is the framing I use in the paywall."

**Q: "What about iOS?"**
A: "Capacitor scaffold is in the repo. The actual binary build needs an Apple Developer account ($99/yr) which I haven't paid for yet. If the Android TWA gets traction, I'll bite the bullet. If the EU DMA issue is still hot, I'll skip iOS and call it v1.0 anyway."

## After the post

- [ ] Stay online for 6-8 hours responding to every comment
- [ ] If a comment is mean, take the feedback on the chin and reply with "fair point, I'll think about that"
- [ ] If a comment is helpful, save it — those are your future testimonials
- [ ] At end of day, tally: which questions came up the most? Those are the things to add to your FAQ or improve in v1.1
