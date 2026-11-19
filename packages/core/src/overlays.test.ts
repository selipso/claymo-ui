import assert from "node:assert/strict";
import { test } from "node:test";
import { overlayOpen, snackbarHideDelay } from "./overlays.ts";

test("overlay open attribute distinguishes automatic mode, presence, and explicit false", () => {
  assert.equal(overlayOpen(null), undefined);
  assert.equal(overlayOpen(""), true);
  assert.equal(overlayOpen("true"), true);
  assert.equal(overlayOpen("false"), false);
});

test("snackbar uses its resume duration only after a pause and otherwise keeps the full interval", () => {
  assert.equal(snackbarHideDelay(4000, 500, false), 4000);
  assert.equal(snackbarHideDelay(4000, 500, true), 500);
  assert.equal(snackbarHideDelay(4000, null, true), 4000);
  assert.equal(snackbarHideDelay(4000, 0, true), 0);
});

test("a disabled snackbar timer cannot be re-enabled by a resume duration", () => {
  assert.equal(snackbarHideDelay(null, 500, false), null);
  assert.equal(snackbarHideDelay(null, 500, true), null);
});
