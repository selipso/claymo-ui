# Getting started

## Contribute to Claymo

1. Clone the repository, install the npm workspaces, and start the playground:

   ```sh
   git clone https://github.com/selipso/claymo-ui.git
   cd claymo-ui
   npm install
   npm start
   ```

   Installation builds core, Svelte and Solid. `npm start` serves the playground at <http://localhost:4321> using workspace packages.

2. Explore the playground. Astro serves the docs shell; Svelte islands hydrate and Solid previews mount in the browser. Theme changes also reach open tabs and previews.

   | Route                          | Contents                                                           |
   | ------------------------------ | ------------------------------------------------------------------ |
   | `/`                            | Claymo overview                                                    |
   | `/docs/<slug>/`                | Guides and the release runbook                                     |
   | `/components/`                 | Component index                                                    |
   | `/components/<name>/`          | Shared reference and live Astro, Svelte, and Solid previews        |
   | `/demo/`, `/demo/solid/`       | The collection dashboard and settings workflow in Svelte and Solid |
   | `/gallery/`, `/gallery/solid/` | Component variants, states, and motion in Svelte and Solid         |
   | `/lab/`                        | Clay surface techniques and browser support                        |

3. Run the checks that cover your change. Before running browser tests for the first time, install the browsers with `npx playwright install chromium firefox webkit`.

   ```sh
   npm run check        # Reference/type parity, then TypeScript, Svelte, and Astro checks
   npm test             # Core and MCP unit tests
   npm run test:e2e     # Playwright against the playground dev server (sidebar, theme, docs, live examples)
   npm run test:packed  # Lint, pack, and test tarballs in fresh framework consumers
   npm run build        # Build workspaces in dependency order
   ```

   See [Accessibility](./accessibility.md) for coverage and the [Runbook](./RUNBOOK.md) for release verification.

## Use Claymo in an Astro app

1. In an existing Astro app, install the bridge and core:

   ```sh
   npm install @claymo/astro @claymo/core
   ```

2. Add the integration to `astro.config.mjs`:

   ```js
   import { defineConfig } from "astro/config";
   import claymo from "@claymo/astro/integration";

   export default defineConfig({ integrations: [claymo()] });
   ```

   The integration loads `@claymo/core/claymo.css` on every page before page CSS. Don't import the Claymo stylesheets again in your layout.

   | Option       | Default | Effect                                                                                                                                               |
   | ------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `pageStyles` | `true`  | Also loads `@claymo/core/page.css` for the brand font, page colors, and global focus ring. Set `false` if the host app supplies its own page styles. |
   | `svelte`     | `false` | Adds `@astrojs/svelte` for Svelte islands unless the project already registers it. Install the island dependencies first.                            |

3. Set the palette and mode on `<html>` in `src/layouts/Layout.astro`:

   ```astro
   ---
   const { title = "Claymo app" } = Astro.props;
   ---

   <!doctype html>
   <html lang="en" data-palette="reef" data-theme="light">
     <head>
       <meta charset="utf-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1" />
       <title>{title}</title>
     </head>
     <body>
       <slot />
     </body>
   </html>
   ```

   Omit `data-palette` for Tidal Pool and `data-theme` to follow the system color scheme. See [Theming](./theming.md) for the other values.

4. Render a component in `src/pages/index.astro`:

   ```astro
   ---
   import { Button } from "@claymo/astro";
   import Layout from "../layouts/Layout.astro";
   ---

   <Layout title="Settings">
     <Button>Save settings</Button>
   </Layout>
   ```

### Add Svelte islands to Astro

1. Install the adapter that matches your Astro major. For Astro 7 use the command below; for Astro 6 use `@astrojs/svelte@8`, and for Astro 5 use `@astrojs/svelte@7`. Astro-only projects do not need any Svelte packages.

   ```sh
   npm install @astrojs/svelte@9 svelte@5 @claymo/svelte
   ```

2. Change the integration call in `astro.config.mjs` to `claymo({ svelte: true })`.
3. Import Svelte components from `@claymo/svelte` and use `client:load` to hydrate the island when the page loads:

   ```astro
   ---
   import { Checkbox } from "@claymo/svelte";
   ---

   <Checkbox client:load indeterminate aria-label="Select all" />
   ```

## Use Claymo in SvelteKit

1. In an existing SvelteKit app, install the bridge and core:

   ```sh
   npm install @claymo/svelte @claymo/core
   ```

2. Import the stylesheets in the root `src/routes/+layout.svelte`:

   ```svelte
   <script>
     import "@claymo/core/claymo.css";
     import "@claymo/core/page.css";

     let { children } = $props();
   </script>

   {@render children()}
   ```

3. Add `data-palette` and `data-theme` to the opening `<html>` tag in `src/app.html`, for example `<html lang="en" data-palette="reef" data-theme="light">`. Keep the rest of the SvelteKit template. Import components by name from `@claymo/svelte` in your routes.

## Use Claymo in Solid 2

The Solid workspace targets `solid-js` and `@solidjs/web` 2.0.3 or later 2.x, not Solid 1. Until `@claymo/solid` is published, use this branch's workspace or packed tarballs (see the [runbook](./RUNBOOK.md)).

1. In a Solid 2 Vite app, use `@claymo/solid` with the matching `@claymo/core`. Import `@claymo/core/claymo.css` in your app entry; add `@claymo/core/page.css` if Claymo should style the page.
2. Use `@solidjs/vite-plugin` 3 and set `"jsx": "preserve"`, `"jsxImportSource": "@solidjs/web"` in `tsconfig.json`. Use `render` from `@solidjs/web` to mount the app. For server-rendered markup use its `hydrate` entry instead.
3. Import components by name in `.tsx` files:

   ```tsx
   import { createSignal } from "solid-js";
   import { Button, Dialog } from "@claymo/solid";

   export default function Settings() {
     const [open, setOpen] = createSignal(false);
     return (
       <>
         <Button onClick={() => setOpen(true)}>Settings</Button>
         <Dialog title="Settings" open={open()} onClose={() => setOpen(false)} dismissible>
           Account settings
         </Dialog>
       </>
     );
   }
   ```

For complete starter files use MCP `get_setup` with `framework: "solid"`. See the [Solid 2 migration guide](https://v2.solidjs.com/migration/from-solid-1) for the renderer split and lifecycle changes.

## Set up a coding agent

See [MCP](./mcp.md) for client configuration and the workflow for generating setup files and finding component APIs.
