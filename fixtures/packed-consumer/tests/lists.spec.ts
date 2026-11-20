import { expect, test } from "@playwright/test";

// The pages are the MCP examples written by check-mcp.mjs, unchanged.
for (const bridge of ["astro", "svelte"]) {
  test.describe(`${bridge} lists`, () => {
    test("a subheader names the list without counting as an item", async ({ page }) => {
      await page.goto(`/reference/${bridge}/List-1/`);
      const plans = page.getByRole("list", { name: "Plans" });
      await expect(plans).toBeVisible();
      await expect(plans.getByRole("listitem")).toHaveCount(3);
      await expect(page.getByText("Plans", { exact: true })).toBeVisible();
    });

    test("rows holding a ListItemButton drop their padding without disablePadding", async ({
      page,
    }) => {
      await page.goto(`/reference/${bridge}/ListItem-2/`);
      await page.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
      const row = page.getByRole("listitem").first();
      await expect(row).toHaveCSS("padding", "0px");
      const link = row.getByRole("link", { name: /Quarterly report/ });
      const text = await link.evaluate((node) => {
        const { left } = node.querySelector(".clay-list-item-text")!.getBoundingClientRect();
        return Math.round(left - node.closest("li")!.getBoundingClientRect().left);
      });
      expect(text).toBe(16); // the button's gutter, not gutter plus row padding
      await expect(row.getByRole("button", { name: "Delete Quarterly report" })).toBeVisible();
    });

    test("list icons are decorative by default", async ({ page }) => {
      await page.goto(`/reference/${bridge}/ListItemIcon-1/`);
      const icons = page.locator(".clay-list-item-icon");
      await expect(icons).toHaveCount(2);
      for (const icon of await icons.all())
        await expect(icon).toHaveAttribute("aria-hidden", "true");
      await expect(
        page.getByRole("list", { name: "Notifications" }).getByRole("listitem"),
      ).toHaveCount(2);
    });
  });
}
