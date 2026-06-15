import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Shape of a row in `public.subscriptions` that this function touches.
// Exported so the test file can build typed fixtures and so callers
// (and the compiler) know exactly which fields are read here.
// `price` is marked optional in the type so the helper can be
// unit-tested with degenerate inputs (NaN, undefined) without
// compromising the DB-level NOT NULL contract — the runtime
// Number.isFinite guard inside effectiveAmount catches them.
export type Subscription = {
  id: string
  name: string
  price?: number | string | null
  actual_price?: number | string | null
  price_mode?: 'fixed' | 'actual' | 'variable' | null
  currency?: string | null
  cycle?: string | null
  next_date?: string | null
  last_remind?: string | null
  emoji?: string | null
}

// Pure helper exported at module scope so the test file can import it
// without spinning up the Deno.serve handler. Self-contained: it does
// not read or mutate any module-level state.
export const effectiveAmount = (sub: Subscription): number => {
  const actual = sub.actual_price == null ? null : Number(sub.actual_price)
  if (sub.price_mode !== 'fixed' && actual !== null && Number.isFinite(actual) && actual >= 0) {
    return actual
  }
  const base = Number(sub.price)
  return Number.isFinite(base) ? base : 0
}

// Top-level request handler. Exported (and called by `Deno.serve` below
// in `import.meta.main` context) so the test file can invoke it directly
// with a synthetic Request and assert on the response without binding a
// network port. The handler is pure with respect to module state: it
// reads env vars and request data on each call.
export const handleRequest = async (req: Request): Promise<Response> => {
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

  // Process a single subscription: send the EmailJS request, then update
  // last_remind on success. Errors are caught and pushed to `failed` so
  // that one bad sub does not abort the whole batch under allSettled.
  const processOne = async (sub: Subscription) => {
    // Skip if already reminded today
    if (sub.last_remind === today) return

    // Defensive: a row without a `next_date` cannot be sent. Log and
    // count as failed rather than crashing the worker.
    if (!sub.next_date) {
      console.error(`Send skipped for ${sub.name}: missing next_date`)
      failed.push(sub.name)
      return
    }

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
            sub_price: `${effectiveAmount(sub)} ${sub.currency}/${sub.cycle}`,
            sub_orig:
              sub.price_mode !== 'fixed'
                ? `${effectiveAmount(sub)} ${sub.currency} • Ref ${sub.price} ${sub.currency}`
                : `${sub.price} ${sub.currency}`,
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

  // Bounded-concurrency worker pool: at most 5 EmailJS calls in flight at
  // once. allSettled means a single failure does not reject the others.
  const CONCURRENCY = 5
  const queue: Subscription[] = (subs ?? []) as Subscription[]
  const workers = Array.from(
    { length: Math.min(CONCURRENCY, queue.length) },
    async () => {
      while (queue.length) {
        const sub = queue.shift()
        if (!sub) break
        await processOne(sub)
      }
    }
  )
  await Promise.allSettled(workers)

  return new Response(JSON.stringify({ sent, failed, total: (subs ?? []).length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Boot the HTTP server only when this module is the program entry point.
// In Supabase Edge Functions the entry is the function module itself, so
// `import.meta.main` is true at deploy/runtime. In `deno test` we import
// the module to call `effectiveAmount`/`handleRequest` directly, so the
// server is not started and no port is bound.
if (import.meta.main) {
  Deno.serve((req) => handleRequest(req))
}
