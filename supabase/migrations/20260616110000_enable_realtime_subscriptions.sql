-- 20260616110000_enable_realtime_subscriptions.sql
--
-- Add public.subscriptions to the supabase_realtime publication so that
-- authenticated clients can subscribe to row-level changes (PRD §6.4 —
-- "Pro-only multi-device sync via Supabase Realtime").
--
-- The frontend filter (`user_id=eq.<auth.uid>`) keeps RLS enforced: a
-- subscriber only receives events for rows they are allowed to read.
-- Free users never open a channel (see startRealtimeSync in app.html),
-- so this migration is a no-op for them.
--
-- Idempotent: re-running on a database where the table is already in
-- the publication raises "already member of publication" — we swallow it.

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Table is already a member of the publication. Nothing to do.
      NULL;
  END;
END
$$;
