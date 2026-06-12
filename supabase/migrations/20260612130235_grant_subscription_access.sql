grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.subscriptions to authenticated;
grant select on public.subscriptions to anon;
