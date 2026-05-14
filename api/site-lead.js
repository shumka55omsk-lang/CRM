const ALLOWED_ORIGINS = [
  "https://www.мягкиеокна55.рф",
  "https://мягкиеокна55.рф",
  "http://www.мягкиеокна55.рф",
  "http://мягкиеокна55.рф"
];

function corsHeaders(request) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

function clean(v) { return String(v || "").trim(); }

async function tgNotify(text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return { ok: false, skipped: true };

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("text", text);
  form.append("parse_mode", "HTML");

  const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    body: form
  });

  return { ok: r.ok, status: r.status, text: await r.text() };
}

function leadText(lead) {
  return [
    "<b>Новая заявка: Сайт мягкиеокна55.рф</b>",
    "",
    `Имя: ${clean(lead.name) || "—"}`,
    `Телефон: ${clean(lead.phone) || "—"}`,
    `Адрес: ${clean(lead.address) || "—"}`,
    `Источник: ${clean(lead.source) || "—"}`,
    "",
    "Комментарий:",
    clean(lead.message) || "—"
  ].join("\n");
}

async function createLead(request) {
  const headersCors = corsHeaders(request);
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ ok: false, error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured" }, { status: 500, headers: headersCors });
  }

  let body = {};
  try { body = await request.json(); }
  catch { return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400, headers: headersCors }); }

  const lead = {
    name: clean(body.name),
    phone: clean(body.phone),
    address: clean(body.address),
    message: clean(body.message || body.comment || body.text),
    source: clean(body.source) || "Сайт мягкиеокна55.рф"
  };

  if (!lead.phone && !lead.message) {
    return Response.json({ ok: false, error: "Phone or message is required" }, { status: 400, headers: headersCors });
  }

  const headers = {
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };

  const clientRes = await fetch(`${supabaseUrl}/rest/v1/clients`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: lead.name,
      phone: lead.phone,
      address: lead.address,
      source: lead.source,
      status: "Новая заявка",
      comment: lead.message,
      updated_at: new Date().toISOString()
    })
  });

  const clientData = await clientRes.json().catch(() => null);
  if (!clientRes.ok) {
    return Response.json({ ok: false, error: "Failed to create client", details: clientData }, { status: clientRes.status, headers: headersCors });
  }

  const client = Array.isArray(clientData) ? clientData[0] : clientData;
  const clientId = client?.id;

  if (clientId) {
    await fetch(`${supabaseUrl}/rest/v1/client_history`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        client_id: clientId,
        type: "Новая заявка",
        text: `Создана заявка с сайта. ${lead.message ? "Комментарий: " + lead.message : ""}`,
        extra: lead
      })
    });
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/site_leads`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        address: lead.address,
        message: lead.message,
        source: lead.source,
        status: "Новая",
        converted_client_id: clientId || null
      })
    });
  } catch {}

  const tg = await tgNotify(leadText(lead));
  return Response.json({ ok: true, client, telegram: tg }, { headers: headersCors });
}

export async function OPTIONS(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request) {
  return Response.json({
    ok: true,
    api: "site-lead",
    method: "POST",
    cors: true,
    allowedOrigins: ALLOWED_ORIGINS,
    requiredEnv: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      TELEGRAM_BOT_TOKEN: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      TELEGRAM_CHAT_ID: Boolean(process.env.TELEGRAM_CHAT_ID)
    }
  }, { headers: corsHeaders(request) });
}

export async function POST(request) {
  return createLead(request);
}
