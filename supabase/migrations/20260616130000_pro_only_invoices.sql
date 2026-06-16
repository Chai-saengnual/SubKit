-- Pro-only enforcement on subscription_invoices. The frontend already
-- hides the upload UI for non-Pro users, but we enforce server-side
-- so a direct curl request can't bypass it.
create or replace function public.check_invoices_pro_only()
returns trigger language plpgsql as $$
declare
  user_plan text;
begin
  select plan into user_plan from public.users where id = auth.uid();
  if user_plan is distinct from 'pro' then
    raise exception 'PRO_ONLY_FEATURE' using errcode = 'P0001',
      hint = 'Invoice attachments are a Pro feature. Upgrade to attach files.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_invoices_pro_only on public.subscription_invoices;
create trigger enforce_invoices_pro_only
before insert on public.subscription_invoices
for each row execute function public.check_invoices_pro_only();
