# Runbook

Release workspaces: `@claymo/core`, `@claymo/svelte`, `@claymo/astro`, `@claymo/solid`, and `@claymo/mcp`. Keep versions in lockstep. `apps/playground` and `fixtures/*` are never published.

## Run the playground from a clone

**Purpose:** work on Claymo with live docs, reference pages and demos.

**Preconditions:** Node and npm versions matching the root `package.json` `engines`, git.

**Steps:**

1. `git clone https://github.com/selipso/claymo-ui.git && cd claymo-ui`
2. `npm install` — `prepare` builds the core, Svelte and Solid distribution files.
3. `npm start` — generates the example pages from `@claymo/core/reference`, then serves the playground at http://localhost:4321. Workspace components and guides reload live. If you edit a reference example, regenerate its preview with `npm run examples -w @claymo/playground`.

**Verify:** `npm run test:e2e` (first run: `npx playwright install chromium firefox webkit`) — the sidebar persists across navigation, the theme carries across pages and example frames, guides and component pages render, and the narrow-screen menu works.

**Rollback:** none needed; nothing outside the clone changes.

## Verify a release candidate

**Purpose:** prove the packed tarballs work for a consumer before publishing.

**Preconditions:** root `engines` requirements met, `npm install` at the root, Playwright browsers (`npx playwright install chromium firefox webkit`).

**Steps:**

1. `npm run check` — the public MCP reference must match bridge types and each workspace must type-check. To isolate reference drift, run `npm run check:contracts`.
2. `npm test` — expected: all core and MCP server tests pass.
3. `npm run test:e2e` — expected: all playground tests pass.
4. `npm run test:packed` — expects successful SvelteKit and Solid setup checks, passing Playwright runs, and `Packed consumers passed: <temp dir>`. Independent consumers install tarballs, query the installed MCP server, compare exports, and build its examples. The Solid fixture checks both the Node/server and browser builds, hydration and interactive controls. Update component contracts and `packages/core/reference/` together.

**Verify:** `npm run build -w @claymo/playground`, then serve `apps/playground/dist` with any static server and compare `/gallery/` and a few `/components/<name>/` pages against the previous release in light and dark.

**Rollback:** nothing is published; fix and rerun.

## Publish

**Purpose:** release the five publishable workspaces at one version.

**Preconditions:** release candidate verified (above) on a clean `main`; npm account with publish rights on the `@claymo` scope; `npm whoami` succeeds; 2FA device at hand.

**Steps:**

1. Bump every publishable workspace to `X.Y.Z`; set `@claymo/core` in each dependent workspace and the playground's `@claymo/*` dependencies to that exact version.
2. `npm install` — refreshes the lockfile; expected: no `ETARGET` errors.
3. `npm run test:packed` — must pass on the bumped versions.
4. Commit and tag: `git commit -am "release: vX.Y.Z" && git tag vX.Y.Z`.
5. Publish core first, then the dependents (`prepack` rebuilds `dist`):
   ```sh
   npm publish -w @claymo/core
   npm publish -w @claymo/svelte -w @claymo/astro -w @claymo/solid -w @claymo/mcp
   ```
6. `git push --follow-tags`.

**Verify:** `npm view @claymo/svelte@X.Y.Z dependencies` shows `@claymo/core: 'X.Y.Z'`; in an empty directory, `npm create astro@latest`, `npm i @claymo/astro @claymo/core`, add `claymo()` from `@claymo/astro/integration` to `integrations` in `astro.config.mjs` and render `<Button>` — the page builds and shows a raised button. `npx -y @claymo/mcp@X.Y.Z` starts and waits on stdin (Ctrl-C to exit).

**Rollback:** `npm deprecate @claymo/<pkg>@X.Y.Z "<reason>"` for each package, then publish a fixed `X.Y.Z+1`. `npm unpublish` works only within 72 hours and the version number can never be reused.

## Common failures

| Symptom                                                     | Cause and fix                                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Cannot resolve `@claymo/svelte` or `@claymo/solid` types    | Build workspace declarations with `npm run prepare` (also runs on `npm install`).            |
| `test:packed`: `Process from config.webServer exited early` | Check the fixture port: 4329 for Astro/Svelte, 4334 for Solid. Stop the conflicting process. |
| `test:e2e` webServer exits early                            | Port 4331 in use, or `astro dev` ran without `--ignore-lock` and moved to the background.    |
| Inflated surfaces render flat                               | `#clay-lit` missing: render `ClayLighting` once per page.                                    |
| Unstyled components in an Astro consumer                    | `claymo()` missing from `integrations` in `astro.config.mjs`.                                |
| `claymo({ svelte: true })` throws on startup                | Svelte islands not installed: `npm install @astrojs/svelte svelte @claymo/svelte`.           |
