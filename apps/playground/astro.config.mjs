import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import claymo from "@claymo/astro/integration";
import solid from "@solidjs/vite-plugin";
import { docLinks } from "./src/lib/doc-links.mjs";

const packages = (path) => fileURLToPath(new URL(`../../packages/${path}`, import.meta.url));

export default defineConfig({
  // The same integration consumers install: Claymo CSS on every page, plus Svelte islands.
  integrations: [claymo({ svelte: true })],
  devToolbar: { enabled: false },
  markdown: { processor: satteri({ mdastPlugins: [docLinks] }) },
  vite: {
    // Solid 2 subtrees mount from browser scripts; Astro's Solid integration targets Solid 1.
    plugins: [
      solid({
        include:
          /\/(?:apps\/playground\/src\/(?:demo|examples\/solid)|packages\/solid\/src)\/[^/]+\.tsx$/,
      }),
    ],
    server: { allowedHosts: true },
    optimizeDeps: {
      // ClientRouter's virtual imports are injected after the dependency scan. Prebundle them
      // so cold dev navigation doesn't discover them after the page is already interactive.
      include: [
        "astro/virtual-modules/transitions-router.js",
        "astro/virtual-modules/transitions-types.js",
        "astro/virtual-modules/transitions-events.js",
        "astro/virtual-modules/transitions-swap-functions.js",
      ],
    },
    resolve: {
      // Run the workspace packages from source: edits to core, Svelte or Solid reload live,
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
        { find: /^@claymo\/solid$/, replacement: packages("solid/src/index.ts") },
      ],
    },
  },
});
