import { expect, test, type Page } from "@playwright/test";

async function openExample(page: Page, bridge: string, example: number) {
  await page.goto(`/reference/${bridge}/Autocomplete-${example}/`);
  if (bridge === "svelte") {
    await page.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
  }
}

for (const bridge of ["astro", "svelte"]) {
  test.describe(`${bridge} Autocomplete`, () => {
    test("keyboard navigation updates ARIA state and commits a chip", async ({ page }) => {
      await openExample(page, bridge, 1);
      const input = page.getByRole("combobox", { name: "Tags" });
      await expect(input).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByRole("button", { name: "Remove TypeScript" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Remove Astro" })).toBeVisible();

      await input.press("ArrowUp");
      const list = page.getByRole("listbox", { name: "Tags" });
      const svelte = list.getByRole("option", { name: "Svelte" });
      const playwright = list.getByRole("option", { name: "Playwright" });
      await expect(input).toHaveAttribute("aria-expanded", "true");
      await expect(input).toHaveAttribute("aria-controls", (await list.getAttribute("id"))!);
      await expect(list.getByRole("option")).toHaveCount(2);
      await expect(playwright).toHaveAttribute("aria-selected", "false");
      await expect(input).toHaveAttribute(
        "aria-activedescendant",
        (await playwright.getAttribute("id"))!,
      );
      await input.press("ArrowDown");
      await expect(input).toHaveAttribute(
        "aria-activedescendant",
        (await svelte.getAttribute("id"))!,
      );
      await input.press("Enter");
      await expect(page.getByRole("button", { name: "Remove Svelte" })).toBeVisible();
      await expect(input).toBeFocused();
      await expect(input).toHaveAttribute("aria-expanded", "false");
      await expect(input).not.toHaveAttribute("aria-activedescendant");

      await input.press("ArrowDown");
      await input.press("Tab");
      await expect(input).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByRole("button", { name: "Remove Playwright" })).toHaveCount(0);
    });

    test("Enter creates a tag and Backspace removes the last chip", async ({ page }) => {
      await openExample(page, bridge, 2);
      const input = page.getByRole("combobox", { name: "Topics" });
      const output = page.getByLabel("Selected topics");
      await input.fill("Web Components");
      await expect(page.getByRole("option", { name: 'Add "Web Components"' })).toBeVisible();
      await input.press("Enter");
      await expect(page.getByRole("button", { name: "Remove Web Components" })).toBeVisible();
      await expect(output).toHaveText("TypeScript, Web Components");
      await expect(input).toHaveValue("");
      await input.press("Backspace");
      await expect(page.getByRole("button", { name: "Remove Web Components" })).toHaveCount(0);
      await expect(output).toHaveText("TypeScript");

      await input.click();
      await expect(page.getByRole("option", { name: "TypeScript" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await page.getByRole("option", { name: "CSS" }).click();
      await expect(input).toBeFocused();
      await expect(output).toHaveText("TypeScript, CSS");
      await page.getByRole("button", { name: "Remove TypeScript" }).click();
      await expect(input).toBeFocused();
      await expect(output).toHaveText("CSS");
    });

    test("native form submission uses the committed option value", async ({ page }) => {
      await openExample(page, bridge, 3);
      const input = page.getByRole("combobox", { name: "Shelf" });
      await input.fill("Pap");
      await expect(page.getByRole("option", { name: "Paper" })).toBeVisible();
      expect(await input.evaluate((node: HTMLInputElement) => node.checkValidity())).toBe(false);
      await input.press("ArrowDown");
      await input.press("Enter");
      await expect(input).toHaveValue("Paper");
      await page.getByRole("button", { name: "Save shelf" }).click();
      await expect(page.getByLabel("Submitted shelf")).toHaveText("paper");
    });
  });
}
