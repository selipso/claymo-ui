# Accessibility

## Component behavior

- Prefer native elements (`button`, `a`, `input`, `select`, `textarea`, `dialog`, `details`, `progress`). Use ARIA for semantics that HTML doesn't provide, such as `switch`, `tablist`, `tooltip`, and `status`.
- Fields, checkbox and radio edges, and slider tracks use `--clay-edge` to target at least 3:1 against the page. Text color pairs target 4.5:1.
- Claymo surfaces have a visible 3px keyboard focus ring. The optional page stylesheet extends it to all elements.
- All bridges honor `prefers-reduced-motion: reduce` through the shared stylesheet. It overrides every [motion preset](./motion.md) without hiding loading or control states. Apply the preference separately to motion your app adds.
- Hover and press change surface depth with a short shadow transition on interactive elements only; static surfaces don't animate their shadows.
- In forced colors, clay surfaces use a `ButtonText` border in place of shadows. Some component indicators still need fallbacks (see below).
- Default-size controls are at least 48px tall. `size="small"` is a dense 36px option.
- `DataTable` keeps native table semantics: sortable headers are buttons with `aria-sort` on the active column, the first data column is the row header, clickable rows make that header a keyboard button, row checkboxes are named after it ("Select logo.svg"), and the selected count and page range are `status` regions. It is not an ARIA grid; see [Data patterns](./data-patterns.md#limits).
- `Autocomplete` follows the ARIA combobox pattern with a listbox popup (`aria-expanded`, `aria-activedescendant`, arrow keys, Enter, Escape). Chips have named remove buttons, and Backspace in an empty field removes the last one.

## Known limits

- The [technique comparison](./index.md) describes the rounded-corner fallback outside Chromium and the limits of SVG lighting and clip paths. The lighting and clipped silhouette are opt-in, not defaults.
- Some default-palette values are prototype colors, not approved brand values; see [Theming](./theming.md) for their provenance.
- Demo data is hard-coded sample content. There are no backend calls.

## Verification coverage

Core unit tests cover recipes and state; MCP unit tests cover the agent workflow. The playground end-to-end suite runs against the dev server and checks navigation, the persistent sidebar, theme changes, and live examples.

Packed-consumer verification installs tarballs outside the workspace, compares exports with MCP, and compiles the framework examples. The Astro/Svelte fixture exercises keyboard, forms, overlays, display semantics and themes; the SvelteKit fixture checks prerendered HTML and CSS. The Solid fixture exercises the DOM build, SSR and hydration. See [Getting started](./getting-started.md) for commands.

### Historical playground audit

The original audit ran in Chromium 158 before the full catalog migration. It is not a current cross-browser or assistive-technology audit.

- Over 40 behavior assertions passed: hover lift (`translateY(-1px)`), press (`scale(.98)` and `translateY(1px)` with a different shadow), a 3px solid focus ring, Switch, Slider, Checkbox (including select-all and indeterminate), Radio arrow keys, Tabs arrows/Home/End, invalid email with helper text and `aria-invalid`, loading Button with `aria-busy`, Snackbar show and auto-hide, and Dialog and Drawer opening, Escape, backdrop click, and focus return.
- Reduced motion yielded `transition-duration: 0s` and no hover lift. No horizontal overflow appeared at widths of 320, 390, or 1280 px.
- Visible text in the Settings demo and component gallery passed contrast checks in light and dark (4.5:1, or 3:1 for large text). `--clay-edge` measured 3.48:1 against the light page and 5.72:1 against the dark page.
- That audit didn't cover Firefox, Safari, forced colors, or screen readers. Contrast on `data-inflated` fills was checked by eye only because the filter changes the fill.

## Review notes

Independent UI design and Biblioplex product marketing reviews of the first complete build led to fixes for focus-ring contrast on colored fills (AppBar and filled Alert), Switch thumb contrast, Checkbox/Radio/Switch hover and press states, and the Dialog and Drawer scrim in dark mode. Round IconButtons and Avatars no longer use squircle corners. Demo copy is generic: no third-party card names, no feature or privacy claims, and a persistent “Prototype · sample data” label.

Open findings:

| Area               | Finding                                                                                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Defaults and scope | The reviews noted component defaults and API restrictions that remain in place; see [Frameworks](./frameworks.md).                                                                                                                                                                  |
| Appearance         | Settings wells read as neumorphic. The `inflated` filter shifts hue, turning the primary toward cyan.                                                                                                                                                                               |
| Pressed state      | Text `Button`, `ListItemButton`, and unselected `Tab` lose the pressed shadow; only the scaling remains.                                                                                                                                                                            |
| Error indication   | `TextField` with `error` but without `helperText` has no non-color cue beyond `aria-invalid`.                                                                                                                                                                                       |
| Target size        | The `Chip` delete target is 22px.                                                                                                                                                                                                                                                   |
| Forced colors      | The Radio dot, Switch thumb, and Alert bar have incomplete fallbacks.                                                                                                                                                                                                               |
| Brand              | The clay look is not an approved Biblioplex direction. Compare it with the documented archive-room treatment (flat parchment, serif wordmark, Orbital Seal) before reuse. Naming clearance for “Biblioplex” is not established, so the branded demo isn't for external publication. |
