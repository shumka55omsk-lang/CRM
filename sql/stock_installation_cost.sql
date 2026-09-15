alter table public.stock_items
add column if not exists installation_cost numeric not null default 0;

comment on column public.stock_items.installation_cost is
'Стоимость установки или производственной работы за одну единицу материала: шт., пог.м или м².';
