import { readFileSync } from "node:fs";
import path from "node:path";

/** @typedef {{ dependencies?: Record<string, string>, devDependencies?: Record<string, string> }} Manifest */

/**
 * The Claymo bridge a project uses, from its package.json dependencies, or undefined when unclear.
 * An installed bridge wins; otherwise SvelteKit means svelte and an Astro site (with or without
 * Svelte islands) means astro.
 * @param {Manifest} manifest
 * @returns {"astro" | "svelte" | undefined}
 */
export function detectFramework(manifest) {
  const deps = { ...manifest.dependencies, ...manifest.devDependencies };
  const bridges = /** @type {const} */ (["astro", "svelte"]).filter(
    (name) => `@claymo/${name}` in deps,
  );
  if (bridges.length === 1) return bridges[0];
  if ("@sveltejs/kit" in deps) return "svelte";
  if ("astro" in deps) return "astro";
  if ("svelte" in deps) return "svelte";
  return undefined;
}

/** Detects whether an Astro project depends on Svelte or the Claymo Svelte bridge.
 * @param {Manifest} manifest
 */
export function detectSvelteIslands(manifest) {
  if (detectFramework(manifest) !== "astro") return false;
  return [manifest.dependencies, manifest.devDependencies].some(
    (deps) => deps && ("svelte" in deps || "@claymo/svelte" in deps),
  );
}

/**
 * Detects the framework and Svelte islands in `dir`; a directory without package.json has neither.
 * @param {string} dir
 */
export function readProject(dir) {
  let source;
  try {
    source = readFileSync(path.join(dir, "package.json"), "utf8");
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code === "ENOENT")
      return { framework: undefined, svelteIslands: false };
    throw error;
  }
  const manifest = JSON.parse(source);
  return { framework: detectFramework(manifest), svelteIslands: detectSvelteIslands(manifest) };
}
