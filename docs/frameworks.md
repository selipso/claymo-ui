# Frameworks

Astro, Svelte 5, and Solid 2 expose the same component names through `@claymo/astro`, `@claymo/svelte`, and `@claymo/solid`. Astro enhances server-rendered HTML with DOM controllers. Svelte uses bindings; Solid uses reactive props, signals and JSX. React and Angular bridges are not included.

| Category                | Components                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Actions                 | `Button`, `IconButton`, `ButtonGroup`, `Chip`, `Badge`, `Avatar`, `Tooltip`                                                      |
| Inputs                  | `Autocomplete`, `TextField` (text, multiline, select), `Checkbox`, `Radio`, `RadioGroup`, `FormControlLabel`, `Switch`, `Slider` |
| Surfaces                | `Paper`, `Card`, `CardHeader`, `CardContent`, `CardActions`, `Accordion`, `Divider`, `Table`, `DataTable`, `ClayLighting`        |
| Feedback                | `Alert`, `Snackbar`, `LinearProgress`, `CircularProgress`, `Skeleton`                                                            |
| Navigation and overlays | `AppBar`, `Drawer`, `Tabs`, `Tab`, `TabPanel`, `Dialog`, `List`, `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`    |
| Content                 | `Typography`                                                                                                                     |

See [Getting started](./getting-started.md) for stylesheet setup. Each component page shows the props, content, events, and live examples for each framework. The same reference is available through [MCP](./mcp.md).

## Content, state, and forms

| Concern      | Astro                                        | Svelte                                                    | Solid 2                                                         |
| ------------ | -------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| Body         | Default slot                                 | `children` snippet                                        | JSX children                                                    |
| Named markup | Named slot, e.g. `start-icon`                | Named snippet, e.g. `startIcon`                           | Named JSX prop, e.g. `startIcon={<Icon />}`                     |
| State        | Props set the initial render                 | `bind:value`, `bind:checked`, `bind:open` where supported | Pass signal values and update them from callbacks               |
| Events       | Native DOM events and `clay-*` custom events | Callback props                                            | Callback props; native DOM handlers use Solid's JSX event types |

`TextField` and `RadioGroup` accept an `options` array. You can also supply native options or compose controls instead. Use `defaultValue` or `defaultChecked` for initial form values and native reset defaults where supported.

## Tabs

All three bridges export `Tabs`, `Tab`, and `TabPanel`. Astro supports two forms:

- **Data mode:** pass a `tabs` array of `{ value, label, disabled? }` objects. Put each panel's content in a named slot matching its tab's `value`. Set the initial selection with `value`.
- **Composed mode:** put `Tab` children in the default slot and `TabPanel` children in the `panels` slot. Give `Tabs` an explicit, unique `id` and pass the same string as `tabsId` to every `Tab` and `TabPanel`. Set the parent's `value` and mark the matching tab and panel `selected` so the initial selection is correct before the client controller runs.

## Overlays

In Astro, open a `Dialog` or temporary `Drawer` with a button whose `commandfor` matches the overlay's `id` and whose `command` is `show-modal`. Escape and backdrop clicks send a cancelable, non-bubbling `clay-request-close` on the overlay itself. Listen there and call `event.preventDefault()` to keep it open.

In Svelte, bind `open` and optionally handle `onClose`. In Solid, pass `open={open()}` and `onClose={() => setOpen(false)}` to keep the parent signal in sync.

`dismissible` adds a close (X) button to a `Dialog`; `closeText` sets its accessible name (default "Close"). It sends the same close request as Escape and the backdrop, with reason `closeButton`, so the same listener or callback can keep the dialog open.

## Lists

Compose `List` > `ListItem` > content. Inside a row, `ListItemIcon` (an icon or `Avatar`) and `ListItemText` (`primary`, `secondary`) line up across rows. For a clickable row, put a `ListItemButton` (an `href` makes it a link) inside the `ListItem`; the row drops its own padding automatically, so `disablePadding` is optional. A trailing control goes in the row's secondary action, never inside the button.

- `subheader` on `List` adds a visible heading that also names the list for assistive technology.
- `ListItemIcon` is decorative (`aria-hidden`) by default; give it an `aria-label` to announce it.
- A selected `ListItemButton` presses into the surface, like a selected tab. Put lists on a `Card`, `Paper` or `Drawer` so hover and selection read as clay.

## Data tables

`DataTable` takes `rows` and `columns` and adds sorting, search, pagination and checkbox selection. Astro renders all supplied rows and emits `clay-*-change` events. Svelte can bind the four models. Solid accepts the models as reactive props and reports changes through callbacks such as `onPaginationModelChange`. `renderCell` is an inline markup function in Astro, a snippet in Svelte, and a function returning JSX in Solid. See [Data patterns](./data-patterns.md).

## Motion

All three bridges accept the same `motion` prop on animated components (`<Button motion="lift">`). It renders `data-motion`, which also works as a plain attribute or `clay-motion-*` class on any element. See [Motion](./motion.md) for presets and tokens.

## Astro navigation and event types

Claymo's controllers upgrade the initial markup and re-run on `astro:page-load`, so interaction survives `ClientRouter` navigation. Replaced tooltips and snackbars release their event listeners and timers after each swap; tooltips and snackbars inside `transition:persist` keep their controllers and state. Components that generate their own IDs use per-instance IDs; supply unique values for any IDs you assign. If your own code attaches listeners to page elements, bind them on initial load and again on `astro:page-load`. Make the setup idempotent so it doesn't add handlers twice.

Import the relevant `@claymo/core/behavior/*` module in your script to bring the `HTMLElementEventMap` augmentation into scope. TypeScript then knows the shape of `event.detail` for `clay-*` events without a cast.

## MUI mapping

Claymo follows [MUI's component API](https://mui.com/material-ui/all-components/) for the props it supports. It is not a drop-in replacement for `@mui/material`.

| MUI API                                                           | Claymo equivalent or limit                                                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `sx`                                                              | Pass `class` and use CSS variables such as `--clay-color`, `--clay-d`, and `--clay-radius`.                                          |
| `classes`, `component`, `slots`, `slotProps`, theme default props | Not supported. `Paper` and `Typography` expose `as` to change the element they render.                                               |
| `disableRipple`, `disableFocusRipple`                             | Not applicable. Focus uses a 3px `:focus-visible` ring; a press uses the clay pressed state.                                         |
| `edge`                                                            | `IconButton` supports `start`, `end`, or `false`. `Switch` doesn't support it.                                                       |
| `TextField variant="standard"`                                    | Not supported. `outlined` is the default; `filled` is also available.                                                                |
| `Button` variant default                                          | `contained` instead of MUI's `text`, so the raised surface is visible by default.                                                    |
| `Badge` color default                                             | `primary`.                                                                                                                           |
| `Avatar` size, `Table` label                                      | Claymo additions. `Avatar` accepts `small`, `medium`, or `large`; `Table` requires a `label` as the scroll region's accessible name. |
| `inflated`                                                        | Optional SVG dome shading on `Button`, `Paper`, and `Card`. See [Theming](./theming.md).                                             |

### Other Claymo defaults and limits

| Component   | Default or limit                                    |
| ----------- | --------------------------------------------------- |
| `AppBar`    | `sticky` position                                   |
| `Snackbar`  | 4000 ms auto-hide, bottom-center                    |
| `Dialog`    | `xs`, `sm`, and `md` widths of 320, 444, and 600 px |
| `Paper`     | Elevation 0–3                                       |
| `TextField` | Native controls, fixed textarea rows                |
| `Slider`    | A single value                                      |
| `Tabs`      | Primary color                                       |
