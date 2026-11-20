// Server-side metadata only. Neither the browser entry point nor either bridge imports this module.
import { readFileSync } from "node:fs";
import controls from "./controls.json" with { type: "json" };
import compound from "./compound.json" with { type: "json" };
import actions from "./actions.json" with { type: "json" };
import display from "./display.json" with { type: "json" };
import input from "./input.json" with { type: "json" };
import overlays from "./overlays.json" with { type: "json" };
import surfaces from "./surfaces.json" with { type: "json" };
import theme from "./theme.json" with { type: "json" };
export { theme };

const components = {
  ...controls,
  ...compound,
  ...actions,
  ...display,
  ...input,
  ...overlays,
  ...surfaces,
};
export const frameworks = Object.freeze(["astro", "svelte"]);
export const modes = Object.freeze(["system", "light", "dark"]);
export const palettes = Object.freeze(Object.keys(theme.palettes));
export const motionPresets = Object.freeze(Object.keys(theme.motion.presets));

// One definition for every component listed in theme.motion.components.
const motionProp = {
  type: "string",
  enum: motionPresets,
  description: `Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default ${theme.motion.default}). See list_themes for what each preset does.`,
};

function choose(kind, value, choices) {
  if (!choices.includes(value))
    throw new RangeError(`Unknown ${kind} "${value}". Choose: ${choices.join(", ")}.`);
}

export function listComponents(framework) {
  choose("framework", framework, frameworks);
  return Object.keys(components)
    .filter((name) => Object.hasOwn(components[name].bridges, framework))
    .sort();
}

/** Prepends an import of the bridge components the example renders (as `<Name`), in list order. */
function componentExample(framework, names, markup) {
  const used = names.filter((name) => new RegExp(`<${name}\\b`).test(markup));
  const statement = `import { ${used.join(", ")} } from "@claymo/${framework}";`;
  const opening = framework === "astro" ? /^---\n/ : /^<script(?:\s[^>]*)?>\n/;
  if (opening.test(markup)) return markup.replace(opening, (match) => `${match}${statement}\n`);
  const header =
    framework === "astro" ? `---\n${statement}\n---` : `<script>\n${statement}\n</script>`;
  return `${header}\n\n${markup}`;
}

/** Configuration props are JSON data; native attributes, slots, bindings and callbacks belong in markup. */
export function getComponent(framework, name) {
  choose("framework", framework, frameworks);
  if (
    typeof name !== "string" ||
    !Object.hasOwn(components, name) ||
    !components[name].bridges[framework]
  ) {
    throw new RangeError(
      `No ${name} in @claymo/${framework}. Choose: ${listComponents(framework).join(", ")}.`,
    );
  }
  const { purpose, props, bridges } = components[name];
  const bridge = bridges[framework];
  return {
    framework,
    name,
    purpose,
    package: `@claymo/${framework}`,
    stylesheet: theme.stylesheet,
    props: {
      type: "object",
      properties: {
        ...props,
        ...bridge.props,
        ...(theme.motion.components.includes(name) ? { motion: motionProp } : {}),
      },
      required: bridge.required,
    },
    content: bridge.content,
    events: bridge.events,
    examples: bridge.examples.map(({ title, source }) => ({
      title,
      source: componentExample(framework, bridge.imports, source),
    })),
  };
}

// Colors come from the shipped CSS, so the reference cannot drift from what renders. Resolved by
// package name, not relative to this module, so it still works once a bundler (e.g. an Astro
// prerender build) moves this code into another directory.
const tokensCss = readFileSync(
  new URL("css/tokens.css", import.meta.resolve("@claymo/core/package.json")),
  "utf8",
);

function tokenBlock(selector) {
  const start = tokensCss.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`tokens.css has no ${selector} block`);
  const body = tokensCss.slice(start, tokensCss.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--clay-[\w-]+):\s*([^;]+);/g)].map((m) => m.slice(1)),
  );
}

function perMode(value) {
  const pair = /^light-dark\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/.exec(value);
  return pair ? { light: pair[1], dark: pair[2] } : { light: value, dark: value };
}

const colorRoles = {
  page: "--clay-page",
  surface: "--clay-surface",
  ink: "--clay-ink",
  primary: "--clay-primary",
  secondary: "--clay-secondary",
};
const rootTokens = tokenBlock(":root");

