// Pure DataTable logic shared by the Svelte component, the Astro server render and the Astro
// controller. No DOM access.
import type { TableOptions } from "./display.ts";

export type DataTableColumnType = "string" | "number" | "actions";
export type DataTableAlign = "left" | "center" | "right";
export type DataTableMode = "client" | "server";
/** Any object works as a row; fields are read by name. */
export type DataTableRow = Record<string, unknown>;

export type DataTableSortDirection = "asc" | "desc";
/** MUI `GridSortModel`; the first entry is the active sort. */
export type DataTableSortModel = readonly { field: string; sort: DataTableSortDirection }[];

export interface DataTablePaginationModel {
  page: number;
  pageSize: number;
}

export interface DataTableCellParams<Row extends object = DataTableRow> {
  row: Row;
  id: string;
  field: string;
  /** After `valueGetter`. */
  value: unknown;
  /** After `valueFormatter`; what the cell shows without `renderCell`. */
  formattedValue: string;
  /** Position in the `rows` prop. */
  rowIndex: number;
}

/** MUI `GridColDef` subset. `Render` is a Svelte snippet or, in Astro, a function returning markup. */
export interface DataTableColumn<Row extends object = DataTableRow, Render = unknown> {
  field: string;
  /** Default: the field name. */
  headerName?: string;
  /** `number` aligns right and sorts numerically; `actions` is neither sortable nor filterable. */
  type?: DataTableColumnType;
  align?: DataTableAlign;
  /** Column width in px. */
  width?: number;
  /** Default true, except for `actions`. */
  sortable?: boolean;
  /** Searched by the quick filter. Default true, except for `actions`. */
  filterable?: boolean;
  valueGetter?: (value: unknown, row: Row) => unknown;
  valueFormatter?: (value: unknown, row: Row) => string;
  renderCell?: Render;
}

/** A field name is shorthand for `{ field }`. */
export type DataTableColumnDef<Row extends object = DataTableRow, Render = unknown> =
  string | DataTableColumn<Row, Render>;

export interface DataTableResolvedColumn<
  Row extends object = DataTableRow,
  Render = unknown,
> extends DataTableColumn<Row, Render> {
  headerName: string;
  type: DataTableColumnType;
  align: DataTableAlign;
  sortable: boolean;
  filterable: boolean;
}

/** MUI `localeText` keys; `{name}` placeholders replace MUI's formatter functions. */
export interface DataTableLocaleText {
  noRowsLabel: string;
  noResultsOverlayLabel: string;
  loadingLabel: string;
  toolbarQuickFilterLabel: string;
  toolbarQuickFilterPlaceholder: string;
  checkboxSelectionSelectAllRows: string;
  /** `{row}` is the row header text. */
  checkboxSelectionSelectRow: string;
  /** `{count}` selected rows. */
  footerRowSelected: string;
  paginationRowsPerPage: string;
  /** `{from}`, `{to}` and `{count}`. */
  paginationDisplayedRows: string;
  paginationPrevious: string;
  paginationNext: string;
}

export const dataTableLocaleText: DataTableLocaleText = {
  noRowsLabel: "No rows",
  noResultsOverlayLabel: "No results found.",
  loadingLabel: "Loading…",
  toolbarQuickFilterLabel: "Search",
  toolbarQuickFilterPlaceholder: "Search…",
  checkboxSelectionSelectAllRows: "Select all rows",
  checkboxSelectionSelectRow: "Select {row}",
  footerRowSelected: "{count} selected",
  paginationRowsPerPage: "Rows per page:",
  paginationDisplayedRows: "{from}–{to} of {count}",
  paginationPrevious: "Go to previous page",
  paginationNext: "Go to next page",
};

/** Options shared by both bridges. Callbacks, slots and snippets are bridge-specific. */
export interface DataTableOptions<Row extends object = DataTableRow, Render = unknown> extends Omit<
  TableOptions,
  "padding"
> {
  rows: readonly Row[];
  /** Default: the keys of the first row. */
  columns?: readonly DataTableColumnDef<Row, Render>[];
  /** Default: `row.id`, then the row's position in `rows`. Ids are compared as strings. */
  getRowId?: (row: Row) => string | number;
  /** Field rendered as the row header (`<th scope="row">`). Default: the first non-action column. */
  rowHeader?: string;
  checkboxSelection?: boolean;
  rowSelectionModel?: readonly string[];
  sortModel?: DataTableSortModel;
  /** Show a search field that filters rows by every filterable column. */
  quickFilter?: boolean;
  quickFilterValue?: string;
  pagination?: boolean;
  paginationModel?: DataTablePaginationModel;
  pageSizeOptions?: readonly number[];
  /** `server`: rows arrive already sorted; the table only reports the sort model. */
  sortingMode?: DataTableMode;
  /** `server`: rows arrive already filtered; the table only reports the quick filter value. */
  filterMode?: DataTableMode;
  /** `server`: `rows` is the current page; set `rowCount` to the total. */
  paginationMode?: DataTableMode;
  /** Total row count for server-side pagination. */
  rowCount?: number;
  loading?: boolean;
  localeText?: Partial<DataTableLocaleText>;
}

