# Claymo UI

Claymo is a component library with soft, inflated clay surfaces and [Material UI](https://mui.com/material-ui/all-components/)-style APIs. Its Astro, Svelte 5, and Solid 2 bridges share native HTML for semantics, CSS for appearance, and TypeScript for behavior.

Core recipes such as `buttonRecipe`, `paperRecipe`, and `tabRecipe` return the element, class, and attributes. Each bridge applies the recipe to native HTML and maps its own content, props, callbacks, and events. Core implements behavior the browser doesn't provide: `moveTabFocus` handles tabs keyboard navigation, `attachDialog` handles Escape and backdrop close requests, and `bindIndeterminate` restores controlled mixed state after clicks and form reset. Renderers that work directly with the DOM can use the `upgrade*` controllers.

## Can CSS render claymorphism?

Michał Malewicz's [Claymorphism in User Interfaces](https://hype4.academy/articles/design/claymorphism-in-user-interfaces) describes the effect as “not really possible to achieve in CSS just yet.” Claymo's verdict: roughly 90% of the look is plain CSS and degrades gracefully. Only arbitrary, resizable vector deformation needs an emulation.

| Technique                                                                                            | Effect                                                           | Browser support and limits                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `box-shadow` with a large offset outer shadow, a light top-left inset, and a dark bottom-right inset | The article's shadow recipe; Claymo's default surface            | All engines                                                                                         |
| `border-radius` at or beyond half size                                                               | Pills and circles                                                | All engines; CSS clamps oversized radii to fit                                                      |
| `corner-shape: squircle`                                                                             | Puffier corners; shadows, outline, and overflow follow the shape | Chromium 139+; requires a nonzero `border-radius`. Firefox and Safari fall back to rounded corners. |
| SVG `feDiffuseLighting` and `feSpecularLighting` on a blurred alpha height map (`data-inflated`)     | Dome highlights that follow the silhouette                       | All engines; repaints on resize, so reserve it for small static surfaces.                           |
| `clip-path: url(#id)` with an `objectBoundingBox` Bézier path                                        | Bulges the side midpoints                                        | All engines; fixed proportions. It clips `box-shadow`, so put `filter: drop-shadow()` on a parent.  |

Run `npm start` and open the Lab at `/lab/` to compare the four stages and see the live `CSS.supports()` results for your browser.

## Packages

| Workspace or fixture        | Package                                      | Contents                                                                                                                                                                  |
| --------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core`             | `@claymo/core`                               | `claymo.css` (tokens, material, and component styles), optional `page.css`, server-safe recipes, DOM controllers (`@claymo/core/behavior/*`), and the component reference |
| `packages/svelte`           | `@claymo/svelte`                             | Svelte 5.57+ bridge, built with `svelte-package` and styled by core                                                                                                       |
| `packages/astro`            | `@claymo/astro`, `@claymo/astro/integration` | Server-rendered `.astro` components with client controllers and an integration for styles and optional Svelte islands                                                     |
| `packages/solid`            | `@claymo/solid`                              | Solid 2 JSX components with separate browser and server builds; consumes the same core recipes and styles                                                                 |
| `packages/mcp`              | `@claymo/mcp`                                | Read-only stdio server (`claymo-mcp`) backed by `@claymo/core/reference`                                                                                                  |
| `apps/playground`           | `@claymo/playground` (private)               | Documentation and demos using workspace packages                                                                                                                          |
| `fixtures/packed-consumer`  | Not a workspace                              | Astro and Svelte app installed from tarballs in a temporary directory so hoisted dependencies can't mask packaging gaps                                                   |
| `fixtures/packed-sveltekit` | Not a workspace                              | SvelteKit app built using setup files and component examples returned by `claymo-mcp`                                                                                     |
| `fixtures/packed-solid`     | Not a workspace                              | Solid 2 Vite app built from the MCP setup and examples; checks SSR, hydration and browser interactions                                                                    |

## Where to go next

- [Getting started](./getting-started.md): run the playground or set up an app.
- [Frameworks](./frameworks.md): compare component conventions and MUI prop mappings.
- [Theming](./theming.md): use the CSS directly, choose a palette, or override tokens.
- [Motion](./motion.md): choose a motion preset or tune hover, press and entrance tokens.
- [Data patterns](./data-patterns.md): tables with sorting, search, pagination and selection; detail and edit dialogs; tag pickers.
- [MCP](./mcp.md): configure a coding agent or use the programmatic reference.
- [Accessibility](./accessibility.md): review behavior, known limits, and test coverage.
- [Runbook](./RUNBOOK.md): verify and publish a release.
