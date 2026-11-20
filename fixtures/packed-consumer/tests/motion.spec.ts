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
      const pushKey = page.getByRole("button", { name: "Push key" });
      for (const control of [checkbox, radio, toggle, pushKey]) {
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

    test("default motion is short, never overshoots, and eases the shadow with the surface", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const button = page.getByRole("button", { name: "Show notice" });
      await expect(button).toHaveCSS("transition-duration", /^0\.15s/);
      await expect(button).toHaveCSS(
        "transition-timing-function",
        /^cubic-bezier\(0\.2, 0, 0, 1\)/,
      );
      await expect(button).toHaveCSS("transition-property", /\bbox-shadow\b/);
      const shadow = await button.evaluate((node) => getComputedStyle(node).boxShadow);

      await button.hover();
      await expect(button).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -1)");
      await expect(button).not.toHaveCSS("box-shadow", shadow);
      await page.mouse.down();
      await expect(button).toHaveCSS("transform", "matrix(0.98, 0, 0, 0.98, 0, 1)");
      await page.mouse.up();

      // Both bridges animate the snackbar with the same CSS (no framework transition).
      await expect(page.locator(".clay-snackbar__wrapper").first()).toHaveCSS(
        "transition-duration",
        /^0\.2s/,
      );
    });

    test("presets apply through the motion prop, a class or the attribute; the nearest wins", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const key = page.getByRole("button", { name: "Push key" });
      await expect(key).toHaveAttribute("data-motion", "lift-push");
      await key.hover();
      await expect(key).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -3)");
      await page.mouse.down();
      await expect(key).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 2)");
      // Pushed in: the drop shadow is gone and the inset shading is 1.6x the 6px depth.
      await expect
        .poll(() => key.evaluate((node) => getComputedStyle(node).boxShadow))
        .toMatch(/0px 0px 0px 0px[\s\S]*9\.6px 9\.6px 14\.4px/);
      await page.mouse.up();

      const lifted = page.getByRole("switch", { name: "Lifted switch" });
      await expect(lifted).toHaveAttribute("data-motion", "lift");
      await lifted.hover();
      await expect(lifted).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -2)");

      const grow = page.getByRole("button", { name: "Grow" });
      await grow.hover();
      await expect(grow).toHaveCSS("transform", "matrix(1.02, 0, 0, 1.02, 0, 0)");

      // `none` inside a `squish` region: no duration and none of squish's distances.
      const still = page.getByRole("button", { name: "Still" });
      await expect(still).toHaveCSS("transition-duration", /^0s/);
      await still.hover();
      await page.mouse.down();
      await expect(still).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
      await page.mouse.up();
    });
  });
}
