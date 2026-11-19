import assert from "node:assert/strict";
import { test } from "node:test";
import { isChipDeleteKey, nativeAction } from "./actions.ts";

test("action buttons preserve native form semantics", () => {
  assert.deepEqual(nativeAction({}), {
    tag: "button",
    attrs: { type: "button", disabled: undefined },
  });
  assert.deepEqual(nativeAction({ type: "submit", disabled: true }), {
    tag: "button",
    attrs: { type: "submit", disabled: true },
  });
  assert.equal(nativeAction({ type: null }).attrs.type, "button");
});

test("a disabled action link keeps its accessible role but sheds navigation and sequential focus", () => {
  assert.deepEqual(nativeAction({ href: "/inbox", type: "submit" }), {
    tag: "a",
    attrs: { href: "/inbox" },
  });
  assert.deepEqual(nativeAction({ href: "/inbox", disabled: true }), {
    tag: "a",
    attrs: { role: "link", "aria-disabled": "true", tabindex: -1 },
  });
});

test("deletable chips recognize keyboard removal without consuming activation keys", () => {
  assert.equal(isChipDeleteKey("Backspace"), true);
  assert.equal(isChipDeleteKey("Delete"), true);
  for (const key of ["Enter", " ", "Escape", "ArrowLeft"]) {
    assert.equal(isChipDeleteKey(key), false);
  }
});
