# Data patterns

Tables, detail and edit dialogs, and tag pickers built from `DataTable`, `Dialog` and `Autocomplete`. Each pattern below has a runnable Astro and Svelte example on the component page (`/components/data-table/`, `/components/autocomplete/`, `/components/dialog/`), served through [MCP](./mcp.md) and type-checked and browser-tested in fresh consumers.

## Table or DataTable

| Use                                                                       | Component                                                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Hand-written markup: merged cells, multiple header rows, a static summary | `Table` with native `thead`, `tbody`, `tr`, `th scope`, `td`                               |
| An array of records                                                       | `DataTable`: `rows` and `columns`, with sorting, search, pagination, selection, row clicks |

`DataTable` renders a `Table`, so size, sticky header and the labelled scroll region are the same.

## Migrating from Material UI v4 table wrappers

Wrapper components that composed MUI `Table`, `TablePagination` and `Dialog` map to props on one `DataTable`. Prop names follow MUI X `DataGrid`.

| Legacy pattern                                                          | Claymo                                                                                                                                       | Example                                                                        |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `items`                                                                 | `rows`                                                                                                                                       | All                                                                            |
| `displayKeys`, or nothing (keys of the first item)                      | `columns={["name", "stock"]}`, or omit `columns`                                                                                             | Columns from field names                                                       |
| `columns: [{ heading, itemKey, renderer }]`                             | `columns: [{ field, headerName, valueGetter, valueFormatter, renderCell }]`                                                                  | Formatted and custom cells                                                     |
| `detailRenderers[key](item)`, `null` shown as "None"                    | `valueFormatter` for text, `renderCell` for markup                                                                                           | Formatted and custom cells                                                     |
| `align="right"` on every cell                                           | `type: "number"` (end-aligned, numeric sort) or `align`                                                                                      | Columns from field names                                                       |
| `onClick({ item, index })` on rows                                      | Svelte `onRowClick({ id, row, rowIndex })`; Astro `clickableRows` and `clay-row-click`                                                       | Row details in a dialog                                                        |
| `DetailModalTable`, `MnTableModal` (`title`, `bodyRenderer`, `actions`) | Row click opens a `Dialog` with `title`, body content and an `actions` slot or snippet                                                       | Row details in a dialog                                                        |
| `FilterableTable` (`withSearchBar`, `searchVal`, `filterProps`)         | `quickFilter`, `quickFilterValue`, `filterable: false` on columns not to search; every typed word must match; typing returns to page 1       | Search, sort and paginate                                                      |
| `OrderableTable` (sorting was a TODO)                                   | Sortable headers by default; `sortModel`; `sortable: false` per column                                                                       | Search, sort and paginate                                                      |
| `PaginatedTable` (`page`, `itemsPerPage`, `[5, 10, 25, 50, 100]`)       | `pagination`, `paginationModel={{ page, pageSize }}`, `pageSizeOptions` (same default)                                                       | Search, sort and paginate                                                      |
| `SelectableTable` (a TODO)                                              | `checkboxSelection`, `rowSelectionModel`                                                                                                     | Selection with a bulk action                                                   |
| `ToolbarTable`, `toolbarRenderer`                                       | `toolbar` slot (Astro) or snippet (Svelte)                                                                                                   | Selection with a bulk action                                                   |
| `EditableTable` (`editable`, `onEdit`)                                  | A `type: "actions"` column whose `renderCell` holds an `IconButton`                                                                          | Edit rows in a dialog                                                          |
| `EditableModal` (edit mode, save, cancel; unsaved warning a TODO)       | `Dialog` with view and edit content; Svelte `onClose`, Astro cancelable `clay-request-close` guard unsaved edits                             | Dialog: View and edit modes; Edit rows in a dialog                             |
| `ListQueryRenderer` (loading, error, empty, GraphQL subscription)       | `loading`, `noRows` (Astro `no-rows`), `rowCount` with `paginationMode`, `sortingMode` and `filterMode` set to `"server"`; refetch on change | Server-side data with loading state (Svelte); Loading and empty states (Astro) |
| `ModelDisplayTable` (`filterFn` over a store)                           | Pass the filtered array: `rows={items.filter(filterFn)}`                                                                                     | –                                                                              |
| `TagAutocomplete`, `CreatableAutocomplete` (react-select)               | `Autocomplete multiple`, plus `freeSolo` to create values                                                                                    | Autocomplete page                                                              |

## Columns

A column is a field name or an object. The same definitions work in both bridges except `renderCell`.

