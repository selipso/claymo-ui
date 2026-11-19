import assert from "node:assert/strict";
import { test } from "node:test";
import { sliderMarks, sliderPercent, sliderValue, textFieldRecipe } from "./input.ts";

test("text field helper text describes the control before consumer descriptions", () => {
  const field = textFieldRecipe({ id: "email", helperText: "Work address", describedBy: "hint" });
  assert.equal(field.input["aria-describedby"], "email-helper hint");
  assert.equal(textFieldRecipe({ id: "a" }).input["aria-describedby"], undefined);
  assert.equal(textFieldRecipe({ id: "a", describedBy: "hint" }).input["aria-describedby"], "hint");
});

test("a multiline field is never styled as a select", () => {
  const field = textFieldRecipe({ id: "a", select: true, multiline: true });
  assert.equal(field.control["data-select"], undefined);
  assert.equal(field.control["data-has-end"], undefined);
});

test("range values clamp, round ties up, and never land past the last valid step", () => {
  assert.equal(sliderValue(-10, 2, 10, 3), 2);
  assert.equal(sliderValue(3.5, 2, 10, 3), 5);
  assert.equal(sliderValue(10, 2, 10, 3), 8);
  assert.equal(sliderValue(0.25, 0, 0.3, 0.1), 0.3);
  assert.equal(sliderValue(9, 7, 7, 1), 7);
  assert.equal(sliderValue(9, 7, 5, 1), 7);
});

test("marks use their actual step positions and do not invent a tick at max", () => {
  assert.deepEqual(sliderMarks(2, 10, 3), [2, 5, 8]);
  assert.equal(sliderPercent(8, 2, 10), 75);
  assert.deepEqual(sliderMarks(-0.2, 0.1, 0.1), [-0.2, -0.1, 0, 0.1]);
  assert.deepEqual(sliderMarks(0, 3e-7, 1e-7), [0, 1e-7, 2e-7, 3e-7]);
  assert.equal(sliderMarks(0, 20, 1).length, 21);
  assert.deepEqual(sliderMarks(0, 21, 1), []);
  assert.deepEqual(sliderMarks(0, 10, 0), []);
  assert.deepEqual(sliderMarks(0, 0, 1), []);
});

test("percentages handle out-of-range and collapsed inputs", () => {
  assert.equal(sliderPercent(-4, 0, 12), 0);
  assert.equal(sliderPercent(13, 0, 12), 100);
  assert.equal(sliderPercent(2, 2, 2), 0);
});
