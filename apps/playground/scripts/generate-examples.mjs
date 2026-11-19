// Turns every reference example (`@claymo/core/reference`, the data the MCP server serves) into a
// page at /examples/<framework>/<component>/, shown in a frame on the component's reference page.
// Frames keep each example's fixed ids apart. Output is generated and gitignored.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { frameworks, getComponent, listComponents } from "@claymo/core/reference";
import { componentSlug } from "../src/lib/nav.ts";

const sources = new URL("../src/examples/", import.meta.url);
const pages = new URL("../src/pages/examples/", import.meta.url);

await Promise.all([sources, pages].map((dir) => rm(dir, { recursive: true, force: true })));
for (const framework of frameworks) {
  await mkdir(new URL(`${framework}/`, sources), { recursive: true });
  await mkdir(new URL(`${framework}/`, pages), { recursive: true });
  for (const name of listComponents(framework)) {
    const file = `${name}.${framework}`;
    await writeFile(
      new URL(`${framework}/${file}`, sources),
      getComponent(framework, name).example,
    );
    await writeFile(
      new URL(`${framework}/${componentSlug(name)}.astro`, pages),
      page(framework, name, file),
    );
  }
}

function page(framework, name, file) {
  const hydrate = framework === "svelte" ? " client:load" : "";
  return `---
import Frame from "../../../layouts/Frame.astro";
import Example from "../../../examples/${framework}/${file}";
---

<Frame title=${JSON.stringify(`${name} example (${framework})`)}><Example${hydrate} /></Frame>
`;
}
