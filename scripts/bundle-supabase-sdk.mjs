import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const entry = fileURLToPath(new URL("scripts/supabase-sdk-entry.mjs", root));
const output = fileURLToPath(new URL("js/vendor/supabase-sdk.mjs", root));

const result = await build({
  entryPoints: [entry],
  outfile: output,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  minify: true,
  legalComments: "external"
});

console.log(`Bundled ${result.metafile ? Object.keys(result.metafile.inputs).length : "Supabase"} inputs into js/vendor/supabase-sdk.mjs`);
