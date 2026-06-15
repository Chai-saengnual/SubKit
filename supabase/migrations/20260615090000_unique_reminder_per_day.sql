-- Prevent two edge function invocations from sending the same reminder
-- on the same day. The (id, last_remind) tuple is unique; once written,
-- a concurrent UPDATE that would set the same value will fail with 23505.
-- The edge function already handles errors per-row, so a single conflict
-- does not abort the batch.
create unique index if not exists subscriptions_id_last_remind_uidx
  on public.subscriptions (id, last_remind)
  where last_remind is not null;
