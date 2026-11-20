// Turns every reference example (`@claymo/core/reference`, the data the MCP server serves) into a
// page at /examples/<framework>/<component>/, shown in a frame on the component's reference page.
// Frames keep each example's fixed ids apart. Output is generated and gitignored.
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { frameworks, getComponent, listComponents } from "@claymo/core/reference";
import { componentSlug } from "../src/lib/nav.ts";

const sources = new URL("../src/examples/", import.meta.url);
const pages = new URL("../src/pages/examples/", import.meta.url);

for (const framework of frameworks) {
  const names = listComponents(framework);
  syncGenerated(
    sources,
    framework,
    names.map((name) => [`${name}.${framework}`, getComponent(framework, name).example]),
  );
  syncGenerated(
    pages,
    framework,
    names.map((name) => [
      `${componentSlug(name)}.astro`,
      page(framework, name, `${name}.${framework}`),
    ]),
  );
}

// Checks and builds also run this generator. Leave unchanged files alone so an open dev server
// does not invalidate every example, or briefly lose routes while the tree is recreated.
function syncGenerated(root, framework, files) {
  const dir = new URL(`${framework}/`, root);
  mkdirSync(dir, { recursive: true });
  const stale = new Set(
    readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => e.name),
  );
  for (const [name, content] of files) {
    const path = new URL(name, dir);
    if (!stale.delete(name) || readFileSync(path, "utf8") !== content) writeFileSync(path, content);
  }
  for (const name of stale) unlinkSync(new URL(name, dir));
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