export const dataTableDefaults = {
  size: "medium",
  pageSizeOptions: [5, 10, 25, 50, 100],
  paginationModel: { page: 0, pageSize: 10 },
  mode: "client",
} as const;

/** Stroke paths for `actionIconAttrs` (24px grid). */
export const dataTableIcons = {
  sort: "M12 19V5m-6 6 6-6 6 6",
  previous: "m15 18-6-6 6-6",
  next: "m9 18 6-6-6-6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4.3-4.3",
} as const;

export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match,
  );
}

function resolveColumn<Row extends object, Render>(
  def: DataTableColumnDef<Row, Render>,
): DataTableResolvedColumn<Row, Render> {
  const column = typeof def === "string" ? { field: def } : def;
  const type = column.type ?? "string";
  const data = type !== "actions";
  return {
    ...column,
    headerName: column.headerName ?? (data ? column.field : ""),
    type,
    align: column.align ?? (data && type !== "number" ? "left" : "right"),
    sortable: column.sortable ?? data,
    filterable: column.filterable ?? data,
  };
}

/** Normalizes column definitions; rejects duplicate fields, which would make cells ambiguous. */
export function dataTableColumns<Row extends object, Render>(
  defs: readonly DataTableColumnDef<Row, Render>[] | undefined,
  rows: readonly Row[],
): DataTableResolvedColumn<Row, Render>[] {
  const columns = (defs ?? Object.keys(rows[0] ?? {})).map(resolveColumn<Row, Render>);
  const fields = new Set<string>();
  for (const { field } of columns) {
    if (fields.has(field)) throw new Error(`DataTable: duplicate column field "${field}"`);
    fields.add(field);
  }
  return columns;
}

/** The row header field: explicit, else the first data column. */
export function rowHeaderField(
  columns: readonly { field: string; type: DataTableColumnType }[],
  rowHeader?: string,
) {
  return rowHeader ?? columns.find((column) => column.type !== "actions")?.field;
}

export function cellValue<Row extends object>(
  row: Row,
  column: DataTableColumn<Row, unknown>,
): unknown {
  const raw: unknown = Reflect.get(row, column.field);
  return column.valueGetter ? column.valueGetter(raw, row) : raw;
}

export function formatCell<Row extends object>(
  value: unknown,
  row: Row,
  column: DataTableColumn<Row, unknown>,
): string {
  if (column.valueFormatter) return column.valueFormatter(value, row);
  if (value == null) return "";
  return Array.isArray(value) ? value.join(", ") : String(value);
}

/** Sorts by value, not formatted text (MUI). Missing numbers sort first, like empty strings. */
export function sortKey(value: unknown, type: DataTableColumnType): string | number {
  if (value == null || value === "") return "";
  if (type !== "number") return String(value);
  const number = Number(value);
  return Number.isNaN(number) ? "" : number;
}

/** Reads a key written to the DOM by `sortKey`. */
export function parseSortKey(text: string, type: DataTableColumnType): string | number {
  return type === "number" && text !== "" ? Number(text) : text;
}

// A fixed locale keeps server and client order identical.
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

export function compareSortKeys(a: string | number, b: string | number): number {
  return typeof a === "number" && typeof b === "number"
    ? a - b
    : collator.compare(String(a), String(b));
}

export interface DataTableCell {
  value: unknown;
  text: string;
  key: string | number;
}

export interface DataTableRowModel<Row extends object = DataTableRow> {
  row: Row;
  id: string;
  index: number;
  /** Aligned with the resolved columns. */
  cells: DataTableCell[];
  /** Lower-cased text of the filterable cells, matched by the quick filter. */
  search: string;
}

/** Computes every cell once; rejects duplicate row ids, which would break selection and clicks. */
export function dataTableRows<Row extends object>(
  rows: readonly Row[],
  columns: readonly DataTableResolvedColumn<Row, unknown>[],
  getRowId?: (row: Row) => string | number,
): DataTableRowModel<Row>[] {
  const ids = new Set<string>();
  return rows.map((row, index) => {
    const own: unknown = "id" in row ? row.id : undefined;
    const id = String(getRowId ? getRowId(row) : (own ?? index));
    if (ids.has(id)) throw new Error(`DataTable: duplicate row id "${id}"; pass getRowId`);
    ids.add(id);
    const cells = columns.map((column) => {
      const value = cellValue(row, column);
      return { value, text: formatCell(value, row, column), key: sortKey(value, column.type) };
    });
    const search = columns
      .flatMap((column, i) => (column.filterable ? [cells[i]!.text] : []))
      .join("\n")
      .toLowerCase();
    return { row, id, index, cells, search };
  });
}

