import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// Written by check-mcp.mjs from the installed server's list_themes response.
const palettes: string[] = JSON.parse(readFileSync("mcp-themes.json", "utf8")).map(
  ({ palette }: { palette: string }) => palette,
);

/** OKLCH of an element's background and of every box-shadow color, as the browser renders them. */
const measure = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const oklch = (color: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((v) => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
        const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
        const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
        const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
        const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
        const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
        const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
        return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
      };
      const style = getComputedStyle(element);
      const colors = style.boxShadow.match(/(?:rgba?|oklch|oklab|color)\([^)]*\)/g) ?? [];
      return { fill: oklch(style.backgroundColor), shadows: colors.map(oklch) };
    });

for (const bridge of ["astro", "svelte"]) {
  test(`${bridge}: shadows are the surface's own hue, darker and at least as saturated`, async ({
    page,
  }) => {
    await page.goto(`/migration-${bridge}/`);
    for (const palette of palettes) {
      for (const mode of ["light", "dark"]) {
        await page.evaluate(
          ([palette, mode]) => {
            const root = document.documentElement;
            root.dataset.theme = mode;
            if (palette === "default") delete root.dataset.palette;
            else root.dataset.palette = palette;
          },
          [palette, mode],
        );
        for (const selector of [".clay-card", ".clay-button[data-variant='contained']"]) {
          const { fill, shadows } = await measure(page, selector);
          // Raised: outer drop, inset shade, inset highlight. The highlight is a tint, not a shadow.
          const [drop, shade] = shadows;
          for (const [name, shadow] of [
            ["drop", drop],
            ["shade", shade],
          ] as const) {
            const at = `${palette} ${mode} ${selector} ${name}`;
            const hue = Math.abs(shadow.h - fill.h);
            expect(Math.min(hue, 360 - hue), `${at} hue`).toBeLessThanOrEqual(10);
            expect(shadow.l, `${at} lightness`).toBeLessThan(fill.l);
            // Saturation is chroma relative to lightness; 8-bit sampling allows a 5% tolerance.
            expect(shadow.c / shadow.l, `${at} saturation`).toBeGreaterThanOrEqual(
              (fill.c / fill.l) * 0.95,
            );
          }
        }
      }
    }
  });
}
