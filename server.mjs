import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PUBLIC_ROOT = fileURLToPath(new URL("./public/", import.meta.url));
const TO = "consult@0xray.dev";
const DEFAULT_FROM = "AI Fleet OPS <consult@0xray.dev>";
const MAX_BODY = 16_000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clean(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, max);
}

function validEmail(email) {
  return email.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function readFields(raw, contentType) {
  if ((contentType || "").includes("application/json")) {
    const data = JSON.parse(raw || "{}");
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return data;
  }
  return Object.fromEntries(new URLSearchParams(raw || "").entries());
}

export async function sendConsult(fields, env = process.env, fetchImpl = globalThis.fetch) {
  const name = clean(fields.name, 200).replace(/[\r\n]/g, "");
  const email = clean(fields.email, 200);
  const company = clean(fields.company, 200);
  const size = clean(fields.fleet_size, 40);
  const need = clean(fields.need, 4000);
  if (!name || !validEmail(email) || !need) {
    return { status: 400, error: "Name, a valid work email, and what you need are required." };
  }
  const key = env.RESEND_API_KEY;
  if (!key) {
    return { status: 503, error: "Consult mail is not configured on this host." };
  }
  const from = env.RESEND_FROM || DEFAULT_FROM;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    size ? `How many agents: ${size}` : null,
    "",
    need,
  ]
    .filter((line) => line !== null)
    .join("\n");
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [TO],
      reply_to: email,
      subject: `Consult request from ${name}`,
      text,
    }),
  });
  if (!res.ok) {
    return { status: 502, error: "The message did not send. Try again in a few minutes." };
  }
  return { status: 200, name };
}

function resultPage(title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} | 0xRay</title>
  <link rel="stylesheet" href="/assets/site.css" />
</head>
<body>
  <main class="wrap">
    <p class="eyebrow">AI Fleet OPS</p>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <p><a href="/#consult">Back to the hub</a></p>
  </main>
</body>
</html>`;
}

function clientAddress(req) {
  const real = req.headers["x-real-ip"];
  const value = Array.isArray(real) ? real[0] : real;
  if (typeof value === "string" && value.trim()) return value.trim();
  return req.socket?.remoteAddress || "local";
}

export function createApp({ env = process.env, fetchImpl = globalThis.fetch, now = () => Date.now() } = {}) {
  const hits = new Map();
  function limited(ip) {
    const windowMs = 10 * 60 * 1000;
    const cutoff = now() - windowMs;
    const recent = (hits.get(ip) || []).filter((t) => t > cutoff);
    if (recent.length >= 8) {
      hits.set(ip, recent);
      return true;
    }
    recent.push(now());
    hits.set(ip, recent);
    return false;
  }

  return async function handle(req, res) {
    const url = new URL(req.url || "/", "http://localhost");
    if (req.method === "POST" && url.pathname === "/api/consult") {
      if (limited(clientAddress(req))) {
        const html = resultPage("Slow down", "Too many consult requests from this network. Wait a few minutes and try again.");
        res.writeHead(429, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
        return;
      }
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BODY) {
          res.writeHead(413, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Request is too large.");
          return;
        }
        chunks.push(chunk);
      }
      let fields = {};
      try {
        fields = readFields(Buffer.concat(chunks).toString("utf8"), req.headers["content-type"]);
      } catch {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("The form could not be read.");
        return;
      }
      let outcome;
      try {
        outcome = await sendConsult(fields, env, fetchImpl);
      } catch {
        outcome = { status: 502, error: "The message did not send. Try again in a few minutes." };
      }
      if (outcome.status !== 200) {
        const html = resultPage("Message not sent", outcome.error);
        res.writeHead(outcome.status, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
        return;
      }
      const html = resultPage(
        "Request received",
        "We have your note. It was sent to consult@0xray.dev, and we will reply within one business day.",
      );
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end("Method not allowed.");
      return;
    }

    let rel = decodeURIComponent(url.pathname);
    if (rel.includes("\0") || rel.includes("..")) {
      res.writeHead(400);
      res.end("Bad path.");
      return;
    }
    const parts = rel.split("/").filter(Boolean);
    const filePath = join(PUBLIC_ROOT, ...parts);
    const rootWithSep = PUBLIC_ROOT.endsWith(sep) ? PUBLIC_ROOT : PUBLIC_ROOT + sep;
    if (filePath !== PUBLIC_ROOT && !filePath.startsWith(rootWithSep)) {
      res.writeHead(403);
      res.end("Forbidden.");
      return;
    }
    try {
      const info = await stat(filePath);
      const target = info.isDirectory() ? join(filePath, "index.html") : filePath;
      if (!target.startsWith(rootWithSep)) {
        res.writeHead(403);
        res.end("Forbidden.");
        return;
      }
      const body = await readFile(target);
      const type = TYPES[extname(target).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found.");
    }
  };
}

export function start(port = Number(process.env.PORT || 3000)) {
  const handle = createApp();
  const server = createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error("request failed", err instanceof Error ? err.message : "error");
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Something went wrong.");
    });
  });
  server.listen(port, "0.0.0.0");
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  start();
}
