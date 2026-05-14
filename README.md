# CRM — заявки с сайта и Авито

Добавлено:
- api/site-lead.js — заявки с сайта;
- api/avito-lead.js — заявки Авито / n8n / почта;
- Telegram-уведомление о новой заявке;
- sql/leads_integration.sql — журнал заявок site_leads;
- docs/site_form_example.html — пример формы для сайта.

Переменные Vercel:
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID

SUPABASE_SERVICE_ROLE_KEY нельзя вставлять в HTML. Только в Vercel Environment Variables.
