-- Bills table — one-off or irregular bills (rent, electricity, etc.)
-- with its own 5-sub free-tier limit and full RLS.
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  due_date date not null,
  paid_date date,
  category text not null default 'Other',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists bills_user_id_idx on public.bills (user_id);
create index if not exists bills_due_date_idx on public.bills (due_date);

drop trigger if exists set_bills_updated_at on public.bills;
create trigger set_bills_updated_at
before update on public.bills
for each row execute function public.handle_updated_at();

-- Free-tier 5-bills limit (Pro exempt).
create or replace function public.check_bills_free_tier_limit()
returns trigger language plpgsql as $$
declare
  user_plan text;
  current_count integer;
begin
  select plan into user_plan from public.users where id = auth.uid();
  if user_plan is distinct from 'pro' then
    select count(*) into current_count from public.bills where user_id = auth.uid();
    if current_count >= 5 then
      raise exception 'FREE_TIER_LIMIT_REACHED' using errcode = 'P0001',
        hint = 'Free tier limited to 5 bills. Upgrade to Pro for unlimited.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_bills_free_tier_limit on public.bills;
create trigger enforce_bills_free_tier_limit
before insert on public.bills
for each row execute function public.check_bills_free_tier_limit();

alter table public.bills enable row level security;

drop policy if exists "Users can view their own bills" on public.bills;
create policy "Users can view their own bills" on public.bills for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own bills" on public.bills;
create policy "Users can insert their own bills" on public.bills for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own bills" on public.bills;
create policy "Users can update their own bills" on public.bills for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own bills" on public.bills;
create policy "Users can delete their own bills" on public.bills for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Service role has full access to bills" on public.bills;
create policy "Service role has full access to bills" on public.bills for all to service_role
  using (true) with check (true);
