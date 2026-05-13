# CRM мягкие окна — Supabase

1. В Supabase открой SQL Editor и запусти файл sql/supabase.sql.
2. В Vercel добавь Environment Variables:
   SUPABASE_URL
   SUPABASE_PUBLISHABLE_KEY
   TELEGRAM_BOT_TOKEN
   TELEGRAM_CHAT_ID
3. Сделай Redeploy.
4. Проверь /api/config и /api/send-telegram.

Данные клиентов, история и расчёты сохраняются в Supabase. Настройки цен сохраняются локально в браузере.

Важно: политики SQL открытые для теста. После проверки CRM лучше сделать авторизацию.
