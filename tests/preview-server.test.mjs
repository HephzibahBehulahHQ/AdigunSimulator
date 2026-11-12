import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { request as httpRequest } from "node:http";
import { once } from "node:events";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPreviewServer } from "../scripts/serve.mjs";

let server;
const socketPath = process.platform === "win32"
  ? `\\\\.\\pipe\\adigunsimulator-preview-${process.pid}-${Date.now()}`
  : join(tmpdir(), `adigunsimulator-preview-${process.pid}-${Date.now()}.sock`);

function fetchPreview(path = "/", options = {}) {
  return new Promise((resolve, reject) => {
    const request = httpRequest({ socketPath, method: options.method ?? "GET", path }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => {
        const body = Buffer.concat(chunks);
        resolve({
          status: response.statusCode,
          headers: { get: name => response.headers[name.toLowerCase()]?.toString() ?? null },
          text: async () => body.toString("utf8"),
          arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)
        });
      });
    });
    request.on("error", reject);
    if (options.body) request.write(options.body);
    request.end();
  });
}

before(async () => {
  server = createPreviewServer();
  server.listen(socketPath);
  await once(server, "listening");
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  if (process.platform !== "win32") await rm(socketPath, { force: true });
});

test("preview serves the simulator and its complete startup/worker import graph with JavaScript MIME types", async () => {
  const page = await fetchPreview();
  assert.equal(page.status, 200);
  assert.match(page.headers.get("content-type"), /^text\/html/);
  assert.match(await page.text(), /<title>AdigunSimulator/);
  const queue = ["/app.js", "/js/simulation-worker.mjs"];
  const visited = new Set();
  while (queue.length) {
    const path = queue.shift();
    if (visited.has(path)) continue;
    visited.add(path);
    const response = await fetchPreview(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /^text\/javascript/, path);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("cache-control"), "no-store");
    const source = await response.text();
    for (const match of source.matchAll(/(?:from\s*|import\s*(?:\(\s*)?)["'](\.[^"']+\.m?js)["']/g)) {
      queue.push(new URL(match[1], `http://preview${path}`).pathname);
    }
  }
  assert.ok(visited.has("/js/core.mjs"));
  assert.ok(visited.has("/js/analysis-dispatch.mjs"));
  assert.ok(visited.has("/js/pcb-routing.mjs"));
});

test("preview preserves project JSON bytes, handles HEAD, and serves assets with explicit MIME types", async () => {
  const path = "examples/070-stm32-timer-pwm.adigun.json";
  const response = await fetchPreview(`/${path}?preview=1`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^application\/json/);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(new URL(`../${path}`, import.meta.url)));
  const head = await fetchPreview("/styles.css", { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.match(head.headers.get("content-type"), /^text\/css/);
  assert.ok(Number(head.headers.get("content-length")) > 0);
  assert.equal(await head.text(), "");
  const image = await fetchPreview("/assets/brand/hephzibah-behulah-official.jpg");
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/jpeg");
});

test("preview refuses private paths, directory listings, traversal, malformed URLs, and writes", async () => {
  for (const path of ["/.git/config", "/.env", "/package.json", "/scripts/serve.mjs", "/js/", "/js/%2e%2e/%2e%2e/.env", "/js/%5c..%5c.env", "/js/missing.mjs"]) {
    assert.equal((await fetchPreview(path)).status, 404, path);
  }
  assert.equal((await fetchPreview("/%ZZ")).status, 400);
  const write = await fetchPreview("/", { method: "POST", body: "ignored" });
  assert.equal(write.status, 405);
  assert.equal(write.headers.get("allow"), "GET, HEAD");
});
