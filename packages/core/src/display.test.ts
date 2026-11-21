import assert from "node:assert/strict";
import { test } from "node:test";
import {
  avatarInitial,
  badgeLabel,
  circularProgress,
  linearProgress,
  skeletonDimensions,
} from "./display.ts";

test("badge omits empty and zero labels unless requested, while dots need no label", () => {
  assert.equal(badgeLabel({}), undefined);
  assert.equal(badgeLabel({ badgeContent: "", showZero: true }), undefined);
  assert.equal(badgeLabel({ badgeContent: 0 }), undefined);
  assert.equal(badgeLabel({ badgeContent: "0" }), undefined);
  assert.equal(badgeLabel({ badgeContent: 0, showZero: true }), 0);
  assert.equal(badgeLabel({ variant: "dot" }), "");
  assert.equal(badgeLabel({ variant: "dot", invisible: true }), undefined);
  assert.equal(badgeLabel({}, true), "");
  assert.equal(badgeLabel({ invisible: true }, true), undefined);
});

test("badge caps only numeric labels above the configured maximum", () => {
  assert.equal(badgeLabel({ badgeContent: 99 }), 99);
  assert.equal(badgeLabel({ badgeContent: 100 }), "99+");
  assert.equal(badgeLabel({ badgeContent: 100, max: 9 }), "9+");
  assert.equal(badgeLabel({ badgeContent: "100" }), "100");
});

test("progress omits an accessible value for animated variants", () => {
  assert.equal(linearProgress({ value: 50 }).range, undefined);
  assert.deepEqual(linearProgress({ variant: "query", value: 50 }), {
    range: undefined,
    buffer: undefined,
  });
  assert.equal(circularProgress({ value: 50 }).range, undefined);
  assert.equal(circularProgress({ value: 50 }).dashOffset, undefined);
});

test("determinate progress clamps to its scale and defaults to the minimum", () => {
  assert.deepEqual(linearProgress({ variant: "determinate", value: -1 }).range, {
    min: 0,
    max: 100,
    now: 0,
    fraction: 0,
  });
  assert.deepEqual(linearProgress({ variant: "determinate", value: 101 }).range, {
    min: 0,
    max: 100,
    now: 100,
    fraction: 1,
  });
  assert.deepEqual(linearProgress({ variant: "determinate", min: -5, max: 5 }).range, {
    min: -5,
    max: 5,
    now: -5,
    fraction: 0,
  });
  assert.deepEqual(linearProgress({ variant: "determinate", min: -5, max: 5, value: 2.5 }).range, {
    min: -5,
    max: 5,
    now: 2.5,
    fraction: 0.75,
  });
  assert.deepEqual(linearProgress({ variant: "determinate", min: 5, max: 5, value: NaN }).range, {
    min: 0,
    max: 100,
    now: 0,
    fraction: 0,
  });
});

test("linear buffer never falls behind completed progress or exceeds the range", () => {
  const options = { variant: "buffer", min: 10, max: 20, value: 15 } as const;
  assert.equal(linearProgress(options).buffer, 0.5);
  assert.equal(linearProgress({ ...options, valueBuffer: 11 }).buffer, 0.5);
  assert.equal(linearProgress({ ...options, valueBuffer: 18 }).buffer, 0.8);
  assert.equal(linearProgress({ ...options, valueBuffer: 30 }).buffer, 1);
});

test("circular arc uses the same scale and reaches both geometry endpoints", () => {
  const options = { variant: "determinate", min: 10, max: 20 } as const;
  const empty = circularProgress({ ...options, value: 9 });
  assert.equal(empty.width, 40);
  assert.equal(empty.stroke, 4);
  assert.equal(empty.radius, 18);
  assert.equal(empty.dashOffset, empty.circumference);
  const half = circularProgress({ ...options, value: 15, size: 20, thickness: 2 });
  assert.equal(half.center, 10);
  assert.equal(half.radius, 9);
  assert.equal(half.dashOffset, half.circumference / 2);
  const full = circularProgress({ ...options, value: 21, size: "2rem" });
  assert.equal(full.width, "2rem");
  assert.equal(full.diameter, 40);
  assert.equal(full.dashOffset, 0);
});

test("skeleton keeps explicit sizes and mirrors a circle's only supplied side", () => {
  assert.deepEqual(skeletonDimensions({}), { width: undefined, height: undefined });
  assert.deepEqual(skeletonDimensions({ variant: "circular" }), { width: "40px", height: "40px" });
  assert.deepEqual(skeletonDimensions({ variant: "circular", height: "2rem" }), {
    width: "2rem",
    height: "2rem",
  });
  assert.deepEqual(skeletonDimensions({ variant: "circular", width: 24 }), {
    width: "24px",
    height: "24px",
  });
  assert.deepEqual(skeletonDimensions({ variant: "circular", width: 0, height: 18 }), {
    width: "0px",
    height: "18px",
  });
  assert.deepEqual(skeletonDimensions({ variant: "rounded", width: "70%", height: 24 }), {
    width: "70%",
    height: "24px",
  });
});

test("avatar derives the first whole Unicode code point for automatic fallbacks", () => {
  assert.equal(avatarInitial("  Ada Lovelace"), "A");
  assert.equal(avatarInitial("🌿 Clay"), "🌿");
  assert.equal(avatarInitial("  "), "");
});
