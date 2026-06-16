-- Add per-row last-modified timestamp from the client so we can detect
-- multi-device edit conflicts and run a last-write-wins guard on update.
--
-- `updated_at` is server-side (touched by the handle_updated_at trigger);
-- `client_updated_at` is the wall clock the client stamped at write time.
-- On conflict resolution we compare client_updated_at server-side so an
-- older local edit can't clobber a fresher one from another device.
alter table public.subscriptions
  add column if not exists client_updated_at timestamptz not null default timezone('utc', now());

-- Backfill: existing rows get the existing updated_at value (which the
-- handle_updated_at trigger keeps fresh). For brand-new rows the column
-- default above already supplies a value, so this is a no-op there.
update public.subscriptions
  set client_updated_at = updated_at
  where client_updated_at is null;

-- Composite index for sync queries (most recent per user).
create index if not exists subscriptions_client_updated_at_idx
  on public.subscriptions (user_id, client_updated_at desc);
