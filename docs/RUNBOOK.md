# Runbook

Packages: `@claymo/core`, `@claymo/svelte`, `@claymo/astro` (components plus the `@claymo/astro/integration` Astro integration), `@claymo/mcp` (published, lockstep versions). `apps/playground` (the docs site) and `fixtures/*` are never published.

## Run the playground from a clone

**Purpose:** work on Claymo with live docs, reference pages and demos.

**Preconditions:** Node 22+, git.

**Steps:**

1. `git clone https://github.com/selipso/claymo-ui.git && cd claymo-ui`
2. `npm install` — `prepare` builds `@claymo/core` and `@claymo/svelte` `dist` for type checks and packing.
3. `npm start` — generates the example pages from `@claymo/core/reference`, then serves the playground at http://localhost:4321. Workspace packages resolve to source, so edits to `packages/*` and `docs/*.md` reload live.

**Verify:** `npm run test:e2e` (first run: `npx playwright install chromium`) — the sidebar persists across navigation, the theme carries across pages and example frames, guides and component pages render, and the narrow-screen menu works.

**Rollback:** none needed; nothing outside the clone changes.

## Verify a release candidate

**Purpose:** prove the packed tarballs work for a consumer before publishing.

**Preconditions:** Node 22+, `npm install` at the root, Playwright browsers (`npx playwright install chromium firefox webkit`).

**Steps:**

1. `npm run check` — expected: 0 errors and 0 warnings in every workspace.
2. `npm test` — expected: all core and MCP server tests pass.
3. `npm run test:e2e` — expected: all playground tests pass.
4. `npm run test:packed` — expects `SvelteKit setup from claymo-mcp: checked, built, themed.`, passing Playwright runs in Chromium, Firefox and WebKit, and `Packed consumers passed: <temp dir>`. The fixtures install tarballs, verify bridge and MCP inventory parity, write the MCP's Astro setup (`astro.config.mjs` with the `claymo({ svelte: true })` integration, so the integration supplies all CSS and Svelte islands), and type-check and build the examples the MCP server returns. Browser tests cover native form values and reset, disclosure and tabs keyboard state, display semantics, and dismissal/focus behavior. Update `packages/core/reference/` in the same change as any public component or theme contract.

**Verify:** `npm run build -w @claymo/playground`, then serve `apps/playground/dist` with any static server and compare `/gallery/` and a few `/components/<name>/` pages against the previous release in light and dark.

**Rollback:** nothing is published; fix and rerun.

## Publish

**Purpose:** release all four packages at one version.

**Preconditions:** release candidate verified (above) on a clean `main`; npm account with publish rights on the `@claymo` scope; `npm whoami` succeeds; 2FA device at hand.

**Steps:**

1. Bump every package to the same version `X.Y.Z` (`version` in `packages/*/package.json`) and set the internal dependency on `@claymo/core` in `packages/svelte`, `packages/astro` and `packages/mcp` to `X.Y.Z`; also set the playground's `@claymo/*` dependencies to `X.Y.Z`.
2. `npm install` — refreshes the lockfile; expected: no `ETARGET` errors.
3. `npm run test:packed` — must pass on the bumped versions.
4. Commit and tag: `git commit -am "release: vX.Y.Z" && git tag vX.Y.Z`.
5. Publish core first, then the dependents (`prepack` rebuilds `dist`):
   ```sh
   npm publish -w @claymo/core
   npm publish -w @claymo/svelte -w @claymo/astro -w @claymo/mcp
   ```
6. `git push --follow-tags`.

**Verify:** `npm view @claymo/svelte@X.Y.Z dependencies` shows `@claymo/core: 'X.Y.Z'`; in an empty directory, `npm create astro@latest`, `npm i @claymo/astro @claymo/core`, add `claymo()` from `@claymo/astro/integration` to `integrations` in `astro.config.mjs` and render `<Button>` — the page builds and shows a raised button. `npx -y @claymo/mcp@X.Y.Z` starts and waits on stdin (Ctrl-C to exit).

**Rollback:** `npm deprecate @claymo/<pkg>@X.Y.Z "<reason>"` for each package, then publish a fixed `X.Y.Z+1`. `npm unpublish` works only within 72 hours and the version number can never be reused.

## Common failures

| Symptom                                                     | Cause and fix                                                                             |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Playground type check cannot resolve `@claymo/svelte`       | `dist` missing: `npm run prepare` (runs on `npm install`).                                |
| `test:packed`: `Process from config.webServer exited early` | Port 4329 in use; stop the other process.                                                 |
| `test:e2e` webServer exits early                            | Port 4331 in use, or `astro dev` ran without `--ignore-lock` and moved to the background. |
| Inflated surfaces render flat                               | `#clay-lit` missing: render `ClayLighting` once per page.                                 |
| Unstyled components in an Astro consumer                    | `claymo()` missing from `integrations` in `astro.config.mjs`.                             |
| `claymo({ svelte: true })` throws on startup                | Svelte islands not installed: `npm install @astrojs/svelte svelte @claymo/svelte`.        |
