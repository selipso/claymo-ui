export default {
  Paper: {
    content: ["children: content for the native surface element."],
    events: ["Native handlers such as onClick are forwarded to the root."],
    examples: [
      {
        title: "Elevated account section",
        source: `import { Paper } from "@claymo/solid";

export default function Example() {
  return (
    <Paper as="section" elevation={2} aria-labelledby="account-title" style={{ padding: "1rem" }}>
      <h2 id="account-title">Account</h2>
      <p>Manage your profile and security settings.</p>
    </Paper>
  );
}`,
      },
      {
        title: "Inflated and outlined surfaces",
        source: `import { ClayLighting, Paper } from "@claymo/solid";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <ClayLighting />
      <Paper as="article" elevation={3} inflated style={{ padding: "1rem" }}>
        <h2>Featured collection</h2>
        <p>See the latest releases.</p>
      </Paper>
      <Paper as="aside" variant="outlined" square style={{ padding: "1rem" }}>
        New releases are added every Friday.
      </Paper>
    </div>
  );
}`,
      },
    ],
  },
  Card: {
    content: ["children: surface content; typically CardHeader, CardContent and CardActions."],
    events: ["Native handlers are forwarded to the root."],
    examples: [
      {
        title: "Raised billing card",
        source: `import { Button, Card, CardActions, CardContent, CardHeader } from "@claymo/solid";

export default function Example() {
  return (
    <Card as="article" raised aria-labelledby="billing-title" style={{ "max-width": "26rem" }}>
      <CardHeader title={<span id="billing-title">Billing</span>} subheader="Updated today" />
      <CardContent>
        <p>Your November statement is ready. The balance of $42.00 is due on December 15.</p>
      </CardContent>
      <CardActions>
        <Button href="/statements/latest">View statement</Button>
        <Button variant="text" href="/billing/history">Billing history</Button>
      </CardActions>
    </Card>
  );
}`,
      },
    ],
  },
  CardContent: {
    content: ["children: the main card content."],
    events: ["Native div handlers are forwarded to the root."],
    examples: [
      {
        title: "Card with padded content",
        source: `import { Card, CardContent, CardHeader } from "@claymo/solid";

export default function Example() {
  return (
    <Card style={{ "max-width": "26rem" }}>
      <CardHeader title="Shipping address" />
      <CardContent>
        <address>10 Market Street<br />Springfield, IL 62701</address>
      </CardContent>
    </Card>
  );
}`,
      },
    ],
  },
  CardActions: {
    content: ["children: buttons, links or other actions."],
    events: ["Native div handlers are forwarded to the root."],
    examples: [
      {
        title: "Card with compact actions",
        source: `import { Button, Card, CardActions, CardContent } from "@claymo/solid";

export default function Example() {
  return (
    <Card style={{ "max-width": "26rem" }}>
      <CardContent><p>Review your statement or change your payment method.</p></CardContent>
      <CardActions disableSpacing>
        <Button variant="text" size="small" href="/statements/latest">Review statement</Button>
        <Button variant="text" size="small" href="/billing/payment">Change payment</Button>
      </CardActions>
    </Card>
  );
}`,
      },
    ],
  },
  CardHeader: {
    props: {
      title: {
        type: "string",
        description: "Plain title text; the JSX prop also accepts inline markup.",
      },
      subheader: {
        type: "string",
        description: "Plain secondary text; the JSX prop also accepts inline markup.",
      },
    },
    content: [
      "title and subheader: optional text or JSX. With disableTypography, these render without the label wrappers.",
      "avatar: optional leading JSX; action: optional trailing JSX.",
    ],
    events: ["Native div handlers are forwarded to the root."],
    examples: [
      {
        title: "Header with custom typography, avatar and action",
        source: `import { Avatar, Button, Card, CardHeader, Typography } from "@claymo/solid";

export default function Example() {
  return (
    <Card as="article" aria-labelledby="profile-title" style={{ "max-width": "26rem" }}>
      <CardHeader
        disableTypography
        title={<Typography id="profile-title" variant="h6" as="h2">Ada Lovelace</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Updated today</Typography>}
        avatar={<Avatar aria-hidden="true" alt="Ada Lovelace" />}
        action={<Button variant="text" size="small" href="/settings">Edit profile</Button>}
      />
    </Card>
  );
}`,
      },
    ],
  },
  Accordion: {
    props: {
      expanded: {
        type: "boolean",
        description:
          "Controlled open state, taking precedence over defaultExpanded. Update it in onChange to accept a native toggle.",
      },
      onChange: {
        description:
          "Optional callback (event: Event, expanded: boolean) => void for native changes; parent-driven expanded changes do not invoke it.",
      },
    },
    content: [
      "summary: required JSX for the visible disclosure label.",
      "children: collapsible content.",
    ],
    events: [
      "onChange(event: Event, expanded: boolean): reports a native change; parent-driven expanded changes do not invoke it.",
      "onToggle(event: ToggleEvent): forwarded native event, including programmatic changes.",
    ],
    examples: [
      {
        title: "Controlled disclosure with synchronized status",
        source: `import { createSignal } from "solid-js";
import { Accordion, Button } from "@claymo/solid";

export default function Example() {
  const [expanded, setExpanded] = createSignal(false);

  return (
    <>
      <Button onClick={() => setExpanded(!expanded())}>
        {expanded() ? "Hide delivery details" : "Show delivery details"}
      </Button>
      <Accordion summary="Delivery details" expanded={expanded()} onChange={(_, open) => setExpanded(open)}>
        <p>Standard delivery takes three to five business days.</p>
      </Accordion>
    </>
  );
}`,
      },
      {
        title: "Uncontrolled FAQ with an initially expanded item",
        source: `import { Accordion } from "@claymo/solid";

export default function Example() {
  return (
    <section aria-label="Frequently asked questions">
      <Accordion name="shipping-faq" defaultExpanded summary={<strong>Where do you deliver?</strong>}>
        <p>We deliver anywhere in the United States.</p>
      </Accordion>
      <Accordion name="shipping-faq" summary="Can I track my order?">
        <p>Your confirmation email includes a tracking link.</p>
      </Accordion>
    </section>
  );
}`,
      },
    ],
  },
  Divider: {
    content: ["None; Divider renders a void hr element."],
    events: ["No component events; native hr handlers are forwarded."],
    examples: [
      {
        title: "Vertical divider between links",
        source: `import { Divider } from "@claymo/solid";

export default function Example() {
  return (
    <nav aria-label="Help and settings" style={{ display: "flex", gap: "0.75rem" }}>
      <a href="/settings">Settings</a>
      <Divider orientation="vertical" flexItem />
      <a href="/support">Support</a>
    </nav>
  );
}`,
      },
    ],
  },
  Typography: {
    content: ["children: text and inline markup."],
    events: ["No component events; native handlers are forwarded to the chosen tag."],
    examples: [
      {
        title: "Semantic heading with a smaller visual style",
        source: `import { Typography } from "@claymo/solid";

export default function Example() {
  return (
    <section aria-labelledby="settings-heading">
      <Typography id="settings-heading" variant="h4" as="h2" gutterBottom>
        Account settings
      </Typography>
      <Typography color="text.secondary">Manage your profile and notifications.</Typography>
    </section>
  );
}`,
      },
      {
        title: "Custom variant mapping with truncated text",
        source: `import { Typography } from "@claymo/solid";

export default function Example() {
  return (
    <section aria-labelledby="report-heading" style={{ "max-width": "18rem" }}>
      <Typography id="report-heading" variant="subtitle1" variantMapping={{ subtitle1: "h2" }}>
        Most recent report
      </Typography>
      <Typography variant="body2" noWrap title="Quarterly revenue and operating expenses by department">
        Quarterly revenue and operating expenses by department
      </Typography>
    </section>
  );
}`,
      },
    ],
  },
  Table: {
    required: ["label"],
    content: ["children: native table elements such as caption, thead, tbody and tfoot."],
    events: ["No component events; native wrapper handlers such as onScroll are forwarded."],
    examples: [
      {
        title: "Inventory table with sticky column headings",
        source: `import { Table } from "@claymo/solid";

export default function Example() {
  return (
    <Table label="Stationery inventory" size="small" stickyHeader style={{ "max-height": "9rem" }}>
      <caption>Available stock by item</caption>
      <thead>
        <tr><th scope="col">Item</th><th scope="col">Count</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">Notebook</th><td>14</td></tr>
        <tr><th scope="row">Pencil</th><td>32</td></tr>
        <tr><th scope="row">Envelope</th><td>26</td></tr>
      </tbody>
    </Table>
  );
}`,
      },
    ],
  },
  List: {
    content: ["children: native li elements or ListItem components."],
    events: ["No component events; native ul handlers are forwarded."],
    examples: [
      {
        title: "Plans with a subheader and two-line items",
        source: `import { List, ListItem, ListItemText } from "@claymo/solid";

export default function Example() {
  return (
    <List subheader="Plans" style={{ "max-width": "22rem" }}>
      <ListItem divider>
        <ListItemText primary="Starter" secondary="One project, community support" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Pro" secondary="Unlimited projects, email support" />
      </ListItem>
    </List>
  );
}`,
      },
      {
        title: "Dense navigation groups within a card",
        source: `import { Card, List, ListItem, ListItemButton, ListItemText } from "@claymo/solid";

export default function Example() {
  return (
    <Card as="nav" aria-label="Settings pages" style={{ "max-width": "20rem", padding: "8px" }}>
      <List subheader="Account" dense>
        <ListItem><ListItemButton href="/profile" selected><ListItemText primary="Profile" /></ListItemButton></ListItem>
        <ListItem><ListItemButton href="/security"><ListItemText primary="Security" /></ListItemButton></ListItem>
      </List>
      <List subheader="Workspace" dense>
        <ListItem><ListItemButton href="/members"><ListItemText primary="Members" /></ListItemButton></ListItem>
        <ListItem><ListItemButton href="/billing"><ListItemText primary="Billing" /></ListItemButton></ListItem>
      </List>
    </Card>
  );
}`,
      },
    ],
  },
  ListItem: {
    content: [
      "children: row content.",
      "secondaryAction: optional trailing JSX separate from the main row action.",
    ],
    events: ["No component events; native li handlers are forwarded."],
    examples: [
      {
        title: "Linked row with a separate trailing action",
        source: `import { Button, List, ListItem, ListItemButton, ListItemText } from "@claymo/solid";

export default function Example() {
  return (
    <List aria-label="Contacts" style={{ "max-width": "25rem" }}>
      <ListItem
        divider
        secondaryAction={<Button variant="outlined" size="small" href="/contacts/ada/edit" aria-label="Edit Ada Lovelace">Edit</Button>}
      >
        <ListItemButton href="/contacts/ada">
          <ListItemText primary="Ada Lovelace" secondary="ada@example.com" />
        </ListItemButton>
      </ListItem>
      <ListItem>
        <ListItemButton href="/contacts/grace">
          <ListItemText primary="Grace Hopper" secondary="grace@example.com" />
        </ListItemButton>
      </ListItem>
    </List>
  );
}`,
      },
    ],
  },
  ListItemButton: {
    content: ["children: non-interactive row content; compose with ListItemIcon and ListItemText."],
    events: ["onClick(event: MouseEvent): forwarded native click; not invoked while disabled."],
    examples: [
      {
        title: "Pick a calendar view",
        source: `import { createSignal, For } from "solid-js";
import { List, ListItem, ListItemButton, ListItemText } from "@claymo/solid";

export default function Example() {
  const views = ["Day", "Week", "Month"] as const;
  const [view, setView] = createSignal<(typeof views)[number]>("Week");

  return (
    <List subheader="Calendar view" dense>
      <For each={views}>
        {(option) => (
          <ListItem>
            <ListItemButton selected={view() === option} onClick={() => setView(option)}>
              <ListItemText primary={option} />
            </ListItemButton>
          </ListItem>
        )}
      </For>
      <ListItem>
        <ListItemButton disabled><ListItemText primary="Year" secondary="Coming soon" /></ListItemButton>
      </ListItem>
    </List>
  );
}`,
      },
      {
        title: "Navigation links with a current page",
        source: `import { List, ListItem, ListItemButton, ListItemText } from "@claymo/solid";

export default function Example() {
  return (
    <List aria-label="Settings pages" disablePadding>
      <ListItem><ListItemButton href="/settings/profile" selected><ListItemText primary="Profile" /></ListItemButton></ListItem>
      <ListItem><ListItemButton href="/settings/privacy"><ListItemText primary="Privacy" /></ListItemButton></ListItem>
    </List>
  );
}`,
      },
    ],
  },
  ListItemIcon: {
    content: [
      "children: icon or Avatar. Decorative by default; give the wrapper an accessible label when it adds meaning.",
    ],
    events: ["No component events; native span handlers are forwarded."],
    examples: [
      {
        title: "Decorative leading icon",
        source: `import { List, ListItem, ListItemIcon, ListItemText } from "@claymo/solid";

export default function Example() {
  return (
    <List aria-label="Notifications">
      <ListItem>
        <ListItemIcon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />
          </svg>
        </ListItemIcon>
        <ListItemText primary="Alerts" secondary="Sounds and banners" />
      </ListItem>
    </List>
  );
}`,
      },
    ],
  },
  ListItemText: {
    props: {
      primary: {
        type: "string",
        description: "Main text; the JSX prop also accepts inline markup and defaults to children.",
      },
      secondary: {
        type: "string",
        description: "Optional detail text; the JSX prop also accepts inline markup.",
      },
    },
    content: [
      "primary and secondary: optional JSX for each line.",
      "children: fallback primary content.",
    ],
    events: ["No component events; native span handlers are forwarded."],
    examples: [
      {
        title: "Primary and secondary content with inline markup",
        source: `import { List, ListItem, ListItemText } from "@claymo/solid";

export default function Example() {
  return (
    <List aria-label="Invoices" style={{ "max-width": "22rem" }}>
      <ListItem divider>
        <ListItemText primary={<strong>November invoice</strong>} secondary="Due December 15" />
      </ListItem>
      <ListItem>
        <ListItemText secondary={<>Paid <time datetime="2026-11-10">November 10</time></>}>
          October invoice
        </ListItemText>
      </ListItem>
    </List>
  );
}`,
      },
    ],
  },
  AppBar: {
    content: ["children: header content, such as branding, navigation and top-level actions."],
    events: ["No component events; native header handlers are forwarded."],
    examples: [
      {
        title: "Sticky app bar with navigation",
        source: `import { AppBar, Button, Typography } from "@claymo/solid";

export default function Example() {
  return (
    <AppBar color="default" style={{ display: "flex", "align-items": "center", "justify-content": "space-between" }}>
      <Typography variant="h5" as="h1">Collections</Typography>
      <nav aria-label="Main">
        <Button variant="text" href="/settings">Settings</Button>
      </nav>
    </AppBar>
  );
}`,
      },
    ],
  },
};
