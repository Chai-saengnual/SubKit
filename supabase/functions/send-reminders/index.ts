import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  let body: {
    ejs_service: string
    ejs_template: string
    ejs_public_key: string
    ejs_email: string
    reminder_days?: number
  }

  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400, headers: corsHeaders })
  }

  const { ejs_service, ejs_template, ejs_public_key, ejs_email, reminder_days = 3 } = body

  if (!ejs_service || !ejs_template || !ejs_public_key || !ejs_email) {
    return new Response('Missing EmailJS config fields', { status: 400, headers: corsHeaders })
  }

  // Authenticate as the calling user
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const today = new Date().toISOString().split('T')[0]
  const ahead = new Date()
  ahead.setDate(ahead.getDate() + reminder_days)
  const maxDate = ahead.toISOString().split('T')[0]

  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('*')
    .gte('next_date', today)
    .lte('next_date', maxDate)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sent: string[] = []
  const failed: string[] = []

  for (const sub of subs ?? []) {
    // Skip if already reminded today
    if (sub.last_remind === today) continue

    const daysLeft = Math.ceil(
      (new Date(sub.next_date).getTime() - Date.now()) / 86400000
    )

    try {
      const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: ejs_service,
          template_id: ejs_template,
          user_id: ejs_public_key,
          template_params: {
            to_email: ejs_email,
            sub_name: sub.name,
            sub_price: `${sub.price} ${sub.currency}/mo`,
            sub_orig: `${sub.price} ${sub.currency}`,
            renewal_date: new Date(sub.next_date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
            days_left: String(daysLeft),
            sub_emoji: sub.emoji,
          },
        }),
      })

      if (emailRes.ok) {
        await supabase
          .from('subscriptions')
          .update({ last_remind: today })
          .eq('id', sub.id)
        sent.push(sub.name)
      } else {
        const errText = await emailRes.text()
        console.error(`EmailJS error for ${sub.name}:`, errText)
        failed.push(sub.name)
      }
    } catch (e) {
      console.error(`Send failed for ${sub.name}:`, e)
      failed.push(sub.name)
    }
  }

  return new Response(JSON.stringify({ sent, failed, total: (subs ?? []).length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
