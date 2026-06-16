# Reddit — Three Posts (different tone per sub)

**Timing:** Stagger. PH launch day at 8 AM, then Reddit at 2 PM and 4 PM same day. r/personalfinance on day 2 (weekday morning) so it has its own chance to rank.

**Rule: be authentic.** Reddit is hostile to anything that smells like marketing. Don't use the words "I built this" in the title. Use a regular question title. Mention the product once, in the body. Add value to the conversation.

---

## r/SaaS (Tuesday 2 PM Pacific)

**Title:** I built a subscription tracker that doesn't ask for your bank login. Here's why.

**Body:**

I was using a popular subscription tracker and they asked me to connect my bank to "auto-discover" my subscriptions.

That was the moment I quit. Nobody needs my bank login to know that I pay $15.49/mo for Netflix.

So I built my own:

- Manual entry only. 5 seconds per item.
- Shows you one normalized monthly total.
- Reminds you 3 days before anything renews.
- Multi-currency.
- Free for 5 subs forever. Pro ($4.99/mo) for multi-device sync.

It's a PWA. No install. No bank OAuth. No data selling. I launched it last week and I'm honestly just trying to see if other people want this.

https://subkit-ten.vercel.app

Curious what other people here do. Spreadsheet? Notion? A real app?

---

## r/productivity (Tuesday 4 PM Pacific)

**Title:** What's your system for tracking recurring subscriptions?

**Body:**

I've been bouncing between a spreadsheet and a Notion database for tracking my ~20 subscriptions (Netflix, ChatGPT, Anthropic, a few SaaS tools, gym, domain renewals, the usual). Neither felt right.

The spreadsheet was fine until I had to add a column for "currency" and "next renewal date in days" and I realized I was rebuilding what a CRUD app should do.

So I built a tiny PWA that does the boring part:

- Add an item in 5 seconds
- See one monthly total
- Get a Telegram ping 3 days before anything renews

https://subkit-ten.vercel.app

The interesting part isn't the app — it's the principle. The principle is: no bank linking, no AI coach, no nags. Just a list + a number + a reminder.

What's everyone else using? Have you found anything that does this without requiring a subscription to track your subscriptions (the irony)?

---

## r/personalfinance (Wednesday 8 AM Pacific)

**Title:** Tool recommendation: tracking subscriptions without linking a bank account?

**Body:**

I'm looking for a subscription tracker that does NOT require connecting a bank account. Every popular option (Mint is dead, Copilot, PocketSmith) defaults to bank linking.

Use case: I have ~15 recurring subscriptions, I want to see one honest monthly total, I want a reminder 3 days before anything renews. I don't want my bank login sitting in someone's database.

I just shipped a tiny PWA that does exactly this for me:

- Manual entry, 5 seconds per item
- Multi-currency (some of mine are in JPY and THB)
- Free for up to 5 items, Pro is $4.99/mo for unlimited + multi-device sync
- Reminders via email or Telegram (you pick)

https://subkit-ten.vercel.app

If you've used the competitor (subkit.chuongle.dev), it's similar but with cloud sync. If you haven't, that's fine too — I'm curious what other people use for this.

Not trying to shill — I literally built this for myself and figured other people might want it.

---

## Reddit comment reply playbook

**"This is just an ad."** → Reply: "Fair. Mods, flag if it crosses a line. I posted because I built it and I'm curious if other people want this. If the sub doesn't want self-promo, I'll delete."

**"Why would I pay for this when a spreadsheet works?"** → Reply: "You probably wouldn't. The people who'd pay are the ones who want reminders (which a spreadsheet can't do well) and multi-device sync. I built it for myself because the spreadsheet broke once and I lost 3 months of data."

**"Bank linking is fine if you use a real company."** → Reply: "For sure. Mint was a real company and they still shut it down. Plaid has had breaches. If you're comfortable with the risk, Mint/Copilot work great. If not, the manual approach exists."

**"The free tier is a trap."** → Reply: "The free tier holds 5 subs forever. There's no countdown or upsell spam. If you have 5 subs, you never pay. I think that's the opposite of a trap, but I get that the freemium pattern has earned skepticism."

**"Open source?"** → Reply: "The repo is at github.com/Chai-saengnual/SubKit. The web app is all there. The Stripe key + Supabase keys are env vars, so the deployed version uses mine. The Pro plan goes toward hosting costs, not the source code being closed."

## Posting rules

- [ ] Each sub has its own account-age and karma requirement. r/SaaS is the easiest. r/personalfinance wants 50+ comment karma. r/productivity is in between.
- [ ] Don't post to more than 2 subs in a 24-hour period or your account gets flagged for spam
- [ ] Reply to every comment within 4 hours
- [ ] If a mod removes your post, accept it and move on. Don't message the mod to argue.
