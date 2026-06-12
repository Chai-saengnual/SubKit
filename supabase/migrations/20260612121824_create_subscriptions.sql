create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  currency text not null default 'USD',
  cycle text not null check (cycle in ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_date date,
  category text not null default 'Other',
  emoji text not null default '📺',
  last_remind date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists subscriptions_next_date_idx
  on public.subscriptions (next_date);

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.handle_updated_at();

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions"
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own subscriptions"
on public.subscriptions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own subscriptions"
on public.subscriptions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own subscriptions"
on public.subscriptions
for delete
to authenticated
using ((select auth.uid()) = user_id);
