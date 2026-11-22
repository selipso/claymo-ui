import { actionIconAttrs } from "@claymo/core/actions";
import { clickedRow } from "@claymo/core/behavior/display";
import {
  ariaSort,
  dataTableDefaults,
  dataTableIcons,
  dataTableLocaleText,
  dataTableView,
  displayedRows,
  fillTemplate,
  nextSortModel,
  toggleSelection,
  type DataTableCellParams,
  type DataTableOptions,
  type DataTablePaginationModel,
  type DataTableSortModel,
} from "@claymo/core/display";
import { dynamic, For, Show, type JSX } from "@solidjs/web";
import { children, createMemo, createSignal, createUniqueId } from "solid-js";
import { IconButton } from "./actions.js";
import { Checkbox, TextField } from "./inputs.js";
import { LinearProgress } from "./overlays.js";
import { omit } from "./shared.js";
import { Table } from "./surfaces.js";

export interface DataTableRowParams<Row> {
  id: string;
  row: Row;
  /** Position in the `rows` prop. */
  rowIndex: number;
}

export type DataTableRenderCell<Row extends object> = (
  params: DataTableCellParams<Row>,
) => JSX.Element;

export interface DataTableProps<Row extends object>
  extends
    DataTableOptions<Row, DataTableRenderCell<Row>>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "role" | "tabindex" | "aria-label" | "children"> {
  /** Makes rows clickable; the row header becomes their keyboard button. */
  onRowClick?: (params: DataTableRowParams<Row>, event: MouseEvent) => void;
  onSortModelChange?: (sortModel: DataTableSortModel) => void;
  onPaginationModelChange?: (paginationModel: DataTablePaginationModel) => void;
  onQuickFilterValueChange?: (quickFilterValue: string) => void;
  onRowSelectionModelChange?: (rowSelectionModel: string[]) => void;
  /** Content before the quick filter, e.g. bulk actions. */
  toolbar?: JSX.Element;
  /** Shown when `rows` is empty and the table is not loading. */
  noRows?: JSX.Element;
}

