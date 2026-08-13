const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MAX_FIELD_LENGTH = 2000;

const attempts = new Map();

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function rateLimited(ip) {
  const now = Date.now();
  const current = attempts.get(ip) || [];
  const recent = current.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

function clean(value, max = MAX_FIELD_LENGTH) {
  return String(value || "").trim().slice(0, max);
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  const type = req.headers["content-type"] || "";

  if (type.includes("application/json")) {
    return raw ? JSON.parse(raw) : {};
  }

  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    }),
  });
  const result = await response.json();
  return Boolean(result.success);
}

function submissionEmail(data) {
  const details = escapeHtml(data.details).replace(/\n/g, "<br>");
  const photoNames = Array.isArray(data.photoNames) ? data.photoNames : [];
  const photos = photoNames.length
    ? `<p><strong>Photo filenames selected:</strong><br>${photoNames.map(escapeHtml).join("<br>")}</p>`
    : "<p><strong>Photo filenames selected:</strong> None</p>";

  return `
    <h2>New Pick Up Pros Quote Request</h2>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Service:</strong> ${escapeHtml(data.service)}</p>
    <p><strong>Page:</strong> ${escapeHtml(data.pageUrl)}</p>
    <p><strong>Job details:</strong><br>${details || "No details provided"}</p>
    ${photos}
  `;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const ip = getClientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, message: "Too many requests. Please try again later." });
  }

  let data;
  try {
    data = await readBody(req);
  } catch {
    return res.status(400).json({ ok: false, message: "Invalid form data." });
  }

  if (clean(data.company)) {
    return res.status(200).json({ ok: true, message: "Thanks. Your request was received." });
  }

  const name = clean(data.name, 120);
  const phone = clean(data.phone, 80);
  const email = clean(data.email, 160);
  const service = clean(data.service, 120);
  const details = clean(data.details, MAX_FIELD_LENGTH);
  const pageUrl = clean(data.pageUrl, 300);
  const photoNames = Array.isArray(data.photoNames)
    ? data.photoNames.map((name) => clean(name, 180)).filter(Boolean).slice(0, 8)
    : [];

  if (!name || !phone || !email || !service || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: "Please complete the required fields." });
  }

  const turnstileToken = clean(data.turnstileToken || data["cf-turnstile-response"], 2048);
  const turnstileOk = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileOk) {
    return res.status(400).json({ ok: false, message: "Please complete the security check." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL || "PickUpProsLI@gmail.com";
  const from = process.env.QUOTE_FROM_EMAIL || "Pick Up Pros <onboarding@resend.dev>";

  if (!apiKey) {
    return res.status(503).json({ ok: false, message: "Quote email is not configured yet." });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `New quote request: ${service}`,
      html: submissionEmail({ name, phone, email, service, details, pageUrl, photoNames }),
    }),
  });

  if (!response.ok) {
    return res.status(502).json({ ok: false, message: "Could not send the quote request. Please call us." });
  }

  return res.status(200).json({ ok: true, message: "Thanks. Your request was received." });
};
