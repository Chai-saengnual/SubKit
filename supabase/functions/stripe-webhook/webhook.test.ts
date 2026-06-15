// Tests for the stripe-webhook handler.
//
// The HTTP entry point (`handleRequest`) does signature verification +
// env-driven client construction. The pure decision logic lives in
// `handleWebhookEvent`, which takes a verified Stripe event and a
// `deps` bag containing the admin client + Stripe client. We test the
// pure logic directly with hand-rolled mocks — no network, no env
// setup, no Stripe library boot.
//
// Pattern follows `../send-reminders/effectiveAmount.test.ts`.

import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts'
import Stripe from 'https://esm.sh/stripe@13?target=deno'
import {
  handleWebhookEvent,
  type SupabaseLike,
  type StripeLike,
} from './index.ts'

// ---------- Mock helpers ----------

// Records the last `update` payload + the user-id it was applied to, so
// each test can assert exactly what the handler wrote to `users`.
type UpdateCall = { userId: string; values: Record<string, unknown> }
const updateCalls: UpdateCall[] = []

// Records every (userId, sub, plan) tuple the handler would have
// applied. Kept in addition to `updateCalls` so tests can assert
// "the handler tried to update THIS user to THIS plan" without
// caring about the exact `stripe_subscription_id` blob.
type SetPlanCall = { userId: string; plan: 'free' | 'pro'; subId: string }
const setPlanCalls: SetPlanCall[] = []

// Lookup table for the "fallback to stripe_customer_id" path. Maps
// customer id → user id. Empty by default; tests that need the
// fallback fill it in.
const customerLookup = new Map<string, string>()

const makeAdminClient = (): SupabaseLike => ({
  from: (_table: string) => ({
    select: (_cols: string) => ({
      eq: (_col: string, _val: unknown) => ({
        single: async () => {
          // Only the customer-id lookup uses `.single()`. Return whatever
          // the test set in `customerLookup`.
          if (_col === 'stripe_customer_id') {
            const data = customerLookup.get(_val as string)
            return { data: data ? { id: data } : null, error: null }
          }
          return { data: null, error: null }
        },
      }),
    }),
    update: (values: Record<string, unknown>) => ({
      eq: async (col: string, val: unknown) => {
        if (col === 'id') {
          updateCalls.push({ userId: val as string, values })
          setPlanCalls.push({
            userId: val as string,
            plan: values.plan as 'free' | 'pro',
            subId: values.stripe_subscription_id as string,
          })
        }
        return { error: null }
      },
    }),
  }),
})

