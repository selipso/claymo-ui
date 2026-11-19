// Run in the disposable SvelteKit app. Acts as an agent: writes get_setup's files and a page from
// get_components' example unchanged, then type-checks, builds and inspects the prerendered page.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "packed-sveltekit", version: "0" });
await client.connect(new StdioClientTransport({ command: "node_modules/.bin/claymo-mcp" }));
const call = async (name, args) => {
  const result = await client.callTool({ name, arguments: args });
  assert.notEqual(result.isError, true, `${name}: ${result.content[0].text}`);
  return JSON.parse(result.content[0].text);
};

// No framework argument: the server detects SvelteKit from this app's package.json.
const setup = await call("get_setup", { palette: "canopy", mode: "light" });
assert.equal(setup.framework, "svelte");
for (const file of setup.files) writeFileSync(file.path, file.content);
const [page] = await call("get_components", { names: ["Tabs"] });
writeFileSync("src/routes/+page.svelte", page.example);
await client.close();

const run = (script) => execFileSync("npm", ["run", script], { stdio: "inherit" });
run("check");
run("build");

const html = readFileSync("build/index.html", "utf8");
assert.match(html, /<html lang="en" data-theme="light" data-palette="canopy">/);
assert.match(html, /role="tablist"/);
const css = readdirSync("build/_app/immutable/assets")
  .filter((file) => file.endsWith(".css"))
  .map((file) => readFileSync(`build/_app/immutable/assets/${file}`, "utf8"))
  .join("\n");
assert.match(css, /\[data-palette=(?:"canopy"|canopy)\]/);
assert.match(css, /(?:^|\})\.clay-tab\{/m);
console.log("SvelteKit setup from claymo-mcp: checked, built, themed.");