export function DataTable<Row extends object>(props: DataTableProps<Row>) {
  const rest = omit(props, [
    "rows",
    "columns",
    "getRowId",
    "rowHeader",
    "checkboxSelection",
    "rowSelectionModel",
    "sortModel",
    "quickFilter",
    "quickFilterValue",
    "pagination",
    "paginationModel",
    "pageSizeOptions",
    "sortingMode",
    "filterMode",
    "paginationMode",
    "rowCount",
    "loading",
    "localeText",
    "label",
    "size",
    "stickyHeader",
    "onRowClick",
    "onSortModelChange",
    "onPaginationModelChange",
    "onQuickFilterValueChange",
    "onRowSelectionModelChange",
    "toolbar",
    "noRows",
    "class",
  ]);
  const toolbar = children(() => props.toolbar);
  const [localSort, setLocalSort] = createSignal<DataTableSortModel>([]);
  const [localPage, setLocalPage] = createSignal<DataTablePaginationModel>(
    dataTableDefaults.paginationModel,
  );
  const [localFilter, setLocalFilter] = createSignal("");
  const [localSelection, setLocalSelection] = createSignal<readonly string[]>([]);
  const sortModel = () => props.sortModel ?? localSort();
  const paginationModel = () => props.paginationModel ?? localPage();
  const quickFilterValue = () => props.quickFilterValue ?? localFilter();
  const rowSelectionModel = () => props.rowSelectionModel ?? localSelection();
  const rowsPerPageId = createUniqueId();
  const locale = createMemo(() => ({ ...dataTableLocaleText, ...props.localeText }));
  const view = createMemo(() =>
    dataTableView({
      rows: props.rows,
      columns: props.columns,
      getRowId: props.getRowId,
      rowHeader: props.rowHeader,
      rowCount: props.rowCount,
      sortModel: sortModel(),
      quickFilterValue: quickFilterValue(),
      paginationModel: props.pagination ? paginationModel() : undefined,
      rowSelectionModel: rowSelectionModel(),
      sortingMode: props.sortingMode ?? dataTableDefaults.mode,
      filterMode: props.filterMode ?? dataTableDefaults.mode,
      paginationMode: props.paginationMode ?? dataTableDefaults.mode,
    }),
  );
  const selected = createMemo(() => new Set(rowSelectionModel()));
  const pageSizes = createMemo(() =>
    (props.pageSizeOptions ?? dataTableDefaults.pageSizeOptions).map((value) => ({
      value,
      label: String(value),
    })),
  );

  function sortBy(field: string) {
    const next = nextSortModel(sortModel(), field);
    if (props.sortModel === undefined) setLocalSort(next);
    props.onSortModelChange?.(next);
  }

  function setPage(page: number, pageSize = paginationModel().pageSize) {
    const next = { page, pageSize };
    if (props.paginationModel === undefined) setLocalPage(next);
    props.onPaginationModelChange?.(next);
  }

  function setQuickFilter(event: Event) {
    const next = (event.currentTarget as HTMLInputElement).value;
    if (props.quickFilterValue === undefined) setLocalFilter(next);
    if (props.pagination && paginationModel().page !== 0) setPage(0);
    props.onQuickFilterValueChange?.(next);
  }

  function select(ids: readonly string[], checked: boolean) {
    const next = toggleSelection(rowSelectionModel(), ids, checked);
    if (props.rowSelectionModel === undefined) setLocalSelection(next);
    props.onRowSelectionModelChange?.(next);
  }

  function clickRow(event: MouseEvent & { currentTarget: HTMLTableSectionElement }) {
    if (!props.onRowClick) return;
    const row = clickedRow(event.target, event.currentTarget);
    if (!row) return;
    const model = view().models[Number(row.dataset.index)];
    if (model) props.onRowClick({ id: model.id, row: model.row, rowIndex: model.index }, event);
  }

  return (
    <div
      {...rest}
      class={["clay-data-table", props.class]}
      data-clickable-rows={props.onRowClick ? "" : undefined}
    >
      <Show when={props.quickFilter || toolbar() != null}>
        <div class="clay-data-table__toolbar">
          <Show when={toolbar() != null}>
            <div class="clay-data-table__toolbar-content">{toolbar()}</div>
          </Show>
          <Show when={props.quickFilter}>
            <TextField
              type="search"
              size="small"
              class="clay-data-table__quick-filter"
              aria-label={locale().toolbarQuickFilterLabel}
              placeholder={locale().toolbarQuickFilterPlaceholder}
              value={quickFilterValue()}
              onChange={setQuickFilter}
              startAdornment={
                <svg {...actionIconAttrs} width="18" height="18">
                  <path d={dataTableIcons.search} />
                </svg>
              }
            />
          </Show>
        </div>
      </Show>
      <div class="clay-data-table__body">
        <Show when={props.loading}>
          <LinearProgress class="clay-data-table__loading" aria-label={locale().loadingLabel} />
        </Show>
        <Table
          label={props.label}
          size={props.size ?? dataTableDefaults.size}
          stickyHeader={props.stickyHeader}
          aria-busy={props.loading ? "true" : undefined}
        >
          <thead>
            <tr>
              <Show when={props.checkboxSelection}>
                <th scope="col" class="clay-data-table__checkbox">
                  <Checkbox
                    size="small"
                    aria-label={locale().checkboxSelectionSelectAllRows}
                    checked={view().selectAll.checked}
                    indeterminate={view().selectAll.indeterminate}
                    onChange={(_, checked) =>
                      select(
                        view().ordered.map((model) => model.id),
                        checked,
                      )
                    }
                  />
                </th>
              </Show>
              <For each={view().columns} keyed={(column) => column.field}>
                {(column) => (
                  <th
                    scope="col"
                    data-field={column().field}
                    data-type={column().type}
                    data-align={column().align}
                    aria-sort={ariaSort(sortModel(), column().field)}
                    style={{ width: column().width ? `${column().width}px` : undefined }}
                  >
                    <Show when={column().sortable} fallback={column().headerName}>
                      <button
                        type="button"
                        class="clay-data-table__sort"
                        onClick={() => sortBy(column().field)}
                      >
                        {column().headerName}
                        <svg
                          {...actionIconAttrs}
                          class="clay-data-table__sort-icon"
                          width="16"
                          height="16"
                        >
                          <path d={dataTableIcons.sort} />
                        </svg>
                      </button>
                    </Show>
                  </th>
                )}
              </For>
            </tr>
          </thead>
          {/* The row-header button handles keyboard activation; the body provides the larger click target. */}
          <tbody onClick={clickRow}>
            <For each={view().visible} keyed={(model) => model.id}>
              {(model) => {
                const id = model().id;
                const isSelected = () => selected().has(id);
                return (
                  <tr
                    data-id={id}
                    data-index={model().index}
                    data-selected={isSelected() ? "" : undefined}
                  >
                    <Show when={props.checkboxSelection}>
                      <td class="clay-data-table__checkbox">
                        <Checkbox
                          size="small"
                          aria-label={fillTemplate(locale().checkboxSelectionSelectRow, {
                            row: model().cells[view().rowHeaderIndex]?.text ?? id,
                          })}
                          checked={isSelected()}
                          value={id}
                          onChange={(_, checked) => select([id], checked)}
                        />
                      </td>
                    </Show>
                    <For each={view().columns} keyed={(column) => column.field}>
                      {(column, index) => {
                        const field = column().field;
                        const cell = () => model().cells[index()]!;
                        const isHeader = () => index() === view().rowHeaderIndex;
                        const Cell = dynamic(() => (isHeader() ? "th" : "td"));
                        const content = () => (
                          <Show when={column().renderCell} keyed fallback={cell().text}>
                            {(render) => {
                              // A selection or sort change can regenerate the view without
                              // changing this cell. Don't remount its custom controls for that.
                              const params = createMemo<DataTableCellParams<Row>>((previous) => {
                                const { row, index: rowIndex } = model();
                                const { value, text: formattedValue } = cell();
                                if (
                                  previous?.row === row &&
                                  previous.rowIndex === rowIndex &&
                                  Object.is(previous.value, value) &&
                                  previous.formattedValue === formattedValue
                                ) {
                                  return previous;
                                }
                                return { row, id, field, value, formattedValue, rowIndex };
                              });
                              return <>{render(params())}</>;
                            }}
                          </Show>
                        );
                        return (
                          <Cell
                            scope={isHeader() ? "row" : undefined}
                            data-field={field}
                            data-align={column().align}
                          >
                            <Show when={props.onRowClick && isHeader()} fallback={content()}>
                              <button type="button" class="clay-data-table__row-button">
                                {content()}
                              </button>
                            </Show>
                          </Cell>
                        );
                      }}
                    </For>
                  </tr>
                );
              }}
            </For>
            <Show when={view().ordered.length === 0}>
              <tr class="clay-data-table__empty">
                <td
                  colspan={Math.max(1, view().columns.length + (props.checkboxSelection ? 1 : 0))}
                >
                  {props.loading
                    ? locale().loadingLabel
                    : props.rows.length === 0
                      ? (props.noRows ?? locale().noRowsLabel)
                      : locale().noResultsOverlayLabel}
                </td>
              </tr>
            </Show>
          </tbody>
        </Table>
      </div>
      <Show when={props.pagination || props.checkboxSelection}>
        <div class="clay-data-table__footer">
          <Show when={props.checkboxSelection}>
            <span class="clay-data-table__selected" role="status">
              {rowSelectionModel().length
                ? fillTemplate(locale().footerRowSelected, { count: rowSelectionModel().length })
                : ""}
            </span>
          </Show>
          <Show when={view().page}>
            {(page) => (
              <div class="clay-data-table__pagination">
                <span id={rowsPerPageId}>{locale().paginationRowsPerPage}</span>
                <TextField
                  select
                  size="small"
                  class="clay-data-table__page-size"
                  aria-labelledby={rowsPerPageId}
                  options={pageSizes()}
                  value={page().pageSize}
                  onChange={(event) =>
                    setPage(0, Number((event.currentTarget as HTMLSelectElement).value))
                  }
                />
                <span class="clay-data-table__displayed" role="status">
                  {displayedRows(locale().paginationDisplayedRows, page(), view().count)}
                </span>
                <IconButton
                  size="small"
                  aria-label={locale().paginationPrevious}
                  disabled={page().page === 0}
                  onClick={() => setPage(page().page - 1)}
                >
                  <svg {...actionIconAttrs} width="18" height="18">
                    <path d={dataTableIcons.previous} />
                  </svg>
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={locale().paginationNext}
                  disabled={page().page >= view().lastPage}
                  onClick={() => setPage(page().page + 1)}
                >
                  <svg {...actionIconAttrs} width="18" height="18">
                    <path d={dataTableIcons.next} />
                  </svg>
                </IconButton>
              </div>
            )}
          </Show>
        </div>
      </Show>
    </div>
  );
}
