import type { AstroIntegration } from "astro";

export interface ClaymoOptions {
  /**
   * Also inject `@claymo/core/page.css`: brand font, page colors and a focus ring on every element.
   * Turn off when Claymo is embedded in a page styled by something else. Default true.
   */
  pageStyles?: boolean;
  /**
   * Enable Svelte islands for `@claymo/svelte` by adding `@astrojs/svelte` (install `@astrojs/svelte`,
   * `svelte` and `@claymo/svelte` first). Skipped when the project already registers it. Default false.
   */
  svelte?: boolean;
}

/**
 * Sets up Claymo in an Astro project: injects the stylesheet into every page and, optionally,
 * Svelte islands. Use it once in `astro.config.mjs`: `integrations: [claymo()]`.
 */
export default function claymo(options?: ClaymoOptions): AstroIntegration;
