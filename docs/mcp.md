# MCP

`@claymo/mcp` is a read-only stdio server for coding agents. The `claymo-mcp` binary requires Node 22.12+. The server reads local project metadata; it doesn't need network access or credentials and doesn't write files.

## Configure a client

Run the server with `npx` in the project directory. For opencode, add the following to `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "claymo": { "type": "local", "command": ["npx", "-y", "@claymo/mcp"], "enabled": true }
  }
}
```

For clients that use `mcpServers`, such as Claude Desktop or Cursor:

```json
{ "mcpServers": { "claymo": { "command": "npx", "args": ["-y", "@claymo/mcp"] } } }
```

### Framework detection

An explicit `framework` argument wins on any tool call that accepts it. Otherwise the server uses `--framework astro|svelte` if supplied, then checks the working directory's `package.json`. It looks for a single Claymo bridge dependency first, then SvelteKit, Astro, and Svelte, in that order. If it finds no default, pass `framework` to each tool that accepts it. Use `astro` for Astro setup and `svelte` for SvelteKit setup or Svelte component reference.

Append `--framework` and the value to your client's command, for example `npx -y @claymo/mcp --framework svelte`. In an Astro project with Svelte islands, use `framework: "astro"` for setup and `framework: "svelte"` when looking up island components.

## Tool workflow

Call the tools in this order. The server instructions tell the agent to use the returned files and examples and not to invent components or props.

| Tool              | Input                                                                                    | Returns                                                                                                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list_themes`     | None                                                                                     | Six palettes with descriptions and page, surface, ink, primary, and secondary colors in light and dark; modes, override guidance, and motion presets with their tokens                            |
| `get_setup`       | `framework?`, `palette` (default `default`), `mode` (default `system`), `svelteIslands?` | Install command and complete setup files: `astro.config.mjs` and `src/layouts/Layout.astro` for Astro, or `src/routes/+layout.svelte` and `src/app.html` for SvelteKit                            |
| `list_components` | `framework?`                                                                             | Importable components with their purpose                                                                                                                                                          |
| `get_components`  | `framework?`, `names[]` (at least one)                                                   | For each name in the requested order: props as JSON Schema (including enums and defaults), slots or snippets, events, and titled complete examples with imports; the first is the most common use |

Choose a palette and mode from `list_themes`; the server reads colors from the shipped `tokens.css`. With `get_setup`, run the install command and use the returned files. Merge the Claymo integration into an existing Astro config rather than replacing it. Then choose components from `list_components` and pass all the names you need to one `get_components` call. Framework, palette, mode, and component names have enumerated choices; invalid values return a tool error that lists the valid options.

`svelteIslands` is a boolean for Astro setup. It defaults to true when the server detects an Astro project that depends on `svelte` or `@claymo/svelte`; otherwise it defaults to false. Pass it explicitly to override detection. When enabled, the generated config uses `claymo({ svelte: true })` and the install command includes `@claymo/svelte`, `@astrojs/svelte`, and `svelte`. The option is ignored for SvelteKit setup. See [Getting started](./getting-started.md) for a Svelte island example.

## Programmatic reference

The server wraps `@claymo/core/reference`. Import it directly in Node 22.12+ to list themes, generate setup files, list component names, or read one component's reference:

```js
import { getComponent, getSetup, listComponents, listThemes } from "@claymo/core/reference";

const themes = listThemes();
const setup = getSetup("astro", "reef", "system", true); // Enable Svelte islands
const names = listComponents("astro");
const button = getComponent("astro", "Button");
```

`props` describes component configuration. It doesn't validate native HTML attributes, slots or snippets, or event handlers. Use the returned `content` and `events` fields for markup and handlers, and see [Theming](./theming.md) for the semantic roles accepted by the `color` prop.

To embed the MCP server in a Node process, connect it to a transport:

```js
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "@claymo/mcp";

await createServer({ framework: "astro" }).connect(new StdioServerTransport());
```
