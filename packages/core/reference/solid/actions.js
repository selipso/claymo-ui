export default {
  Button: {
    required: [],
    content: [
      "children: visible button or link label.",
      "startIcon and endIcon: optional leading and trailing JSX content. Mark decorative icons aria-hidden.",
    ],
    events: [
      "onClick(event: MouseEvent): native activation. It is not invoked when disabled or loading. Other native attributes and handlers pass through to the rendered action.",
    ],
    examples: [
      {
        title: "Link button with a leading icon",
        source: `import { Button } from "@claymo/solid";

export default function Example() {
  return (
    <Button href="/account" variant="outlined" startIcon={<span aria-hidden="true">←</span>}>
      Back to account
    </Button>
  );
}`,
      },
      {
        title: "Native form submission and reset",
        source: `import { Button } from "@claymo/solid";
import { createSignal } from "solid-js";

export default function Example() {
  const [nickname, setNickname] = createSignal("");

  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      setNickname(String(new FormData(event.currentTarget).get("nickname") ?? ""));
    }}>
      <label>Nickname <input name="nickname" required /></label>
      <Button type="submit">Save</Button>
      <Button type="reset" variant="text">Clear input</Button>
      <p role="status">{nickname() && \`Current nickname: \${nickname()}\`}</p>
    </form>
  );
}`,
      },
      {
        title: "Loading button with a visible label",
        source: `import { Button } from "@claymo/solid";

export default function Example() {
  return <Button loading loadingPosition="start">Saving settings</Button>;
}`,
      },
    ],
  },
  IconButton: {
    required: ["aria-label"],
    content: [
      "children: the icon, normally decorative because aria-label names the action.",
      "loadingIndicator: optional JSX replacement for the default progressbar. Provide an accessible name for the replacement.",
    ],
    events: [
      "onClick(event: MouseEvent): native activation, suppressed while disabled or loading. Other native attributes and handlers pass through.",
    ],
    examples: [
      {
        title: "Accessible icon link",
        source: `import { IconButton } from "@claymo/solid";

export default function Example() {
  return (
    <IconButton aria-label="Search docs" href="/search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="10" cy="10" r="6" />
        <path d="m14 14 5 5" />
      </svg>
    </IconButton>
  );
}`,
      },
      {
        title: "Replace the loading indicator",
        source: `import { IconButton } from "@claymo/solid";

export default function Example() {
  return (
    <IconButton
      aria-label="Sync documents"
      loading
      loadingIndicator={<span role="progressbar" aria-label="Syncing documents">…</span>}
    />
  );
}`,
      },
    ],
  },
  ButtonGroup: {
    required: [],
    content: [
      "children: Buttons and an optional fieldset legend. Name an unlabeled group with aria-label or aria-labelledby.",
    ],
    events: [
      "No component-specific events. Native handlers pass to the fieldset, and Buttons retain their native behavior.",
    ],
    examples: [
      {
        title: "Outlined text alignment controls",
        source: `import { Button, ButtonGroup } from "@claymo/solid";
import { createSignal } from "solid-js";

export default function Example() {
  const [alignment, setAlignment] = createSignal<"left" | "center" | "right">("left");

  return (
    <>
      <ButtonGroup aria-label="Text alignment" variant="outlined" color="secondary" size="small">
        <Button
          aria-pressed={alignment() === "left" ? "true" : "false"}
          onClick={() => setAlignment("left")}
        >
          Left
        </Button>
        <Button
          aria-pressed={alignment() === "center" ? "true" : "false"}
          onClick={() => setAlignment("center")}
        >
          Center
        </Button>
        <Button
          aria-pressed={alignment() === "right" ? "true" : "false"}
          onClick={() => setAlignment("right")}
        >
          Right
        </Button>
      </ButtonGroup>
      <p style={{ "text-align": alignment() }}>Preview text</p>
    </>
  );
}`,
      },
      {
        title: "Disable a vertical group of native buttons",
        source: `import { Button, ButtonGroup } from "@claymo/solid";

export default function Example() {
  return (
    <ButtonGroup aria-label="Document actions" orientation="vertical" fullWidth disabled>
      <Button>Rename</Button>
      <Button>Duplicate</Button>
      <Button>Archive</Button>
    </ButtonGroup>
  );
}`,
      },
    ],
  },
  Badge: {
    required: [],
    content: [
      "children: optional anchor for the indicator.",
      "badgeContent may be inline JSX instead of a scalar. The dot variant ignores it.",
    ],
    events: ["No component events. Native attributes and handlers pass through to the wrapper."],
    examples: [
      {
        title: "Capped unread count on an inbox link",
        source: `import { Badge, Button } from "@claymo/solid";

export default function Example() {
  return (
    <Badge badgeContent={120} color="error">
      <Button href="/inbox" variant="outlined" aria-label="Inbox, 120 unread messages">Inbox</Button>
    </Badge>
  );
}`,
      },
      {
        title: "Status dot on a circular avatar and standalone JSX badge",
        source: `import { Avatar, Badge } from "@claymo/solid";

export default function Example() {
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
      <Badge variant="dot" color="success" overlap="circular" anchorOrigin={{ vertical: "bottom" }}>
        <Avatar alt="Ada Lovelace, online" />
      </Badge>
      <Badge badgeContent={<strong>Beta</strong>} color="secondary" />
    </div>
  );
}`,
      },
    ],
  },
  Avatar: {
    required: [],
    content: [
      "children: optional fallback JSX rendered without an image source or after an image error. Provide accessible text if the custom fallback conveys information.",
      "Changing src, srcSet, or sizes retries the image. The default fallback uses the first character of alt, then a decorative profile icon if alt is empty.",
    ],
    events: ["No component events. Native attributes and handlers pass through to the root span."],
    examples: [
      {
        title: "Automatic initials, explicit initials, and decorative avatar",
        source: `import { Avatar } from "@claymo/solid";

export default function Example() {
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
      <Avatar alt="Ada Lovelace" size="small" />
      <Avatar role="img" aria-label="Grace Hopper" variant="rounded">GH</Avatar>
      <span><Avatar size="large" aria-hidden="true" /> Guest</span>
    </div>
  );
}`,
      },
    ],
  },
  Chip: {
    required: ["label"],
    props: {
      onDelete: {
        description:
          "Callback (event: MouseEvent | KeyboardEvent) => void. Providing this callback shows a separate remove button; the caller owns visibility.",
      },
    },
    content: [
      "avatar and icon: optional leading JSX. The label prop provides the visible text.",
      "deleteIcon: optional JSX replacing the remove glyph. The remove button keeps the accessible name Remove {label}.",
    ],
    events: [
      "onClick(event: MouseEvent): activates the body and implies a native button even when clickable is omitted.",
      'Set aria-pressed to "true" or "false" on a toggle chip. It is forwarded to the interactive body button, not the wrapper.',
      "onDelete(event: MouseEvent | KeyboardEvent): providing this callback shows a separate remove button. Clicking it or pressing Backspace/Delete on either button requests deletion; the caller owns visibility.",
    ],
    examples: [
      {
        title: "Clickable, removable topic filters",
        source: `import { Chip } from "@claymo/solid";
import { createSignal, For } from "solid-js";

export default function Example() {
  const [topics, setTopics] = createSignal(["Design systems", "Accessibility", "Typography"]);
  const [active, setActive] = createSignal("");

  return (
    <>
      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.5rem" }}>
        <For each={topics()}>{(topic) => (
          <Chip
            label={topic}
            variant="outlined"
            color={active() === topic ? "primary" : "default"}
            aria-pressed={active() === topic ? "true" : "false"}
            icon={<span aria-hidden="true">#</span>}
            onClick={() => setActive((current) => current === topic ? "" : topic)}
            onDelete={() => {
              setTopics((current) => current.filter((item) => item !== topic));
              if (active() === topic) setActive("");
            }}
          />
        )}</For>
      </div>
      <p role="status">{active() ? \`Selected topic: \${active()}\` : "No topic selected"}</p>
    </>
  );
}`,
      },
    ],
  },
  Tooltip: {
    required: [],
    props: {
      title: {
        type: "string",
        description: "Description text. An empty title with no JSX content suppresses the tooltip.",
      },
      onOpen: {
        description: "Callback (event: Event) => void reported on hover or focus.",
      },
      onClose: {
        description:
          "Callback (event: Event, reason: 'leave' | 'escapeKeyDown') => void reported on pointer/focus leave or Escape.",
      },
    },
    content: [
      "children: one focusable trigger element. Its existing aria-describedby ids are preserved.",
      "content: optional noninteractive JSX replacing title.",
    ],
    events: [
      "onOpen(event) and onClose(event, reason) report requests from hover, focus, pointer/focus leave, or Escape. Close reasons are leave and escapeKeyDown. In controlled mode update open yourself; in automatic mode the callbacks are notifications.",
    ],
    examples: [
      {
        title: "Automatic tooltip over a focusable trigger",
        source: `import { Button, Tooltip } from "@claymo/solid";

export default function Example() {
  return (
    <Tooltip placement="top" arrow content={<span>Keeps your current settings</span>}>
      <Button>Save settings</Button>
    </Tooltip>
  );
}`,
      },
      {
        title: "Controlled tooltip with Escape dismissal",
        source: `import { Button, Tooltip } from "@claymo/solid";
import { createSignal } from "solid-js";

export default function Example() {
  const [open, setOpen] = createSignal(false);

  return (
    <Tooltip
      title="Downloads the current report as CSV"
      placement="right"
      open={open()}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      <Button href="/reports/current.csv" variant="outlined">Export report</Button>
    </Tooltip>
  );
}`,
      },
    ],
  },
  ClayLighting: {
    required: [],
    content: [],
    events: [],
    examples: [
      {
        title: "Light an inflated button",
        source: `import { Button, ClayLighting } from "@claymo/solid";

export default function Example() {
  return (
    <>
      <ClayLighting />
      <Button inflated color="secondary">Continue</Button>
    </>
  );
}`,
      },
    ],
  },
};
