-- Add optional account label (email or name) to distinguish multiple accounts
-- for the same service (e.g. ChatGPT under saengnual@gmail.com vs man519@gmail.com)
alter table public.subscriptions
add column if not exists account text;
