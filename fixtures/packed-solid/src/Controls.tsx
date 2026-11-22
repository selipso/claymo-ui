import { createSignal } from "solid-js";
import { Autocomplete, Button, Checkbox, DataTable, Dialog } from "@claymo/solid";

const rows = [
  { id: "reef", name: "Reef" },
  { id: "bay", name: "Bay" },
];
export default function Controls() {
  const [open, setOpen] = createSignal(false);
  const [selected, setSelected] = createSignal(false);
  return (
    <>
      <Checkbox
        aria-label="Notifications"
        checked={selected()}
        onChange={(_, checked) => setSelected(checked)}
      />
      <Button disabled={!selected()} onClick={() => setOpen(true)}>
        Edit settings
      </Button>
      <Dialog title="Settings" open={open()} onClose={() => setOpen(false)} dismissible>
        <Autocomplete label="Site" options={["Reef", "Bay"]} />
      </Dialog>
      <DataTable
        label="Sites"
        rows={rows}
        columns={[{ field: "name", headerName: "Site" }]}
        quickFilter
        checkboxSelection
      />
    </>
  );
}
