alter table public.subscriptions
  add column if not exists price_mode text not null default 'fixed'
    check (price_mode in ('fixed', 'actual', 'variable')),
  add column if not exists actual_price numeric(10, 2)
    check (actual_price is null or actual_price >= 0),
  add column if not exists price_note text;
