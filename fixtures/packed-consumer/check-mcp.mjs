// Run in the disposable consumer. Acts as an agent: asks the installed claymo-mcp server for a theme,
// setup files and every example of every component, writes them unchanged, and leaves
// `npm run check`, `npm run build` and Playwright to prove they type-check, render and apply the theme.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "packed-consumer", version: "0" });
await client.connect(new StdioClientTransport({ command: "node_modules/.bin/claymo-mcp" }));
const call = async (name, args = {}) => {
  const result = await client.callTool({ name, arguments: args });
  assert.notEqual(result.isError, true, `${name}: ${result.content[0].text}`);
  return JSON.parse(result.content[0].text);
};

const astro = (await call("list_components", { framework: "astro" })).map(({ name }) => name);
const svelte = (await call("list_components", { framework: "svelte" })).map(({ name }) => name);
assert.deepEqual(astro, svelte, "The bridges must publish the same components");
// The server detects Astro from this app's package.json, so framework may be omitted.
assert.equal((await call("get_setup")).framework, "astro");

// Theme data for the Playwright theme spec: it must match what renders.
await writeFile("mcp-themes.json", JSON.stringify((await call("list_themes")).palettes));

const root = "src/pages/reference";
await mkdir(root); // refuse to overwrite an existing route
for (const [framework, names] of Object.entries({ astro, svelte })) {
  const folder = `${root}/${framework}`;
  await mkdir(folder);
  const components = await call("get_components", { framework, names });
  for (const { name, examples } of components) {
    assert.ok(examples.length > 0, `${framework} ${name} has no example`);
    for (const [index, { source }] of examples.entries()) {
      const file = `_${name}-${index + 1}.${framework}`;
      await writeFile(`${folder}/${file}`, source);
      const hydrate = framework === "svelte" ? " client:load" : "";
      await writeFile(
        `${folder}/${name}-${index + 1}.astro`,
        `---\nimport Page from "../../../layouts/Page.astro";\nimport Example from "./${file}";\n---\n<Page title=${JSON.stringify(name)}><Example${hydrate} /></Page>\n`,
      );
    }
  }
  // Compare MCP against actual runtime exports; type-only exports are not components.
  await writeFile(
    `${folder}/index.astro`,
    `---\nimport * as bridge from "@claymo/${framework}";\nconst names = ${JSON.stringify(names)};\nif (JSON.stringify(Object.keys(bridge).sort()) !== JSON.stringify(names)) throw new Error("Stale ${framework} component reference");\n---\n<ul>{names.map((name) => <li><a href={\`./\${name}-1/\`}>{name}</a></li>)}</ul>\n`,
  );
}

const setup = await call("get_setup", { framework: "astro", palette: "orbit", mode: "dark" });
const config = setup.files.find(({ path }) => path === "astro.config.mjs");
assert.ok(config, "Astro setup must provide astro.config.mjs");
assert.ok(config.content.includes("claymo({ svelte: true })"), "Svelte islands must be detected");
for (const file of setup.files) await writeFile(file.path, file.content);
await writeFile(
  `${root}/setup.astro`,
  `---\nimport Layout from "../../layouts/Layout.astro";\nimport Example from "./astro/_Button-1.astro";\n---\n<Layout title="Setup"><Example /></Layout>\n`,
);
await client.close();
