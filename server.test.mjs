import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import { createApp, sendConsult } from "./server.mjs";

const fields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical",
  fleet_size: "2–5",
  need: "Stand up the first release gate.",
};

test("sendConsult refuses a missing key without calling Resend", async () => {
  let called = false;
  const outcome = await sendConsult(fields, {}, async () => {
    called = true;
    return { ok: true };
  });
  assert.equal(outcome.status, 503);
  assert.equal(called, false);
});

test("sendConsult posts to Resend for consult@0xray.dev", async () => {
  let seen;
  const outcome = await sendConsult(fields, { RESEND_API_KEY: "test-key" }, async (url, init) => {
    seen = { url, init };
    return { ok: true };
  });
  assert.equal(outcome.status, 200);
  assert.equal(seen.url, "https://api.resend.com/emails");
  assert.equal(seen.init.headers.Authorization, "Bearer test-key");
  const body = JSON.parse(seen.init.body);
  assert.equal(body.from, "AI Fleet OPS <consult@0xray.dev>");
  assert.deepEqual(body.to, ["consult@0xray.dev"]);
  assert.equal(body.reply_to, "ada@example.com");
  assert.match(body.text, /Stand up the first release gate/);
  assert.match(body.subject, /Ada Lovelace/);
  assert.equal(JSON.stringify(body).includes("test-key"), false);
});

test("sendConsult rejects a bad email", async () => {
  const outcome = await sendConsult({ ...fields, email: "not-an-email" }, { RESEND_API_KEY: "k" }, async () => ({ ok: true }));
  assert.equal(outcome.status, 400);
});

test("POST /api/consult returns the received page", async () => {
  const handle = createApp({
    env: { RESEND_API_KEY: "test-key" },
    fetchImpl: async () => ({ ok: true }),
  });
  const server = createServer((req, res) => handle(req, res));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  const res = await fetch(`http://127.0.0.1:${port}/api/consult`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields),
  });
  const html = await res.text();
  assert.equal(res.status, 200);
  assert.match(html, /Request received/);
  assert.match(html, /consult@0xray\.dev/);
  assert.equal(html.includes("consult@ops"), false);
  const home = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(home.status, 200);
  const page = await home.text();
  assert.match(page, /action="\/api\/consult"/);
  assert.equal(page.includes("mailto:"), false);
  assert.equal(page.includes("consult@ops"), false);
  server.close();
});

test("sendConsult strips CR and LF from the name in the subject", async () => {
  let seen;
  const outcome = await sendConsult(
    { ...fields, name: "Ada\r\nBcc: eve@example.com" },
    { RESEND_API_KEY: "test-key" },
    async (_url, init) => {
      seen = init;
      return { ok: true };
    },
  );
  assert.equal(outcome.status, 200);
  const body = JSON.parse(seen.body);
  assert.equal(body.subject.includes("\r"), false);
  assert.equal(body.subject.includes("\n"), false);
  assert.equal(body.subject, "Consult request from AdaBcc: eve@example.com");
});

async function postConsult(port, headers) {
  return fetch(`http://127.0.0.1:${port}/api/consult`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
    body: new URLSearchParams(fields),
  });
}

test("rotating X-Forwarded-For does not reset the cap for one X-Real-IP", async () => {
  const handle = createApp({
    env: { RESEND_API_KEY: "test-key" },
    fetchImpl: async () => ({ ok: true }),
  });
  const server = createServer((req, res) => handle(req, res));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  try {
    for (let i = 0; i < 8; i += 1) {
      const res = await postConsult(port, {
        "x-real-ip": "203.0.113.5",
        "x-forwarded-for": `198.51.100.${i}`,
      });
      assert.equal(res.status, 200);
      await res.text();
    }
    const blocked = await postConsult(port, {
      "x-real-ip": "203.0.113.5",
      "x-forwarded-for": "203.0.113.99",
    });
    assert.equal(blocked.status, 429);
    await blocked.text();
  } finally {
    server.close();
  }
});

test("rotating X-Forwarded-For does not reset the cap for one socket", async () => {
  const handle = createApp({
    env: { RESEND_API_KEY: "test-key" },
    fetchImpl: async () => ({ ok: true }),
  });
  const server = createServer((req, res) => handle(req, res));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  try {
    for (let i = 0; i < 8; i += 1) {
      const res = await postConsult(port, { "x-forwarded-for": `198.51.100.${i}` });
      assert.equal(res.status, 200);
      await res.text();
    }
    const blocked = await postConsult(port, { "x-forwarded-for": "203.0.113.99" });
    assert.equal(blocked.status, 429);
  } finally {
    server.close();
  }
});
