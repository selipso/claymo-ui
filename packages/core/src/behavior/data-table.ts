import {
  ariaSort,
  clampPage,
  dataTableOrder,
  displayedRows,
  fillTemplate,
  nextSortModel,
  pageCount,
  pageSlice,
  parseSortKey,
  selectAllState,
  toggleSelection,
  type DataTableColumnType,
  type DataTableMode,
  type DataTablePaginationModel,
  type DataTableSortModel,
} from "../data-table.ts";
import { upgrader } from "./upgrade.ts";

export const DATA_TABLE_ROW_CLICK_EVENT = "clay-row-click";
export const DATA_TABLE_SORT_MODEL_CHANGE_EVENT = "clay-sort-model-change";
export const DATA_TABLE_PAGINATION_MODEL_CHANGE_EVENT = "clay-pagination-model-change";
export const DATA_TABLE_QUICK_FILTER_VALUE_CHANGE_EVENT = "clay-quick-filter-value-change";
export const DATA_TABLE_ROW_SELECTION_MODEL_CHANGE_EVENT = "clay-row-selection-model-change";

/** `rowIndex` is the row's position in the `rows` prop. */
export type DataTableRowClickEvent = CustomEvent<{ id: string; rowIndex: number }>;
export type DataTableSortModelChangeEvent = CustomEvent<{ sortModel: DataTableSortModel }>;
export type DataTablePaginationModelChangeEvent = CustomEvent<{
  paginationModel: DataTablePaginationModel;
}>;
export type DataTableQuickFilterValueChangeEvent = CustomEvent<{ quickFilterValue: string }>;
export type DataTableRowSelectionModelChangeEvent = CustomEvent<{ rowSelectionModel: string[] }>;

declare global {
  interface HTMLElementEventMap {
    "clay-row-click": DataTableRowClickEvent;
    "clay-sort-model-change": DataTableSortModelChangeEvent;
    "clay-pagination-model-change": DataTablePaginationModelChangeEvent;
    "clay-quick-filter-value-change": DataTableQuickFilterValueChangeEvent;
    "clay-row-selection-model-change": DataTableRowSelectionModelChangeEvent;
  }
}

/** Interactive content inside a row keeps its own click; the row button is the row's own action. */
const INTERACTIVE = "a, button, input, select, textarea, label, summary, [tabindex]";

/** The body row a click activates, if any. Shared by the Astro controller and the Svelte bridge. */
export function clickedRow(target: EventTarget | null, body: HTMLElement) {
  if (!(target instanceof Element)) return undefined;
  const row = target.closest<HTMLTableRowElement>("tr[data-id]");
  if (!row || row.parentElement !== body) return undefined;
  const control = target.closest(INTERACTIVE);
  const own = !control || !row.contains(control) || control.matches(".clay-data-table__row-button");
  return own ? row : undefined;
}

function columnType(header: HTMLElement): DataTableColumnType {
  const type = header.dataset.type;
  return type === "number" || type === "actions" ? type : "string";
}

function initialSort(headers: readonly HTMLElement[]): DataTableSortModel {
  return headers.flatMap((header) => {
    const sort = header.getAttribute("aria-sort");
    const field = header.dataset.field;
    if (!field || (sort !== "ascending" && sort !== "descending")) return [];
    return [{ field, sort: sort === "ascending" ? ("asc" as const) : ("desc" as const) }];
  });
}

/** Sort keys written by the server render, parsed once per table. */
function readKeys(rows: readonly HTMLTableRowElement[], types: Map<string, DataTableColumnType>) {
  return new Map(
    rows.map((row) => [
      row,
      new Map(
        [...row.cells].flatMap((cell) => {
          const { field, sort } = cell.dataset;
          return field && sort !== undefined
            ? [[field, parseSortKey(sort, types.get(field) ?? "string")] as const]
            : [];
        }),
      ),
    ]),
  );
}

