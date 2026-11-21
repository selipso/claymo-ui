# @claymo/core

The framework-independent foundation of Claymo, a claymorphic design system: the stylesheet, design tokens, recipes, DOM behavior and the component reference. Use it through [`@claymo/astro`](https://www.npmjs.com/package/@claymo/astro) or [`@claymo/svelte`](https://www.npmjs.com/package/@claymo/svelte), or use the CSS on its own.

| Export                                                                     | Contents                                                                            |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `@claymo/core/claymo.css`                                                  | Tokens, palettes, light and dark modes, and every component's styles                |
| `@claymo/core/page.css`                                                    | Optional page defaults: brand font, page colors, focus ring                         |
| `@claymo/core`, `/actions`, `/display`, `/input`, `/overlays`, `/surfaces` | Server-safe recipes and types shared by the bridges                                 |
| `@claymo/core/behavior/*`                                                  | Idempotent DOM controllers (tabs, dialogs, overlays, form reset)                    |
| `@claymo/core/reference`                                                   | Component, theme and setup reference as data (Node); the source the MCP server uses |

## Docs

[Theming](https://github.com/selipso/claymo-ui/blob/main/docs/theming.md) and the [overview](https://github.com/selipso/claymo-ui/blob/main/docs/index.md).
