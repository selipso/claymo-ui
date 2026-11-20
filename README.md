# claymo-ui

A proof-of-concept claymorphic component library with Material UI-style APIs for Astro and Svelte.

![Claymorphic buttons showcasing variants, colors, sizes, and states](claymo-buttons.png)

## Quick start

Use Node 22.23.4 (or later 22.x) or Node 24+, with npm 9.6.5+.

```sh
git clone https://github.com/selipso/claymo-ui.git && cd claymo-ui && npm install && npm start
```

Open <http://localhost:4321> for the docs, component previews, and demos.

## Packages

| Package              | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `@claymo/core`       | Styles, recipes, DOM behavior, and component reference |
| `@claymo/astro`      | Astro components and `@claymo/astro/integration`       |
| `@claymo/svelte`     | Svelte 5 components                                    |
| `@claymo/mcp`        | Read-only MCP server for coding agents                 |
| `@claymo/playground` | Documentation and demos (private)                      |

## Documentation

- [Overview](docs/index.md) — architecture, packages, and CSS techniques
- [Getting started](docs/getting-started.md) — playground, Astro, and SvelteKit setup
- [Frameworks](docs/frameworks.md) — component conventions and MUI mappings
- [Theming](docs/theming.md) — CSS-only usage, palettes, and overrides
- [MCP](docs/mcp.md) — client setup, tools, and the programmatic API
- [Accessibility](docs/accessibility.md) — behavior, limits, and verification coverage
- [Runbook](docs/RUNBOOK.md) — release verification and publishing

## License

[MIT](LICENSE) © 2026 claymo-ui contributors.
