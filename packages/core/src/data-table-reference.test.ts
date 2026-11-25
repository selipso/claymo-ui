import assert from "node:assert/strict";
import { test } from "node:test";
import { frameworks, getComponent } from "../reference/index.js";
import { dataTableDefaults } from "./data-table.ts";

test("DataTable documents the runtime pagination default in every bridge", () => {
  for (const framework of frameworks) {
    const { props } = getComponent(framework, "DataTable");
    assert.deepEqual(
      props.properties.paginationModel?.default,
      dataTableDefaults.paginationModel,
      framework,
    );
  }
});