export function quickFilterTerms(value: string): string[] {
  return value.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export interface DataTableQuery<Entry> {
  search: (entry: Entry) => string;
  key: (entry: Entry, field: string) => string | number;
  sortModel: DataTableSortModel;
  quickFilterValue: string;
  sortingMode: DataTableMode;
  filterMode: DataTableMode;
}

/**
 * Filters (every term must match) then sorts (stable, ties keep their order). Works on row models
 * in Svelte and on server-rendered `<tr>`s in the Astro controller.
 */
export function dataTableOrder<Entry>(entries: readonly Entry[], query: DataTableQuery<Entry>) {
  const terms = query.filterMode === "server" ? [] : quickFilterTerms(query.quickFilterValue);
  const filtered = terms.length
    ? entries.filter((entry) => terms.every((term) => query.search(entry).includes(term)))
    : [...entries];
  const sort = query.sortingMode === "server" ? undefined : query.sortModel[0];
  if (!sort) return filtered;
  const direction = sort.sort === "desc" ? -1 : 1;
  return filtered.sort(
    (a, b) => direction * compareSortKeys(query.key(a, sort.field), query.key(b, sort.field)),
  );
}

export function pageCount(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

/** Keeps the page in range after filtering or a page size change. */
export function clampPage(model: DataTablePaginationModel, count: number) {
  const page = Math.min(Math.max(0, model.page), pageCount(count, model.pageSize) - 1);
  return page === model.page ? model : { ...model, page };
}

export function pageSlice<Entry>(
  entries: readonly Entry[],
  { page, pageSize }: DataTablePaginationModel,
  mode: DataTableMode,
): readonly Entry[] {
  return mode === "server" ? entries : entries.slice(page * pageSize, (page + 1) * pageSize);
}

export function displayedRows(
  template: string,
  { page, pageSize }: DataTablePaginationModel,
  count: number,
): string {
  const from = count === 0 ? 0 : page * pageSize + 1;
  return fillTemplate(template, { from, to: Math.min(count, (page + 1) * pageSize), count });
}

/** Header click cycle: ascending, descending, unsorted (MUI `sortingOrder`). */
export function nextSortModel(model: DataTableSortModel, field: string): DataTableSortModel {
  const current = model[0]?.field === field ? model[0].sort : undefined;
  if (!current) return [{ field, sort: "asc" }];
  return current === "asc" ? [{ field, sort: "desc" }] : [];
}

export function ariaSort(model: DataTableSortModel, field: string) {
  const sort = model[0]?.field === field ? model[0].sort : undefined;
  return sort && (sort === "asc" ? "ascending" : "descending");
}

/** State of the select-all checkbox over the rows it controls. */
export function selectAllState(selected: readonly string[], ids: readonly string[]) {
  const count = ids.filter((id) => selected.includes(id)).length;
  return {
    checked: count > 0 && count === ids.length,
    indeterminate: count > 0 && count < ids.length,
  };
}

/** Adds or removes `ids`, keeping selections outside them (e.g. rows on other pages). */
export function toggleSelection(
  selected: readonly string[],
  ids: readonly string[],
  checked: boolean,
): string[] {
  const rest = selected.filter((id) => !ids.includes(id));
  return checked ? [...rest, ...ids] : rest;
}

export type DataTableViewOptions<Row extends object, Render> = Pick<
  DataTableOptions<Row, Render>,
  "rows" | "columns" | "getRowId" | "rowHeader" | "rowCount"
> & {
  sortModel: DataTableSortModel;
  quickFilterValue: string;
  /** Omitted when pagination is off. */
  paginationModel?: DataTablePaginationModel;
  rowSelectionModel: readonly string[];
  sortingMode: DataTableMode;
  filterMode: DataTableMode;
  paginationMode: DataTableMode;
};

/** Everything a bridge renders, from the props and the current models. */
export function dataTableView<Row extends object, Render>(o: DataTableViewOptions<Row, Render>) {
  if (o.paginationModel && o.paginationMode === "server" && o.rowCount === undefined)
    throw new Error('DataTable: paginationMode "server" needs rowCount');
  const columns = dataTableColumns(o.columns, o.rows);
  const models = dataTableRows(o.rows, columns, o.getRowId);
  const position = new Map(columns.map((column, index) => [column.field, index]));
  const ordered = dataTableOrder(models, {
    search: (model) => model.search,
    key: (model, field) => model.cells[position.get(field) ?? -1]?.key ?? "",
    sortModel: o.sortModel,
    quickFilterValue: o.quickFilterValue,
    sortingMode: o.sortingMode,
    filterMode: o.filterMode,
  });
  const count = o.paginationMode === "server" ? (o.rowCount ?? 0) : ordered.length;
  const page = o.paginationModel && clampPage(o.paginationModel, count);
  const header = rowHeaderField(columns, o.rowHeader);
  return {
    columns,
    models,
    ordered,
    visible: page ? pageSlice(ordered, page, o.paginationMode) : ordered,
    count,
    page,
    lastPage: page ? pageCount(count, page.pageSize) - 1 : 0,
    rowHeader: header,
    rowHeaderIndex: header === undefined ? -1 : (position.get(header) ?? -1),
    selectAll: selectAllState(
      o.rowSelectionModel,
      ordered.map((model) => model.id),
    ),
  };
}
