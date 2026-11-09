import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { buildPages } from "../scripts/build-pages.mjs";

test("Pages artifact contains committed runtime assets and exact revision, excluding private/untracked files", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "adigun-pages-test-")), repo = join(workspace, "repo"), output = join(workspace, "site");
  try {
    await mkdir(repo);
    const git = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "pipe" }).toString().trim();
    git("init", "-q");
    const files = ["index.html", "app.js", "styles.css", "CNAME", "js/core.mjs", "examples/manifest.json", "library/parts-ledger.json", "assets/brand/logo.svg", "scripts/private.mjs", ".env", "assets/.env", "tests/private.mjs"];
    for (const path of files) { await mkdir(join(repo, path, ".."), { recursive: true }); await writeFile(join(repo, path), `committed:${path}`); }
    git("add", "."); git("-c", "user.name=Pages Test", "-c", "user.email=pages-test@example.invalid", "commit", "-qm", "fixture");
    await writeFile(join(repo, "app.js"), "uncommitted change");
    await writeFile(join(repo, "assets", "private.json"), "untracked secret fixture");
    const result = await buildPages({ repository: repo, output });
    assert.equal(result.commit, git("rev-parse", "HEAD"));
    assert.equal(await readFile(join(output, "app.js"), "utf8"), "committed:app.js");
    assert.equal(await readFile(join(output, "assets/brand/logo.svg"), "utf8"), "committed:assets/brand/logo.svg");
    assert.equal(JSON.parse(await readFile(join(output, "release.json"))).commit, result.commit);
    for (const path of [".git/config", ".env", "assets/.env", "assets/private.json", "scripts/private.mjs", "tests/private.mjs"]) await assert.rejects(access(join(output, path)));
    await assert.rejects(buildPages({ repository: repo, output }), /EEXIST/);
    assert.equal(await readFile(join(output, "app.js"), "utf8"), "committed:app.js");
    git("rm", "-q", "CNAME"); git("-c", "user.name=Pages Test", "-c", "user.email=pages-test@example.invalid", "commit", "-qm", "missing required asset");
    await assert.rejects(buildPages({ repository: repo, output: join(workspace, "invalid") }), /Missing required public asset: CNAME/);
    await assert.rejects(access(join(workspace, "invalid")));
  } finally {
    assert.ok(resolve(workspace).startsWith(resolve(tmpdir()) + "\\") || resolve(workspace).startsWith(resolve(tmpdir()) + "/"));
    await rm(workspace, { recursive: true, force: true });
  }
});
