# Getting started

## Contribute to Claymo

1. Clone the repository, install the npm workspaces, and start the playground:

   ```sh
   git clone https://github.com/selipso/claymo-ui.git
   cd claymo-ui
   npm install
   npm start
   ```

   Installation builds core and the Svelte package. `npm start` (also `npm run dev`) serves the playground at <http://localhost:4321> using workspace source. Edit the packages, docs, or playground and see changes without rebuilding the packages by hand.

2. Explore the playground. Its sidebar stays in place as you navigate and holds the global palette and mode controls.

   | Route                 | Contents                                                                   |
   | --------------------- | -------------------------------------------------------------------------- |
   | `/`                   | Claymo overview                                                            |
   | `/docs/<slug>/`       | Guides and the release runbook                                             |
   | `/components/`        | Component index                                                            |
   | `/components/<name>/` | Reference from `@claymo/core/reference` and live Astro and Svelte previews |
   | `/demo/`              | Settings and dashboard screens composed from Claymo components             |
   | `/gallery/`           | Component variants and states                                              |
   | `/lab/`               | Clay surface techniques and browser support                                |

3. Run the checks that cover your change:

   ```sh
   npm run check        # TypeScript, Svelte, and Astro checks across workspaces
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
   <html lang="en" data-palette="tidal" data-theme="light">
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

   Omit `data-palette` for Archive Teal and `data-theme` to follow the system color scheme. See [Theming](./theming.md) for the other values.

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

1. Install the island dependencies:

   ```sh
   npm install @astrojs/svelte svelte @claymo/svelte
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

3. Add `data-palette` and `data-theme` to the opening `<html>` tag in `src/app.html`, for example `<html lang="en" data-palette="tidal" data-theme="light">`. Keep the rest of the SvelteKit template. Import components by name from `@claymo/svelte` in your routes.

## Set up a coding agent

See [MCP](./mcp.md) for client configuration and the workflow for generating setup files and finding component APIs.
