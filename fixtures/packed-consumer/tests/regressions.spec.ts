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

test("Astro detaches replaced overlays and keeps persisted ones across soft swaps", async ({
  page,
}) => {
  await page.goto("/nav/one/");
  const persisted = page.locator("#persisted-tip");
  await expect(persisted).toHaveAttribute("data-clay-tooltip-ready", "");
  const persistedElement = await persisted.elementHandle();

  for (let i = 0; i < 2; i++) {
    const tooltip = page.locator("#page-tip");
    await expect(tooltip).toHaveAttribute("data-clay-tooltip-ready", "");
    const oldTooltip = await tooltip.elementHandle();
    const oldSnackbar = await page.locator("#page-toast").elementHandle();

    await page.getByRole("link", { name: "Go to page two" }).click();
    await expect(page.getByRole("heading", { name: "Page two" })).toBeVisible();
    await expect
      .poll(() => oldTooltip.evaluate((node) => node.hasAttribute("data-clay-tooltip-ready")))
      .toBe(false);
    expect(
      await oldSnackbar.evaluate((node) => {
        node.removeAttribute("data-clay-open");
        node.dispatchEvent(Object.assign(new Event("command"), { command: "--clay-show" }));
        return node.hasAttribute("data-clay-open");
      }),
    ).toBe(false);
    expect(
      await persistedElement.evaluate((node) => node === document.querySelector("#persisted-tip")),
    ).toBe(true);
    await expect(persisted.getByRole("button")).toHaveAttribute(
      "aria-describedby",
      "persisted-tip-tip",
    );
    await expect(page.getByText("Persistent tip", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Go to page one" }).click();
    await expect(page.getByRole("heading", { name: "Page one" })).toBeVisible();
  }
  await expect(page.locator("#page-tip")).toHaveAttribute("data-clay-tooltip-ready", "");
});

test("Svelte checkbox preserves controlled mixed state and native change semantics", async ({
  page,
}) => {
  await load(page, "/regressions-svelte/");
  const checkbox = page.getByLabel("Controlled mixed");
  await expect(checkbox).toBeChecked({ indeterminate: true });
  const changes = page.getByLabel("User checkbox changes");

  const toggle = page.getByRole("button", { name: "Toggle mixed" });
  await toggle.click();
  await expect(checkbox).not.toBeChecked({ indeterminate: true });
  await toggle.click();
  await expect(checkbox).toBeChecked({ indeterminate: true });
  await expect(changes).toHaveText("0");
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await expect(checkbox).toBeChecked({ indeterminate: true });
  await page.getByRole("button", { name: "Reset mixed form" }).click();
  await expect(checkbox).not.toBeChecked();
  await expect(checkbox).toBeChecked({ indeterminate: true });
  await expect(changes).toHaveText("1");
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

  test(`${bridge}: a dismissible Dialog's X requests close, and the owner can reject it`, async ({
    page,
  }) => {
    await load(page, `/regressions-${bridge}/`);
    await page.locator("#open-dismissible").click();
    const dialog = page.getByRole("dialog", { name: "Dismissible dialog" });
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole("button", { name: "Dismiss" });

    await close.click();
    await expect(page.locator("#dismiss-requests")).toHaveText("closeButton");
    await expect(dialog).toBeVisible();

    await close.click();
    await expect(page.locator("#dismiss-requests")).toHaveText("closeButton,closeButton");
    await expect(dialog).toBeHidden();
  });

  test(`${bridge}: Chip forwards aria-pressed to button, loading links keep opacity, ButtonGroup handles legend, empty DataTable has colspan 1`, async ({
    page,
  }) => {
    await load(page, `/regressions-${bridge}/`);
    const checks = page.getByRole("region", { name: "Consistency checks" });
    const chipButton = checks.getByRole("button", { name: "Pinned filter" });
    await expect(chipButton).toHaveAttribute("aria-pressed", "true");
    await expect(chipButton.locator("..")).not.toHaveAttribute("aria-pressed", "true");

    const loadingLink = checks.locator("#loading-link");
    await expect(loadingLink).toHaveAttribute("aria-disabled", "true");
    expect(await loadingLink.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeCloseTo(
      0.85,
      2,
    );

    const groupButtons = checks.locator("#legend-group .clay-button");
    expect(
      await groupButtons
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius)),
    ).toBeGreaterThan(0);
    expect(
      await groupButtons
        .nth(1)
        .evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius)),
    ).toBe(0);

    const emptyCell = checks.getByRole("region", { name: "Empty inferred" }).locator("td");
    await expect(emptyCell).toHaveAttribute("colspan", "1");
  });
}

test("Svelte enforces controlled rejection and hydrates CSR defaultChecked", async ({ page }) => {
  await load(page, "/regressions-svelte/");
  const checks = page.getByRole("region", { name: "Consistency checks" });

  const lockedCheckbox = checks.getByLabel("Locked unchecked");
  await expect(lockedCheckbox).not.toBeChecked();
  await lockedCheckbox.click();
  await expect(lockedCheckbox).not.toBeChecked();

  const lockedText = checks.getByRole("textbox", { name: "Locked text" });
  await expect(lockedText).toHaveValue("locked");
  await lockedText.fill("changed");
  await expect(lockedText).toHaveValue("locked");

  await checks.locator("#mount-csr-default").click();
  await expect(checks.getByLabel("CSR default checked")).toBeChecked();
});

test("Astro form reset honors event.preventDefault()", async ({ page }) => {
  await load(page, "/regressions-astro/");
  const slider = page.getByRole("slider", { name: "Canceled reset slider" });
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("50");
  await page.getByRole("button", { name: "Blocked reset" }).click();
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 30)));
  await expect
    .poll(() => sliderState(slider))
    .toEqual({
      value: "50",
      bubble: "50",
      fill: "50",
      activeTicks: 0,
    });
});
