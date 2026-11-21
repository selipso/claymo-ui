<script module lang="ts">
  export interface DataTableRowParams<Row> {
    id: string;
    row: Row;
    /** Position in the `rows` prop. */
    rowIndex: number;
  }
</script>

<script lang="ts" generics="Row extends object">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { actionIconAttrs } from "@claymo/core/actions";
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
  import { clickedRow } from "@claymo/core/behavior/display";
  import Checkbox from "./Checkbox.svelte";
  import IconButton from "./IconButton.svelte";
  import LinearProgress from "./LinearProgress.svelte";
  import Table from "./Table.svelte";
  import TextField from "./TextField.svelte";

  interface Props
    extends
      Omit<
        HTMLAttributes<HTMLDivElement>,
        keyof DataTableOptions | "role" | "tabindex" | "aria-label"
      >,
      DataTableOptions<Row, Snippet<[DataTableCellParams<Row>]>> {
    /** Makes rows clickable; the row header becomes their keyboard button. */
    onRowClick?: (params: DataTableRowParams<Row>, event: MouseEvent) => void;
    onSortModelChange?: (sortModel: DataTableSortModel) => void;
    onPaginationModelChange?: (paginationModel: DataTablePaginationModel) => void;
    onQuickFilterValueChange?: (quickFilterValue: string) => void;
    onRowSelectionModelChange?: (rowSelectionModel: string[]) => void;
    /** Content before the quick filter, e.g. bulk actions. */
    toolbar?: Snippet;
    /** Shown when `rows` is empty. */
    noRows?: Snippet;
  }

  let {
    rows,
    columns,
    getRowId,
    rowHeader,
    checkboxSelection = false,
    rowSelectionModel = $bindable([]),
    sortModel = $bindable([]),
    quickFilter = false,
    quickFilterValue = $bindable(""),
    pagination = false,
    paginationModel = $bindable({ ...dataTableDefaults.paginationModel }),
    pageSizeOptions = dataTableDefaults.pageSizeOptions,
    sortingMode = dataTableDefaults.mode,
    filterMode = dataTableDefaults.mode,
    paginationMode = dataTableDefaults.mode,
    rowCount,
    loading = false,
    localeText,
    label,
    size = dataTableDefaults.size,
    stickyHeader = false,
    onRowClick,
    onSortModelChange,
    onPaginationModelChange,
    onQuickFilterValueChange,
    onRowSelectionModelChange,
    toolbar,
    noRows,
    class: className = "",
    ...rest
  }: Props = $props();

  const rowsPerPageId = $props.id();
  const locale = $derived({ ...dataTableLocaleText, ...localeText });
  const view = $derived(
    dataTableView({
      rows,
      columns,
      getRowId,
      rowHeader,
      rowCount,
      sortModel,
      quickFilterValue,
      paginationModel: pagination ? paginationModel : undefined,
      rowSelectionModel,
      sortingMode,
      filterMode,
      paginationMode,
    }),
  );
  const pageSizes = $derived(
    pageSizeOptions.map((option) => ({ value: option, label: String(option) })),
  );

  function sortBy(field: string) {
    sortModel = nextSortModel(sortModel, field);
    onSortModelChange?.(sortModel);
  }

  function setPage(page: number, pageSize = paginationModel.pageSize) {
    paginationModel = { page, pageSize };
    onPaginationModelChange?.(paginationModel);
  }

  // Filtering starts again from the first page.
  function setQuickFilter(event: Event) {
    quickFilterValue = (event.currentTarget as HTMLInputElement).value;
    if (pagination && paginationModel.page !== 0) setPage(0);
    onQuickFilterValueChange?.(quickFilterValue);
  }

  function select(ids: readonly string[], checked: boolean) {
    const next = toggleSelection(rowSelectionModel, ids, checked);
    rowSelectionModel = next;
    onRowSelectionModelChange?.(next);
  }

  function clickRow(event: MouseEvent & { currentTarget: HTMLElement }) {
    const row = clickedRow(event.target, event.currentTarget);
    const model = row && view.models.find((candidate) => candidate.id === row.dataset.id);
    if (model) onRowClick?.({ id: model.id, row: model.row, rowIndex: model.index }, event);
  }
</script>

<div
  {...rest}
  class={["clay-data-table", className]}
  data-clickable-rows={onRowClick ? "" : undefined}
