# @claymo/mcp

Read-only stdio MCP server for Claymo themes, setup files, and component references.

## Install and configure

Requires Node 22.12+. The client commands below run the package with `npx`. To install the `claymo-mcp` binary as a project dependency, run `npm install --save-dev @claymo/mcp`.

opencode (`opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "claymo": { "type": "local", "command": ["npx", "-y", "@claymo/mcp"], "enabled": true }
  }
}
```

Clients that use `mcpServers` (Claude Desktop, Cursor and others):

```json
{ "mcpServers": { "claymo": { "command": "npx", "args": ["-y", "@claymo/mcp"] } } }
```

Run the server in the project directory so it can detect Astro, Svelte, or Solid. Pass `--framework solid` to select Solid 2 in a mixed workspace. Solid setup returns a Vite starter; its examples are complete TSX components.

## Tools

1. `list_themes`: find a palette and mode.
2. `get_setup`: generate the install command and setup files.
3. `list_components`: find components for the target framework.
4. `get_components`: fetch props, content, events, and examples for the selected components.

See the [MCP guide in the repository](https://github.com/selipso/claymo-ui/blob/main/docs/mcp.md) for tool arguments, framework detection, Svelte islands, and the programmatic reference.
