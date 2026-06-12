-- Storage bucket for invoice PDFs and images (10 MB limit)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invoices', 'invoices', false, 10485760,
  array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do nothing;

-- Table: one row per uploaded file
create table if not exists public.subscription_invoices (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  content_type text,
  uploaded_at timestamptz default now()
);

alter table public.subscription_invoices enable row level security;

create policy "Users manage own invoices"
  on public.subscription_invoices
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage RLS: path must start with user's own uid folder
create policy "Users upload own invoices"
  on storage.objects for insert
  with check (bucket_id = 'invoices' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users read own invoices"
  on storage.objects for select
  using (bucket_id = 'invoices' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own invoices"
  on storage.objects for delete
  using (bucket_id = 'invoices' and auth.uid()::text = (storage.foldername(name))[1]);
