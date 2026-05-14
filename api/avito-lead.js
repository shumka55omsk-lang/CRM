
async function tgNotify(text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return { ok: false, skipped: true };
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("text", text);
  form.append("parse_mode", "HTML");
  const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: "POST", body: form });
  return { ok: r.ok, status: r.status, text: await r.text() };
}
function clean(v) { return String(v || "").trim(); }
function leadText(prefix, lead) {
  return [
    `<b>${prefix}</b>`,
    ``,
    `Имя: ${clean(lead.name) || "—"}`,
    `Телефон: ${clean(lead.phone) || "—"}`,
    `Адрес: ${clean(lead.address) || "—"}`,
    `Источник: ${clean(lead.source) || "—"}`,
    ``,
    `Комментарий:`,
    clean(lead.message) || "—"
  ].join("\n");
}
async function createLead(request, defaultSource) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ ok: false, error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured" }, { status: 500 });
  }
  let body = {};
  try { body = await request.json(); } catch { return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 }); }

  const lead = {
    name: clean(body.name),
    phone: clean(body.phone),
    address: clean(body.address),
    message: clean(body.message || body.comment || body.text),
    source: clean(body.source) || defaultSource
  };
  if (!lead.phone && !lead.message) return Response.json({ ok: false, error: "Phone or message is required" }, { status: 400 });

  const headers = {
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
  const clientPayload = {
    name: lead.name,
    phone: lead.phone,
    address: lead.address,
    source: lead.source,
    status: "Новая заявка",
    comment: lead.message,
    updated_at: new Date().toISOString()
  };
  const clientRes = await fetch(`${supabaseUrl}/rest/v1/clients`, { method: "POST", headers, body: JSON.stringify(clientPayload) });
  const clientData = await clientRes.json().catch(() => null);
  if (!clientRes.ok) return Response.json({ ok: false, error: "Failed to create client", details: clientData }, { status: clientRes.status });
  const client = Array.isArray(clientData) ? clientData[0] : clientData;
  const clientId = client?.id;

  if (clientId) {
    await fetch(`${supabaseUrl}/rest/v1/client_history`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        client_id: clientId,
        type: "Новая заявка",
        text: `Создана заявка. Источник: ${lead.source}. ${lead.message ? "Комментарий: " + lead.message : ""}`,
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
  const tg = await tgNotify(leadText(`Новая заявка: ${lead.source}`, lead));
  return Response.json({ ok: true, client, telegram: tg });
}

export async function GET() {
  return Response.json({
    ok: true,
    api: "avito-lead",
    method: "POST",
    requiredEnv: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      TELEGRAM_BOT_TOKEN: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      TELEGRAM_CHAT_ID: Boolean(process.env.TELEGRAM_CHAT_ID)
    }
  });
}
export async function POST(request) { return createLead(request, "Авито"); }
