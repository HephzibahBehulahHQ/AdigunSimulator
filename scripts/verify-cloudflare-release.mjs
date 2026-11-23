import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { setTimeout as wait } from "node:timers/promises";

const baseUrl = new URL("https://adigunsimulator.hephzibahbehulah.com/");
const expected = process.env.GITHUB_SHA;
if (!/^[0-9a-f]{40}$/.test(expected ?? "")) throw new Error("A full GitHub release SHA is required.");

const files = ["library/component-inventory.json", "library/component-inventory.csv"];
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const expectedDigests = await Promise.all(files.map(async file => digest(await readFile(new URL(`../dist/${file}`, import.meta.url)))));

async function fetchReleaseFile(path) {
  const url = new URL(path, baseUrl);
  url.searchParams.set("release", expected);
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  return response;
}

const attempts = 12;
for (let attempt = 1; attempt <= attempts; attempt++) {
  try {
    const { commit } = await (await fetchReleaseFile("release.json")).json();
    if (commit !== expected) throw new Error(`Production reports ${commit}; expected ${expected}`);
    await Promise.all(files.map(async (path, index) => {
      const bytes = Buffer.from(await (await fetchReleaseFile(path)).arrayBuffer());
      if (digest(bytes) !== expectedDigests[index]) throw new Error(`Production bytes differ for ${path}`);
    }));
    console.log(`Verified production release ${commit} and both inventory exports.`);
    break;
  } catch (error) {
    if (attempt === attempts) throw error;
    await wait(5000);
  }
}