>
  {#if quickFilter || toolbar}
    <div class="clay-data-table__toolbar">
      {#if toolbar}<div class="clay-data-table__toolbar-content">{@render toolbar()}</div>{/if}
      {#if quickFilter}
        <TextField
          type="search"
          size="small"
          class="clay-data-table__quick-filter"
          aria-label={locale.toolbarQuickFilterLabel}
          placeholder={locale.toolbarQuickFilterPlaceholder}
          value={quickFilterValue}
          onChange={setQuickFilter}
        >
          {#snippet startAdornment()}
            <svg {...actionIconAttrs} width="18" height="18">
              <path d={dataTableIcons.search} />
            </svg>
          {/snippet}
        </TextField>
      {/if}
    </div>
  {/if}
  <div class="clay-data-table__body">
    {#if loading}
      <LinearProgress class="clay-data-table__loading" aria-label={locale.loadingLabel} />
    {/if}
    <Table {label} {size} {stickyHeader} aria-busy={loading ? "true" : undefined}>
      <thead>
        <tr>
          {#if checkboxSelection}
            <th scope="col" class="clay-data-table__checkbox">
              <Checkbox
                size="small"
                aria-label={locale.checkboxSelectionSelectAllRows}
                checked={view.selectAll.checked}
                indeterminate={view.selectAll.indeterminate}
                onChange={(_, checked) =>
                  select(
                    view.ordered.map((model) => model.id),
                    checked,
                  )}
              />
            </th>
          {/if}
          {#each view.columns as column (column.field)}
            <th
              scope="col"
              data-field={column.field}
              data-type={column.type}
              data-align={column.align}
              aria-sort={ariaSort(sortModel, column.field)}
              style:width={column.width ? `${column.width}px` : undefined}
            >
              {#if column.sortable}
                <button
                  type="button"
                  class="clay-data-table__sort"
                  onclick={() => sortBy(column.field)}
                >
                  {column.headerName}
                  <svg
                    class="clay-data-table__sort-icon"
                    {...actionIconAttrs}
                    width="16"
                    height="16"
                  >
                    <path d={dataTableIcons.sort} />
                  </svg>
                </button>
              {:else}
                {column.headerName}
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <!-- Keyboard users activate a row with its row-header button; the row click is a larger target. -->
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
      <tbody onclick={onRowClick ? clickRow : undefined}>
        {#each view.visible as model (model.id)}
          {@const isSelected = rowSelectionModel.includes(model.id)}
          <tr
            data-id={model.id}
            data-index={model.index}
            data-selected={isSelected ? "" : undefined}
          >
            {#if checkboxSelection}
              <td class="clay-data-table__checkbox">
                <Checkbox
                  size="small"
                  aria-label={fillTemplate(locale.checkboxSelectionSelectRow, {
                    row: model.cells[view.rowHeaderIndex]?.text ?? model.id,
                  })}
                  checked={isSelected}
                  value={model.id}
                  onChange={(_, checked) => select([model.id], checked)}
                />
              </td>
            {/if}
            {#each view.columns as column, index (column.field)}
              {@const cell = model.cells[index]!}
              {@const isHeader = index === view.rowHeaderIndex}
              {#snippet content()}
                {#if column.renderCell}
                  {@render column.renderCell({
                    row: model.row,
                    id: model.id,
                    field: column.field,
                    value: cell.value,
                    formattedValue: cell.text,
                    rowIndex: model.index,
                  })}
                {:else}
                  {cell.text}
                {/if}
              {/snippet}
              <svelte:element
                this={isHeader ? "th" : "td"}
                scope={isHeader ? "row" : undefined}
                data-field={column.field}
                data-align={column.align}
              >
                {#if onRowClick && isHeader}
                  <button type="button" class="clay-data-table__row-button"
                    >{@render content()}</button
                  >
                {:else}
                  {@render content()}
                {/if}
              </svelte:element>
            {/each}
          </tr>
        {/each}
        {#if view.ordered.length === 0}
          <tr class="clay-data-table__empty">
            <td colspan={view.columns.length + (checkboxSelection ? 1 : 0)}>
              {#if loading}
                {locale.loadingLabel}
              {:else if rows.length === 0}
                {#if noRows}{@render noRows()}{:else}{locale.noRowsLabel}{/if}
              {:else}
                {locale.noResultsOverlayLabel}
              {/if}
            </td>
          </tr>
        {/if}
      </tbody>
    </Table>
  </div>
  {#if pagination || checkboxSelection}
    <div class="clay-data-table__footer">
      {#if checkboxSelection}
        <span class="clay-data-table__selected" role="status">
          {rowSelectionModel.length
            ? fillTemplate(locale.footerRowSelected, { count: rowSelectionModel.length })
            : ""}
        </span>
      {/if}
      {#if view.page}
        {@const page = view.page}
        <div class="clay-data-table__pagination">
          <span id={rowsPerPageId}>{locale.paginationRowsPerPage}</span>
          <TextField
            select
            size="small"
            class="clay-data-table__page-size"
            aria-labelledby={rowsPerPageId}
            options={pageSizes}
            value={page.pageSize}
            onChange={(event) =>
              setPage(0, Number((event.currentTarget as HTMLSelectElement).value))}
          />
          <span class="clay-data-table__displayed" role="status">
            {displayedRows(locale.paginationDisplayedRows, page, view.count)}
          </span>
          <IconButton
            size="small"
            aria-label={locale.paginationPrevious}
            disabled={page.page === 0}
            onclick={() => setPage(page.page - 1)}
          >
            <svg {...actionIconAttrs} width="18" height="18">
              <path d={dataTableIcons.previous} />
            </svg>
          </IconButton>
          <IconButton
            size="small"
            aria-label={locale.paginationNext}
            disabled={page.page >= view.lastPage}
            onclick={() => setPage(page.page + 1)}
          >
            <svg {...actionIconAttrs} width="18" height="18">
              <path d={dataTableIcons.next} />
            </svg>
          </IconButton>
        </div>
      {/if}
    </div>
  {/if}
</div>
