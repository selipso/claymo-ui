import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as bridge from "@claymo/solid";
import { generateHydrationScript, renderToString } from "@solidjs/web";
import { build } from "vite";
import solid from "@solidjs/vite-plugin";
import { Counter } from "./counter.mjs";

const client = new Client({ name: "packed-solid", version: "0" });
await client.connect(new StdioClientTransport({ command: "node_modules/.bin/claymo-mcp" }));
const call = async (name, args = {}) => {
  const result = await client.callTool({ name, arguments: args });
  assert.ok(!result.isError, `${name}: ${result.content[0].text}`);
  return JSON.parse(result.content[0].text);
};
try {
  const { palettes } = await call("list_themes");
  assert.ok(palettes.some((p) => p.palette === "reef"));
  const setup = await call("get_setup", { palette: "reef", mode: "dark" });
  assert.equal(setup.framework, "solid");
  for (const { path, content } of setup.files) {
    await mkdir(dirname(path), { recursive: true });
    if (path === "package.json") {
      const installed = JSON.parse(await readFile(path, "utf8"));
      await writeFile(path, JSON.stringify({ ...installed, ...JSON.parse(content) }));
    } else await writeFile(path, content);
  }
  const names = (await call("list_components")).map((c) => c.name);
  assert.deepEqual(names, Object.keys(bridge).sort(), "Solid exports must match the MCP inventory");
  assert.deepEqual(
    names,
    (await call("list_components", { framework: "astro" })).map((c) => c.name),
  );
  const examples = await call("get_components", { names });
  await mkdir("src/examples");
  const imports = [];
  const entries = [];
  for (const component of examples) {
    assert.ok(component.examples.length, `Missing ${component.name} examples`);
    for (const [i, { source }] of component.examples.entries()) {
      const id = `${component.name}_${i + 1}`;
      await writeFile(`src/examples/${id}.tsx`, source);
      imports.push(`import ${id} from './examples/${id}';`);
      entries.push(id);
    }
  }
  await writeFile("examples.json", JSON.stringify(entries));
  await writeFile(
    "src/catalog.ts",
    [...imports, `export default {${entries.join(", ")}};`].join("\n"),
  );
  await rename("src/App.tsx", "src/Setup.tsx");
  await writeFile(
    "src/App.tsx",
    [
      "import catalog from './catalog';",
      "import Setup from './Setup';",
      "import Controls from './Controls';",
      "const examples: Record<string, typeof Setup> = {Setup, Controls, ...catalog};",
      "export default function App() { const Example = examples[new URLSearchParams(location.search).get('example') ?? 'Setup']!; return <Example />; }",
    ].join("\n"),
  );
} finally {
  await client.close();
}
execFileSync("npm", ["run", "check"], { stdio: "inherit" });
await build({
  configFile: false,
  plugins: [solid({ ssr: true })],
  build: { ssr: "src/catalog.ts", outDir: "server" },
});
const { default: catalog } = await import("./server/catalog.js");
for (const [name, Example] of Object.entries(catalog)) {
  const errors = [];
  const html = renderToString(Example, { onError: (error) => errors.push(error) });
  assert.deepEqual(errors, [], `${name}: SSR failed: ${errors.join("; ")}`);
  assert.ok(html, `${name}: missing server output`);
}
const content = renderToString(Counter);
assert.match(content, /Count: 0/);
await writeFile(
  "hydrate.html",
  `<!doctype html><html lang="en"><head>${generateHydrationScript()}</head><body><main>${content}</main><script type="module" src="/hydrate.mjs"></script></body></html>`,
);
await build({ build: { rolldownOptions: { input: ["index.html", "hydrate.html"] } } });
console.log("Packed Solid: setup, exports, all TSX examples and server render verified.");
