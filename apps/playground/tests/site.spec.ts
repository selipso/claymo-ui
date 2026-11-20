import { expect, test, type Page } from "@playwright/test";
import { listComponents } from "@claymo/core/reference";
import { guideHref, guides } from "../src/lib/nav";

const sidebar = (page: Page) => page.locator("[data-site-nav]");

test("sidebar persists across navigation and follows the current page", async ({ page }) => {
  await page.goto("/");
  await expect(sidebar(page).getByRole("link", { name: "Introduction" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await sidebar(page).evaluate((nav) => nav.setAttribute("data-test-marker", ""));

  await sidebar(page).getByRole("link", { name: "Theming" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Theming/);
  await expect(sidebar(page)).toHaveAttribute("data-test-marker", "");
  await expect(sidebar(page).getByRole("link", { name: "Theming" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(sidebar(page).getByRole("link", { name: "Introduction" })).not.toHaveAttribute(
    "aria-current",
  );

  await sidebar(page).getByRole("link", { name: "Gallery" }).click();
  await expect(page.getByRole("heading", { name: "Component gallery" })).toBeVisible();
  await expect(sidebar(page)).toHaveAttribute("data-test-marker", "");
});

test("theme choice applies across pages, reloads and example frames", async ({ page }) => {
  await page.goto("/");
  await sidebar(page).getByLabel("Palette").selectOption("orbit");
  await sidebar(page).getByLabel("Mode").selectOption("dark");

  await sidebar(page).getByRole("link", { name: "Button", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Button");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(html).toHaveAttribute("data-palette", "orbit");
  const frame = page.frameLocator('iframe[src="/examples/astro/button/"]');
  await expect(frame.locator("html")).toHaveAttribute("data-palette", "orbit");

  // Example frames follow a change made after they loaded.
  await sidebar(page).getByLabel("Mode").selectOption("light");
  await expect(frame.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(sidebar(page).getByLabel("Palette")).toHaveValue("orbit");
});

test("the app demo's Dark switch and the sidebar share one theme", async ({ page }) => {
  await page.goto("/demo/");
  await page.getByRole("switch").first().check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(sidebar(page).getByLabel("Mode")).toHaveValue("dark");
});

test("system changes and changes from another tab keep the demo controls in sync", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/demo/");
  const dark = page.getByRole("switch", { name: "Dark" });
  await expect(dark).not.toBeChecked();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(dark).toBeChecked();

  const settings = await context.newPage();
  await settings.goto("/");
  await sidebar(settings).getByLabel("Mode").selectOption("light");
  await sidebar(settings).getByLabel("Palette").selectOption("orbit");
  await expect(dark).not.toBeChecked();
  await expect(sidebar(page).getByLabel("Mode")).toHaveValue("light");
  await expect(sidebar(page).getByLabel("Palette")).toHaveValue("orbit");
});

test("every guide renders with links that stay inside the site", async ({ page }) => {
  for (const { slug, label } of guides) {
    await page.goto(guideHref(slug));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.locator("main a[href$='.md']"),
      `${label} links to a raw .md file`,
    ).toHaveCount(0);
  }
});

test("component pages run the Astro and Svelte examples live", async ({ page }) => {
  await page.goto("/components/tabs/");
  const astro = page.frameLocator('iframe[src="/examples/astro/tabs/"]');
  await astro.getByRole("tab", { name: "Security" }).click();
  await expect(astro.locator("#account-selected")).toHaveText("security");

  await page.getByRole("tab", { name: "Svelte" }).click();
  const svelte = page.frameLocator('iframe[src="/examples/svelte/tabs/"]');
  // The lazy iframe shows SSR markup before the island has attached its click handlers.
  await svelte.locator("astro-island:not([ssr])").getByRole("tab", { name: "Security" }).click();
  await expect(svelte.getByText("Selected tab: security. User changes: 1.")).toBeVisible();
});

test("the component overview links every component", async ({ page }) => {
  await page.goto("/components/");
  await expect(page.locator("main .component-list a")).toHaveCount(listComponents("astro").length);
});

test.describe("narrow screens", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the menu opens, then closes after navigating", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menu" });
    await expect(sidebar(page).getByRole("link", { name: "Theming" })).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await sidebar(page).getByRole("link", { name: "Theming" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Theming/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar(page).getByRole("link", { name: "Theming" })).toBeHidden();
  });
});
