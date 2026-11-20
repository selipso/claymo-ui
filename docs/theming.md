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

- `.clay` reads `--clay-color` (fill), `--clay-d` (depth in CSS pixels), and `--clay-radius` on the element. It derives `--clay-light`, `--clay-shade`, and `--clay-drop`, and the shadow tokens `--clay-raised`, `--clay-pressed`, `--clay-well`, `--clay-insets`, and `--clay-outer`.
- `data-color` selects a semantic role: `primary`, `secondary`, `success`, `error`, `warning`, `info`, `default`, or `inherit`. It resolves `--c` (fill), `--c-on` (text on the fill), and `--c-ink` (colored text or border on a page or surface). A component's `color` prop also takes a role, not a palette name or a CSS color.
- `data-clay-interactive` adds hover lift and the pressed state. `.clay` has a 3px `:focus-visible` ring, and `page.css` extends it to every element.
- Components use `--clay-border-width` (1px by default) for borders and dividers. Focus rings and indicator strokes are independent of that width.

## Choose a mode and palette

Light and dark colors are defined together with `light-dark()`. Set `data-theme="light"` or `data-theme="dark"` on `<html>` to override the visitor's system color scheme. Omit the attribute for system mode; there is no theme prop on individual components.

Set `data-palette` on `<html>` for the whole page or on a container to theme one region. Omit it for the default palette. The root defines status colors; each alternate palette replaces them along with the primary and secondary colors.

| `data-palette`      | Palette         | Colors                                        |
| ------------------- | --------------- | --------------------------------------------- |
| Omitted (`default`) | Archive Teal    | Deep teal and steel blue on cool mint         |
| `tidal`             | Tidal Pool      | Lagoon teal and terracotta coral on pale aqua |
| `sorbet`            | Sunset Sorbet   | Electric magenta and Capri cyan on peach      |
| `orbit`             | Lunar Orbit     | Ultraviolet and solar citron on lavender      |
| `atelier`           | Cobalt Atelier  | Klein cobalt and marigold on ice blue         |
| `canopy`            | Tropical Canopy | Malachite jade and neon orchid on mint        |

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

Archive Teal borrows from the draft Biblioplex brand reference (`biblioplex/docs/brand.md` on the `branding` branch), including primary teal, the dark page color, and Source Sans 3. Other token values were chosen for the prototype and are not brand-approved.

| Token or value                                                                                                     | Source or decision                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--clay-primary` `#008282`                                                                                         | Documented primary color                                                                                                                             |
| Dark `--clay-page` `#102629`, `--clay-ink` `#e8f3f2`, `--clay-focus` `#f3ead2`, and `--clay-primary-ink` `#55c9c5` | Documented colors assigned to new roles here; `#55c9c5` was documented only as a toggle border.                                                      |
| Source Sans 3 (400 and 600), 3px focus ring                                                                        | Documented                                                                                                                                           |
| Light `--clay-page` `#d4e8e6` and `--clay-surface` `#e6f2f0`; dark `--clay-surface` `#1f4044`                      | Tints derived for the prototype                                                                                                                      |
| `--clay-ink-muted`, `--clay-edge`, light `--clay-focus` `#006969`                                                  | Prototype values. `#006969` was documented as a primary hover shade; Parchment `#f3ead2` had only about 1.06:1 contrast as a ring on the light page. |
| Remaining `*-on` and `*-ink` colors                                                                                | Hand-picked to target 4.5:1 text contrast                                                                                                            |
| `secondary`, `success`, `error`, `warning`, and `info` fills                                                       | Prototype hues near the Orbital Seal blue, green, and red, darkened where needed so white text reaches 4.5:1.                                        |
| Documented but unused in those roles                                                                               | `#193639`, `#456063`, `#789495`, `#006969` as hover, Source Serif 4, Ink `#343240`, and Parchment as a surface                                       |

The draft brand rules say not to recolor status colors in the host app. Claymo defines its own for the prototype; an integrating app should set `--clay-success`, `--clay-error`, and the other role tokens to its own approved values.
