import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { palettes } from "../reference/index.js";

const css = readFileSync(new URL("../css/tokens.css", import.meta.url), "utf8");
type Mode = "light" | "dark";
type Pair = Record<Mode, string>;

/** `--clay-*: light-dark(#hex, #hex)` declarations of one rule. */
function block(selector: string): Record<string, Pair> {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `tokens.css has no ${selector} rule`);
  const body = css.slice(start, css.indexOf("}", start));
  const pairs = body.matchAll(/--clay-([\w-]+):\s*light-dark\(\s*(#\w{6}),\s*(#\w{6})\s*\)/g);
  return Object.fromEntries([...pairs].map(([, name, light, dark]) => [name, { light, dark }]));
}

const root = block(":root");
const tokens = (palette: string) =>
  palette === "default" ? root : { ...root, ...block(`[data-palette="${palette}"]`) };

const linear = (hex: string) =>
  hex.match(/\w\w/g)!.map((h) => {
    const v = parseInt(h, 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });

function oklab(hex: string): [number, number, number] {
  const [r, g, b] = linear(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
const chroma = (hex: string) => Math.hypot(oklab(hex)[1], oklab(hex)[2]);
const deltaE = (x: string, y: string) => {
  const [a, b] = [oklab(x), oklab(y)];
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};
const luminance = (hex: string) => {
  const [r, g, b] = linear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (x: string, y: string) => {
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};

const cases = palettes.flatMap((palette) =>
  (["light", "dark"] as const).map((mode) => ({ palette, mode, t: tokens(palette) })),
);

test("pages are clean and near-neutral; surfaces are pastel clay that stands off them", () => {
  for (const { palette, mode, t } of cases) {
    const [page, surface] = [t.page[mode], t.surface[mode]];
    const at = `${palette} ${mode}`;
    assert.ok(chroma(page) <= 0.015, `${at}: page chroma ${chroma(page).toFixed(3)}`);
    assert.ok(chroma(surface) >= 0.06, `${at}: surface chroma ${chroma(surface).toFixed(3)}`);
    assert.ok(chroma(surface) >= 4 * chroma(page), `${at}: surface not 4x page chroma`);
    assert.ok(
      deltaE(page, surface) >= 0.08,
      `${at}: page/surface ΔE ${deltaE(page, surface).toFixed(3)}`,
    );
  }
});

test("text stays readable and edges visible on both the page and surfaces", () => {
  for (const { palette, mode, t } of cases) {
    for (const background of ["page", "surface"]) {
      const bg = t[background][mode];
      for (const [name, pair] of Object.entries(t)) {
        const min =
          name === "ink" || name.endsWith("-ink") || name === "ink-muted"
            ? 4.5
            : name === "edge" || name === "focus"
              ? 3
              : 0;
        if (!min) continue;
        const ratio = contrast(pair[mode], bg);
        assert.ok(
          ratio >= min,
          `${palette} ${mode}: --clay-${name} on ${background} is ${ratio.toFixed(2)}:1`,
        );
      }
    }
  }
});
