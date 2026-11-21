import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import claymo from "@claymo/astro/integration";
import { docLinks } from "./src/lib/doc-links.mjs";

const packages = (path) => fileURLToPath(new URL(`../../packages/${path}`, import.meta.url));

export default defineConfig({
  // The same integration consumers install: Claymo CSS on every page, plus Svelte islands.
  integrations: [claymo({ svelte: true })],
  devToolbar: { enabled: false },
  markdown: { processor: satteri({ mdastPlugins: [docLinks] }) },
  vite: {
    server: { allowedHosts: true },
    resolve: {
      // Run the workspace packages from source: edits to core or the Svelte bridge reload live,
      // with no rebuild. CSS and the reference data already ship as source.
      alias: [
        { find: /^@claymo\/core$/, replacement: packages("core/src/index.ts") },
        {
          find: /^@claymo\/core\/(actions|display|input|overlays|surfaces)$/,
          replacement: packages("core/src/$1.ts"),
        },
        {
          find: /^@claymo\/core\/behavior\/(.+)$/,
          replacement: packages("core/src/behavior/$1.ts"),
        },
        { find: /^@claymo\/svelte$/, replacement: packages("svelte/src/lib/index.ts") },
      ],
    },
  },
});
