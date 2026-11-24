import assert from "node:assert/strict";
import { test } from "node:test";
import { buttonRecipe } from "./button.ts";
import { paperRecipe } from "./paper.ts";
import { isTabbable, tabIds, tabKeyTarget, tabRecipe } from "./tabs.ts";

test("tab keys wrap, mirror in RTL, and ignore other keys", () => {
  assert.equal(tabKeyTarget("ArrowRight", 2, 3, false), 0);
  assert.equal(tabKeyTarget("ArrowLeft", 0, 3, false), 2);
  assert.equal(tabKeyTarget("ArrowRight", 0, 3, true), 2);
  assert.equal(tabKeyTarget("Home", 2, 3, false), 0);
  assert.equal(tabKeyTarget("End", 0, 3, false), 2);
  assert.equal(tabKeyTarget("Enter", 0, 3, false), undefined);
  assert.equal(tabKeyTarget("ArrowRight", -1, 3, false), undefined);
});

test("roving tabindex falls back to the first enabled tab", () => {
  assert.equal(isTabbable("b", "b", ["a", "b"]), true);
  assert.equal(isTabbable("a", "b", ["a", "b"]), false);
  // Selected value is disabled or missing: the first enabled tab keeps the tablist reachable.
  assert.equal(isTabbable("a", "x", ["a", "b"]), true);
  assert.equal(isTabbable("a", undefined, ["a", "b"]), true);
});

test("tab ids from different bases never collide", () => {
  const one = tabIds("settings");
  const two = tabIds("billing");
  assert.notEqual(one.tab("general"), two.tab("general"));
  assert.notEqual(one.tab(1), one.tab("1"));
  assert.notEqual(one.tab("shared space"), one.tab("shared-space"));
  assert.notEqual(one.tab("general"), one.panel("general"));
});

test("a loading button is disabled; a disabled link drops href and leaves the tab order", () => {
  const loading = buttonRecipe({ loading: true });
  assert.equal(loading.attrs.disabled, true);
  assert.equal(loading.attrs["aria-busy"], "true");

  const link = buttonRecipe({ href: "/next", disabled: true });
  assert.equal(link.tag, "a");
  assert.equal(link.attrs.href, undefined);
  assert.equal(link.attrs["aria-disabled"], "true");
  assert.equal(link.attrs.role, "link"); // an <a> without href has no implicit role
  assert.equal(link.attrs.tabindex, -1);
  assert.equal(link.attrs.disabled, undefined);
});

test("button keeps clay defaults: contained, primary, type=button", () => {
  const { attrs } = buttonRecipe({});
  assert.equal(attrs["data-variant"], "contained");
  assert.equal(attrs["data-color"], "primary");
  assert.equal(attrs.type, "button");
});

test("paper ignores inflated on flat surfaces", () => {
  assert.equal(
    paperRecipe({ inflated: true, variant: "outlined" }).attrs["data-inflated"],
    undefined,
  );
  assert.equal(paperRecipe({ inflated: true, elevation: 0 }).attrs["data-inflated"], undefined);
  assert.equal(paperRecipe({ inflated: true }).attrs["data-inflated"], "");
});

test("button ignores inflated on text variant", () => {
  assert.equal(buttonRecipe({ inflated: true, variant: "text" }).attrs["data-inflated"], undefined);
  assert.equal(buttonRecipe({ inflated: true, variant: "contained" }).attrs["data-inflated"], "");
});

test("disabled tab always uses tabindex -1", () => {
  const disabled = tabRecipe({
    value: "a",
    selected: "a",
    enabled: ["a", "b"],
    ids: tabIds("t"),
    disabled: true,
  });
  assert.equal(disabled.attrs.tabindex, -1);
});
