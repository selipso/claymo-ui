# Motion

Every input gets a visible response, but the response stays small. Hover and press feedback finishes in 150ms or less by default, a press starts in 90ms, and nothing overshoots or wobbles. Animations never block input: they are CSS transitions on the element that changed.

All motion reads a small set of CSS custom properties. A preset is a named set of values for them, so you can pick a feel for the whole app, one region, or one component, and override any single value with CSS.

## Presets

| Preset            | Feel                                                                                                               | Use                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `subtle`          | Default. 1px lift on hover, 2% press, 150ms ease-out; overlays enter in 200ms.                                     | Recommended                   |
| `ease-in-out`     | The same distances on a symmetric 200ms curve.                                                                     | Recommended for calm UIs      |
| `expand-contract` | Grows 2% toward the pointer and contracts 3% when pressed; no vertical travel.                                     | Recommended for dense layouts |
| `lift`            | Rises 2px with a deeper shadow; settles back when pressed, without scaling.                                        | Recommended                   |
| `fade`            | No movement. Hover and press show as shadow and color changes only.                                                | Recommended for calm UIs      |
| `none`            | Instant. States still show; nothing animates.                                                                      | Tests, screenshots, kiosks    |
| `lift-push`       | A physical key: rises 3px under the pointer, then sinks into the surface when pressed. Its drop shadow disappears. | Expressive accents            |
| `squish`          | Soft clay: flattens and widens under a press, then regains its shape over 260ms.                                   | Expressive accents            |

`lift-push` and `squish` are deliberately expressive. Use them for a few prominent controls, not a whole form.

## Apply a preset

The nearest preset wins. Each preset starts from the defaults, so a nested preset never inherits its parent's distances.

| Scope         | How                                                                  |
| ------------- | -------------------------------------------------------------------- |
| Whole app     | `<html data-motion="lift">`, next to `data-theme` and `data-palette` |
| One region    | `data-motion="fade"` or `class="clay-motion-fade"` on any container  |
| One component | The same `motion` prop in every bridge                               |
| One value     | A token, e.g. `.toolbar { --clay-motion-duration: 120ms; }`          |

Astro:

```astro
---
import { Button } from "@claymo/astro";
---

<Button motion="lift-push">Record</Button>
```

Svelte:

```svelte
<script>
  import { Button } from "@claymo/svelte";
</script>

<Button motion="lift-push">Record</Button>
```

The prop renders `data-motion` on the component's outer element, so it also applies to everything the component draws, such as a slider's thumb or a dialog's backdrop. These components take it: Accordion, Alert, Badge, Button, ButtonGroup, Checkbox, Chip, Dialog, Drawer, IconButton, ListItemButton, Radio, RadioGroup, Slider, Snackbar, Switch, Tab, Tabs and Tooltip. Any other element can use the attribute or class.

## Tokens

| Token                           | Default                      | Controls                                                |
| ------------------------------- | ---------------------------- | ------------------------------------------------------- |
| `--clay-motion-duration`        | `150ms`                      | Hover, focus, toggles and the release after a press     |
| `--clay-motion-duration-press`  | `90ms`                       | Going into a press                                      |
| `--clay-motion-duration-enter`  | `200ms`                      | Dialogs, drawers, snackbars, badges and value changes   |
| `--clay-motion-easing`          | `cubic-bezier(0.2, 0, 0, 1)` | Every transition and entrance                           |
| `--clay-motion-hover-y`         | `-1px`                       | Vertical travel on hover (negative rises)               |
| `--clay-motion-hover-scale`     | `1`                          | Scale on hover                                          |
| `--clay-motion-hover-elevation` | `1.15`                       | Outer shadow multiplier on hover                        |
| `--clay-motion-press-y`         | `1px`                        | Vertical travel while pressed                           |
| `--clay-motion-press-scale-x`   | `0.98`                       | Horizontal scale while pressed                          |
| `--clay-motion-press-scale-y`   | `0.98`                       | Vertical scale while pressed                            |
| `--clay-motion-press-drop`      | `0.4`                        | Outer shadow kept while pressed, as a fraction of depth |
| `--clay-motion-press-sink`      | `1`                          | Inset shading while pressed, as a multiple of depth     |
| `--clay-motion-enter-y`         | `8px`                        | Distance entering overlays and indicators travel        |
| `--clay-motion-enter-scale`     | `0.98`                       | Starting scale of entering overlays and indicators      |

Set tokens on the element that should change or on any ancestor. Built-in presets keep every duration at or under 300ms; values you set yourself are not capped.

## Your own preset

Any `data-motion` value starts from the defaults, so a custom preset only lists what differs:

```css
[data-motion="brand"] {
  --clay-motion-duration: 120ms;
  --clay-motion-hover-y: 0px;
  --clay-motion-hover-scale: 1.015;
}
```

Apply it with the attribute (`<main data-motion="brand">`). The `motion` prop only accepts the built-in names.

## What moves

| Element                                     | Motion                                                     |
| ------------------------------------------- | ---------------------------------------------------------- |
| Buttons, chips, list items, tabs, summaries | Hover travel and shadow, press travel, scale and shading   |
| Checkbox, radio, switch                     | Hover and press travel; tick and dot fade in from 60% size |
| Switch thumb, slider value bubble           | Slide and fade                                             |
| Dialog, drawer, snackbar, badge             | Enter animation                                            |
| Progress bars and rings                     | Value changes ease; indeterminate loops are not presets    |

Drawers always slide in from their edge; `none` and reduced motion make them appear instantly. Spinners and skeletons keep looping under every preset because they show that something is loading.

## Reduced motion

`prefers-reduced-motion: reduce` overrides every preset and token default: no hover or press travel, no transitions, no entrances, and no loading loops. Controls still show every state, and loading indicators stay visible. Claymo's rules apply only to its own elements, so motion your app adds needs its own handling.
