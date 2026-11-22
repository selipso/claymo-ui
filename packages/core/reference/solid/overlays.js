const modalClose = {
  description:
    "Callback (event: Event, reason: 'escapeKeyDown' | 'backdropClick' | 'closeButton') => void. Set open to false to accept a dismissal request; leave open unchanged to reject it. Without the callback the modal dismisses itself.",
};
const defaultOpen = {
  type: "boolean",
  default: false,
  description:
    "Initial visibility when open is omitted. Later changes to defaultOpen do not change visibility.",
};

export default {
  Dialog: {
    props: {
      open: {
        type: "boolean",
        default: false,
        description:
          "Reactive modal visibility. With onClose, the owner decides whether to accept a dismissal by setting open to false.",
      },
      defaultOpen,
      onClose: modalClose,
    },
    required: [],
    content: ["children: dialog body.", "actions: optional JSX rendered after the body."],
    events: [
      "onClose(event, reason): requests dismissal on Escape, a backdrop click, or the optional top-corner close button. The reason is escapeKeyDown, backdropClick, or closeButton respectively.",
      'A native close such as submitting a form with method="dialog" cannot be vetoed. If Claymo considered the dialog open, it resets its local state and reports escapeKeyDown for bridge compatibility.',
    ],
    examples: [
      {
        title: "Dialog with close button and backdrop guard",
        source: `import { createSignal } from "solid-js";
import { Button, Dialog } from "@claymo/solid";

export default function Example() {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open help</Button>
      <Dialog
        open={open()}
        title="Account help"
        dismissible
        closeText="Dismiss help"
        onClose={(_event, reason) => {
          if (reason !== "backdropClick") setOpen(false);
        }}
        actions={<Button variant="text" onClick={() => setOpen(false)}>Close</Button>}
      >
        <p>Change your contact information in Account Settings.</p>
        <p>Use Close, the X, or Escape to leave this dialog.</p>
      </Dialog>
    </>
  );
}`,
      },
      {
        title: "Edit in a modal and guard unsaved changes",
        source: `import { createSignal, Show } from "solid-js";
import { Button, Dialog, TextField } from "@claymo/solid";

export default function Example() {
  const [open, setOpen] = createSignal(false);
  const [saved, setSaved] = createSignal("Weekly sync with the design team.");
  const [draft, setDraft] = createSignal(saved());
  const [confirming, setConfirming] = createSignal(false);

  function startEditing() {
    setDraft(saved());
    setConfirming(false);
    setOpen(true);
  }

  function requestClose() {
    if (draft() === saved()) setOpen(false);
    else setConfirming(true);
  }

  return (
    <>
      <p>{saved()}</p>
      <Button onClick={startEditing}>Edit event</Button>
      <Dialog
        open={open()}
        title="Edit team meeting"
        fullWidth
        maxWidth="sm"
        dismissible
        onClose={requestClose}
        actions={(
          <Show when={confirming()} fallback={(
            <>
              <Button variant="text" onClick={requestClose}>Cancel</Button>
              <Button onClick={() => { setSaved(draft()); setOpen(false); }}>Save</Button>
            </>
          )}>
            <Button variant="text" onClick={() => setConfirming(false)}>Keep editing</Button>
            <Button color="error" onClick={() => setOpen(false)}>Discard changes</Button>
          </Show>
        )}
      >
        <TextField
          label="Description"
          multiline
          rows={3}
          fullWidth
          value={draft()}
          onInput={(event) => setDraft(event.currentTarget.value)}
        />
        <Show when={confirming()}><p role="status">Discard unsaved changes?</p></Show>
      </Dialog>
    </>
  );
}`,
      },
      {
        title: "Self-dismissing dialog with a native invoker and form",
        source: `import { createUniqueId } from "solid-js";
import { Button, Dialog } from "@claymo/solid";

export default function Example() {
  const id = createUniqueId();
  return (
    <>
      <Button commandfor={id} command="show-modal">Show keyboard help</Button>
      <Dialog id={id} defaultOpen title="Keyboard help" dismissible>
        <p>Press Tab to move through controls and Enter to activate a button.</p>
        <form method="dialog"><Button type="submit">Got it</Button></form>
      </Dialog>
    </>
  );
}`,
      },
    ],
  },
  Drawer: {
    props: {
      defaultOpen,
      onClose: modalClose,
    },
    required: ["aria-label"],
    content: [
      "children: drawer content.",
      "actions: optional JSX controls rendered below the content.",
    ],
    events: [
      "onClose(event, reason): a temporary drawer requests dismissal on Escape or a backdrop click. Mark a button with data-clay-dialog-close to request closeButton. An already-completed native close is reported as escapeKeyDown and resets local visibility.",
      "Persistent and permanent drawers render as nonmodal asides and do not request dismissal.",
    ],
    examples: [
      {
        title: "Controlled navigation drawer with explicit close",
        source: `import { createSignal, createUniqueId } from "solid-js";
import { Button, Drawer } from "@claymo/solid";

export default function Example() {
  const [open, setOpen] = createSignal(false);
  const overview = createUniqueId();
  const preferences = createUniqueId();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open navigation</Button>
      <Drawer
        aria-label="Account navigation"
        variant="temporary"
        anchor="left"
        width={260}
        open={open()}
        onClose={(_event, reason) => { if (reason !== "backdropClick") setOpen(false); }}
        actions={<Button variant="text" data-clay-dialog-close="">Close navigation</Button>}
      >
        <nav aria-label="Account sections">
          <ul>
            <li><a href={"#" + overview} onClick={() => setOpen(false)}>Overview</a></li>
            <li><a href={"#" + preferences} onClick={() => setOpen(false)}>Preferences</a></li>
          </ul>
        </nav>
      </Drawer>
      <h2 id={overview}>Overview</h2>
      <p>Review your account information.</p>
      <h2 id={preferences}>Preferences</h2>
      <p>Choose which updates you receive.</p>
    </>
  );
}`,
      },
      {
        title: "Persistent and permanent drawers in the page layout",
        source: `import { createSignal, createUniqueId } from "solid-js";
import { Button, Drawer } from "@claymo/solid";

export default function Example() {
  const [filters, setFilters] = createSignal(true);
  const id = createUniqueId();

  return (
    <section aria-label="Report results">
      <Button aria-expanded={filters() ? "true" : "false"} aria-controls={id} onClick={() => setFilters(!filters())}>
        {filters() ? "Hide filters" : "Show filters"}
      </Button>
      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "1rem" }}>
        <Drawer id={id} aria-label="Report filters" variant="persistent" width={180} open={filters()}>
          <label><input type="checkbox" /> Include archived reports</label>
        </Drawer>
        <div><h2>Reports</h2><p>Quarterly summary</p></div>
        <Drawer aria-label="Reporting tips" variant="permanent" anchor="right" width={180}>
          <p>Use the filters to include earlier reports.</p>
        </Drawer>
      </div>
    </section>
  );
}`,
      },
    ],
  },
  Tabs: {
    props: {
      value: {
        type: ["string", "number"],
        description:
          "Controlled selection. Update value from onChange to accept user selection. Each value matches a Tab and TabPanel by type as well as by value.",
      },
      defaultValue: {
        type: ["string", "number"],
        description:
          "Initial selection in uncontrolled mode. If omitted, no panel starts selected and the first enabled tab is the keyboard entry point.",
      },
      onChange: {
        description:
          "Optional callback (event: Event, value: string | number) => void. Called for different user selections, not parent-driven updates.",
      },
    },
    required: ["aria-label"],
    content: [
      "children: compose Tab buttons inside the tablist.",
      "panels: JSX containing TabPanel components rendered after the tablist. The shared context links panels to buttons without manual IDs.",
    ],
    events: [
      "onChange(event, value): user selection by click, keyboard activation, or Left, Right, Home and End. Disabled buttons are skipped.",
    ],
    examples: [
      {
        title: "Controlled settings tabs with keyboard navigation",
        source: `import { createSignal } from "solid-js";
import { Button, Tab, TabPanel, Tabs } from "@claymo/solid";

export default function Example() {
  const [selected, setSelected] = createSignal<string | number>("profile");
  const [changes, setChanges] = createSignal(0);

  return (
    <>
      <Button variant="text" onClick={() => setSelected("security")}>Go to security</Button>
      <Tabs
        aria-label="Account settings"
        variant="fullWidth"
        value={selected()}
        onChange={(_event, value) => { setSelected(value); setChanges(changes() + 1); }}
        panels={(
          <>
            <TabPanel value="profile"><p>Manage your profile.</p></TabPanel>
            <TabPanel value="billing"><p>Billing is unavailable.</p></TabPanel>
            <TabPanel value="security"><p>Review sign-in options.</p></TabPanel>
          </>
        )}
      >
        <Tab value="profile" label="Profile" />
        <Tab value="billing" label="Billing" disabled />
        <Tab value="security" label="Security" />
      </Tabs>
      <p>User selections: <output>{changes()}</output></p>
    </>
  );
}`,
      },
      {
        title: "Uncontrolled tabs with distinct numeric and text values",
        source: `import { Tab, TabPanel, Tabs } from "@claymo/solid";

export default function Example() {
  return (
    <Tabs
      aria-label="Report views"
      defaultValue={2}
      panels={(
        <>
          <TabPanel value={2}><p>Numeric report data.</p></TabPanel>
          <TabPanel value="2"><p>Text notes for this report.</p></TabPanel>
        </>
      )}
    >
      <Tab value={2} label="Data" />
      <Tab value="2" label="Notes" />
    </Tabs>
  );
}`,
      },
    ],
  },
  Tab: {
    required: ["label", "value"],
    content: ["icon: optional JSX rendered before the label. No default children."],
    events: [
      "onClick and onKeyDown: native button handlers run before selection or keyboard navigation. Call event.preventDefault() to skip the built-in behavior.",
      "Observe selection on Tabs via onChange, not on each Tab.",
    ],
    examples: [
      {
        title: "Tab with a decorative icon",
        source: `import { Tab, TabPanel, Tabs } from "@claymo/solid";

export default function Example() {
  return (
    <Tabs
      aria-label="Project settings"
      defaultValue="preferences"
      panels={(
        <>
          <TabPanel value="preferences"><p>Choose your project preferences.</p></TabPanel>
          <TabPanel value="members"><p>Manage project members.</p></TabPanel>
        </>
      )}
    >
      <Tab value="preferences" label="Preferences" icon={<span aria-hidden="true">⚙</span>} />
      <Tab value="members" label="Members" />
    </Tabs>
  );
}`,
      },
    ],
  },
  TabPanel: {
    required: ["value"],
    content: ["children: panel content. Place matching panels in Tabs' panels prop."],
    events: [],
    examples: [
      {
        title: "An uncontrolled form field keeps its draft between tab changes",
        source: `import { Tab, TabPanel, Tabs, TextField } from "@claymo/solid";

export default function Example() {
  return (
    <Tabs
      aria-label="Report editor"
      defaultValue={1}
      panels={(
        <>
          <TabPanel value={1} tabindex={0}>
            <TextField label="Report name" defaultValue="Quarterly review" />
          </TabPanel>
          <TabPanel value={2} tabindex={0}><p>Reports can be exported after they are saved.</p></TabPanel>
        </>
      )}
    >
      <Tab value={1} label="Summary" />
      <Tab value={2} label="Export options" />
    </Tabs>
  );
}`,
      },
    ],
  },
  Snackbar: {
    props: {
      defaultOpen,
      onClose: {
        description:
          "Callback (event: Event | null, reason: 'timeout' | 'escapeKeyDown' | 'clickaway') => void. Set open to false to accept a dismissal, or leave it unchanged to reject it. Timeout passes null as the event.",
      },
    },
    required: [],
    content: [
      "children: JSX replacing the entire message bar.",
      "action: optional JSX beside message in the default bar.",
    ],
    events: [
      "onClose(event, reason): timeout, Escape, or click outside. Without the callback the notification closes itself. An explicit open=false does not call onClose.",
    ],
    examples: [
      {
        title: "Timed snackbar with a dismiss action and click-away guard",
        source: `import { createSignal } from "solid-js";
import { Button, Snackbar } from "@claymo/solid";

export default function Example() {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Save settings</Button>
      <Snackbar
        open={open()}
        message="Settings saved"
        autoHideDuration={5000}
        resumeHideDuration={2500}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={(_event, reason) => { if (reason !== "clickaway") setOpen(false); }}
        action={<Button variant="text" size="small" onClick={() => setOpen(false)}>Dismiss</Button>}
      />
    </>
  );
}`,
      },
      {
        title: "Persistent notification composed with Alert",
        source: `import { Snackbar, Alert } from "@claymo/solid";

export default function Example() {
  return (
    <Snackbar defaultOpen autoHideDuration={null} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
      <Alert severity="info" variant="outlined" role="group">
        Changes are saved locally. Press Escape or click outside to dismiss.
      </Alert>
    </Snackbar>
  );
}`,
      },
    ],
  },
  Alert: {
    props: {
      icon: {
        type: "boolean",
        enum: [false],
        description:
          "Use false to hide the icon, or pass JSX to replace it. Severity is announced even without a visible icon.",
      },
      onClose: {
        description:
          "Callback (event: MouseEvent) => void. Shows the default close button unless action is supplied. The owner decides how to hide the alert.",
      },
    },
    required: [],
    content: [
      "children: message.",
      "icon: optional JSX replacing the severity icon, or false to hide the icon.",
      "action: optional JSX instead of the default close control.",
    ],
    events: [
      "onClose(event): runs when the default close control is clicked. The component does not hide itself.",
    ],
    examples: [
      {
        title: "Dismissible low-priority status message",
        source: `import { createSignal, Show } from "solid-js";
import { Alert } from "@claymo/solid";

export default function Example() {
  const [visible, setVisible] = createSignal(true);
  return (
    <Show when={visible()}>
      <Alert
        severity="info"
        variant="outlined"
        role="status"
        closeText="Dismiss sync notice"
        onClose={() => setVisible(false)}
      >
        Changes have been synced.
      </Alert>
    </Show>
  );
}`,
      },
      {
        title: "Status with a custom undo action",
        source: `import { createSignal, Show } from "solid-js";
import { Alert, Button } from "@claymo/solid";

export default function Example() {
  const [archived, setArchived] = createSignal(false);
  return (
    <Show when={archived()} fallback={<Button onClick={() => setArchived(true)}>Archive draft</Button>}>
      <Alert
        severity="success"
        role="status"
        icon={false}
        action={<Button variant="text" size="small" onClick={() => setArchived(false)}>Undo</Button>}
      >
        Draft archived.
      </Alert>
    </Show>
  );
}`,
      },
    ],
  },
  CircularProgress: {
    required: ["aria-label"],
    content: [],
    events: ["Native SVG attributes and event handlers are forwarded; no component events."],
    examples: [
      {
        title: "Determinate circular progress for a known total",
        source: `import { CircularProgress } from "@claymo/solid";

export default function Example() {
  return (
    <CircularProgress
      aria-label="Files imported"
      aria-valuetext="3 of 8 files imported"
      variant="determinate"
      max={8}
      value={3}
      size="3rem"
      thickness={5}
      color="success"
    />
  );
}`,
      },
      {
        title: "Fixed-length rotating arc without a track",
        source: `import { CircularProgress } from "@claymo/solid";

export default function Example() {
  return <CircularProgress aria-label="Checking availability" disableShrink enableTrackSlot={false} />;
}`,
      },
    ],
  },
  LinearProgress: {
    required: ["aria-label"],
    content: [],
    events: ["Native div attributes and event handlers are forwarded; no component events."],
    examples: [
      {
        title: "Linear progress with completed and buffered amounts",
        source: `import { LinearProgress } from "@claymo/solid";

export default function Example() {
  return (
    <LinearProgress
      aria-label="Download progress"
      aria-valuetext="35 of 100 megabytes downloaded"
      variant="buffer"
      value={35}
      valueBuffer={70}
    />
  );
}`,
      },
      {
        title: "Query progress when no total is available",
        source: `import { LinearProgress } from "@claymo/solid";

export default function Example() {
  return <LinearProgress aria-label="Searching reports" variant="query" color="secondary" />;
}`,
      },
    ],
  },
  Skeleton: {
    required: [],
    content: [],
    events: ["Native span attributes and event handlers are forwarded; no component events."],
    examples: [
      {
        title: "Decorative placeholders in a busy profile region",
        source: `import { Skeleton } from "@claymo/solid";

export default function Example() {
  return (
    <section aria-label="Profile" aria-busy="true">
      <p role="status">Loading profile…</p>
      <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
        <Skeleton variant="circular" width={48} animation={false} />
        <Skeleton variant="text" width="min(60%, 16rem)" />
      </div>
      <Skeleton variant="rounded" width="100%" height={80} animation="wave" />
    </section>
  );
}`,
      },
    ],
  },
};
