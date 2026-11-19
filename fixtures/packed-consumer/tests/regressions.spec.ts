import { expect, test, type Locator, type Page } from "@playwright/test";

async function load(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
}

/** Native value plus everything the slider paints from it: bubble, fill and active ticks. */
const sliderState = (slider: Locator) =>
  slider.evaluate((input: HTMLInputElement) => {
    const root = input.closest<HTMLElement>(".clay-slider")!;
    return {
      value: input.value,
      bubble: root.querySelector(".clay-slider__bubble")?.textContent?.trim(),
      fill: root.style.getPropertyValue("--clay-slider-percent").trim(),
      activeTicks: root.querySelectorAll(".clay-slider__tick[data-active]").length,
    };
  });

test("Astro controllers keep working after a ClientRouter navigation", async ({ page }) => {
  await page.goto("/nav/one/");
  await page.evaluate(() => ((window as Window & { softNav?: boolean }).softNav = true));
  await page.getByRole("link", { name: "Go to page two" }).click();
  await expect(page.getByRole("heading", { name: "Page two" })).toBeVisible();
  // Same window: the page was swapped by the router, not reloaded.
  expect(await page.evaluate(() => (window as Window & { softNav?: boolean }).softNav)).toBe(true);

  await page.getByRole("tab", { name: "Bravo" }).click();
  await expect(page.getByText("Bravo panel")).toBeVisible();
  await expect(page.getByText("Alpha panel")).toBeHidden();

  const mixed = page.getByLabel("Mixed");
  await expect.poll(() => mixed.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true);

  await page.locator("summary").click();
  await expect(page.getByText("Locked content")).toBeHidden();

  const slider = page.getByRole("slider", { name: "Level" });
  await slider.press("ArrowRight");
  await page.getByRole("button", { name: "Reset level" }).click();
  await expect
    .poll(() => sliderState(slider))
    .toEqual({
      value: "20",
      bubble: "20",
      fill: "20",
      activeTicks: 0,
    });

  // A backdrop click only closes when the dialog controller is attached.
  await page.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog", { name: "Navigation dialog" });
  await expect(dialog).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(dialog).toBeHidden();
});

test.describe("Astro overlays share Escape correctly", () => {
  test.beforeEach(({ page }) => load(page, "/regressions-astro/"));

  test("a pinned tooltip outside a modal leaves Escape to the modal", async ({ page }) => {
    await expect(page.getByText("Pinned tip")).toBeVisible();
    await page.locator("#open-plain").focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Plain dialog" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("a tooltip inside a modal takes the first Escape without notifying the dialog", async ({
    page,
  }) => {
    await page.locator("#open-tip").focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Tip dialog" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Inner action" }).focus();
    await expect(page.getByText("Inner tip")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("Inner tip")).toBeHidden();
    await expect(dialog).toBeVisible();
    await expect(page.locator("#dialog-requests")).toHaveText("0");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("#dialog-requests")).toHaveText("1:escapeKeyDown");
  });
});

test("repeated Astro tablists with the same label stay independent", async ({ page }) => {
  await load(page, "/regressions-astro/");
  const first = page.getByRole("region", { name: "First copy" });
  const second = page.getByRole("region", { name: "Second copy" });
  await second.getByRole("tab", { name: "Bravo" }).click();
  await expect(second.getByRole("tabpanel")).toHaveText("Bravo body");
  await expect(first.getByRole("tabpanel")).toHaveText("Alpha body");
  await expect(first.getByRole("tab", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");
});

test("composed Astro tabs keep the selection marked on their children", async ({ page }) => {
  await load(page, "/regressions-astro/");
  const tabs = page.getByRole("tablist", { name: "Composed" });
  await expect(tabs.getByRole("tab", { name: "Second" })).toHaveAttribute("aria-selected", "true");
  await expect(tabs.getByRole("tab", { name: "Second" })).toHaveAttribute("tabindex", "0");
  await expect(page.getByText("Second panel")).toBeVisible();
  await expect(page.getByText("First panel")).toBeHidden();
});

test("a reopened Svelte Dialog stays open and reports no user close", async ({ page }) => {
  await load(page, "/regressions-svelte/");
  await page.locator("#open-reopen").click();
  const dialog = page.getByRole("dialog", { name: "Reopen dialog" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Reopen" }).click();
  // Let the queued native `close` task run before asserting.
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 50)));
  await expect(dialog).toBeVisible();
  await expect(page.locator("#close-reasons")).toHaveText("");
});

for (const bridge of ["astro", "svelte"]) {
  test(`${bridge}: a disabled link Button ignores clicks`, async ({ page }) => {
    await load(page, `/regressions-${bridge}/`);
    const link = page.getByRole("link", { name: "Disabled link" });
    await expect(link).toHaveAttribute("aria-disabled", "true");
    await expect(link).not.toHaveAttribute("href");
    await link.click({ force: true });
    await expect(page.locator("#link-clicks")).toHaveText("none");
  });
}
