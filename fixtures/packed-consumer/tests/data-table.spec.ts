import { expect, test, type Page } from "@playwright/test";

// The pages are the MCP examples written by check-mcp.mjs, unchanged.
async function open(page: Page, bridge: string, example: number) {
  await page.goto(`/reference/${bridge}/DataTable-${example}/`);
  await page.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
}

const firstColumn = (page: Page) =>
  page.locator("tbody tr[data-id]:visible > :is(th, td):first-child");

for (const bridge of ["astro", "svelte"]) {
  test.describe(`${bridge} DataTable`, () => {
    test("formats values and renders custom cells", async ({ page }) => {
      await open(page, bridge, 2);
      const grace = page.getByRole("row", { name: /A-1002/ });
      await expect(grace.getByRole("rowheader")).toHaveText("A-1002");
      await expect(grace.getByRole("cell").nth(1)).toHaveText("$42.00");
      await expect(grace.getByRole("cell").nth(2)).toHaveText("No");
      await expect(grace.locator(".clay-chip")).toHaveText("Pending");
      await expect(
        page
          .getByRole("row", { name: /A-1003/ })
          .getByRole("cell")
          .nth(1),
      ).toHaveText("None");
    });

    test("sorts, searches from the first page, and paginates", async ({ page }) => {
      await open(page, bridge, 3);
      const region = page.getByRole("region", { name: "Sites" });
      const visits = region.getByRole("columnheader", { name: "Visits" });
      const site = region.getByRole("columnheader", { name: "Site" });
      const status = page.locator(".clay-data-table__displayed");
      await expect(visits).toHaveAttribute("aria-sort", "descending");
      await expect(firstColumn(page)).toHaveText(["Inlet", "Fjord", "Cedar", "Kestrel", "Harbor"]);
      await expect(status).toHaveText("1–5 of 12");

      await site.getByRole("button").click();
      await expect(site).toHaveAttribute("aria-sort", "ascending");
      await expect(visits).not.toHaveAttribute("aria-sort");
      await expect(firstColumn(page)).toHaveText(["Atlas", "Birch", "Cedar", "Delta", "Ember"]);
      await site.getByRole("button").click();
      await expect(site).toHaveAttribute("aria-sort", "descending");
      await site.getByRole("button").click();
      await expect(site).not.toHaveAttribute("aria-sort");

      const next = page.getByRole("button", { name: "Go to next page" });
      const previous = page.getByRole("button", { name: "Go to previous page" });
      await expect(previous).toBeDisabled();
      await next.click();
      await next.click();
      await expect(status).toHaveText("11–12 of 12");
      await expect(next).toBeDisabled();

      await page.getByRole("searchbox", { name: "Search" }).fill("coast  B");
      await expect(status).toHaveText("1–3 of 3");
      await expect(firstColumn(page)).toHaveText(["Birch", "Ember", "Harbor"]);
      await page.getByRole("searchbox", { name: "Search" }).fill("zzz");
      await expect(page.getByText("No results found.")).toBeVisible();
      await expect(status).toHaveText("0–0 of 0");

      await page.getByRole("searchbox", { name: "Search" }).fill("");
      await page.getByLabel("Rows per page:").selectOption("10");
      await expect(status).toHaveText("1–10 of 12");
    });

    test("rows open details by click and from the keyboard", async ({ page }) => {
      await open(page, bridge, 4);
      const dialog = page.getByRole("dialog");
      await page.getByRole("cell", { name: "K. Osei" }).click();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("heading")).toHaveText("Reef survey");
      await expect(dialog).toContainText("A season of counts");
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();

      await page.getByRole("button", { name: "Kelp forests" }).focus();
      await page.keyboard.press("Enter");
      await expect(dialog.getByRole("heading")).toHaveText("Kelp forests");
    });

    test("checkbox selection tracks rows, select all and the toolbar action", async ({ page }) => {
      await open(page, bridge, 5);
      const all = page.getByRole("checkbox", { name: "Select all rows" });
      const remove = page.getByRole("button", { name: "Delete selected" });
      const count = page.locator(".clay-data-table__selected");
      await expect(remove).toBeDisabled();

      await page.getByRole("checkbox", { name: "Select logo.svg" }).check();
      await expect(count).toHaveText("1 selected");
      await expect(all).toHaveJSProperty("indeterminate", true);
      await expect(page.getByRole("row", { name: /logo\.svg/ })).toHaveAttribute(
        "data-selected",
        "",
      );
      await expect(remove).toBeEnabled();

      await all.check();
      await expect(count).toHaveText("3 selected");
      await expect(all).toHaveJSProperty("indeterminate", false);
      await all.uncheck();
      await expect(count).toHaveText("");
      await expect(remove).toBeDisabled();
    });

    test("an action column edits a row in a dialog", async ({ page }) => {
      await open(page, bridge, 6);
      await page.getByRole("button", { name: "Edit Grace Hopper" }).click();
      const dialog = page.getByRole("dialog", { name: "Edit contact" });
      await expect(dialog.getByLabel("Name")).toHaveValue("Grace Hopper");
      await dialog.getByLabel("Email").fill("grace@navy.mil");
      await dialog.getByRole("button", { name: "Save" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByRole("row", { name: /Grace Hopper/ })).toContainText("grace@navy.mil");
    });
  });
}

test("astro shows loading and custom empty states", async ({ page }) => {
  await open(page, "astro", 7);
  const loading = page.getByRole("region", { name: "Reports, loading" });
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("progressbar", { name: "Loading…" })).toBeVisible();
  await expect(loading).toContainText("Loading…");
  await expect(page.getByRole("region", { name: "Reports", exact: true })).toContainText(
    "No reports yet.",
  );
});

test("svelte server mode reports models and shows the server's page", async ({ page }) => {
  await open(page, "svelte", 7);
  const status = page.locator(".clay-data-table__displayed");
  await expect(status).toHaveText("1–5 of 23");
  await page.getByRole("button", { name: "Go to next page" }).click();
  await expect(status).toHaveText("6–10 of 23");
  await expect(firstColumn(page)).toHaveText([
    "Volume 6",
    "Volume 7",
    "Volume 8",
    "Volume 9",
    "Volume 10",
  ]);
  await page.getByRole("searchbox", { name: "Search" }).fill("volume 2");
  await expect(status).toHaveText("1–5 of 5");
  await expect(firstColumn(page).first()).toHaveText("Volume 2");
});
