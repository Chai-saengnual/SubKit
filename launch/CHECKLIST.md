# SubKit v1.0 Launch Checklist

## T-7 days

- [ ] Reserve Product Hunt launch slot (Tuesday or Wednesday)
- [ ] Brief 5-10 friends with PH accounts to upvote (NOT comment) at launch
- [ ] Create PH maker account, link to your SubKit account
- [ ] Upload 5 gallery images to PH draft
- [ ] Record 30-second demo video (Loom, 1280x720)
- [ ] Test all 5 marketing URLs: `/`, `/app`, `/privacy`, `/terms`, `/changelog`
- [ ] Verify Supabase env vars are set: STRIPE_SECRET_KEY (test mode ok for launch), SUPABASE_URL, etc.
- [ ] Apply all 14 migrations to Supabase (`supabase db push`)
- [ ] Deploy all 4 edge functions: send-reminders, create-checkout, stripe-webhook, customer-portal
- [ ] Set up a `support@subkit.app` inbox (or forward to your personal email) — auto-reply: "Got your message, I'll reply within 24h"
- [ ] Add Google Analytics OR Plausible OR self-hosted (whatever you prefer) — even just for launch day traffic
- [ ] Smoke test: open https://subkit-ten.vercel.app/ in incognito, add a subscription, sign up for an account, complete the Pro checkout in test mode (use Stripe's 4242 4242 4242 4242 card)
- [ ] Take screenshots of the working app for the PH gallery

## T-1 day

- [ ] Final PR review of the week-4 branch — make sure everything is in main
- [ ] Make sure Vercel has deployed the latest main (visit /, check the build info chip in Settings)
- [ ] Charge your phone. Seriously. You're going to be on it for 12 hours.
- [ ] Clear your calendar for the launch day
- [ ] Tell your partner/housemate "I'm in launch mode tomorrow, please don't ask me questions" — they will, but the warning helps
- [ ] Write out a personal FAQ of 10 likely questions (you'll be tired when people ask them)
- [ ] Pre-load the PH first comment as a draft so you can paste it instantly at 8:00 AM

## Launch day

### 8:00 AM Pacific — Product Hunt goes live

- [ ] Submit on PH (5 minutes before 8 AM so it's live right on the hour)
- [ ] Pin the maker comment
- [ ] Reply to first 5 comments in <5 minutes each (engagement drives ranking)
- [ ] Add the PH badge to the marketing site footer (`<a href="..."> <img src="...">` — wait, do this AFTER launch so the badge doesn't 404)

### 9:00 AM — X thread

- [ ] Post the 8-tweet thread from launch/twitter.md
- [ ] Add the PH link in the last tweet
- [ ] Watch the reply notifications

### 9:30 AM — Hacker News

- [ ] Submit the Show HN from launch/hackernews.md
- [ ] Title: "Show HN: SubKit – Manual subscription tracker, no bank linking"
- [ ] Stay online for 6+ hours replying to comments

### 12:00 PM — IndieHackers

- [ ] Post from launch/indiehackers.md
- [ ] Tag: subscriptions, productivity, launch

### 2:00 PM — r/SaaS

- [ ] Post from launch/reddit.md
- [ ] Watch for mod removals (auto-mod sometimes catches new accounts)

### 4:00 PM — r/productivity

- [ ] Post the productivity version of the Reddit thread

### 6:00 PM — Email blast

- [ ] Send the email from launch/email.md to your personal network
- [ ] BCC yourself first to verify the HTML renders correctly

### 8:00 PM — Wind down

- [ ] Tally: PH rank, HN points, IH comments, Reddit upvotes, email open rate
- [ ] Save every comment that taught you something (these are your v1.1 backlog)
- [ ] Go to bed. You've earned it.

## Day 2

- [ ] r/personalfinance post (the rules say one post per sub per day; day 2 is the personalfinance window)
- [ ] Reply to anything that came in overnight
- [ ] Check Stripe dashboard for any successful test-mode checkouts (zero is expected, but check)

## Day 3-7

- [ ] Reply to stragglers on all channels
- [ ] Watch for any "is this dead?" comments and address them
- [ ] Track the real metric: how many people signed up for Pro?
- [ ] Write a public "week 1 post-launch" IndieHackers update

## T+30 days

- [ ] Publish a retrospective: "What I learned launching SubKit" — on your own blog, IH, or as a Show HN follow-up
- [ ] Update the roadmap in the changelog
- [ ] Cut the free tier from 5 to 4 if Pro conversion is <1%. Or keep 5 if it's >2%. Or A/B test it.
- [ ] Reach out to the people who upvoted / commented the most — they might be your first testimonial

## What success looks like

| Metric | Good day | Great day | Breakout day |
|---|---|---|---|
| PH upvotes | 50-100 | 100-300 | 300+ |
| HN points | 10-30 | 30-100 | 100+ |
| Twitter impressions | 1k-5k | 5k-20k | 20k+ |
| Reddit upvotes | 20-50 | 50-200 | 200+ |
| **Free signups (week 1)** | **20-50** | **50-200** | **200+** |
| **Pro signups (week 1)** | **0-2** | **2-5** | **5-10** |
| Pro MRR (week 1) | $0-10 | $10-25 | $25-50 |

The Pro numbers look small because they are. The product is $4.99/mo. The first week is a sample size of 1. The real metric is: does anyone come back in week 2? Week 4? Week 12? If the answer is yes, you've got something.

## Worst-case recovery

If the launch tanks:
1. Don't panic-delete anything. PH and HN don't penalize you for low engagement.
2. The IndieHackers post and Reddit posts keep getting impressions for weeks.
3. The product is real and live. Real users might find it through search over the next 3 months.
4. The Week 5-6 work is "find the 5 people who care and email them personally." That's always worked.

## What NEVER to do

- ❌ Buy upvotes (PH will ban you)
- ❌ Pay for HN traffic (HN moderators will catch it)
- ❌ Use multiple accounts to upvote your own post
- ❌ Discredit a competitor by name
- ❌ Promise features that aren't shipping in the next 2 weeks
- ❌ Post the same content to multiple subs in the same hour (spam detection)
- ❌ Get defensive in a comment thread
