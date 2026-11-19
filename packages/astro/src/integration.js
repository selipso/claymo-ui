// Plain JavaScript, unlike the components: Astro loads astro.config.mjs through Vite's module runner,
// which closes before integration hooks run. A .ts file in node_modules would execute inside that
// runner and its later `import("@astrojs/svelte")` would fail; a .js file loads natively in Node.

/**
 * Sets up Claymo in an Astro project: injects the stylesheet into every page and, optionally,
 * Svelte islands. Use it once in `astro.config.mjs`: `integrations: [claymo()]`.
 * @param {import("./integration").ClaymoOptions} [options]
 * @returns {import("astro").AstroIntegration}
 */
export default function claymo({ pageStyles = true, svelte = false } = {}) {
  return {
    name: "@claymo/astro",
    hooks: {
      async "astro:config:setup"({ config, injectScript, updateConfig }) {
        // `page-ssr` imports load before each page's own CSS, so project styles override Claymo.
        injectScript("page-ssr", 'import "@claymo/core/claymo.css";');
        if (pageStyles) injectScript("page-ssr", 'import "@claymo/core/page.css";');
        if (!svelte || config.integrations.some(({ name }) => name === "@astrojs/svelte")) return;
        updateConfig({ integrations: [(await importSvelteIntegration())()] });
      },
    },
  };
}

// Dynamic on purpose: @astrojs/svelte is an optional peer, absent from Astro-only projects,
// and a static import would break them even when `svelte` is false.
async function importSvelteIntegration() {
  try {
    return (await import("@astrojs/svelte")).default;
  } catch (cause) {
    throw new Error(
      "claymo({ svelte: true }) needs Svelte islands: npm install @astrojs/svelte svelte @claymo/svelte",
      { cause },
    );
  }
}
