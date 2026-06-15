-- Free-tier enforcement: free users can have at most 5 rows
-- in public.subscriptions. Pro users (users.plan = 'pro') are
-- exempt. Edge function and app code handle the friendly error;
-- this trigger is the hard backend gate.
create or replace function public.check_free_tier_limit()
returns trigger
language plpgsql
as $$
declare
  user_plan text;
  current_count integer;
begin
  select plan into user_plan
  from public.users
  where id = auth.uid();

  if user_plan is distinct from 'pro' then
    select count(*) into current_count
    from public.subscriptions
    where user_id = auth.uid();

    if current_count >= 5 then
      raise exception 'FREE_TIER_LIMIT_REACHED'
        using errcode = 'P0001',
              hint = 'Free tier limited to 5 subscriptions. Upgrade to Pro for unlimited.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_free_tier_limit on public.subscriptions;
create trigger enforce_free_tier_limit
before insert on public.subscriptions
for each row
execute function public.check_free_tier_limit();
