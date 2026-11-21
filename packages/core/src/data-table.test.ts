import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clampPage,
  dataTableColumns,
  dataTableOrder,
  dataTableRows,
  displayedRows,
  nextSortModel,
  pageSlice,
  rowHeaderField,
  selectAllState,
  toggleSelection,
  type DataTableQuery,
  type DataTableResolvedColumn,
  type DataTableRowModel,
  type DataTableSortModel,
} from "./data-table.ts";

const items = [
  { id: 1, name: "Item 10", qty: 5, tags: ["a", "b"], note: null },
  { id: 2, name: "item 9", qty: 40, tags: [], note: "Fragile glass" },
  { id: 3, name: "Item 2", qty: null, tags: ["c"], note: "glass" },
];

function order<Row extends object>(
  rows: readonly DataTableRowModel<Row>[],
  columns: readonly DataTableResolvedColumn<Row>[],
  query: Partial<DataTableQuery<DataTableRowModel<Row>>>,
) {
  return dataTableOrder(rows, {
    search: (row) => row.search,
    key: (row, field) => row.cells[columns.findIndex((c) => c.field === field)]!.key,
    sortModel: [],
    quickFilterValue: "",
    sortingMode: "client",
    filterMode: "client",
    ...query,
  }).map((row) => row.id);
}

test("columns default to the first row's keys; strings are field shorthand", () => {
  const columns = dataTableColumns(undefined, items);
  assert.deepEqual(
    columns.map((c) => c.field),
    ["id", "name", "qty", "tags", "note"],
  );
  const [qty, edit] = dataTableColumns(["qty", { field: "edit", type: "actions" }], items);
  assert.equal(qty!.headerName, "qty");
  assert.equal(edit!.headerName, "");
  assert.equal(edit!.sortable, false);
  assert.equal(edit!.filterable, false);
  assert.equal(edit!.align, "right");
  assert.equal(rowHeaderField([edit!, qty!]), "qty");
  assert.throws(() => dataTableColumns(["qty", "qty"], items), /duplicate column field "qty"/);
});

test("row ids come from getRowId, then id, then position; duplicates are rejected", () => {
  const columns = dataTableColumns(["name"], items);
  assert.deepEqual(
    dataTableRows(items, columns).map((r) => r.id),
    ["1", "2", "3"],
  );
  const unnamed = [{ name: "a" }, { name: "b" }];
  assert.deepEqual(
    dataTableRows(unnamed, dataTableColumns(["name"], unnamed)).map((r) => r.id),
    ["0", "1"],
  );
  assert.deepEqual(
    dataTableRows(items, columns, (row) => row.name).map((r) => r.id),
    ["Item 10", "item 9", "Item 2"],
  );
  assert.throws(() => dataTableRows(items, columns, () => "same"), /duplicate row id "same"/);
});

test("cells format nulls as empty, arrays as lists, and honor valueGetter and valueFormatter", () => {
  const columns = dataTableColumns<(typeof items)[number], unknown>(
    [
      "note",
      "tags",
      {
        field: "total",
        type: "number",
        valueGetter: (_, row) => (row.qty ?? 0) * 2,
        valueFormatter: (value) => `${String(value)} pcs`,
      },
    ],
    items,
  );
  const [first] = dataTableRows(items, columns);
  assert.deepEqual(
    first!.cells.map((c) => c.text),
    ["", "a, b", "10 pcs"],
  );
  assert.equal(first!.cells[2]!.key, 10); // sorts by value, not by the formatted text
});

test("sorting is numeric for numbers, natural for text, stable, and missing values sort first", () => {
  const columns = dataTableColumns(["name", { field: "qty", type: "number" }], items);
  const rows = dataTableRows(items, columns);
  assert.deepEqual(order(rows, columns, { sortModel: [{ field: "qty", sort: "asc" }] }), [
    "3",
    "1",
    "2",
  ]);
  assert.deepEqual(order(rows, columns, { sortModel: [{ field: "name", sort: "asc" }] }), [
    "3",
    "2",
    "1",
  ]);
  assert.deepEqual(order(rows, columns, { sortModel: [{ field: "name", sort: "desc" }] }), [
    "1",
    "2",
    "3",
  ]);
  const ties = dataTableRows(
    [
      { id: "a", n: 1 },
      { id: "b", n: 1 },
    ],
    dataTableColumns(["n"], [{ n: 1 }]),
  );
  assert.deepEqual(
    order(ties, dataTableColumns(["n"], [{ n: 1 }]), { sortModel: [{ field: "n", sort: "desc" }] }),
    ["a", "b"],
  );
});

test("the quick filter matches every term, case-insensitively, in filterable columns only", () => {
  const columns = dataTableColumns(["name", { field: "note", filterable: false }], items);
  const rows = dataTableRows(items, columns);
  assert.deepEqual(order(rows, columns, { quickFilterValue: "  ITEM   1 " }), ["1"]);
  assert.deepEqual(order(rows, columns, { quickFilterValue: "glass" }), []);
  const all = dataTableColumns(["name", "note"], items);
  assert.deepEqual(order(dataTableRows(items, all), all, { quickFilterValue: "glass item" }), [
    "2",
    "3",
  ]);
});

test("server modes leave filtering, sorting and slicing to the caller", () => {
  const columns = dataTableColumns(["name"], items);
  const rows = dataTableRows(items, columns);
  const sortModel: DataTableSortModel = [{ field: "name", sort: "asc" }];
  assert.deepEqual(
    order(rows, columns, {
      quickFilterValue: "nothing matches",
      filterMode: "server",
      sortModel,
      sortingMode: "server",
    }),
    ["1", "2", "3"],
  );
  assert.equal(pageSlice(rows, { page: 3, pageSize: 1 }, "server").length, 3);
});

test("pagination clamps to the last page and labels the visible range", () => {
  assert.deepEqual(clampPage({ page: 4, pageSize: 10 }, 15), { page: 1, pageSize: 10 });
  assert.deepEqual(clampPage({ page: 2, pageSize: 10 }, 0), { page: 0, pageSize: 10 });
  assert.deepEqual(pageSlice([1, 2, 3, 4, 5], { page: 1, pageSize: 2 }, "client"), [3, 4]);
  const template = "{from}–{to} of {count}";
  assert.equal(displayedRows(template, { page: 1, pageSize: 10 }, 15), "11–15 of 15");
  assert.equal(displayedRows(template, { page: 0, pageSize: 10 }, 0), "0–0 of 0");
});

test("header clicks cycle ascending, descending, unsorted; another column starts ascending", () => {
  let model = nextSortModel([], "name");
  assert.deepEqual(model, [{ field: "name", sort: "asc" }]);
  model = nextSortModel(model, "name");
  assert.deepEqual(model, [{ field: "name", sort: "desc" }]);
  assert.deepEqual(nextSortModel(model, "qty"), [{ field: "qty", sort: "asc" }]);
  assert.deepEqual(nextSortModel(model, "name"), []);
});

test("select all reflects the rows it controls and keeps selections outside them", () => {
  assert.deepEqual(selectAllState(["1"], ["1", "2"]), { checked: false, indeterminate: true });
  assert.deepEqual(selectAllState(["1", "2"], ["1", "2"]), { checked: true, indeterminate: false });
  assert.deepEqual(selectAllState([], []), { checked: false, indeterminate: false });
  assert.deepEqual(toggleSelection(["9", "1"], ["1", "2"], true), ["9", "1", "2"]);
  assert.deepEqual(toggleSelection(["9", "1"], ["1", "2"], false), ["9"]);
});
