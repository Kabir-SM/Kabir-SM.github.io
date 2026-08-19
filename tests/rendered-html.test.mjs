import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(pathname = "/", origin = "https://portfolio.example") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, origin), { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("permanently redirects the legacy portfolio domain", async () => {
  const response = await render(
    "/privacy?source=legacy",
    "https://kabir-marwaha-portfolio.hotwheelers11.chatgpt.site",
  );

  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://kabir-sm.github.io/privacy?source=legacy");
});

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
  assert.match(html, /href="https:\/\/github\.com\/Kabir-SM"/i);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/kabir-marwaha-70ba2738b"/i);
  assert.match(html, /Computer Science \+ AI \/ Open to opportunities/i);
  assert.match(html, /SOUND:\s*(?:<!-- -->)?START/i);
  assert.match(html, /aria-label="Start ambient soundtrack"/i);
  assert.match(html, /aria-label="Jump to a portfolio section"/i);
  assert.match(html, /Projects &amp; case studies/i);
  assert.match(html, /© 2026 Kabir Marwaha\. Built with intention\./i);
  assert.match(html, /href="\/privacy"[^>]*>Privacy Policy/i);
  assert.match(html, /href="\/terms"[^>]*>Terms of Use/i);
  assert.doesNotMatch(html, /locations automated|duplicate lines removed|workflow improvement/i);
  assert.doesNotMatch(html, /renderer-badge|particle field online/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|codex-preview/i);
});

test("publishes complete legal pages", async () => {
  const [privacyResponse, termsResponse] = await Promise.all([render("/privacy"), render("/terms")]);
  assert.equal(privacyResponse.status, 200);
  assert.equal(termsResponse.status, 200);

  const [privacy, terms] = await Promise.all([privacyResponse.text(), termsResponse.text()]);
  assert.match(privacy, /<title>Privacy Policy \| Kabir Marwaha<\/title>/i);
  assert.match(privacy, /Nothing entered in the contact form is uploaded to or stored by this portfolio/i);
  assert.match(privacy, /Kabir_1_6@icloud\.com/i);
  assert.match(terms, /<title>Terms of Use \| Kabir Marwaha<\/title>/i);
  assert.match(terms, /Portfolio purpose/i);
  assert.match(terms, /Kabir_1_6@icloud\.com/i);
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
  const [page, layout, contact, kinetic, portrait, resume] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ContactModal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/KineticExperience.tsx", import.meta.url), "utf8"),
    access(new URL("public/kabir-marwaha-portrait.png", projectRoot)),
    access(new URL("public/Kabir_Marwaha_Resume_2026.pdf", projectRoot)),
  ]);

  assert.doesNotMatch(page, /dangerouslySetInnerHTML|\binnerHTML\b|\beval\s*\(/);
  assert.doesNotMatch(contact, /dangerouslySetInnerHTML|\binnerHTML\b|\beval\s*\(/);
  assert.match(contact, /maxLength=\{2000\}/);
  assert.match(page, /rel="noreferrer"/);
  assert.doesNotMatch(page, /<KineticExperience/);
  assert.match(layout, /<KineticExperience/);
  assert.doesNotMatch(kinetic, /addEventListener\("pointerdown", onPointerDown/);
  assert.match(kinetic, /addEventListener\("click", onClick/);
  assert.match(kinetic, /if \(!interactive\) return/);
  assert.equal(portrait, undefined);
  assert.equal(resume, undefined);
});
