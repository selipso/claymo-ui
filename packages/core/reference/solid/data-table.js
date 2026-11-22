import display from "../display.json" with { type: "json" };

const { columns, paginationModel, quickFilterValue, rowSelectionModel, sortModel } =
  display.DataTable.props;
const [fieldName, columnDefinition] = columns.items.anyOf;

export default {
  DataTable: {
    purpose:
      "Data-driven table with sorting, quick filter search, checkbox selection, pagination and clickable rows. Column definitions can be field-name strings or objects with an optional renderCell function returning JSX. Use Table for hand-written markup.",
    required: ["label", "rows"],
    props: {
      columns: {
        ...columns,
        items: {
          anyOf: [
            fieldName,
            {
              ...columnDefinition,
              properties: {
                ...columnDefinition.properties,
                renderCell: {
                  description:
                    "(params: { row, id, field, value, formattedValue, rowIndex }) => JSX.Element. The default cell shows formattedValue. Column type actions suits buttons or links.",
                },
              },
            },
          ],
        },
      },
      paginationModel: {
        ...paginationModel,
        description:
          "Zero-based page and page size. Omit for internal state, or update this prop in onPaginationModelChange.",
      },
      quickFilterValue: {
        ...quickFilterValue,
        description:
          "Search text. Omit for internal state, or update this prop in onQuickFilterValueChange.",
      },
      rowSelectionModel: {
        ...rowSelectionModel,
        description:
          "Selected row ids. Omit for internal state, or update this prop in onRowSelectionModelChange.",
      },
      sortModel: {
        ...sortModel,
        description:
          "Active sort; header clicks cycle ascending, descending, unsorted. Omit for internal state, or update this prop in onSortModelChange.",
      },
      onRowClick: {
        description:
          "({ id, row, rowIndex }, event: MouseEvent) => void. Makes rows clickable and the row header a keyboard button. Interactive controls inside a row keep their own behavior.",
      },
    },
    content: [
      "toolbar: JSX before the quick filter, e.g. bulk actions.",
      "noRows: JSX shown when rows is empty and the table is not loading.",
    ],
    events: [
      "onRowClick({ id, row, rowIndex }, event): click a noninteractive part of a row or activate its row-header button. rowIndex is its position in rows.",
      "onSortModelChange(sortModel): change the active sort.",
      "onPaginationModelChange(paginationModel): change the page or page size; changing the quick filter resets the page to zero.",
      "onQuickFilterValueChange(quickFilterValue): change the search text.",
      "onRowSelectionModelChange(rowSelectionModel): change selected row ids. Select all covers filtered rows in client mode, or supplied rows in server pagination mode.",
    ],
    examples: [
      {
        title: "Columns from field names",
        source: `import { DataTable } from "@claymo/solid";

const rows = [
  { id: 1, name: "Notebook", category: "Paper", stock: 14 },
  { id: 2, name: "Fountain pen", category: "Writing", stock: 3 },
  { id: 3, name: "Desk lamp", category: "Lighting", stock: 0 },
];

export default function Example() {
  return (
    <DataTable
      label="Inventory"
      rows={rows}
      columns={["name", "category", { field: "stock", headerName: "In stock", type: "number" }]}
    />
  );
}`,
      },
      {
        title: "Formatted and custom cells",
        source: `import { Chip, DataTable } from "@claymo/solid";

type Order = {
  id: string;
  customer: string;
  total: number | null;
  paid: boolean;
  status: "Shipped" | "Pending" | "Cancelled";
};
const rows: Order[] = [
  { id: "A-1001", customer: "Ada Byron", total: 128.5, paid: true, status: "Shipped" },
  { id: "A-1002", customer: "Grace Hopper", total: 42, paid: false, status: "Pending" },
  { id: "A-1003", customer: "Alan Kay", total: null, paid: false, status: "Cancelled" },
];
const statusColor = { Shipped: "success", Pending: "warning", Cancelled: "error" } as const;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function Example() {
  return (
    <DataTable
      label="Orders"
      rows={rows}
      columns={[
        { field: "id", headerName: "Order" },
        { field: "customer", headerName: "Customer" },
        {
          field: "total",
          headerName: "Total",
          type: "number",
          valueFormatter: (value) => (value == null ? "None" : money.format(Number(value))),
        },
        {
          field: "paid",
          headerName: "Paid",
          valueGetter: (_, row) => (row.paid ? 1 : 0),
          valueFormatter: (value) => (value ? "Yes" : "No"),
        },
        {
          field: "status",
          headerName: "Status",
          renderCell: ({ row }) => <Chip size="small" label={row.status} color={statusColor[row.status]} />,
        },
      ]}
    />
  );
}`,
      },
      {
        title: "Search, sort and paginate",
        source: `import { type DataTableSortModel } from "@claymo/core/display";
import { DataTable } from "@claymo/solid";
import { createSignal } from "solid-js";

const names = [
  "Atlas", "Birch", "Cedar", "Delta", "Ember", "Fjord", "Grove", "Harbor", "Inlet", "Juniper", "Kestrel", "Lagoon",
];
const regions = ["North", "Coast", "Valley"];
const rows = names.map((name, index) => ({
  id: index + 1,
  name,
  region: regions[index % 3],
  visits: (index * 37) % 100,
}));

export default function Example() {
  const [paginationModel, setPaginationModel] = createSignal({ page: 0, pageSize: 5 });
  const [sortModel, setSortModel] = createSignal<DataTableSortModel>([{ field: "visits", sort: "desc" }]);
  const [quickFilterValue, setQuickFilterValue] = createSignal("");

  return (
    <DataTable
      label="Sites"
      rows={rows}
      columns={[
        { field: "name", headerName: "Site" },
        { field: "region", headerName: "Region" },
        { field: "visits", headerName: "Visits", type: "number" },
      ]}
      quickFilter
      quickFilterValue={quickFilterValue()}
      onQuickFilterValueChange={setQuickFilterValue}
      sortModel={sortModel()}
      onSortModelChange={setSortModel}
      pagination
      paginationModel={paginationModel()}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[5, 10, 25]}
    />
  );
}`,
      },
      {
        title: "Row details in a dialog",
        source: `import { Button, DataTable, Dialog } from "@claymo/solid";
import { createSignal } from "solid-js";

type Article = { id: number; title: string; author: string; summary: string };
const rows: Article[] = [
  {
    id: 1,
    title: "Tide tables",
    author: "M. Reyes",
    summary: "How the moon sets the rhythm of the coast.",
  },
  {
    id: 2,
    title: "Reef survey",
    author: "K. Osei",
    summary: "A season of counts along the outer reef.",
  },
  {
    id: 3,
    title: "Kelp forests",
    author: "L. Park",
    summary: "Why kelp grows fastest in cold water.",
  },
];

export default function Example() {
  const [active, setActive] = createSignal<Article>();
  const [open, setOpen] = createSignal(false);
  const close = () => setOpen(false);

  return (
    <>
      <DataTable
        label="Articles"
        rows={rows}
        columns={[
          { field: "title", headerName: "Title" },
          { field: "author", headerName: "Author" },
        ]}
        onRowClick={({ row }) => {
          setActive(row);
          setOpen(true);
        }}
      />
      <Dialog
        open={open()}
        title={active()?.title ?? "Article"}
        dismissible
        onClose={close}
        actions={<Button onClick={close}>Close</Button>}
      >
        <p>{active()?.summary}</p>
      </Dialog>
    </>
  );
}`,
      },
      {
        title: "Selection with a bulk action",
        source: `import { Button, DataTable } from "@claymo/solid";
import { createSignal } from "solid-js";

export default function Example() {
  const [rows, setRows] = createSignal([
    { id: "f1", name: "budget.xlsx", owner: "Ada", size: 24 },
    { id: "f2", name: "logo.svg", owner: "Grace", size: 8 },
    { id: "f3", name: "notes.md", owner: "Alan", size: 2 },
  ]);
  const [selected, setSelected] = createSignal<string[]>([]);

  function remove() {
    const ids = new Set(selected());
    setRows((rows) => rows.filter((row) => !ids.has(row.id)));
    setSelected([]);
  }

  return (
    <DataTable
      label="Files"
      rows={rows()}
      columns={[
        { field: "name", headerName: "Name" },
        { field: "owner", headerName: "Owner" },
        { field: "size", headerName: "Size (KB)", type: "number" },
      ]}
      checkboxSelection
      rowSelectionModel={selected()}
      onRowSelectionModelChange={setSelected}
      toolbar={
        <Button variant="outlined" color="error" disabled={selected().length === 0} onClick={remove}>
          Delete selected
        </Button>
      }
    />
  );
}`,
      },
      {
        title: "Edit rows in a dialog",
        source: `import { Button, DataTable, Dialog, IconButton, TextField } from "@claymo/solid";
import { createMemo, createSignal, createUniqueId } from "solid-js";

type Contact = { id: number; name: string; email: string };

export default function Example() {
  const [rows, setRows] = createSignal<Contact[]>([
    { id: 1, name: "Ada Byron", email: "ada@example.com" },
    { id: 2, name: "Grace Hopper", email: "grace@example.com" },
  ]);
  const [editing, setEditing] = createSignal<Contact>();
  const [draft, setDraft] = createSignal({ name: "", email: "" });
  const [open, setOpen] = createSignal(false);
  const formId = createUniqueId();
  const dirty = createMemo(() => {
    const contact = editing();
    return !!contact && (draft().name !== contact.name || draft().email !== contact.email);
  });

  function edit(contact: Contact) {
    setEditing(contact);
    setDraft({ name: contact.name, email: contact.email });
    setOpen(true);
  }

  function save(event: SubmitEvent) {
    event.preventDefault();
    const id = editing()?.id;
    setRows((rows) => rows.map((row) => (row.id === id ? { ...row, ...draft() } : row)));
    setOpen(false);
  }

  function requestClose() {
    if (!dirty() || window.confirm("Discard unsaved changes?")) setOpen(false);
  }

  return (
    <>
      <DataTable
        label="Contacts"
        rows={rows()}
        columns={[
          { field: "name", headerName: "Name" },
          { field: "email", headerName: "Email" },
          {
            field: "edit",
            type: "actions",
            renderCell: ({ row }) => (
              <IconButton size="small" aria-label={"Edit " + row.name} onClick={() => edit(row)}>
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
                </svg>
              </IconButton>
            ),
          },
        ]}
      />
      <Dialog
        open={open()}
        title="Edit contact"
        onClose={requestClose}
        actions={
          <>
            <Button variant="text" onClick={requestClose}>Cancel</Button>
            <Button type="submit" form={formId} disabled={!dirty()}>Save</Button>
          </>
        }
      >
        <form id={formId} onSubmit={save} style={{ display: "grid", gap: "16px", "padding-block-start": "8px" }}>
          <TextField
            label="Name"
            fullWidth
            required
            value={draft().name}
            onChange={(event) => {
              const name = (event.currentTarget as HTMLInputElement).value;
              setDraft((draft) => ({ ...draft, name }));
            }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={draft().email}
            onChange={(event) => {
              const email = (event.currentTarget as HTMLInputElement).value;
              setDraft((draft) => ({ ...draft, email }));
            }}
          />
        </form>
      </Dialog>
    </>
  );
}`,
      },
      {
        title: "Server-side data with loading state",
        source: `import type { DataTablePaginationModel, DataTableSortModel } from "@claymo/core/display";
import { DataTable } from "@claymo/solid";
import { createEffect, createSignal } from "solid-js";

type Book = { id: number; title: string; year: number };
const library: Book[] = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  title: "Volume " + (index + 1),
  year: 1990 + ((index * 7) % 30),
}));

// Replace with an API request supplying its current page and unpaginated total.
async function fetchBooks(page: DataTablePaginationModel, sort: DataTableSortModel, search: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const terms = search.toLowerCase().trim().split(/\\s+/).filter(Boolean);
  const found = library.filter((book) => {
    const text = (book.title + " " + book.year).toLowerCase();
    return terms.every((term) => text.includes(term));
  });
  const [order] = sort;
  if (order) {
    const direction = order.sort === "asc" ? 1 : -1;
    found.sort((a, b) => direction * (order.field === "year" ? a.year - b.year : a.id - b.id));
  }
  const start = page.page * page.pageSize;
  return { rows: found.slice(start, start + page.pageSize), total: found.length };
}

export default function Example() {
  const [paginationModel, setPaginationModel] = createSignal({ page: 0, pageSize: 5 });
  const [sortModel, setSortModel] = createSignal<DataTableSortModel>([]);
  const [quickFilterValue, setQuickFilterValue] = createSignal("");
  const [result, setResult] = createSignal<{ rows: Book[]; total: number }>({ rows: [], total: 0 });
  const [loading, setLoading] = createSignal(true);

  createEffect(
    () => ({ page: paginationModel(), sort: sortModel(), search: quickFilterValue() }),
    ({ page, sort, search }) => {
      let current = true;
      setLoading(true);
      void fetchBooks(page, sort, search).then((next) => {
        if (!current) return;
        setResult(next);
        setLoading(false);
      });
      return () => { current = false; };
    },
  );

  return (
    <DataTable
      label="Books"
      rows={result().rows}
      rowCount={result().total}
      loading={loading()}
      columns={[
        { field: "title", headerName: "Title" },
        { field: "year", headerName: "Year", type: "number" },
      ]}
      quickFilter
      pagination
      pageSizeOptions={[5, 10]}
      paginationMode="server"
      sortingMode="server"
      filterMode="server"
      paginationModel={paginationModel()}
      onPaginationModelChange={setPaginationModel}
      sortModel={sortModel()}
      onSortModelChange={setSortModel}
      quickFilterValue={quickFilterValue()}
      onQuickFilterValueChange={setQuickFilterValue}
      noRows={<span>No books match.</span>}
    />
  );
}`,
      },
      {
        title: "Loading and empty states",
        source: `import { DataTable } from "@claymo/solid";

const columns = [
  { field: "name", headerName: "Report" },
  { field: "owner", headerName: "Owner" },
];

export default function Example() {
  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <DataTable label="Reports, loading" rows={[]} columns={columns} loading />
      <DataTable
        label="Reports"
        rows={[]}
        columns={columns}
        noRows={<span>No reports yet. Reports you create appear here.</span>}
      />
    </div>
  );
}`,
      },
    ],
  },
};
