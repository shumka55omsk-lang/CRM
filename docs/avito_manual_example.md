# Авито → CRM

URL для POST:
https://ТВОЙ-CRM-ДОМЕН.vercel.app/api/avito-lead

JSON:
{
  "name": "Клиент Авито",
  "phone": "",
  "address": "",
  "message": "Здравствуйте, сколько стоят мягкие окна?",
  "source": "Авито"
}

Через n8n:
Gmail trigger / manual trigger → HTTP Request → /api/avito-lead
