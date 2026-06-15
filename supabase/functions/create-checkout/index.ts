import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Stripe price IDs — in test mode, these are created via
// `stripe prices create --product=prod_xxx` and stored as Supabase
// secrets. The function reads them from env so the same code works for
// both monthly and yearly modes without redeploy.
const PRICE_IDS = {
  monthly: Deno.env.get('STRIPE_PRICE_MONTHLY')!,
  yearly: Deno.env.get('STRIPE_PRICE_YEARLY')!,
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
// Where to send the user after Stripe redirects back. The `/app?upgrade=…`
// query is what the frontend looks at to show a toast / refresh user.plan.
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://subkit-ten.vercel.app'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Auth: require the caller's JWT so we know which user is upgrading.
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: userErr } = await userClient.auth.getUser()
  if (userErr || !user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  let body: { plan?: 'monthly' | 'yearly' }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders })
  }
  const plan = body.plan ?? 'monthly'
  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return new Response(`No Stripe price configured for plan="${plan}"`, {
      status: 500,
      headers: corsHeaders,
    })
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })

  // Service-role client for users-table read/write. We bypass RLS here
  // intentionally: only this function can mint a stripe_customer_id, and
  // it always operates on the row owned by the authenticated user above.
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Look up the user's email + existing stripe customer id so we can
  // re-use the same Stripe customer across re-subscribes (and so the
  // Stripe dashboard shows a familiar email).
  const { data: userRow } = await adminClient
    .from('users')
    .select('email, stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = userRow?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userRow?.email ?? user.email!,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await adminClient
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${SITE_URL}/app?upgrade=success`,
    cancel_url: `${SITE_URL}/app?upgrade=cancel`,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id, plan },
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan },
    },
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
