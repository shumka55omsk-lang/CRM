-- Склад для CRM мягких окон
create table if not exists stock_items (
  id uuid primary key default gen_random_uuid(),
  material text not null,
  width text not null,
  qty_m numeric default 0,
  critical_m numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(material, width)
);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  stock_item_id uuid references stock_items(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  type text,
  qty_m numeric default 0,
  note text,
  created_at timestamptz default now()
);

alter table stock_items enable row level security;
alter table stock_movements enable row level security;

drop policy if exists "public read stock_items" on stock_items;
drop policy if exists "public insert stock_items" on stock_items;
drop policy if exists "public update stock_items" on stock_items;
drop policy if exists "public delete stock_items" on stock_items;
drop policy if exists "public read stock_movements" on stock_movements;
drop policy if exists "public insert stock_movements" on stock_movements;
drop policy if exists "public update stock_movements" on stock_movements;
drop policy if exists "public delete stock_movements" on stock_movements;

create policy "public read stock_items" on stock_items for select using (true);
create policy "public insert stock_items" on stock_items for insert with check (true);
create policy "public update stock_items" on stock_items for update using (true) with check (true);
create policy "public delete stock_items" on stock_items for delete using (true);
create policy "public read stock_movements" on stock_movements for select using (true);
create policy "public insert stock_movements" on stock_movements for insert with check (true);
create policy "public update stock_movements" on stock_movements for update using (true) with check (true);
create policy "public delete stock_movements" on stock_movements for delete using (true);
