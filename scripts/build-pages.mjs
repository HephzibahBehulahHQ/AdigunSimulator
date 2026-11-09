import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const publicFile = path => ["index.html", "app.js", "styles.css", "CNAME"].includes(path)
  || /^(assets|js|library|examples)\//.test(path)
    && !path.split("/").some(part => part.startsWith("."))
    && /\.(m?js|json|svg|png|jpe?g|webp|ico|woff2?|ttf|md|txt|csv|gbr|drl|ino|c|cpp|h|hex|bin|pdf)$/i.test(path);

// Read committed objects only: untracked files and working-copy secrets cannot enter the artifact.
export async function buildPages({ repository, output }) {
  const git = (...args) => execFileSync("git", ["-C", repository, ...args], { maxBuffer: 32 * 1024 * 1024 });
  const commit = git("rev-parse", "HEAD").toString().trim();
  const entries = git("ls-tree", "-r", "-z", "HEAD").toString().split("\0").filter(Boolean).map(line => {
    const [, mode, type, sha, path] = /^(\d+) (\w+) ([a-f0-9]+)\t([\s\S]+)$/.exec(line);
    return { mode, type, sha, path };
  }).filter(entry => publicFile(entry.path));
  for (const entry of entries) if (entry.type !== "blob" || !["100644", "100755"].includes(entry.mode)) throw new Error(`Unsupported public file mode: ${entry.path}`);
  for (const path of ["index.html", "app.js", "styles.css", "CNAME", "js/core.mjs", "examples/manifest.json", "library/parts-ledger.json"]) {
    if (!entries.some(entry => entry.path === path)) throw new Error(`Missing required public asset: ${path}`);
  }
  // Refuse an existing destination; never delete or overwrite prior artifacts.
  await mkdir(output);
  for (const entry of entries) {
    const destination = join(output, entry.path);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, git("cat-file", "blob", entry.sha), { flag: "wx" });
  }
  await writeFile(join(output, ".nojekyll"), "", { flag: "wx" });
  await writeFile(join(output, "release.json"), JSON.stringify({ commit, fileCount: entries.length }, null, 2) + "\n", { flag: "wx" });
  return { commit, fileCount: entries.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error("Pass a new output directory outside the publication source.");
  console.log(JSON.stringify(await buildPages({ repository: fileURLToPath(new URL("..", import.meta.url)), output: resolve(process.argv[2]) })));
}
