-- No-op: last_remind was already included in the initial create_subscriptions migration.
-- Kept to preserve migration history; IF NOT EXISTS makes this safe to re-run.
alter table public.subscriptions
add column if not exists last_remind date;
