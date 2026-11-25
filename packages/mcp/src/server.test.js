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
  assert.match(client.getInstructions() ?? "", /framework \(astro, svelte, solid\)/);
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
    "npm install @claymo/core @claymo/astro @claymo/svelte @astrojs/svelte@9 svelte@5",
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

test("Solid setup ignores Astro-only island settings", async () => {
  const client = await connect({ framework: "solid" });
  const args = { palette: "reef", mode: "light" };
  const setup = json(await client.callTool({ name: "get_setup", arguments: args }));
  const withIslands = json(
    await client.callTool({ name: "get_setup", arguments: { ...args, svelteIslands: true } }),
  );
  assert.deepEqual(withIslands, setup);
  assert.equal(setup.framework, "solid");
});

test("lists the same importable catalog for all bridges, each with a purpose", async () => {
  const client = await connect();
  const list = async (framework) =>
    json(await client.callTool({ name: "list_components", arguments: { framework } }));
  const astro = await list("astro");
  assert.deepEqual(astro, await list("svelte"));
  const solid = await list("solid");
  assert.deepEqual(
    solid.map((component) => component.name),
    astro.map((component) => component.name),
  );
  assert.ok([...astro, ...solid].every((component) => component.purpose.length > 0));
});

test("list_themes describes motion presets, and animated components take a motion prop", async () => {
  const client = await connect({ framework: "astro" });
  const { motion } = json(await client.callTool({ name: "list_themes", arguments: {} }));
  assert.equal(motion.attribute, "data-motion");
  assert.equal(motion.default, "subtle");
  assert.ok(motion.presets["lift-push"].description.length > 0);
  assert.ok(motion.tokens["--clay-motion-duration"]);
  const [button, card] = json(
    await client.callTool({ name: "get_components", arguments: { names: ["Button", "Card"] } }),
  );
  assert.deepEqual(button.props.properties.motion.enum, Object.keys(motion.presets));
  assert.equal(card.props.properties.motion, undefined);
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
  for (const { examples } of components) {
    assert.ok(examples.length > 0);
    for (const { title, source } of examples) {
      assert.ok(title.length > 0);
      assert.match(source, /from "@claymo\/svelte"/);
    }
  }
});

test("Solid Alert does not inherit Astro's dismissal API", async () => {
  const client = await connect();
  const getAlert = async (framework) => {
    const [alert] = json(
      await client.callTool({
        name: "get_components",
        arguments: { framework, names: ["Alert"] },
      }),
    );
    return alert;
  };
  const astro = await getAlert("astro");
  const solid = await getAlert("solid");
  assert.ok("dismissible" in astro.props.properties);
  assert.ok(!("dismissible" in solid.props.properties));
  assert.ok(solid.events.some((event) => event.includes("onClose")));
});

test("a detected project framework becomes the default for every tool", async () => {
  const client = await connect({ framework: "solid" });
  assert.match(client.getInstructions() ?? "", /uses solid/);
  assert.equal(
    json(await client.callTool({ name: "get_setup", arguments: {} })).framework,
    "solid",
  );
  const [button] = json(
    await client.callTool({ name: "get_components", arguments: { names: ["Button"] } }),
  );
  assert.equal(button.framework, "solid");
  // Explicit framework and Svelte islands still win when the project has different defaults.
  const astro = json(
    await client.callTool({
      name: "get_setup",
      arguments: { framework: "astro", svelteIslands: true },
    }),
  );
  assert.equal(astro.framework, "astro");
  assert.match(astro.install, /@claymo\/svelte @astrojs\/svelte@9 svelte@5$/);
});

test("invalid input returns the valid choices", async () => {
  const client = await connect();
  assert.match(
    await errorText(client, "get_setup", { framework: "astro", palette: "neon" }),
    /reef/,
  );
  assert.match(await errorText(client, "list_components", {}), /astro[\s\S]*svelte[\s\S]*solid/);
  assert.match(
    await errorText(client, "get_components", { framework: "astro", names: ["Carousel"] }),
    /Button/,
  );
  assert.throws(() => createServer({ framework: "react" }), /Choose: astro, svelte, solid/);
});
