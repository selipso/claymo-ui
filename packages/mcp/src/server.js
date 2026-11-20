import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  frameworks,
  getComponent,
  getSetup,
  listComponents,
  listThemes,
  modes,
  palettes,
  theme,
} from "@claymo/core/reference";
import manifest from "../package.json" with { type: "json" };

const componentNames = [...new Set(frameworks.flatMap(listComponents))].sort();

/**
 * @param {string | undefined} framework
 * @param {boolean} svelteIslands
 */
function instructions(framework, svelteIslands) {
  const project = framework
    ? `This project uses ${framework} (detected); every framework argument defaults to it.\n`
    : "Pass the project's framework (astro or svelte) to every tool.\n";
  const islands = svelteIslands
    ? "Astro setup enables Svelte islands by default (detected); pass svelteIslands: false to disable them.\n"
    : "";
  return `Claymo builds claymorphic (soft, inflated) UIs from npm packages. ${project}${islands}Follow these steps in order:
1. Call list_themes. Pick ONE palette whose description fits the product, and a mode (system, light or dark). Keep the default motion preset unless the brief asks for a different feel; set another one with data-motion on <html>.
2. Call get_setup with your palette and mode. Run its install command and write the returned files, merging the Astro integration into an existing config as noted.
3. Call list_components. Choose components by purpose. Use ONLY names it returns.
4. Call get_components ONCE with every chosen name. Copy the example whose title is closest to your need, then change only values its props allow.
Rules: never invent props or components. A component's color prop is a semantic role (primary, error, ...), never a palette name or a CSS color. Theme is set once in the layout, never on components.`;
}

/** @param {import("@claymo/core/reference").Framework | undefined} framework */
function frameworkInput(framework) {
  const schema = z.enum(frameworks);
  return framework
    ? schema
        .default(framework)
        .describe(`UI framework; defaults to ${framework}, detected from this project.`)
    : schema.describe("The UI framework of the project: astro or svelte.");
}

const readOnly = { readOnlyHint: true, idempotentHint: true, openWorldHint: false };

/**
 * JSON text for the model. Thrown RangeErrors (bad combinations) reach the model as isError
 * results that list the valid choices.
 * @param {unknown} value
 * @returns {{ content: { type: "text"; text: string }[] }}
 */
const reply = (value) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });

/**
 * @param {{ framework?: string, svelteIslands?: boolean }} [options]
 */
export function createServer({
  framework: projectFramework,
  svelteIslands: projectSvelteIslands = false,
} = {}) {
  if (projectFramework !== undefined && !frameworks.some((name) => name === projectFramework))
    throw new RangeError(
      `Unknown framework "${projectFramework}". Choose: ${frameworks.join(", ")}.`,
    );
  const detected = /** @type {import("@claymo/core/reference").Framework | undefined} */ (
    projectFramework
  );
  const server = new McpServer(
    { name: "claymo", version: manifest.version },
    { instructions: instructions(detected, projectSvelteIslands) },
  );
  const framework = frameworkInput(detected);

  server.registerTool(
    "list_themes",
    {
      title: "List Claymo themes",
      description:
        "Step 1. Lists every palette with a description and its page, surface, ink, primary and secondary colors in light and dark mode, the available modes, and the motion presets with their tokens.",
      annotations: readOnly,
    },
    async () => {
      const { components: _components, ...motion } = theme.motion;
      return reply({ modes, palettes: listThemes(), overrides: theme.overrides, motion });
    },
  );

  server.registerTool(
    "get_setup",
    {
      title: "Get Claymo setup files",
      description:
        "Step 2. Returns the install command and setup files that load Claymo's CSS and apply the chosen palette and mode. Follow the notes for existing Astro configs.",
      inputSchema: {
        framework,
        palette: z.enum(palettes).default("default").describe("A palette from list_themes."),
        mode: z
          .enum(modes)
          .default("system")
          .describe("system follows the visitor's preference; light or dark forces one."),
        svelteIslands: z
          .boolean()
          .default(projectSvelteIslands)
          .describe("Astro only: also enable Svelte islands for @claymo/svelte."),
      },
      annotations: readOnly,
    },
    async ({ framework, palette, mode, svelteIslands }) =>
      reply(getSetup(framework, palette, mode, svelteIslands)),
  );

  server.registerTool(
    "list_components",
    {
      title: "List Claymo components",
      description:
        "Step 3. Lists the components you can import for this framework, each with its purpose. Use only these names.",
      inputSchema: { framework },
      annotations: readOnly,
    },
    async ({ framework }) =>
      reply(
        listComponents(framework).map((name) => ({
          name,
          purpose: getComponent(framework, name).purpose,
        })),
      ),
  );

  server.registerTool(
    "get_components",
    {
      title: "Get Claymo components",
      description:
        "Step 4. For each requested name, in order: props (JSON Schema with enums and defaults), content slots or snippets, events, and titled, complete copyable examples with imports (the first is the most common use). Request every component you need in one call.",
      inputSchema: {
        framework,
        names: z
          .array(z.enum(componentNames))
          .min(1)
          .describe('Component names returned by list_components, e.g. ["Button", "Dialog"].'),
      },
      annotations: readOnly,
    },
    async ({ framework, names }) => reply(names.map((name) => getComponent(framework, name))),
  );

  return server;
}
