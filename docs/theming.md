# Theming

## Use the CSS on its own

Install `@claymo/core` and import its styles once. Include `page.css` if Claymo owns the page font, colors, and focus styles; omit it when embedding Claymo in an existing design.

```js
import "@claymo/core/claymo.css";
import "@claymo/core/page.css"; // Optional page defaults
```

```html
<button
  class="clay"
  data-color="primary"
  data-clay-interactive
  style="--clay-color: var(--c); color: var(--c-on)"
>
  Save
</button>
```

- `.clay` reads `--clay-color` (fill), `--clay-d` (depth in CSS pixels), and `--clay-radius` on the element. It derives `--clay-light`, `--clay-shade`, and `--clay-drop`, and the shadow tokens `--clay-raised`, `--clay-pressed`, `--clay-well`, `--clay-insets`, and `--clay-outer`. Shade and drop are hue-matched: the fill's own OKLCH hue, darker and at least as saturated, never mixed with black. Any `--clay-color` gets matching shadows, including your own.
- `data-color` selects a semantic role: `primary`, `secondary`, `success`, `error`, `warning`, `info`, `default`, or `inherit`. It resolves `--c` (fill), `--c-on` (text on the fill), and `--c-ink` (colored text or border on a page or surface). A component's `color` prop also takes a role, not a palette name or a CSS color.
- `data-clay-interactive` adds hover lift and the pressed state. `.clay` has a 3px `:focus-visible` ring, and `page.css` extends it to every element.
- Components use `--clay-border-width` (1px by default) for borders and dividers. Focus rings and indicator strokes are independent of that width.

## Choose a mode and palette

Light and dark colors are defined together with `light-dark()`. Set `data-theme="light"` or `data-theme="dark"` on `<html>` to override the visitor's system color scheme. Omit the attribute for system mode; there is no theme prop on individual components.

Set `data-palette` on `<html>` for the whole page or on a container to theme one region. Omit it for the default palette. The root defines status colors; each alternate palette replaces them along with the primary and secondary colors.

Every palette follows the claymorphism backdrop rule: a clean, near-neutral page (OKLCH chroma ≤ 0.015) under pastel clay surfaces in the palette's hue (chroma ≥ 0.06, at least 4× the page, ΔE ≥ 0.08), with text inks at 4.5:1 and edges and focus at 3:1 on both. The rule is enforced by tests; follow it when you override `--clay-page` or `--clay-surface`.

| `data-palette`      | Palette         | Colors                                          |
| ------------------- | --------------- | ----------------------------------------------- |
| Omitted (`default`) | Tidal Pool      | Lagoon teal and terracotta coral on pale aqua   |
| `reef`              | Coral Reef      | Coral pink and lagoon turquoise on pastel coral |
| `sorbet`            | Sunset Sorbet   | Electric magenta and Capri cyan on peach        |
| `orbit`             | Lunar Orbit     | Ultraviolet and solar citron on lavender        |
| `atelier`           | Cobalt Atelier  | Klein cobalt and marigold on ice blue           |
| `canopy`            | Tropical Canopy | Malachite jade and neon orchid on mint          |

Use the playground's palette and mode controls while viewing `/gallery/` to compare the palettes in light and dark.

## Override tokens

| What to change   | Tokens and placement                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page and surface | Set `--clay-page`, `--clay-surface`, `--clay-ink`, `--clay-ink-muted`, `--clay-edge`, and `--clay-focus` on the themed page or container.                                                                                             |
| Brand and status | Override a role's fill, on-fill, and surface ink together, for example `--clay-primary`, `--clay-primary-on`, and `--clay-primary-ink`. Check contrast in both modes. Don't assign the internal `--c` variables directly.             |
| Geometry         | Prefer a supported `elevation`, `size`, or `square` prop. If necessary, set `--clay-d` or `--clay-radius` on the surface element itself.                                                                                              |
| Avatar centering | Initials and icons sit slightly up and left of the geometric center (3px on small and medium avatars, 2.5px on large), matching the lit face of the clay shading. `--clay-avatar-optical-offset` sets the shift; `0` centers exactly. |

## Inflated lighting

Set the `inflated` prop on supported components or add `data-inflated` to a raw `.clay` surface. Render `ClayLighting` from either bridge once in the page layout. Without a bridge, put the `CLAY_LIGHTING_SVG` export from `@claymo/core` in the document as SVG markup. This supplies the `#clay-lit` filter; don't hide it with `display: none`.

## Palette provenance

The draft Biblioplex brand reference (`biblioplex/docs/brand.md` on the `branding` branch) supplied Source Sans 3 and the 3px focus ring. No palette uses its colors since Tidal Pool became the default and Coral Reef replaced Archive Teal, the palette that carried the documented teal. All palette colors are prototype choices, not brand-approved.

| Token or value                                                                 | Source or decision                                                                                                                                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source Sans 3 (400 and 600), 3px focus ring                                    | Documented                                                                                                                                                                                 |
| `--clay-page` and `--clay-surface` in every palette and mode                   | Derived from the palette hue by the backdrop rule above                                                                                                                                    |
| Role fills, `*-on`, `*-ink`, `--clay-ink-muted`, `--clay-edge`, `--clay-focus` | Chosen per palette theme (Coral Reef: coral pink, lagoon turquoise, sea grass, yellow tang, fire coral, deep ocean) to meet 4.5:1 text and 3:1 edge and focus contrast; tests enforce both |
| Documented but unused                                                          | Primary `#008282`, dark page `#102629`, `#193639`, `#456063`, `#789495`, `#006969`, Source Serif 4, Ink `#343240`, and Parchment `#f3ead2`                                                 |

The draft brand rules say not to recolor status colors in the host app. Claymo defines its own for the prototype; an integrating app should set `--clay-success`, `--clay-error`, and the other role tokens to its own approved values.
