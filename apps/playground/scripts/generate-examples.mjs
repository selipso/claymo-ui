// Turns every reference example (`@claymo/core/reference`, the data the MCP server serves) into a
// page at /examples/<framework>/<component>-<n>/, shown in a frame on the component's reference
// page. Frames keep each example's fixed ids apart. Output is generated and gitignored.
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { frameworks, getComponent, listComponents } from "@claymo/core/reference";
import { exampleSlug } from "../src/lib/nav.ts";

const sources = new URL("../src/examples/", import.meta.url);
const pages = new URL("../src/pages/examples/", import.meta.url);

for (const framework of frameworks) {
  const extension = framework === "solid" ? "tsx" : framework;
  const examples = listComponents(framework).flatMap((name) =>
    getComponent(framework, name).examples.map(({ source }, index) => ({
      name,
      slug: exampleSlug(name, index),
      source,
    })),
  );
  syncGenerated(
    sources,
    framework,
    examples.map(({ slug, source }) => [`${slug}.${extension}`, source]),
  );
  syncGenerated(
    pages,
    framework,
    examples.map(({ name, slug }) => [
      `${slug}.astro`,
      page(framework, name, `${slug}.${extension}`),
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
  const title = JSON.stringify(`${name} example (${framework})`);
  if (framework === "solid")
    return `---
import Frame from "../../../layouts/Frame.astro";
---

<Frame title=${title}><div data-solid-example></div></Frame>

<script>
  import { createComponent } from "solid-js";
  import Example from "../../../examples/${framework}/${file}";
  import { mountSolid } from "../../../lib/mount-solid";
  mountSolid("[data-solid-example]", () => createComponent(Example, {}));
</script>
`;

  const hydrate = framework === "svelte" ? " client:load" : "";
  return `---
import Frame from "../../../layouts/Frame.astro";
import Example from "../../../examples/${framework}/${file}";
---

<Frame title=${title}><Example${hydrate} /></Frame>
`;
}
