import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addAutocompleteValue,
  autocompleteInputValue,
  autocompleteSelectedValues,
  autocompleteValue,
  filterAutocompleteOptions,
  nextAutocompleteIndex,
  normalizeAutocompleteOptions,
  removeAutocompleteValue,
} from "./input.ts";

const options = normalizeAutocompleteOptions([
  "TypeScript",
  { label: "JavaScript", value: "js" },
  { label: "Svelte" },
  { label: "Duplicate value", value: "js" },
]);

test("normalization keeps the first label for each value and defaults values to their labels", () => {
  assert.deepEqual([...options.keys()], ["TypeScript", "js", "Svelte"]);
  assert.equal(autocompleteInputValue(options, ["js"], false), "JavaScript");
  assert.equal(autocompleteInputValue(options, ["Others"], false), "Others");
  assert.equal(autocompleteInputValue(options, ["js"], true), "");
});

test("filtering matches label substrings without regard to case, not separate values", () => {
  assert.deepEqual(
    filterAutocompleteOptions(options, "sCrIp", []).items.map(({ value }) => value),
    ["TypeScript", "js"],
  );
  assert.deepEqual(filterAutocompleteOptions(options, "js", []).items, []);
  assert.deepEqual(
    filterAutocompleteOptions(options, "script", ["TypeScript"], {
      filterSelectedOptions: true,
    }).items.map(({ value }) => value),
    ["js"],
  );
});

test("freeSolo appends a creatable entry only for a novel, nonempty input", () => {
  assert.equal(filterAutocompleteOptions(options, "new", []).typedValue, undefined);
  assert.deepEqual(filterAutocompleteOptions(options, "new", []).items, []);
  const partial = filterAutocompleteOptions(options, "Type", [], { freeSolo: true });
  assert.deepEqual(
    partial.items.map(({ value }) => value),
    ["TypeScript", "Type"],
  );
  assert.deepEqual(partial.items.at(-1), { label: 'Add "Type"', value: "Type" });
  assert.equal(partial.typedValue, "Type");
  const alreadySelected = filterAutocompleteOptions(options, "javascript", ["js"], {
    filterSelectedOptions: true,
    freeSolo: true,
  });
  assert.deepEqual(alreadySelected, { items: [], typedValue: "js" });
  assert.equal(filterAutocompleteOptions(options, "  ", [], { freeSolo: true }).items.length, 3);
  assert.deepEqual(
    filterAutocompleteOptions(options, "  A $& B  ", [], {
      freeSolo: true,
      addOptionText: "Create {input} ({input})",
    }).items.at(-1),
    { label: "Create A $& B (A $& B)", value: "A $& B" },
  );
});

test("arrow navigation picks an endpoint from no active item and wraps in both directions", () => {
  assert.equal(nextAutocompleteIndex(-1, 3, 1), 0);
  assert.equal(nextAutocompleteIndex(-1, 3, -1), 2);
  assert.equal(nextAutocompleteIndex(2, 3, 1), 0);
  assert.equal(nextAutocompleteIndex(0, 3, -1), 2);
  assert.equal(nextAutocompleteIndex(8, 0, 1), -1);
});

test("selection adds and removes values immutably without introducing duplicates", () => {
  const selected = autocompleteSelectedValues(["js", "Svelte", "js"], true);
  assert.deepEqual(selected, ["js", "Svelte"]);
  assert.equal(addAutocompleteValue(selected, "Svelte", true), selected);
  assert.deepEqual(addAutocompleteValue(selected, "CSS", true), ["js", "Svelte", "CSS"]);
  assert.deepEqual(removeAutocompleteValue(selected, "Svelte"), ["js"]);
  assert.equal(removeAutocompleteValue(selected, "CSS"), selected);
  assert.deepEqual(selected, ["js", "Svelte"]);
  assert.equal(autocompleteValue(addAutocompleteValue(["js"], "Svelte", false), false), "Svelte");
  assert.equal(autocompleteValue(removeAutocompleteValue(["js"], "js"), false), null);
});
