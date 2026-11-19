import { expect, test } from "@playwright/test";

for (const framework of ["astro", "svelte"]) {
  test.describe(`${framework} migrated catalog`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/migration-${framework}/`);
      await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
      if (framework === "astro") await expect(page.locator("astro-island")).toHaveCount(0);
    });

    test("native inputs validate, submit and reset together", async ({ page }) => {
      const email = page.getByRole("textbox", { name: "Email" });
      const shelf = page.getByRole("combobox", { name: "Shelf" });
      const plan = page.getByRole("radiogroup", { name: "Plan" });
      const alerts = page.getByRole("switch", { name: "Alerts" });
      const slider = page.getByRole("slider", { name: "Volume" });
      const saved = page.locator("#saved");
      const save = page.getByRole("button", { name: "Save preferences" });
      await expect(shelf).toHaveValue("paper");
      await expect(plan.getByRole("radio", { name: "Pro" })).toBeChecked();
      await expect(alerts).toBeChecked();
      await expect(slider).toHaveValue("25");

      await email.fill("not-an-email");
      await save.click();
      await expect(saved).toBeEmpty();
      await email.fill("reader@example.test");
      await shelf.selectOption("ebook");
      await plan.getByRole("radio", { name: "Basic" }).check();
      await alerts.click();
      await slider.press("ArrowRight");
      await expect(slider).toHaveValue("50");
      await save.click();
      await expect(saved).toHaveText("mail=reader%40example.test&shelf=ebook&plan=basic&volume=50");

      await page.getByRole("button", { name: "Reset preferences" }).click();
      await expect(email).toHaveValue("");
      await expect(shelf).toHaveValue("paper");
      await expect(plan.getByRole("radio", { name: "Pro" })).toBeChecked();
      await expect(alerts).toBeChecked();
      await expect(slider).toHaveValue("25");
      // Visuals follow the reset too, not just the native value (ticks 0 and 25 are active).
      await expect
        .poll(() =>
          slider.evaluate((input: HTMLInputElement) => {
            const root = input.closest<HTMLElement>(".clay-slider")!;
            return [
              root.querySelector(".clay-slider__bubble")?.textContent?.trim(),
              root.style.getPropertyValue("--clay-slider-percent").trim(),
              root.querySelectorAll(".clay-slider__tick[data-active]").length,
            ];
          }),
        )
        .toEqual(["25", "25", 2]);
    });

    test("disclosure and compound tabs keep keyboard and accessible state in sync", async ({
      page,
    }) => {
      const disclosure = page.getByText("Native disclosure content");
      await expect(disclosure).toBeHidden();
      await page
        .locator("summary")
        .filter({ has: page.getByText("Details", { exact: true }) })
        .press("Enter");
      await expect(disclosure).toBeVisible();
      await page
        .locator("summary")
        .filter({ has: page.getByText("Locked details", { exact: true }) })
        .press("Enter");
      await expect(page.getByText("Unavailable disclosure content")).toBeHidden();

      const tabs = page.getByRole("tablist", { name: "Migration tabs" });
      await expect(page.getByRole("tabpanel", { name: "Overview" })).toBeVisible();
      await tabs.getByRole("tab", { name: "Overview" }).press("ArrowRight");
      await expect(tabs.getByRole("tab", { name: "Stats" })).toBeFocused();
      await expect(tabs.getByRole("tab", { name: "Stats" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(page.getByRole("tabpanel", { name: "Stats" })).toBeVisible();
      await expect(page.getByText("Overview panel")).toBeHidden();
      await expect(page.locator("#tab-selection")).toHaveText("number:2");
    });

    test("display widgets preserve semantics and visual state", async ({ page }) => {
      const activity = page.getByRole("article").filter({ hasText: "Activity" });
      await expect(activity.getByText("99+")).toBeVisible();
      await expect(activity.getByRole("progressbar", { name: "Import progress" })).toHaveAttribute(
        "aria-valuenow",
        "40",
      );
      const region = activity.getByRole("region", { name: "Results" });
      await expect(region.getByRole("cell", { name: "Ready" })).toBeVisible();
      const scrolled = await region.evaluate((node) => {
        const header = node.querySelector("th")!;
        const top = header.getBoundingClientRect().top;
        node.scrollTop = node.scrollHeight;
        return { distance: node.scrollTop, headerOffset: header.getBoundingClientRect().top - top };
      });
      expect(scrolled.distance).toBeGreaterThan(0);
      expect(Math.abs(scrolled.headerOffset)).toBeLessThan(1);
    });

    test("keyboard dismisses actions, tooltip, drawer and snackbar", async ({ page }) => {
      await page.getByRole("button", { name: "Draft", exact: true }).press("Delete");
      await expect(page.getByRole("button", { name: "Draft", exact: true })).toBeHidden();
      const alert = page.getByRole("alert");
      await alert.getByRole("button", { name: "Close", exact: true }).click();
      await expect(alert).toBeHidden();

      const trigger = page.getByRole("button", { name: "More info" });
      await trigger.focus();
      await expect(trigger).toHaveAccessibleDescription("Extra information");
      await expect(page.getByRole("tooltip")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("tooltip")).toBeHidden();

      const opener = page.getByRole("button", { name: "Open drawer" });
      await opener.focus();
      await page.keyboard.press("Enter");
      const drawer = page.getByRole("dialog", { name: "Settings drawer" });
      await expect(drawer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      await expect(opener).toBeFocused();

      await page.getByRole("button", { name: "Show notice" }).click();
      const notice = page.getByText("Preferences saved", { exact: true });
      await expect(notice).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(notice).toBeHidden();
    });
  });
}
