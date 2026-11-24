import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const bridges = ["astro", "svelte"] as const;

async function load(page: Page, bridge: string) {
  await page.goto(`/${bridge}/`);
  // Islands drop `ssr` once hydrated; Astro pages have none.
  await page.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
}

const focusedInDialog = (page: Page) =>
  page.evaluate(() => !!document.activeElement?.closest("dialog[open]"));

test("a static Astro page ships no JavaScript and still renders clay", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(request.url());
  });
  await page.goto("/static/");
  expect(scripts).toEqual([]);
  await expect(page.locator("script, astro-island")).toHaveCount(0);
  const paper = page.locator(".clay-paper");
  expect(await paper.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
  await expect(page.locator(".clay-button").first()).toHaveAttribute("data-variant", "contained");
});

test("component CSS ships once; the Svelte bridge carries no styles", async () => {
  const assets = "dist/_astro";
  const files = (await readdir(assets)).filter((file) => file.endsWith(".css"));
  const css = await Promise.all(files.map((file) => readFile(path.join(assets, file), "utf8")));
  const html = await Promise.all(
    ["static", "astro", "svelte"].map((p) => readFile(`dist/${p}/index.html`, "utf8")),
  );
  const all = [...css, ...html].join("\n");
  // Rule starts only (minified: preceded by "}" or file start), not descendant selectors.
  expect(all.match(/(?:^|\})\.clay-button\{/gm)).toHaveLength(1);
  expect(all.match(/(?:^|\})\.clay-tab\{/gm)).toHaveLength(1);

  const bridge = "node_modules/@claymo/svelte/dist";
  for (const file of (await readdir(bridge)).filter((f) => f.endsWith(".svelte"))) {
    expect(await readFile(path.join(bridge, file), "utf8"), file).not.toContain("<style");
  }
});

test("both bridges render the same DOM and pixels for the same props", async ({ page }) => {
  const snapshot = async (bridge: string) => {
    await load(page, bridge);
    const dom = await page.locator("#parity").evaluate((root) => {
      // Per-instance IDs and the Astro-only controller hooks differ by design.
      const ids = [
        "id",
        "aria-controls",
        "aria-labelledby",
        "data-clay-tabs",
        "data-clay-selected",
      ];
      const walk = (el: Element): unknown => [
        el.tagName,
        [...el.attributes]
          .filter((a) => !ids.includes(a.name))
          .map((a) => `${a.name}=${a.value}`)
          .sort(),
        // Rendered UI only: Svelte hydration comments and Astro's colocated <script> are delivery details.
        [...el.childNodes]
          .filter((n) => n.nodeType === 3 || (n.nodeType === 1 && n.nodeName !== "SCRIPT"))
          .map((n) => (n.nodeType === 1 ? walk(n as Element) : n.textContent!.trim()))
          .filter((n) => n !== ""),
      ];
      return walk(root);
    });
    return { dom, png: await page.locator("#parity").screenshot() };
  };
  const astro = await snapshot("astro");
  const svelte = await snapshot("svelte");
  expect(svelte.dom).toEqual(astro.dom);
  expect(svelte.png.equals(astro.png)).toBe(true);
});

