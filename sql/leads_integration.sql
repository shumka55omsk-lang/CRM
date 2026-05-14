-- Журнал заявок с сайта / Авито
create table if not exists site_leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  address text,
  message text,
  source text default 'Сайт',
  status text default 'Новая',
  converted_client_id uuid references clients(id) on delete set null,
  created_at timestamptz default now()
);

alter table site_leads enable row level security;

drop policy if exists "public all site_leads" on site_leads;

create policy "public all site_leads"
on site_leads for all
using (true)
with check (true);
