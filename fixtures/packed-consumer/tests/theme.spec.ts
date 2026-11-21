import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// Written by check-mcp.mjs from the installed server's list_themes response.
interface Colors {
  page: string;
  surface: string;
  primary: string;
}
const themes: { palette: string; colors: Record<"light" | "dark", Colors> }[] = JSON.parse(
  readFileSync("mcp-themes.json", "utf8"),
);

const rgb = (hex: string) => {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

/** The rendered page background and the first button's fill. */
const rendered = (page: Page) =>
  page.evaluate(() => ({
    page: getComputedStyle(document.body).backgroundColor,
    button: getComputedStyle(document.querySelector(".clay-button")!).backgroundColor,
  }));

test("every palette list_themes reports renders its reported colors in both modes", async ({
  page,
}) => {
  await page.goto("/static/");
  for (const { palette, colors } of themes) {
    for (const mode of ["light", "dark"] as const) {
      await page.evaluate(
        ([palette, mode]) => {
          const root = document.documentElement;
          root.dataset.theme = mode;
          if (palette === "default") delete root.dataset.palette;
          else root.dataset.palette = palette;
        },
        [palette, mode],
      );
      expect(await rendered(page), `${palette} ${mode}`).toEqual({
        page: rgb(colors[mode].page),
        button: rgb(colors[mode].primary), // /static/'s first Button is contained primary
      });
    }
  }
});

test("the get_setup layout applies the chosen palette and mode", async ({ page }) => {
  await page.goto("/reference/setup/");
  const orbit = themes.find((t) => t.palette === "orbit")!.colors.dark;
  await expect(page.locator("html")).toHaveAttribute("data-palette", "orbit");
  // The setup page renders get_components' Button example, which is outlined: surface fill.
  expect(await rendered(page)).toEqual({ page: rgb(orbit.page), button: rgb(orbit.surface) });
});
