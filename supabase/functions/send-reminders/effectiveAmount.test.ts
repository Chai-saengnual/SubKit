// Tests for the pure helper `effectiveAmount` exported from index.ts.
// Runs under Deno's built-in test runner (`deno test --allow-all`).
//
// The helper is the single source of truth for "what price should I bill
// for this subscription given its pricing mode" and is used both in the
// edge function and (visually) in the browser. Catching regressions here
// is cheap.

import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts'
import { effectiveAmount, type Subscription } from './index.ts'

// Minimal fixtures: `effectiveAmount` only reads price-related fields,
// but the `Subscription` type requires `id` and `name`. Use throwaway
// values here — the helper doesn't touch them. The cast at the end is
// safe because the helper only reads `price`, `actual_price`, and
// `price_mode`; everything else is irrelevant.
const sub = (overrides: Record<string, unknown>) =>
  ({
    id: 'test-id',
    name: 'Test',
    ...overrides,
  }) as Subscription

Deno.test('effectiveAmount: fixed mode, no actual_price returns base price', () => {
  const s = sub({ price_mode: 'fixed', price: 9.99, actual_price: null })
  assertEquals(effectiveAmount(s), 9.99)
})

Deno.test('effectiveAmount: actual mode with actual_price returns actual_price', () => {
  const s = sub({ price_mode: 'actual', price: 12, actual_price: 14.5 })
  assertEquals(effectiveAmount(s), 14.5)
})

Deno.test('effectiveAmount: variable mode with actual_price returns actual_price', () => {
  const s = sub({ price_mode: 'variable', price: 20, actual_price: 17.25 })
  assertEquals(effectiveAmount(s), 17.25)
})

Deno.test('effectiveAmount: actual mode with null actual_price falls back to base', () => {
  const s = sub({ price_mode: 'actual', price: 12, actual_price: null })
  assertEquals(effectiveAmount(s), 12)
})

Deno.test('effectiveAmount: negative actual_price falls back to base (defensive)', () => {
  // The CHECK constraint should prevent this, but the function must not
  // emit a negative number if it ever sneaks through (e.g. legacy data).
  const s = sub({ price_mode: 'actual', price: 12, actual_price: -5 })
  assertEquals(effectiveAmount(s), 12)
})

Deno.test('effectiveAmount: NaN actual_price (string input) falls back to base', () => {
  // parseFloat("12.50abc") would return 12.5 (good), but parseFloat("abc")
  // returns NaN. The DB column is numeric so this shouldn't happen, but
  // a string in the JSON payload would coerce to NaN via Number() and
  // the helper must not propagate NaN into the email.
  const s = sub({ price_mode: 'actual', price: 12, actual_price: 'not-a-number' })
  assertEquals(effectiveAmount(s), 12)
})

Deno.test('effectiveAmount: price=0 and actual_price=0 returns 0', () => {
  const s = sub({ price_mode: 'fixed', price: 0, actual_price: 0 })
  assertEquals(effectiveAmount(s), 0)
})

Deno.test('effectiveAmount: fixed mode with non-numeric price returns 0 (defensive)', () => {
  // Same defensive posture as above: a bad input must not propagate.
  const s = sub({ price_mode: 'fixed', price: 'NaN', actual_price: null })
  assertEquals(effectiveAmount(s), 0)
})
