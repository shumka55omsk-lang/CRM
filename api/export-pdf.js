export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};

function safeFilename(name) {
  return String(name || "document.pdf")
    .replace(/[\\/:*?"<>|\r\n]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 140) || "document.pdf";
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { html, filename = "document.pdf", options = {} } = req.body || {};

    if (!html || typeof html !== "string") {
      return res.status(400).json({ error: "HTML is required" });
    }

    const token = process.env.BROWSERLESS_TOKEN;
    if (!token) {
      return res.status(500).json({
        error: "BROWSERLESS_TOKEN is not configured",
        details: "Добавь переменную BROWSERLESS_TOKEN в Vercel → Project → Settings → Environment Variables и сделай Redeploy."
      });
    }

    const baseUrl = (process.env.BROWSERLESS_URL || "https://production-sfo.browserless.io").replace(/\/+$/, "");
    const endpoint = `${baseUrl}/pdf?token=${encodeURIComponent(token)}`;

    const browserlessResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({
        html,
        options: {
          format: "A4",
          printBackground: true,
          preferCSSPageSize: true,
          margin: {
            top: "10mm",
            right: "10mm",
            bottom: "10mm",
            left: "10mm"
          },
          ...options
        }
      })
    });

    if (!browserlessResponse.ok) {
      const details = await browserlessResponse.text();
      return res.status(502).json({
        error: "Browserless PDF error",
        details
      });
    }

    const pdfBuffer = Buffer.from(await browserlessResponse.arrayBuffer());
    const safeName = safeFilename(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`);
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(pdfBuffer);
  } catch (e) {
    return res.status(500).json({
      error: "PDF export failed",
      details: e && e.message ? e.message : String(e)
    });
  }
}