function attachDataTable(root: HTMLElement) {
  const table = root.querySelector<HTMLTableElement>(
    ":scope > .clay-data-table__body > .clay-table > table",
  );
  const tbody = table?.tBodies[0];
  const head = table?.tHead;
  if (!table || !tbody || !head) return;

  const mode = (value: string | undefined): DataTableMode =>
    value === "server" ? "server" : "client";
  const sortingMode = mode(root.dataset.sortingMode);
  const filterMode = mode(root.dataset.filterMode);
  const paginationMode = mode(root.dataset.paginationMode);
  const rows = [...tbody.rows]
    .filter((row) => row.dataset.id !== undefined)
    .sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
  const empty = tbody.querySelector<HTMLTableRowElement>(":scope > .clay-data-table__empty");
  const headers = [...head.querySelectorAll<HTMLTableCellElement>("th[data-field]")];
  const keys = readKeys(rows, new Map(headers.map((h) => [h.dataset.field!, columnType(h)])));
  const filterInput = root.querySelector<HTMLInputElement>("input[data-clay-quick-filter]");
  const pageSize = root.querySelector<HTMLSelectElement>("select[data-clay-page-size]");
  const displayed = root.querySelector<HTMLElement>(".clay-data-table__displayed");
  const previous = root.querySelector<HTMLButtonElement>("button[data-clay-page='previous']");
  const next = root.querySelector<HTMLButtonElement>("button[data-clay-page='next']");
  const selectAll = root.querySelector<HTMLInputElement>("input[data-clay-select-all]");
  const selectedStatus = root.querySelector<HTMLElement>(".clay-data-table__selected");

  let sortModel = initialSort(headers);
  let quickFilterValue = filterInput?.value ?? "";
  let paginationModel: DataTablePaginationModel | undefined =
    pageSize && displayed
      ? { page: Number(displayed.dataset.page), pageSize: Number(pageSize.value) }
      : undefined;
  let selected = rows
    .filter((row) => row.hasAttribute("data-selected"))
    .map((row) => row.dataset.id!);
  let ordered = rows;

  const emit = <Detail>(name: string, detail: Detail) =>
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const count = () =>
    paginationMode === "server" ? Number(root.dataset.rowCount) : ordered.length;

  function renderSelection() {
    for (const row of rows) {
      const isSelected = selected.includes(row.dataset.id!);
      row.toggleAttribute("data-selected", isSelected);
      const box = row.querySelector<HTMLInputElement>("input[data-clay-select-row]");
      if (box) box.checked = isSelected;
    }
    if (selectAll) {
      const state = selectAllState(
        selected,
        ordered.map((row) => row.dataset.id!),
      );
      selectAll.checked = state.checked;
      selectAll.indeterminate = state.indeterminate;
    }
    if (selectedStatus) {
      selectedStatus.textContent = selected.length
        ? fillTemplate(selectedStatus.dataset.template ?? "", { count: selected.length })
        : "";
    }
  }

  function renderPagination() {
    if (!paginationModel || !displayed) return;
    paginationModel = clampPage(paginationModel, count());
    displayed.dataset.page = String(paginationModel.page);
    displayed.textContent = displayedRows(
      displayed.dataset.template ?? "",
      paginationModel,
      count(),
    );
    if (previous) previous.disabled = paginationModel.page === 0;
    if (next)
      next.disabled = paginationModel.page >= pageCount(count(), paginationModel.pageSize) - 1;
  }

  function render() {
    ordered = dataTableOrder(rows, {
      search: (row) => row.dataset.search ?? "",
      key: (row, field) => keys.get(row)?.get(field) ?? "",
      sortModel,
      quickFilterValue,
      sortingMode,
      filterMode,
    });
    renderPagination();
    const visible = new Set(
      paginationModel ? pageSlice(ordered, paginationModel, paginationMode) : ordered,
    );
    if (sortingMode === "client") {
      const shown = new Set(ordered);
      tbody!.append(
        ...ordered,
        ...rows.filter((row) => !shown.has(row)),
        ...(empty ? [empty] : []),
      );
    }
    for (const row of rows) row.hidden = !visible.has(row);
    if (empty) empty.hidden = ordered.length > 0;
    for (const header of headers) {
      const sort = ariaSort(sortModel, header.dataset.field!);
      if (sort) header.setAttribute("aria-sort", sort);
      else header.removeAttribute("aria-sort");
    }
    renderSelection();
  }

  function setPage(page: number, size = paginationModel!.pageSize) {
    paginationModel = { page, pageSize: size };
    render();
    emit(DATA_TABLE_PAGINATION_MODEL_CHANGE_EVENT, { paginationModel });
  }

  head.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button[data-clay-sort]");
    const field = button?.closest<HTMLElement>("th")?.dataset.field;
    if (!field) return;
    sortModel = nextSortModel(sortModel, field);
    render();
    emit(DATA_TABLE_SORT_MODEL_CHANGE_EVENT, { sortModel });
  });

  // Filtering starts again from the first page.
  filterInput?.addEventListener("input", () => {
    quickFilterValue = filterInput.value;
    if (paginationModel && paginationModel.page !== 0) setPage(0);
    else render();
    emit(DATA_TABLE_QUICK_FILTER_VALUE_CHANGE_EVENT, { quickFilterValue });
  });

  pageSize?.addEventListener("change", () => setPage(0, Number(pageSize.value)));
  previous?.addEventListener("click", () => setPage(paginationModel!.page - 1));
  next?.addEventListener("click", () => setPage(paginationModel!.page + 1));

  selectAll?.addEventListener("change", () => {
    selected = toggleSelection(
      selected,
      ordered.map((row) => row.dataset.id!),
      selectAll.checked,
    );
    renderSelection();
    emit(DATA_TABLE_ROW_SELECTION_MODEL_CHANGE_EVENT, { rowSelectionModel: selected });
  });

  tbody.addEventListener("change", (event) => {
    const box = (event.target as Element).closest<HTMLInputElement>("input[data-clay-select-row]");
    const id = box?.closest<HTMLTableRowElement>("tr")?.dataset.id;
    if (!box || id === undefined) return;
    selected = toggleSelection(selected, [id], box.checked);
    renderSelection();
    emit(DATA_TABLE_ROW_SELECTION_MODEL_CHANGE_EVENT, { rowSelectionModel: selected });
  });

  if (root.hasAttribute("data-clickable-rows")) {
    tbody.addEventListener("click", (event) => {
      const row = clickedRow(event.target, tbody);
      if (!row) return;
      emit(DATA_TABLE_ROW_CLICK_EVENT, {
        id: row.dataset.id!,
        rowIndex: Number(row.dataset.index),
      });
    });
  }
}

/** Upgrade server-rendered data tables once per root. */
export const upgradeDataTables = upgrader<HTMLElement>("[data-clay-data-table]", attachDataTable);
