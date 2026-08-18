import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`https://portfolio.example${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Kabir Marwaha Portfolio<\/title>/i);
  assert.match(html, /Systems in motion/i);
  assert.match(html, /Start a conversation/i);
  assert.match(html, /Ask Kabir/i);
  assert.match(html, /Open Absence Report Automation case study/i);
  assert.match(html, /Move through the portfolio/i);
  assert.match(html, /Kabir_1_6@icloud\.com/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|codex-preview/i);
});

test("attaches restrictive browser security headers", async () => {
  const response = await render();
  const csp = response.headers.get("content-security-policy") ?? "";

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("cross-origin-opener-policy"), "same-origin");
  assert.match(response.headers.get("permissions-policy") ?? "", /camera=\(\)/);
});

test("ships the required portfolio assets and avoids unsafe HTML injection", async () => {
  const [page, contact, portrait, resume] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ContactModal.tsx", import.meta.url), "utf8"),
    access(new URL("public/kabir-marwaha-portrait.png", projectRoot)),
    access(new URL("public/Kabir_Marwaha_Resume_2026.pdf", projectRoot)),
  ]);

  assert.doesNotMatch(page, /dangerouslySetInnerHTML|\binnerHTML\b|\beval\s*\(/);
  assert.doesNotMatch(contact, /dangerouslySetInnerHTML|\binnerHTML\b|\beval\s*\(/);
  assert.match(contact, /maxLength=\{2000\}/);
  assert.match(page, /rel="noreferrer"/);
  assert.equal(portrait, undefined);
  assert.equal(resume, undefined);
});
