import assert from "node:assert/strict";
import { test } from "node:test";
import { accordionRecipe, cardElevation, typographyTag } from "./surfaces.ts";

test("Accordion is collapsed unless an initial state was requested", () => {
  assert.equal(accordionRecipe({}).open, false);
  assert.equal(accordionRecipe({ defaultExpanded: true }).open, true);
  assert.equal(accordionRecipe({ expanded: true }).open, true);
});

test("Accordion's explicit expanded state wins even when false", () => {
  assert.equal(accordionRecipe({ expanded: false, defaultExpanded: true }).open, false);
  assert.equal(accordionRecipe({ expanded: true, defaultExpanded: false }).open, true);
});

test("disabling Accordion marks its trigger without discarding the open state", () => {
  const recipe = accordionRecipe({ disabled: true, defaultExpanded: true });
  assert.equal(recipe.open, true);
  assert.deepEqual(recipe.summaryAttrs, {
    "aria-disabled": "true",
    "data-disabled": "",
    tabindex: -1,
  });
  assert.deepEqual(accordionRecipe({ disabled: false }).summaryAttrs, {
    "aria-disabled": undefined,
    "data-disabled": undefined,
    tabindex: undefined,
  });
});

test("Typography keeps clay's native tags and resolves as before variantMapping", () => {
  assert.equal(typographyTag("h3"), "h3");
  assert.equal(typographyTag("subtitle1"), "p");
  assert.equal(typographyTag("caption"), "span");
  assert.equal(typographyTag("h3", undefined, { h3: "h2" }), "h2");
  assert.equal(typographyTag("h3", "div", { h3: "h2" }), "div");
  assert.equal(typographyTag("body1", undefined, { h6: "h2" }), "p");
});

test("Card raised increases the default but keeps explicit elevations including zero", () => {
  assert.equal(cardElevation(undefined), 1);
  assert.equal(cardElevation(undefined, true), 2);
  assert.equal(cardElevation(0, true), 0);
  assert.equal(cardElevation(3, false), 3);
});
