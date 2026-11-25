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

An explicit `framework` argument wins. Otherwise the server uses `--framework astro|svelte|solid`, then the working directory's `package.json`: a single installed Claymo bridge, then SvelteKit, SolidStart, Astro, Svelte, or Solid. Pass a framework explicitly if detection is ambiguous or you are looking up an island inside another framework.

Append `--framework` and the value to your client's command, for example `npx -y @claymo/mcp --framework svelte`. In an Astro project with Svelte islands, use `framework: "astro"` for setup and `framework: "svelte"` when looking up island components.

## Tool workflow

Call the tools in this order. The server instructions tell the agent to use the returned files and examples and not to invent components or props.

| Tool              | Input                                             | Returns                                                                                                                                                                |
| ----------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list_themes`     | None                                              | Six palettes with descriptions and page, surface, ink, primary, and secondary colors in light and dark; modes, override guidance, and motion presets with their tokens |
| `get_setup`       | `framework?`, `palette`, `mode`, `svelteIslands?` | Install command and setup files for Astro, SvelteKit or standalone Solid 2 + Vite. Solid uses `@solidjs/web` for rendering and JSX types.                              |
| `list_components` | `framework?`                                      | Importable components with their purpose                                                                                                                               |
| `get_components`  | `framework?`, `names[]` (at least one)            | Props, framework-specific content and callbacks, and complete examples with imports. Solid examples are default-exported TSX components.                               |

Choose a palette and mode from `list_themes`; the server reads colors from the shipped `tokens.css`. For a new project, write the files from `get_setup` before running its install command. For an existing project, merge the settings; don't replace its `package.json` or Astro config. Then choose components from `list_components` and pass the names to one `get_components` call. Invalid framework, palette, mode, and component names return an error with the valid choices.

`svelteIslands` only affects Astro setup. It defaults to true when the server detects an Astro project that depends on `svelte` or `@claymo/svelte`. When enabled, the generated config uses `claymo({ svelte: true })` and the install command includes `@claymo/svelte`, `@astrojs/svelte`, and `svelte`. See [Getting started](./getting-started.md) for a Svelte island example.

## Programmatic reference

The server wraps `@claymo/core/reference`. Import it directly in Node 22.12+ to list themes, generate setup files, list component names, or read one component's reference:

```js
import { getComponent, getSetup, listComponents, listThemes } from "@claymo/core/reference";

const themes = listThemes();
const setup = getSetup("astro", "reef", "system", true); // Enable Svelte islands
const names = listComponents("astro");
const button = getComponent("astro", "Button");
```

`props` describes component configuration and callback props. Use `content` and `events` for framework-specific JSX, slots, snippets, DOM events and callback signatures. The repository checks the reference against component types with `npm run check:contracts`; examples are compiled in fresh consumers. See [Theming](./theming.md) for color roles.

To embed the MCP server in a Node process, connect it to a transport:

```js
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "@claymo/mcp";

await createServer({ framework: "astro" }).connect(new StdioServerTransport());
```
