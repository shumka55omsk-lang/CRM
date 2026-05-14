-- Закупочная стоимость материалов на складе
alter table stock_items
add column if not exists unit_cost numeric default 0;

comment on column stock_items.unit_cost is
'Закупочная цена. Для ПВХ полотна — руб/м². Для остальных материалов — руб за пог.м или шт.';
