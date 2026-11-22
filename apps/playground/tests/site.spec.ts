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

test("theme and motion choices apply across pages, reloads and example frames", async ({
  page,
}) => {
  await page.goto("/");
  await sidebar(page).getByLabel("Palette").selectOption("orbit");
  await sidebar(page).getByLabel("Mode").selectOption("dark");
  await sidebar(page).getByLabel("Motion").selectOption("lift");

  await sidebar(page).getByRole("link", { name: "Button", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Button");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(html).toHaveAttribute("data-palette", "orbit");
  await expect(html).toHaveAttribute("data-motion", "lift");
  const frame = page.frameLocator('iframe[src="/examples/astro/button-1/"]');
  await expect(frame.locator("html")).toHaveAttribute("data-palette", "orbit");
  await expect(frame.locator("html")).toHaveAttribute("data-motion", "lift");

  // Example frames follow a change made after they loaded.
  await sidebar(page).getByLabel("Mode").selectOption("light");
  await expect(frame.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(sidebar(page).getByLabel("Palette")).toHaveValue("orbit");
  await expect(sidebar(page).getByLabel("Motion")).toHaveValue("lift");

  // The default removes the attribute instead of storing a redundant preset.
  await sidebar(page).getByLabel("Motion").selectOption("subtle");
  await expect(html).not.toHaveAttribute("data-motion");
});

test("the app demo's Dark switch and the sidebar share one theme", async ({ page }) => {
  await page.goto("/demo/");
  // This Svelte island renders the switch before its browser handlers are attached.
  const hydratedDemo = page.locator("astro-island:not([ssr])");
  await hydratedDemo.getByRole("switch", { name: "Dark" }).check();
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

test("component pages run the Astro, Svelte and Solid examples live", async ({ page }) => {
  await page.goto("/components/tabs/");
  const astro = page.frameLocator('iframe[src="/examples/astro/tabs-1/"]');
  await astro.getByRole("tab", { name: "Security" }).click();
  await expect(astro.locator("#account-selected")).toHaveText("security");

  await page.getByRole("tab", { name: "Svelte" }).click();
  const svelte = page.frameLocator('iframe[src="/examples/svelte/tabs-1/"]');
  // The lazy iframe shows SSR markup before the island has attached its click handlers.
  await svelte.locator("astro-island:not([ssr])").getByRole("tab", { name: "Security" }).click();
  await expect(svelte.getByText("Selected tab: security. User changes: 1.")).toBeVisible();

  const frameworks = page.getByRole("tablist", { name: "Framework" });
  await frameworks.getByRole("tab", { name: "Svelte" }).press("ArrowRight");
  await expect(frameworks.getByRole("tab", { name: "Solid", selected: true })).toBeFocused();
  const panel = page.getByRole("tabpanel", { name: "Solid" });
  await expect(panel.locator("pre").first()).toContainText("export default function Example()");
  const solid = panel.frameLocator('iframe[src="/examples/solid/tabs-1/"]');
  await solid.getByRole("tab", { name: "Profile" }).press("ArrowRight");
  await expect(solid.getByRole("tab", { name: "Security", selected: true })).toBeFocused();
  await expect(solid.getByText("Review sign-in options.")).toBeVisible();
  await expect(solid.locator("output")).toHaveText("1");
  await solid.getByRole("tab", { name: "Profile" }).click();
  await solid.getByRole("button", { name: "Go to security" }).click();
  await expect(solid.getByRole("tab", { name: "Security", selected: true })).toBeVisible();
  await expect(solid.locator("output")).toHaveText("2");
});

test("the component overview links every component", async ({ page }) => {
  await page.goto("/components/");
  await expect(page.locator("main .component-list a")).toHaveCount(listComponents("solid").length);
});

test("Solid app demo handles profile interactions and remounts after Astro navigation", async ({
  page,
}) => {
  await page.goto("/demo/");
  const switcher = page.getByRole("navigation", { name: "Showcase framework" });
  await switcher.getByRole("link", { name: "Solid" }).click();
  await expect(page).toHaveURL(/\/demo\/solid\/$/);
  await expect(switcher.getByRole("link", { name: "Solid" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(sidebar(page).getByRole("link", { name: "App demo" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(page.getByRole("heading", { name: "Collection demo" })).toBeVisible();

  const trade = page.getByRole("button", { name: "Trade", exact: true });
  await expect(page.getByRole("row", { name: /Glass Compass/ })).toHaveCount(0);
  await trade.click();
  await expect(trade).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("row", { name: /Glass Compass/ })).toBeVisible();
  await page.getByRole("button", { name: "Remove Trade" }).click();
  await expect(trade).toHaveCount(0);
  await page.getByRole("button", { name: "Restore filters" }).click();
  await expect(trade).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("switch", { name: "Dark" }).check();
  await expect(sidebar(page).getByLabel("Mode")).toHaveValue("dark");
  await page.getByRole("tab", { name: "Settings" }).click();
  const notifications = page.getByRole("checkbox", { name: "All notifications" });
  await expect(notifications).toHaveJSProperty("indeterminate", true);
  await notifications.click();
  await expect(page.getByRole("checkbox", { name: "Reminders" })).toBeChecked();
  const email = page.getByRole("textbox", { name: /Email/ });
  const save = page.getByRole("button", { name: "Save changes" });
  await email.fill("not-an-email");
  await save.click();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await email.fill("new@example.com");
  await save.click();
  await expect(page.getByRole("status")).toContainText("Settings saved");

  const reset = page.getByRole("button", { name: "Reset sample data" });
  await reset.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Reset sample data?" });
  await expect(dialog).toBeVisible();
  await dialog.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(reset).toBeFocused();

  await sidebar(page).getByRole("link", { name: "Theming" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Theming/);
  await page.goBack();
  await expect(page.getByRole("tab", { name: "Dashboard", selected: true })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Dark" })).toBeChecked();
  await expect(page.getByRole("heading", { name: "Collection demo" })).toHaveCount(1);
});

test("Solid gallery previews respond to typing, keyboard selection, and table controls", async ({
  page,
}) => {
  await page.goto("/gallery/");
  await page
    .getByRole("navigation", { name: "Showcase framework" })
    .getByRole("link", { name: "Solid" })
    .click();
  await expect(page).toHaveURL(/\/gallery\/solid\/$/);
  await expect(page.getByRole("heading", { name: "Component gallery" })).toBeVisible();
  await page.getByRole("textbox", { name: "Outlined", exact: true }).fill("Solid input");
  await expect(page.getByText("Typed value: Solid input")).toBeVisible();
  const shelves = page.getByRole("combobox", { name: "Shelves" });
  await shelves.fill("wish");
  await shelves.press("ArrowDown");
  await shelves.press("Enter");
  await expect(page.getByRole("button", { name: "Remove Wishlist" })).toBeVisible();

  const table = page.getByRole("region", { name: "DataTable", exact: true });
  await expect(table.getByRole("row", { name: /Lantern Moth/ })).toHaveCount(0);
  await table.getByRole("button", { name: "Go to next page" }).click();
  await expect(table.getByRole("row", { name: /Lantern Moth/ })).toBeVisible();
  await table.getByLabel("Search", { exact: true }).fill("Ember");
  await expect(table.getByRole("row", { name: /Ember Sprite/ })).toBeVisible();
  await expect(table.getByRole("row", { name: /Lantern Moth/ })).toHaveCount(0);
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

  test("the Solid demo drawer opens and closes with keyboard controls", async ({ page }) => {
    await page.goto("/demo/solid/");
    const open = page.getByRole("button", { name: "Open navigation" });
    await open.press("Enter");
    const drawer = page.getByRole("dialog", { name: "Main navigation" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("button", { name: /Settings/ }).click();
    await expect(drawer).toBeHidden();
    await expect(open).toBeFocused();
    await expect(page.getByRole("tab", { name: "Settings", selected: true })).toBeVisible();
  });
});
