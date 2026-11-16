# claymo-ui

Proof of concept: a claymorphic (soft, inflated, inner and outer shadow) component library with [Material UI](https://mui.com/material-ui/all-components/)-style APIs, written as Svelte 5 components on one plain-CSS foundation, with an Astro playground.

Inspired by Michał Malewicz's [Claymorphism in User Interfaces](https://hype4.academy/articles/design/claymorphism-in-user-interfaces), which says the effect is "not really possible to achieve in CSS just yet". This repository tests that claim.

## Feasibility verdict

About 90% of the look is plain CSS today and degrades gracefully. Only the article's bulged-edge silhouette needs an emulation.

| Technique | Gives you | Browser support | Limits |
| --- | --- | --- | --- |
| `box-shadow`: one large offset outer shadow, light inset top-left, dark inset bottom-right | The article's exact recipe | All | None. This is the default for every component |
| `border-radius` beyond the half-size clamp | Pill and circle shapes | All | CSS clamps radii at 50%, as in the article |
| `corner-shape: squircle` (progressive enhancement) | Puffier, smoother corners; shadows, outline and overflow follow the shape | Chromium 139+ (Aug 2025). Firefox and Safari fall back to plain rounded corners | Needs `border-radius > 0`; cosmetic only |
| SVG `feDiffuseLighting` / `feSpecularLighting` over a blurred alpha height-map (`data-inflated`) | A real dome highlight that follows any silhouette | All engines | Repaints on resize; opt-in, for small static elements |
| `clip-path: url(#id)` with an `objectBoundingBox` Bezier path | A truly bulged silhouette (the article's "drag the side midpoints out") | All engines | Fixed proportions; clips `box-shadow`, so the drop shadow must come from a parent `filter: drop-shadow()` |

Conclusion: the article is correct only about arbitrary, resizable vector deformation. See `/lab/` for the four stages side by side, with a live `CSS.supports()` table for your browser.

## Run

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 4321   # http://localhost:4321
npm run check                                # astro check (types + Svelte a11y warnings)
npm run build
```

Routes: `/` app demo (every component composed into a settings and dashboard screen), `/components/` gallery of variants and states, `/lab/` the technique comparison.

## Use the CSS on its own

Import `src/lib/styles/clay.css` once, then:

```html
<button class="clay" data-clay-interactive style="--clay-color: var(--clay-primary); color: var(--clay-primary-on)">Save</button>
```

- `.clay` is the surface. Per element it reads `--clay-color` (fill), `--clay-d` (depth in px) and `--clay-radius`, and derives `--clay-light`, `--clay-shade`, `--clay-drop` and the shadow stacks `--clay-raised`, `--clay-pressed`, `--clay-well`, `--clay-insets`, `--clay-outer`.
- `data-color="primary|secondary|success|error|warning|info|default|inherit"` sets `--c`, `--c-on`, `--c-ink` (fill, text on the fill, coloured text or border on a page or surface).
- `data-clay-interactive` adds hover lift and the pressed state; focus rings are global (`:focus-visible`, 3px).
- `data-inflated` switches the surface to the SVG lighting filter. It needs the hidden `<svg>` with `#clay-lit` from `src/layouts/Base.astro` in the document (do not use `display: none` on it).
- Light and dark themes use one token block with `light-dark()`. `<html data-theme="light|dark">` overrides the system preference.

## Components

Svelte 5 (runes). Import from `src/lib/components/`.

- Actions: `Button`, `IconButton`, `ButtonGroup`, `Chip`, `Badge`, `Avatar`, `Tooltip`
- Inputs: `TextField` (text, multiline, select), `Checkbox`, `Radio`, `RadioGroup`, `FormControlLabel`, `Switch`, `Slider`
- Surfaces: `Paper`, `Card`, `CardHeader`, `CardContent`, `CardActions`, `Accordion`, `Divider`, `Table`
- Feedback: `Alert`, `Snackbar`, `LinearProgress`, `CircularProgress`, `Skeleton`
- Navigation and overlays: `AppBar`, `Drawer`, `Tabs`, `Tab`, `TabPanel`, `Dialog`, `List`, `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`
- Content: `Typography`

### MUI to clay API mapping

Prop names, values and defaults follow MUI v9 for supported props. Controlled values are `$bindable` (`bind:checked`, `bind:value`, `bind:open`). MUI node props (`startIcon`, `endIcon`, `icon`, `avatar`, `action`) are Svelte snippets. Custom MUI events keep their MUI names (`onChange`, `onClose`, `onDelete`); native events (`onclick`, `onfocus`) pass through to the element.

| MUI | clay |
| --- | --- |
| `sx` | Not supported. Pass `class` and use CSS variables (`--clay-color`, `--clay-d`, `--clay-radius`) |
| `classes`, `component`, `slots`, `slotProps`, theme default props | Not supported. Components that need it expose `as` (`Paper`, `Typography`) |
| `disableRipple`, `disableFocusRipple` | Not applicable. Focus uses a 3px `:focus-visible` ring; press uses a pressed clay state |
| `edge` (Switch, IconButton) | Not supported |
| `TextField variant="standard"` | Not supported. `outlined` (default) and `filled` |
| `Button variant` default | **`contained`** (MUI: `text`). The raised surface is the style's identity |
| `Badge color` default | `primary` |
| `Avatar size`, `Table label` | clay additions (`small\|medium\|large`; required accessible name for the scroll region) |
| Extra | `inflated` on `Button`, `Paper`, `Card`: opt-in SVG dome shading |

## Accessibility

- Native elements first (`button`, `a`, `input`, `select`, `textarea`, `dialog`, `details`, `progress`); ARIA only where HTML has no equivalent (`role="switch"`, `tablist`, `tooltip`, `status`).
- Fields, checkbox and radio edges, and slider tracks use `--clay-edge` for at least 3:1 against the page; text pairs target 4.5:1. The contrast audit used during development is described under Verification below.
- Visible 3px focus ring everywhere; the ring is never removed.
- `prefers-reduced-motion`: transitions and animations are disabled; hover lift and press scale are removed.
- `forced-colors`: shadows are replaced with a 2px `ButtonText` border. Not visually exercised in this POC.
- Controls are at least 48px tall at the default size (36px for `size="small"`, which is documented as dense).

## Known limits

- `corner-shape: squircle` is Chromium-only today; other browsers show plain rounded corners (still clay).
- The lighting filter and clip-path silhouette are opt-in and not used by default.
- Palette values come from the draft Biblioplex reference (`biblioplex/docs/brand.md` on branch `branding`): primary `#008282`, dark surface `#102629`, focus `#f3ead2`, Source Sans 3. The light surface tints, `--clay-edge`, and the secondary, success, error, warning and info colours are POC values, not brand-approved.
- All demo data is hard-coded sample content. No backend calls.

## Palette provenance

| Token | Source |
| --- | --- |
| `--clay-primary` `#008282` | Documented (`biblioplex/docs/brand.md`) |
| Dark `--clay-page` `#102629`, `--clay-ink` `#e8f3f2`, `--clay-focus` `#f3ead2`, `--clay-primary-ink` `#55c9c5` | Documented colours, assigned to new roles here (`#55c9c5` is documented only as a toggle border) |
| Source Sans 3 (400, 600), 3px focus ring | Documented |
| Light `--clay-page` `#d4e8e6`, `--clay-surface` `#e6f2f0`; dark `--clay-surface` `#1f4044` | POC values (derived tints) |
| `--clay-ink-muted`, `--clay-edge`, light `--clay-focus` `#006969` | POC values; `#006969` is documented only as a primary hover shade, and Parchment `#f3ead2` was not usable as a focus ring on the light page (about 1.06:1) |
| Every `*-on` and `*-ink` token | POC values, hand-chosen so text reaches 4.5:1 |
| `secondary`, `success`, `error`, `warning`, `info` fills | POC values with hues near the Orbital Seal blue, green and red, darkened so white text passes 4.5:1. Not brand-approved |
| Documented but unused: `#193639`, `#456063`, `#789495`, `#006969` as hover, Source Serif 4, Ink `#343240`, Parchment as a surface | |

The brand doc says status colours (error, success) must not be recoloured in the host application. claymo-ui is its own host UI, so it defines its own status colours; a real host should override `--clay-success`, `--clay-error` and the other `--clay-<name>` tokens. Whether the clay look suits the archive-room brand is an open brand decision, not settled here.

## Verification

Run against the dev server in Chromium 158 (Playwright driving a local build; `corner-shape: squircle` supported):

- `npm run check` (`astro check` + `svelte-check`): 0 errors, 0 warnings. `npm run build`: 3 pages.
- 40+ behaviour assertions pass: hover lift (`translateY(-1px)`), press (`scale(.98)` + `translateY(1px)`, different `box-shadow`), 3px solid focus ring; Switch, Slider, Checkbox (incl. select-all and indeterminate), Radio arrow keys; Tabs arrows/Home/End; invalid-email helper text and `aria-invalid`; Button `loading` with `aria-busy`; Snackbar show and auto-hide; Dialog and Drawer open, Escape, backdrop click and focus return; reduced motion (`transition-duration: 0s`, no hover lift); no horizontal overflow at 320, 390 and 1280px.
- A text-contrast audit over every visible text node on `/` (Settings tab) and `/components/` in light and dark passes (4.5:1, or 3:1 for large text); `--clay-edge` is 3.48:1 against the light page and 5.72:1 against the dark page.
- Not exercised: Firefox and Safari (no `corner-shape`, so plain rounded corners), forced-colors, screen readers, contrast of text on `data-inflated` fills (the fill is filtered; checked by eye only).

## Review notes

Independent `ui-designer` and `biblioplex-product-marketing-manager` reviews were run on the first complete build. Fixed afterwards: focus-ring contrast on coloured fills (AppBar, filled Alert), Switch thumb boundary, hover and press for Checkbox, Radio and Switch, Dialog and Drawer scrim in dark mode, round shapes (IconButton, circular Avatar) no longer squircled, demo copy made generic (no third-party card names, no feature or privacy claims, persistent "Prototype · sample data" label).

Open, not acted on:

- **Defaults that differ from MUI:** `Snackbar autoHideDuration` 4000 (MUI `null`) and anchor bottom-center; `Dialog maxWidth` xs/sm/md = 320/444/600px; `Paper elevation` 0-3; `TextField rows` fixed (no auto-grow, no `minRows`/`maxRows`), static label, `select` takes native `<option>`; `Slider` single value only; `Tabs` colour fixed to primary; `Button.loading` defaults to `false`.
- **Look (taste):** wells on the Settings screen read neumorphic; default Card, Paper and Chip are separated from the page by shadow only (about 1.1:1 fill contrast); the `inflated` filter shifts hue (primary turns cyan), so it is a demo, not a default.
- **States and a11y still open:** pressed shadow is lost on text `Button`, `ListItemButton` and unselected `Tab` (only scale shows); `TextField error` without `helperText` has no non-colour cue beyond `aria-invalid`; the `Chip` delete target is 22px; forced-colors fallbacks are not complete for the Radio dot, Switch thumb and Alert bar.
- **Brand:** the clay look is not a brand decision for Biblioplex (the documented direction is archive-room, serif wordmark, Orbital Seal). Compare against a flat parchment-and-serif treatment before reuse. Naming clearance for "Biblioplex" is not established, so the demo is not for external publication.