// Test-controlled subscription. `id` and `status` are the only fields
// the handler reads; `customer` is a string so the metadata-fallback
// branch is exercised when `metadata.supabase_user_id` is absent.
const makeSub = (overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription => ({
  id: 'sub_test_123',
  status: 'active',
  customer: 'cus_test_abc',
  metadata: {},
  // Fill in the rest with empty objects/arrays to satisfy the type.
  // The handler only reads `id`, `status`, `customer`, `metadata`,
  // and (cast) `current_period_end`.
  ...({
    object: 'subscription',
    application: null,
    billing_cycle_anchor: 0,
    cancel_at: null,
    cancel_at_period_end: false,
    canceled_at: null,
    collection_method: 'charge_automatically',
    created: 0,
    currency: 'usd',
    current_period_end: 1_700_000_000,
    current_period_start: 1_699_000_000,
    days_until_due: null,
    default_payment_method: null,
    default_source: null,
    default_tax_rates: [],
    description: null,
    discount: null,
    ended_at: null,
    invoice_settings: {} as Stripe.Subscription.InvoiceSettings,
    items: {} as Stripe.ApiList<Stripe.SubscriptionItem>,
    latest_invoice: null,
    livemode: false,
    next_pending_invoice_item_invoice: null,
    on_behalf_of: null,
    pause_collection: null,
    payment_settings: {} as Stripe.Subscription.PaymentSettings,
    pending_invoice_item_interval: null,
    pending_setup_intent: null,
    pending_update: null,
    schedule: null,
    start_date: 0,
    test_clock: null,
    transfer_data: null,
    trial_end: null,
    trial_settings: {} as Stripe.Subscription.TrialSettings,
    trial_start: null,
  } as Partial<Stripe.Subscription>),
  ...overrides,
} as Stripe.Subscription)

const makeStripe = (sub: Stripe.Subscription): StripeLike => ({
  subscriptions: {
    retrieve: async (_id: string) => sub,
  },
})

// ---------- Fixtures ----------

const TEST_USER_ID = 'user_abc123'
const TEST_SUB = makeSub({ id: 'sub_test_123', customer: 'cus_test_abc' })

// ---------- Tests ----------

Deno.test('checkout.session.completed: writes plan=pro and pulls sub via metadata', async () => {
  updateCalls.length = 0
  setPlanCalls.length = 0
  customerLookup.clear()

  const session = {
    id: 'cs_test_session_1',
    subscription: { id: 'sub_test_123' } as Stripe.Subscription,
    metadata: { supabase_user_id: TEST_USER_ID, plan: 'monthly' },
    client_reference_id: TEST_USER_ID,
  } as unknown as Stripe.Checkout.Session

  const event = {
    id: 'evt_test_1',
    type: 'checkout.session.completed',
    data: { object: session },
  } as unknown as Stripe.Event

  await handleWebhookEvent(event, {
    adminClient: makeAdminClient(),
    stripe: makeStripe(TEST_SUB),
  })

  // Exactly one update, applied to the right user, with plan=pro and
  // the sub id we retrieved.
  assertEquals(setPlanCalls.length, 1)
  assertEquals(setPlanCalls[0].userId, TEST_USER_ID)
  assertEquals(setPlanCalls[0].plan, 'pro')
  assertEquals(setPlanCalls[0].subId, 'sub_test_123')

  // plan_expires_at should be set on the pro row (sub has
  // current_period_end = 1_700_000_000 → 2023-11-14T22:13:20Z).
  assertEquals(updateCalls[0].values.plan, 'pro')
  assertEquals(
    updateCalls[0].values.plan_expires_at,
    '2023-11-14T22:13:20.000Z'
  )
})

Deno.test('customer.subscription.deleted: writes plan=free and clears expiry', async () => {
  updateCalls.length = 0
  setPlanCalls.length = 0
  customerLookup.clear()

  const sub = makeSub({
    id: 'sub_test_456',
    customer: 'cus_test_abc',
    metadata: { supabase_user_id: TEST_USER_ID },
  })

  const event = {
    id: 'evt_test_2',
    type: 'customer.subscription.deleted',
    data: { object: sub },
  } as unknown as Stripe.Event

  await handleWebhookEvent(event, {
    adminClient: makeAdminClient(),
    stripe: makeStripe(sub),
  })

  assertEquals(setPlanCalls.length, 1)
  assertEquals(setPlanCalls[0].userId, TEST_USER_ID)
  assertEquals(setPlanCalls[0].plan, 'free')

  // plan_expires_at should be null on downgrade so the frontend
  // can use a single `IS NULL` check.
  assertEquals(updateCalls[0].values.plan, 'free')
  assertEquals(updateCalls[0].values.plan_expires_at, null)
  assertEquals(updateCalls[0].values.stripe_subscription_id, 'sub_test_456')
})

Deno.test('unknown event type: no DB writes, no error', async () => {
  updateCalls.length = 0
  setPlanCalls.length = 0
  customerLookup.clear()

  // Pick a real Stripe event we don't handle. The handler must swallow
  // it silently — Stripe sends many event types and we only care about
  // the four in the switch.
  const event = {
    id: 'evt_test_3',
    type: 'customer.created',
    data: { object: { id: 'cus_other' } },
  } as unknown as Stripe.Event

  await handleWebhookEvent(event, {
    adminClient: makeAdminClient(),
    stripe: makeStripe(TEST_SUB),
  })

  assertEquals(setPlanCalls.length, 0)
  assertEquals(updateCalls.length, 0)
})

Deno.test('customer.subscription.updated: inactive status flips plan to free', async () => {
  updateCalls.length = 0
  setPlanCalls.length = 0
  customerLookup.clear()

  // A subscription that has been updated to a non-active state
  // (e.g. past_due, unpaid, canceled) must downgrade the user.
  const sub = makeSub({
    id: 'sub_test_789',
    customer: 'cus_test_abc',
    status: 'past_due',
    metadata: { supabase_user_id: TEST_USER_ID },
  })

  const event = {
    id: 'evt_test_4',
    type: 'customer.subscription.updated',
    data: { object: sub },
  } as unknown as Stripe.Event

  await handleWebhookEvent(event, {
    adminClient: makeAdminClient(),
    stripe: makeStripe(sub),
  })

  assertEquals(setPlanCalls.length, 1)
  assertEquals(setPlanCalls[0].plan, 'free')
})
