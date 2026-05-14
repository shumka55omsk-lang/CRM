# Готовая CRM + заявки с сайта www.мягкиеокна55.рф

## Что внутри

- `public/index.html` — CRM
- `api/site-lead.js` — приём заявок с сайта мягкиеокна55.рф
- `api/avito-lead.js` — приём заявок Авито / n8n / почта
- `api/send-telegram.js` — отправка отчётов в Telegram
- `api/config.js` — подключение Supabase
- `sql/leads_integration.sql` — таблица журнала заявок
- `sql/client_files_storage.sql` — фото замера и Storage
- `docs/add_to_site_form.html` — код для добавления на сайт

## Vercel Environment Variables

Проверь, что в Vercel есть:

SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID

## Supabase SQL

В Supabase SQL Editor запусти:

1. `sql/leads_integration.sql`
2. `sql/client_files_storage.sql`

Если таблицы уже есть — SQL не сломает базу, он использует `create table if not exists`.

## Как подключить сайт

На сайте www.мягкиеокна55.рф оставь текущую отправку в Telegram.
Дополнительно добавь вызов:

await sendLeadToCRM({
  name,
  phone,
  address,
  message
});

Код-шаблон лежит в:

`docs/add_to_site_form.html`

В нём обязательно замени:

https://ТВОЙ-CRM-ДОМЕН.vercel.app/api/site-lead

на реальный домен CRM.

## Проверка

Открой:

https://ТВОЙ-CRM-ДОМЕН.vercel.app/api/site-lead

Должно быть `ok: true`.

После отправки формы с сайта должно появиться:

- новый клиент в CRM
- запись в Supabase `clients`
- запись в `client_history`
- уведомление в Telegram
