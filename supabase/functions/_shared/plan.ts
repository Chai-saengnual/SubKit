// supabase/functions/_shared/plan.ts
//
// Shared helper for edge functions that need to know whether a
// Supabase user is on the Free or Pro plan. Reads from the
// public.users table (created in
// 20260615210000_create_users_table.sql) which is kept in sync
// with auth.users via the on_auth_user_created trigger and with
// Stripe via the stripe-webhook edge function.
//
// Conventions used across SubKit edge functions:
//   - Supabase URL + service role key come from env vars so the
//     same code runs locally (supabase start) and in production.
//   - All callers pass userId explicitly; we never trust a JWT
//     inside the helper because the service-role client bypasses
//     RLS.
//   - On any read failure we default to 'free' — fail-closed so a
//     misconfigured user row never silently unlocks Pro features.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type Plan = 'free' | 'pro'

export interface PlanState {
  plan: Plan
  plan_expires_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

const FREE_DEFAULT: PlanState = {
  plan: 'free',
  plan_expires_at: null,
  stripe_customer_id: null,
  stripe_subscription_id: null,
}

export async function getPlan(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string
): Promise<PlanState> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data, error } = await supabase
    .from('users')
    .select('plan, plan_expires_at, stripe_customer_id, stripe_subscription_id')
    .eq('id', userId)
    .single()
  if (error || !data) {
    return FREE_DEFAULT
  }
  return data as PlanState
}

export function isPro(state: PlanState): boolean {
  if (state.plan !== 'pro') return false
  if (!state.plan_expires_at) return true  // no expiry = lifetime/manual
  return new Date(state.plan_expires_at) > new Date()
}