function paletteColors(palette) {
  const tokens = {
    ...rootTokens,
    ...(palette === "default" ? {} : tokenBlock(`[data-palette="${palette}"]`)),
  };
  const colors = { light: {}, dark: {} };
  for (const [role, token] of Object.entries(colorRoles)) {
    const { light, dark } = perMode(tokens[token]);
    colors.light[role] = light;
    colors.dark[role] = dark;
  }
  return colors;
}

/** Every palette an agent may choose, with the resolved colors of each mode. */
export function listThemes() {
  return palettes.map((palette) => ({
    palette,
    ...theme.palettes[palette],
    colors: paletteColors(palette),
  }));
}

function htmlTag(palette, mode) {
  const attributes = [
    'lang="en"',
    mode === "system" ? "" : `${theme.mode.attribute}="${mode}"`,
    palette === "default" ? "" : `${theme.palette.attribute}="${palette}"`,
  ];
  return `<html ${attributes.filter(Boolean).join(" ")}>`;
}

const setupFiles = {
  astro: (html, integration) => [
    {
      path: "astro.config.mjs",
      content: `import { defineConfig } from "astro/config";\nimport claymo from "@claymo/astro/integration";\n\nexport default defineConfig({ integrations: [${integration}] });\n`,
    },
    {
      path: "src/layouts/Layout.astro",
      content: `---\ninterface Props {\n  title: string;\n}\nconst { title } = Astro.props;\n---\n\n<!doctype html>\n${html}\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>{title}</title>\n  </head>\n  <body>\n    <slot />\n  </body>\n</html>\n`,
    },
  ],
  svelte: (html) => [
    {
      path: "src/routes/+layout.svelte",
      content: `<script>\n  import "${theme.stylesheet}";\n  import "${theme.pageStylesheet}";\n\n  let { children } = $props();\n</script>\n\n{@render children()}\n`,
    },
    {
      path: "src/app.html",
      content: `<!doctype html>\n${html}\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    %sveltekit.head%\n  </head>\n  <body data-sveltekit-preload-data="hover">\n    <div style="display: contents">%sveltekit.body%</div>\n  </body>\n</html>\n`,
    },
  ],
};

const usage = {
  astro:
    'Wrap every page: `import Layout from "../layouts/Layout.astro";` then `<Layout title="Page title">…</Layout>`. Import components in each page\'s frontmatter.',
  svelte:
    "SvelteKit: the layout applies to every route. Import components in each +page.svelte. In an Astro site with Svelte islands, use the astro setup instead.",
};

/** Exact files that load Claymo's CSS and apply the chosen palette and mode. */
export function getSetup(framework, palette = "default", mode = "system", svelteIslands = false) {
  choose("framework", framework, frameworks);
  choose("palette", palette, palettes);
  choose("mode", mode, modes);
  const astro = framework === "astro";
  const withIslands = astro && svelteIslands;
  const integration = withIslands ? "claymo({ svelte: true })" : "claymo()";
  return {
    framework,
    palette,
    mode,
    install:
      `npm install @claymo/core @claymo/${framework}` +
      (withIslands ? " @claymo/svelte @astrojs/svelte@9 svelte@5" : ""),
    files: setupFiles[framework](htmlTag(palette, mode), integration),
    usage: usage[framework],
    notes: [
      ...(astro
        ? [
            `The Claymo integration injects ${theme.stylesheet} and ${theme.pageStylesheet}. Set pageStyles: false to skip the page stylesheet.`,
            `If astro.config.mjs already has integrations, import claymo and add ${integration} to that list rather than replacing the config.`,
            ...(withIslands
              ? [
                  "The install command targets Astro 7. For Astro 5 use @astrojs/svelte@7 instead; for Astro 6 use @astrojs/svelte@8.",
                  "Use a client directive (e.g. client:load) on Svelte components.",
                ]
              : []),
          ]
        : [
            `${theme.pageStylesheet} sets the font, page colors and focus ring on every element. Remove that import only when embedding Claymo in a page styled by something else.`,
          ]),
      "If any component uses inflated, render ClayLighting once in the layout.",
      theme.componentColor,
    ],
  };
}
