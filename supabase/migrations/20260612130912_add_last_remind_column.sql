alter table public.subscriptions
add column if not exists last_remind date;
