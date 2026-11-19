import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "./server.js";

/** @param {Parameters<typeof createServer>[0]} [options] */
async function connect(options) {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([createServer(options).connect(serverSide), client.connect(clientSide)]);
  return client;
}

/** A tool error the model can read and correct from, whether the SDK returns or throws it. */
async function errorText(client, name, args) {
  try {
    const result = await client.callTool({ name, arguments: args });
    assert.equal(result.isError, true);
    return result.content[0].text;
  } catch (error) {
    return error.message;
  }
}

const json = (result) => JSON.parse(result.content[0].text);

test("exposes four read-only tools in workflow order, with workflow instructions", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  assert.deepEqual(
    tools.map((tool) => tool.name),
    ["list_themes", "get_setup", "list_components", "get_components"],
  );
  assert.ok(tools.every((tool) => tool.annotations?.readOnlyHint));
  assert.match(client.getInstructions() ?? "", /list_themes[\s\S]*get_setup[\s\S]*get_components/);
});

test("Astro setup injects CSS through its config and sets palette and mode on <html>", async () => {
  const client = await connect();
  const setup = json(
    await client.callTool({
      name: "get_setup",
      arguments: { framework: "astro", palette: "orbit", mode: "dark" },
    }),
  );
  const config = setup.files.find(({ path }) => path === "astro.config.mjs");
  const layout = setup.files.find(({ path }) => path === "src/layouts/Layout.astro");
  assert.ok(config && layout);
  assert.equal(setup.install, "npm install @claymo/core @claymo/astro");
  assert.match(config.content, /from "@claymo\/astro\/integration"/);
  assert.match(config.content, /integrations: \[claymo\(\)\]/);
  assert.match(layout.content, /<html lang="en" data-theme="dark" data-palette="orbit">/);
  assert.doesNotMatch(layout.content, /@claymo\/core\/(?:claymo|page)\.css/);
});

test("detected Svelte islands default on for Astro setup and can be switched off", async () => {
  const client = await connect({ framework: "astro", svelteIslands: true });
  assert.match(client.getInstructions() ?? "", /Astro setup enables Svelte islands by default/);
  const setup = json(await client.callTool({ name: "get_setup", arguments: {} }));
  assert.equal(
    setup.install,
    "npm install @claymo/core @claymo/astro @claymo/svelte @astrojs/svelte svelte",
  );
  const config = setup.files.find(({ path }) => path === "astro.config.mjs");
  assert.ok(config);
  assert.match(config.content, /integrations: \[claymo\(\{ svelte: true \}\)\]/);
  assert.ok(setup.notes.some((note) => note.includes("client:load")));
  const disabled = json(
    await client.callTool({ name: "get_setup", arguments: { svelteIslands: false } }),
  );
  const disabledConfig = disabled.files.find(({ path }) => path === "astro.config.mjs");
  assert.ok(disabledConfig);
  assert.match(disabledConfig.content, /integrations: \[claymo\(\)\]/);
});

test("SvelteKit setup ignores svelteIslands", async () => {
  const client = await connect({ framework: "svelte" });
  const setup = json(await client.callTool({ name: "get_setup", arguments: {} }));
  const withIslands = json(
    await client.callTool({ name: "get_setup", arguments: { svelteIslands: true } }),
  );
  assert.deepEqual(withIslands, setup);
  assert.ok(setup.files.some((file) => file.content.includes('<html lang="en">')));
});

test("lists the same importable catalog for both bridges, each with a purpose", async () => {
  const client = await connect();
  const list = async (framework) =>
    json(await client.callTool({ name: "list_components", arguments: { framework } }));
  const astro = await list("astro");
  assert.deepEqual(astro, await list("svelte"));
  assert.ok(astro.every((c) => c.purpose.length > 0));
});

test("one get_components call returns every requested component, in order", async () => {
  const client = await connect();
  const components = json(
    await client.callTool({
      name: "get_components",
      arguments: { framework: "svelte", names: ["Dialog", "Button"] },
    }),
  );
  assert.deepEqual(
    components.map((c) => c.name),
    ["Dialog", "Button"],
  );
  assert.ok(components.every((c) => c.example.includes('from "@claymo/svelte"')));
});

test("a detected project framework becomes the default for every tool", async () => {
  const client = await connect({ framework: "svelte" });
  assert.match(client.getInstructions() ?? "", /uses svelte/);
  assert.equal(
    json(await client.callTool({ name: "get_setup", arguments: {} })).framework,
    "svelte",
  );
  const [button] = json(
    await client.callTool({ name: "get_components", arguments: { names: ["Button"] } }),
  );
  assert.equal(button.framework, "svelte");
  // Explicit framework and Svelte islands still win when the project has different defaults.
  const astro = json(
    await client.callTool({
      name: "get_setup",
      arguments: { framework: "astro", svelteIslands: true },
    }),
  );
  assert.equal(astro.framework, "astro");
  assert.match(astro.install, /@claymo\/svelte @astrojs\/svelte svelte$/);
});

test("invalid input returns the valid choices", async () => {
  const client = await connect();
  assert.match(
    await errorText(client, "get_setup", { framework: "astro", palette: "neon" }),
    /tidal/,
  );
  assert.match(await errorText(client, "list_components", {}), /astro|svelte/);
  assert.match(
    await errorText(client, "get_components", { framework: "astro", names: ["Carousel"] }),
    /Button/,
  );
  assert.throws(() => createServer({ framework: "react" }), /Choose: astro, svelte/);
});
