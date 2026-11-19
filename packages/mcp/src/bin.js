#!/usr/bin/env node
import { parseArgs } from "node:util";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readProject } from "./project.js";
import { createServer } from "./server.js";

// `--framework astro|svelte` wins; otherwise the project in the working directory decides.
const { values } = parseArgs({ options: { framework: { type: "string" } } });
const project = readProject(process.cwd());
const framework = values.framework ?? project.framework;

await createServer({ framework, svelteIslands: project.svelteIslands }).connect(
  new StdioServerTransport(),
);
