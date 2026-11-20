import { expect, test } from "@playwright/test";

for (const bridge of ["astro", "svelte"]) {
  test.describe(`${bridge} motion`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/migration-${bridge}/`);
      await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
    });

    test("reduced motion suppresses library effects without muting slotted content", async ({
      page,
    }) => {
      const circle = page.getByRole("progressbar", { name: "Checking updates" });
      const bar = page
        .getByRole("progressbar", { name: "Downloading updates" })
        .locator(".clay-linear-progress__bar");
      const arc = circle.locator(".clay-circular-progress__arc");
      const badge = page.getByText("99+", { exact: true });
      const skeleton = page.locator(".clay-skeleton");
      const buffer = page
        .getByRole("progressbar", { name: "Import progress" })
        .locator(".clay-linear-progress__buffer");
      const chevron = page.locator(".clay-accordion__chevron").first();

      await page.addStyleTag({
        content: `
          @keyframes consumer-feedback { to { opacity: 0.9; } }
          .clay-card h2 { animation: consumer-feedback 1s infinite alternate; transition: color 250ms; }
        `,
      });
      const heading = page.getByRole("heading", { name: "Activity" });
      await expect(heading).toHaveCSS("animation-name", "consumer-feedback");
      await expect(heading).toHaveCSS("transition-duration", "0.25s");

      for (const element of [circle, arc, bar, badge]) {
        await expect(element).toHaveCSS("animation-name", "none");
        await expect(element).toBeVisible();
      }
      const reducedWave = await skeleton.evaluate(
        (node) => getComputedStyle(node, "::after").animationName,
      );
      expect(reducedWave).toBe("none");
      await expect(buffer).toHaveCSS("transition-duration", "0s");
      await expect(chevron).toHaveCSS("transition-duration", "0s");

      await page.emulateMedia({ reducedMotion: "no-preference" });
      for (const element of [circle, arc, bar, badge]) {
        await expect(element).not.toHaveCSS("animation-name", "none");
      }
      const animatedWave = await skeleton.evaluate(
        (node) => getComputedStyle(node, "::after").animationName,
      );
      expect(animatedWave).not.toBe("none");
      await expect(buffer).not.toHaveCSS("transition-duration", "0s");
      await expect(chevron).not.toHaveCSS("transition-duration", "0s");
    });

    test("reduced motion preserves native control state without lift or press scaling", async ({
      page,
    }) => {
      const checkbox = page.getByRole("checkbox", { name: "Back up changes" });
      const radio = page.getByRole("radio", { name: "Basic" });
      const toggle = page.getByRole("switch", { name: "Alerts" });
      for (const control of [checkbox, radio, toggle]) {
        await control.hover();
        await expect(control).toHaveCSS("transform", "none");
        await page.mouse.down();
        await expect(control).toHaveCSS("transform", "none");
        await page.mouse.up();
      }
      await expect(checkbox).toBeChecked();
      await expect(radio).toBeChecked();
      await expect(toggle).not.toBeChecked();
    });

    test("hover still lifts and changes material depth without tweening shadows", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const button = page.getByRole("button", { name: "Show notice" });
      const shadow = await button.evaluate((node) => getComputedStyle(node).boxShadow);
      await expect(button).toHaveCSS("transition-property", /\btransform\b/);
      await expect(button).not.toHaveCSS("transition-property", /\b(?:box-shadow|all)\b/);

      await button.hover();
      await expect(button).not.toHaveCSS("transform", "none");
      await expect(button).not.toHaveCSS("box-shadow", shadow);
    });
  });
}
