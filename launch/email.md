# Email Announcement — Plain Text + HTML

**Timing:** Tuesday evening or Wednesday morning Pacific. NOT on the same hour as PH launch — let PH have its moment first, then email for the "second wave."

**Send to:** Your personal network — friends, ex-colleagues, family. NOT to a purchased list. (You don't have a list yet, and purchased lists perform terribly for indie products.)

**Tool:** Plain Gmail, or use a free tier of Buttondown / Mailchimp. Don't use your primary domain's email — SPF/DKIM will tank your deliverability.

---

## Plain text version

```
Subject: I shipped something — a subscription tracker that doesn't want your bank

Hi [name],

Quick personal note: I just shipped v1.0 of a thing I've been working on for 4 weeks.

It's called SubKit — a subscription tracker for people who don't want their
bank connected to a fintech app. Manual entry, shows you one monthly total,
reminds you 3 days before anything renews. Free for 5 subs, Pro is $4.99/mo
for multi-device sync.

The reason I'm emailing you specifically: you either (a) track your
subscriptions in a spreadsheet and hate it, (b) tried a subscription tracker
and quit because of the bank login, or (c) might just know someone in that
situation.

If that sounds like you: https://subkit-ten.vercel.app

If not: no worries, ignore this email. I just didn't want to launch without
telling the people in my address book first.

— Chai
```

---

## HTML version (for Buttondown / Mailchimp)

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SubKit is live</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;color:#f0f0f5">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#13131a;border-radius:16px;padding:48px 40px;border:1px solid rgba(255,255,255,0.06)">
        <tr>
          <td style="text-align:center;padding-bottom:24px">
            <span style="display:inline-block;background:rgba(77,216,232,0.15);color:#4dd8e8;font-size:11px;font-weight:700;letter-spacing:0.08em;padding:6px 14px;border-radius:100px">SUBKIT IS LIVE</span>
          </td>
        </tr>
        <tr>
          <td style="font-size:32px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;text-align:center;padding-bottom:16px">
            Your subscriptions,<br><span style="color:#4dd8e8">one number</span> you can trust.
          </td>
        </tr>
        <tr>
          <td style="font-size:16px;line-height:1.6;color:#8e8ea8;text-align:center;padding-bottom:32px">
            Manual entry. No bank linking. Real reminders. Free for 5 subs forever.
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:32px">
            <a href="https://subkit-ten.vercel.app" style="display:inline-block;background:#4dd8e8;color:#0a0a0f;font-weight:600;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none">
              Try it free →
            </a>
          </td>
        </tr>
        <tr>
          <td style="font-size:14px;line-height:1.6;color:#8e8ea8;padding-top:24px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0 0 12px 0">Quick personal note: I just shipped v1.0 of a thing I've been working on for 4 weeks.</p>
            <p style="margin:0 0 12px 0">It's called SubKit — a subscription tracker for people who don't want their bank connected to a fintech app. Manual entry, shows you one monthly total, reminds you 3 days before anything renews.</p>
            <p style="margin:0 0 12px 0">If you track your subscriptions in a spreadsheet and hate it, or tried a tracker and quit because of the bank login, this is for you.</p>
            <p style="margin:0 0 0 0">If not: no worries, ignore this email. I just didn't want to launch without telling the people in my address book first.</p>
            <p style="margin:16px 0 0 0;color:#f0f0f5">— Chai</p>
          </td>
        </tr>
      </table>
      <table width="560" cellpadding="0" cellspacing="0" style="padding:24px 0">
        <tr>
          <td align="center" style="font-size:12px;color:#3a3a50">
            <a href="{{unsubscribe_url}}" style="color:#3a3a50;text-decoration:underline">Unsubscribe</a>
            · SubKit by Chai Saengnual · Bangkok, Thailand
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
```

---

## Segment rules

- [ ] If you have multiple lists (friends vs colleagues vs family), use a separate subject for each
- [ ] Suppress unengaged recipients from your last 3 emails (if any)
- [ ] Include a one-click unsubscribe (CAN-SPAM / GDPR)
- [ ] Don't include attachments — they tank deliverability
- [ ] Send yourself a test first, check it renders right in Gmail + Outlook + Apple Mail
- [ ] Personal note: send from your personal email (Chai <you@gmail.com>), NOT no-reply@subkit.app

## What NOT to include

- ❌ "Forward this to a friend" (looks spammy)
- ❌ "Limited time offer" / urgency (kills trust)
- ❌ Multiple CTAs (one CTA, the website)
- ❌ A 600-word essay about the architecture (link to the launch post for that)
- ❌ Your photo (SubKit's brand is the product, not you)