for (const bridge of bridges) {
  test.describe(`${bridge} bridge`, () => {
    test("tablists get distinct ids and wire tabs to panels", async ({ page }) => {
      await load(page, bridge);
      const ids = await page.$$eval("[id]", (els) => els.map((el) => el.id));
      expect(new Set(ids).size).toBe(ids.length);
      for (const tab of await page.getByRole("tab").all()) {
        const panel = page.locator(`#${await tab.getAttribute("aria-controls")}`);
        await expect(panel).toHaveAttribute("aria-labelledby", (await tab.getAttribute("id"))!);
      }
    });

    test("keyboard moves and activates tabs, skipping disabled ones", async ({ page }) => {
      await load(page, bridge);
      const account = page.getByRole("tablist", { name: "Account" });
      const selected = () => account.locator('[aria-selected="true"]');
      await account.getByRole("tab", { name: "Profile" }).focus();
      await page.keyboard.press("ArrowRight");
      await expect(selected()).toHaveText("Security");
      await expect(selected()).toBeFocused();
      await expect(page.getByText("Security panel")).toBeVisible();
      await expect(page.getByText("Profile panel")).toBeHidden();
      await page.keyboard.press("ArrowRight");
      await expect(selected()).toHaveText("Billing");
      await page.keyboard.press("ArrowRight");
      await expect(selected()).toHaveText("Profile");
      await page.keyboard.press("End");
      await expect(selected()).toHaveText("Billing");
      await page.keyboard.press("Home");
      await expect(selected()).toHaveText("Profile");
      await expect(account.locator('[tabindex="0"]')).toHaveCount(1);
      // Security, Billing, Profile (wrap), Billing (End), Profile (Home).
      await expect(page.locator("#tab-changes")).toHaveText("5");
    });

    test("a labeled checkbox submits with its form", async ({ page }) => {
      await load(page, bridge);
      await page.getByText("Accept terms").click();
      await expect(page.getByLabel("Accept terms")).toBeChecked();
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page).toHaveURL(/[?&]terms=yes/);
    });

    test("form reset restores checked and indeterminate state", async ({ page }) => {
      await load(page, bridge);
      const mixed = page.getByLabel("Mixed", { exact: true });
      const isMixed = () => mixed.evaluate((el: HTMLInputElement) => el.indeterminate);
      expect(await isMixed()).toBe(true);
      await page.getByText("Accept terms").click();
      await mixed.click();
      expect(await isMixed()).toBe(false);
      await page.getByRole("button", { name: "Reset" }).click();
      await expect(page.getByLabel("Accept terms")).not.toBeChecked();
      if (bridge === "astro") await expect.poll(isMixed).toBe(true);
    });

    test("a parent can reject close requests without losing modal focus", async ({ page }) => {
      await load(page, bridge);
      const opener = page.locator("#open");
      const dialog = page.getByRole("dialog", { name: "Locked dialog" });
      // Keyboard activation: WebKit does not focus buttons on click, so there is no opener to restore.
      await opener.focus();
      await page.keyboard.press("Enter");
      await expect(dialog).toBeVisible();
      expect(await focusedInDialog(page)).toBe(true);

      await page.keyboard.press("Escape");
      await expect(page.locator("#rejections")).toContainText("escapeKeyDown");
      await expect(dialog).toBeVisible();
      expect(await focusedInDialog(page)).toBe(true);

      await page.mouse.click(4, 4);
      await expect(page.locator("#rejections")).toContainText("backdropClick");
      await expect(dialog).toBeVisible();

      await dialog.getByRole("button", { name: "Close" }).click();
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
    });
  });
}

test.describe("svelte bridge only", () => {
  test("SSR ids survive hydration and islands do not collide", async ({ page, request }) => {
    const html = await (await request.get("/svelte/")).text();
    await load(page, "svelte");
    const ssr = await page.evaluate(
      (source) =>
        [
          ...new DOMParser().parseFromString(source, "text/html").querySelectorAll("[role=tab]"),
        ].map((tab) => tab.id),
      html,
    );
    const live = await page.$$eval("[role=tab]", (tabs) => tabs.map((tab) => tab.id));
    expect(live).toEqual(ssr);
    expect(new Set(live).size).toBe(live.length);
  });

  test("hydrates without console warnings or errors", async ({ page }) => {
    const messages: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "warning" || m.type() === "error") messages.push(m.text());
    });
    page.on("pageerror", (error) => messages.push(error.message));
    await load(page, "svelte");
    await page.getByRole("tab", { name: "Security" }).first().click();
    expect(messages).toEqual([]);
  });

  test("controlled checked follows clicks and form reset", async ({ page }) => {
    await load(page, "svelte");
    await page.getByText("Accept terms").click();
    await expect(page.locator("#terms")).toHaveText("true");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("#terms")).toHaveText("false");
  });

  test("controlled indeterminate is restored after a click unless the parent clears it", async ({
    page,
  }) => {
    await load(page, "svelte");
    const locked = page.getByLabel("Locked mixed");
    await locked.click();
    await expect(locked).toBeChecked();
    await expect.poll(() => locked.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true);
  });

  test("an application value update does not echo a change event", async ({ page }) => {
    await load(page, "svelte");
    await page.locator("#programmatic").click();
    await expect(page.getByRole("tab", { name: "Billing" }).first()).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.locator("#tab-changes")).toHaveText("0");
  });
});
