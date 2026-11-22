import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

test("every documented TSX example mounts without runtime errors", async ({ page }) => {
  const examples: string[] = JSON.parse(readFileSync("examples.json", "utf8"));
  test.setTimeout(120_000);
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));
  for (const example of examples) {
    await page.goto(`/?example=${example}`);
    await expect(page.locator("#root > *").first(), example).toBeAttached();
    expect(errors, example).toEqual([]);
  }
});

test("server-rendered button survives hydration and handles repeated clicks", async ({ page }) => {
  await page.goto("/hydrate.html");
  const button = page.getByRole("button", { name: /Count:/ });
  await expect(button).toHaveAttribute("data-hydrated", "true");
  await button.click();
  await button.click();
  await expect(button).toHaveText("Count: 2");
});

test("signals control form and dialog state; keyboard combobox and table controls work", async ({
  page,
}) => {
  await page.goto("/?example=Controls");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "reef");
  const edit = page.getByRole("button", { name: "Edit settings" });
  await expect(edit).toBeDisabled();
  await page.getByRole("checkbox", { name: "Notifications" }).check();
  // WebKit does not focus buttons on a pointer click. Test keyboard focus restoration.
  await edit.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Settings" });
  const input = dialog.getByRole("combobox", { name: "Site" });
  await input.fill("Re");
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(input).toHaveValue("Reef");
  await input.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(edit).toBeFocused();
  const sites = page.getByRole("region", { name: "Sites" });
  await sites.getByRole("button", { name: "Site" }).click();
  await expect(sites.getByRole("rowheader")).toHaveText(["Bay", "Reef"]);
  await page.getByRole("searchbox", { name: "Search" }).fill("ree");
  await expect(sites.getByRole("rowheader")).toHaveText(["Reef"]);
  await sites.getByRole("checkbox", { name: "Select all rows" }).check();
  await expect(page.getByText("1 selected", { exact: true })).toBeVisible();
});

test("keyboard tab selection skips disabled tabs and updates its linked panel", async ({
  page,
}) => {
  await page.goto("/?example=Tabs_1");
  await page.getByRole("tab", { name: "Profile" }).press("ArrowRight");
  const selected = page.getByRole("tab", { name: "Security" });
  await expect(selected).toBeFocused();
  await expect(selected).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Security" })).toHaveText(
    "Review sign-in options.",
  );
});

test("native form reset restores grouped radios and range values", async ({ page }) => {
  await page.goto("/?example=RadioGroup_1");
  await page.getByRole("radio", { name: "Digital" }).check();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("radio", { name: "Paper" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Digital" })).not.toBeChecked();
  await page.goto("/?example=Slider_1");
  const slider = page.getByRole("slider", { name: "Volume" });
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("50");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(slider).toHaveValue("25");
  await expect(page.getByText("25", { exact: true })).toBeVisible();
});
