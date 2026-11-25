import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { frameworks, getComponent, listComponents, theme } from "../reference/index.js";
import { motionPresets } from "./motion.ts";

const css = readFileSync(new URL("../css/motion.css", import.meta.url), "utf8");

/** Declarations of the first rule whose selector list ends with `selector`. */
function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `motion.css has no rule for ${selector}`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--clay-motion-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]),
  );
}

// The defaults rule lists every preset class and ends with the last one; the squish rule comes later.
const defaults = block(".clay-motion-squish");
const preset = (name: string) =>
  name === "subtle" ? defaults : { ...defaults, ...block(`.clay-motion-${name}`) };

test("presets are the same in TypeScript, the reference and the stylesheet", () => {
  assert.deepEqual(Object.keys(theme.motion.presets), [...motionPresets]);
  for (const name of motionPresets.filter((name) => name !== "subtle")) {
    assert.ok(css.includes(`[data-motion="${name}"],\n.clay-motion-${name} {`), name);
  }
  // The defaults and the reduced-motion override both reset every preset.
  const resets = css.split(":root,").slice(1);
  assert.equal(resets.length, 2);
  for (const reset of resets) {
    const selectors = reset.slice(0, reset.indexOf("{"));
    for (const name of motionPresets) assert.ok(selectors.includes(`.clay-motion-${name}`), name);
  }
});

test("the defaults declare every documented token", () => {
  assert.deepEqual(Object.keys(defaults).sort(), Object.keys(theme.motion.tokens).sort());
});

test("every preset finishes within 300ms and never overshoots", () => {
  for (const name of motionPresets) {
    const tokens = preset(name);
    for (const [token, value] of Object.entries(tokens).filter(([t]) => t.includes("duration"))) {
      const ms = value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
      assert.ok(ms <= 300, `${name} ${token} is ${value}`);
    }
    const curve = /cubic-bezier\(([^)]+)\)/.exec(tokens["--clay-motion-easing"]);
    assert.ok(curve, `${name} easing`);
    const [, y1, , y2] = curve[1].split(",").map(Number);
    for (const y of [y1, y2]) assert.ok(y >= 0 && y <= 1, `${name} easing overshoots`);
  }
});

test("components that animate expose the motion prop in every bridge", () => {
  for (const framework of frameworks) {
    for (const name of listComponents(framework)) {
      const motion = getComponent(framework, name).props.properties.motion;
      assert.equal(Boolean(motion), theme.motion.components.includes(name), `${framework} ${name}`);
      if (motion) assert.deepEqual(motion.enum, [...motionPresets]);
    }
  }
});
