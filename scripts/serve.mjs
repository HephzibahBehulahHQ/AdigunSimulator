import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".md": "text/plain; charset=utf-8"
};
const publicFiles = new Set(["index.html", "app.js", "styles.css"]);
const publicDirectories = new Set(["assets", "js", "examples", "library", "docs"]);

/** Local preview only: fixed project root, loopback listener, explicit module MIME types. */
export function createPreviewServer(root = projectRoot) {
  return createServer(async (request, response) => {
    const reply = (status, text) => {
      response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
      response.end(request.method === "HEAD" ? undefined : text);
    };
    if (!["GET", "HEAD"].includes(request.method)) {
      response.setHeader("Allow", "GET, HEAD");
      return reply(405, "Method not allowed");
    }
    try {
      const pathname = decodeURIComponent((request.url ?? "/").split("?")[0]);
      const segments = pathname.split("/").filter(Boolean);
      if (!pathname.startsWith("/") || pathname.includes("\\") || pathname.includes("\0") || segments.some((segment) => segment.startsWith("."))) return reply(404, "Not found");
      const name = segments.join("/") || "index.html";
      if (!publicFiles.has(name) && !publicDirectories.has(segments[0])) return reply(404, "Not found");
      const base = await realpath(root);
      const file = await realpath(resolve(base, name));
      const fromRoot = relative(base, file);
      if (isAbsolute(fromRoot) || fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || !(await stat(file)).isFile()) return reply(404, "Not found");
      const type = contentTypes[extname(file).toLowerCase()];
      if (!type) return reply(404, "Not found");
      const data = await readFile(file);
      response.writeHead(200, { "Content-Type": type, "Content-Length": data.length, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      response.end(request.method === "HEAD" ? undefined : data);
    } catch (error) {
      if (error instanceof URIError) return reply(400, "Invalid URL");
      if (["ENOENT", "ENOTDIR", "EACCES", "EPERM"].includes(error.code)) return reply(404, "Not found");
      reply(500, "Preview request failed");
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const portArgument = args[0] ?? "--port=4176";
  if (args.length > 1 || !/^--port=\d+$/.test(portArgument) || Number(portArgument.slice(7)) < 1 || Number(portArgument.slice(7)) > 65535) {
    console.error("Usage: npm run dev -- --port=4176 (port 1–65535)");
    process.exitCode = 1;
  } else {
    const port = Number(portArgument.slice(7));
    const server = createPreviewServer();
    server.on("error", (error) => { console.error(`AdigunSimulator preview failed: ${error.code}`); process.exitCode = 1; });
    server.listen(port, "127.0.0.1", () => console.log(`AdigunSimulator preview: http://127.0.0.1:${port}/\nSource: ${projectRoot}`));
  }
}