| Key                                        | Effect                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `field`                                    | Row property to read                                                                 |
| `headerName`                               | Header text; default: the field                                                      |
| `type`                                     | `number` aligns right and sorts numerically; `actions` is not sortable or searchable |
| `valueGetter(value, row)`                  | Derived value; sorting uses it                                                       |
| `valueFormatter(value, row)`               | Displayed and searched text                                                          |
| `renderCell(params)`                       | Markup from `{ row, id, field, value, formattedValue, rowIndex }`                    |
| `sortable`, `filterable`, `align`, `width` | Per-column overrides                                                                 |

The first non-action column is the row header (`th scope="row"`); `rowHeader` picks another. Row ids come from `getRowId`, then `row.id`, then the position, and are strings.

Astro: write `renderCell` inline in the template, since frontmatter can't contain markup.

```astro
<DataTable
  label="Orders"
  rows={orders}
  columns={[
    { field: "id", headerName: "Order" },
    { field: "total", type: "number", valueFormatter: (value) => money.format(Number(value)) },
    {
      field: "status",
      renderCell: (params) => <Chip size="small" label={params.formattedValue} />,
    },
  ]}
/>
```

Svelte: `renderCell` takes a snippet.

```svelte
{#snippet status({ row }: DataTableCellParams<Order>)}
  <Chip size="small" label={row.status} color={statusColor[row.status]} />
{/snippet}

<DataTable label="Orders" rows={orders} columns={[{ field: "id" }, { field: "status", renderCell: status }]} />
```

## State and events

Sort, search, page and selection are models. Astro renders every row on the server and its page script updates them; events bubble from the root with the model in `detail`. Svelte binds them.

`quickFilterValue` filters rows even without a search box. Select all acts on rows matching the filter across client pages (only the supplied page in server mode); it preserves selected IDs outside that set.

| Model               | Astro event                        | Svelte                                                |
| ------------------- | ---------------------------------- | ----------------------------------------------------- |
| `sortModel`         | `clay-sort-model-change`           | `bind:sortModel`, `onSortModelChange`                 |
| `quickFilterValue`  | `clay-quick-filter-value-change`   | `bind:quickFilterValue`, `onQuickFilterValueChange`   |
| `paginationModel`   | `clay-pagination-model-change`     | `bind:paginationModel`, `onPaginationModelChange`     |
| `rowSelectionModel` | `clay-row-selection-model-change`  | `bind:rowSelectionModel`, `onRowSelectionModelChange` |
| Row click           | `clay-row-click` (`clickableRows`) | `onRowClick`                                          |

Clickable rows make the row header a button for keyboard users. Clicks on links, buttons and inputs inside a row keep their own behavior.

```astro
<DataTable id="articles" label="Articles" rows={articles} clickableRows />
<script>
  document.getElementById("articles")!.addEventListener("clay-row-click", (event) => {
    const { id, rowIndex } = event.detail; // rowIndex is the position in `rows`
  });
</script>
```

```svelte
<DataTable label="Articles" rows={articles} onRowClick={({ row }) => openDetails(row)} />
```

## Server-side data

Set `paginationMode`, `sortingMode` and `filterMode` to `"server"` when your API pages, sorts or searches. The table then shows `rows` as given, uses `rowCount` for the page label, and only reports model changes. Show `loading` while a request runs; the previous rows stay visible.

```svelte
<DataTable
  label="Books"
  {rows}
  {rowCount}
  {loading}
  quickFilter
  pagination
  paginationMode="server"
  sortingMode="server"
  filterMode="server"
  bind:paginationModel
  bind:sortModel
  bind:quickFilterValue
/>
```

Refetch in an `$effect` that reads the three models. In Astro, read the models from the URL on the server and navigate on change, for example `location.search = "?page=" + event.detail.paginationModel.page`.

## Dialog patterns

| Need                        | Svelte                                                    | Astro                                                                         |
| --------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Open from code              | `bind:open`                                               | `dialog.showModal()` or a button with `commandfor` and `command="show-modal"` |
| Title, body, actions        | `title`, children, `actions` snippet                      | `title`, default slot, `slot="actions"`                                       |
| Ask before discarding edits | `onClose`: leave `open` true to refuse                    | `clay-request-close`: `event.preventDefault()` to refuse                      |
| Save a form                 | `<form id>` plus `<Button type="submit" form>` in actions | Same; `method="dialog"` closes after submit                                   |

## Limits

- One sort column at a time; a single quick filter, no per-column filter UI.
- No column resizing, reordering, virtualization, grouping or cell editing. Edit in a dialog.
- Native table semantics, not an ARIA grid: Tab moves between controls; there is no arrow-key cell navigation.
- Astro rows come from the server. To change them, reload or navigate; client changes to rows are not tracked.
