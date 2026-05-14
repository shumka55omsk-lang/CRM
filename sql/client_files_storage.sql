-- Фото замера и файлы клиента для CRM мягких окон
create table if not exists client_files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  file_type text,
  file_name text,
  storage_path text,
  public_url text,
  comment text,
  created_at timestamptz default now()
);

alter table client_files enable row level security;

drop policy if exists "public all client_files" on client_files;
create policy "public all client_files"
on client_files for all
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', true)
on conflict (id) do nothing;

drop policy if exists "public upload client-files" on storage.objects;
drop policy if exists "public read client-files" on storage.objects;
drop policy if exists "public update client-files" on storage.objects;
drop policy if exists "public delete client-files" on storage.objects;

create policy "public upload client-files"
on storage.objects for insert
with check (bucket_id = 'client-files');

create policy "public read client-files"
on storage.objects for select
using (bucket_id = 'client-files');

create policy "public update client-files"
on storage.objects for update
using (bucket_id = 'client-files')
with check (bucket_id = 'client-files');

create policy "public delete client-files"
on storage.objects for delete
using (bucket_id = 'client-files');
