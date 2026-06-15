import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13?target=deno'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Minimum surface that the webhook handler needs from a Supabase client.
// We accept any object that quacks like the postgrest query builder so
// the unit test can pass a hand-rolled mock without spinning up a
// network. The Supabase client returned by `createClient` is structurally
// compatible, so production code is unchanged.
export type SupabaseLike = {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => {
        single: () => Promise<{ data: Record<string, unknown> | null; error: unknown }>
      }
    }
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => Promise<{ error: unknown }>
    }
  }
}

// Same trick for Stripe: we only call `subscriptions.retrieve` here, so
// the type is narrow. In production this is the real `Stripe` instance;
// in tests it's `{ subscriptions: { retrieve: ... } }`.
export type StripeLike = {
  subscriptions: {
    retrieve: (id: string) => Promise<Stripe.Subscription>
  }
}

// Pure handler. Takes an already-verified Stripe event and a deps bag
// (admin client + stripe client) and applies the right DB mutation.
// Exported so the test file can call it directly with synthetic events
// and a mock deps object — no signature verification, no network, no
// Deno.serve boot.
export const handleWebhookEvent = async (
  event: Stripe.Event,
  deps: { adminClient: SupabaseLike; stripe: StripeLike }
): Promise<void> => {
  const { adminClient, stripe } = deps

  // Helper: resolve a user id from a Stripe subscription's metadata.
  // Webhooks that fire from the customer portal / Stripe dashboard may
  // not carry metadata, so we fall back to a stripe_customer_id lookup.
  const getUserIdFromSub = async (sub: Stripe.Subscription): Promise<string | null> => {
    const meta = (sub.metadata?.supabase_user_id ?? null) as string | null
    if (meta) return meta
    if (typeof sub.customer === 'string') {
      const { data } = await adminClient
        .from('users')
        .select('id')
        .eq('stripe_customer_id', sub.customer)
        .single()
      return (data?.id as string | undefined) ?? null
    }
    return null
  }

  // Helper: apply plan state to a user row. plan_expires_at is only
  // meaningful while the user is `pro`; we clear it on downgrade so the
  // frontend can use a single IS NOT NULL check.
  const setUserPlan = async (
    userId: string,
    sub: Stripe.Subscription,
    plan: 'free' | 'pro'
  ) => {
    // Stripe API version 2024-04-10 still surfaces `current_period_end`
    // on Subscription even though it's deprecated in favor of the items
    // array — keep using it until the library surfaces the new shape.
    const subAny = sub as unknown as { current_period_end?: number }
    const periodEnd = subAny.current_period_end
      ? new Date(subAny.current_period_end * 1000).toISOString()
      : null
    await adminClient
      .from('users')
      .update({
        plan,
        plan_expires_at: plan === 'pro' ? periodEnd : null,
        stripe_subscription_id: sub.id,
      })
      .eq('id', userId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id
        )
        const userId =
          session.metadata?.supabase_user_id
          ?? session.client_reference_id
          ?? await getUserIdFromSub(sub)
        if (userId) {
          await setUserPlan(userId, sub, 'pro')
        }
      }
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription
      const userId = await getUserIdFromSub(sub)
      if (userId) {
        const plan = ['active', 'trialing'].includes(sub.status) ? 'pro' : 'free'
        await setUserPlan(userId, sub, plan)
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = await getUserIdFromSub(sub)
      if (userId) {
        await setUserPlan(userId, sub, 'free')
      }
      break
    }
    default:
      // Ignore unhandled event types — Stripe sends many, and we only
      // care about the ones that affect plan state.
      break
  }
}

// HTTP entry point. Boots the real Stripe + Supabase clients from env
// and delegates to `handleWebhookEvent` after signature verification.
// In `deno test` we import `handleWebhookEvent` directly, so the
// server is not started and no port is bound.
const handleRequest = async (req: Request): Promise<Response> => {
  // Stripe sends the raw body; we need to verify the signature against
  // exactly those bytes. Don't parse the body as JSON first.
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const body = await req.text()
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature, STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 })
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    // Cast: `SupabaseLike` is a structural subset of the real client's
    // query builder, narrowed to only the methods this handler calls.
    // At runtime the real client satisfies the contract.
    await handleWebhookEvent(event, {
      adminClient: adminClient as unknown as SupabaseLike,
      stripe: stripe as unknown as StripeLike,
    })
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err)
    return new Response('Webhook handler error', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}

if (import.meta.main) {
  Deno.serve((req) => handleRequest(req))
}
