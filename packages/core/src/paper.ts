import { flag, type Attrs } from "./attrs.ts";

export type PaperElement = "div" | "section" | "article" | "nav" | "aside" | "header";

export interface PaperOptions {
  /** Depth level: 0 flat, 1 = 6px, 2 = 10px, 3 = 16px. */
  elevation?: 0 | 1 | 2 | 3;
  variant?: "elevation" | "outlined";
  square?: boolean;
  /** Opt-in SVG dome shading; ignored on flat surfaces. Needs ClayLighting on the page. */
  inflated?: boolean;
  as?: PaperElement;
}

export function paperRecipe(o: PaperOptions): {
  tag: PaperElement;
  className: string;
  attrs: Attrs;
} {
  const elevation = o.elevation ?? 1;
  const variant = o.variant ?? "elevation";
  const flat = variant === "outlined" || elevation === 0;
  return {
    tag: o.as ?? "div",
    className: "clay clay-paper",
    attrs: {
      "data-elevation": elevation,
      "data-variant": variant,
      "data-flat": flag(flat),
      "data-square": flag(o.square),
      "data-inflated": flag(o.inflated && !flat),
    },
  };
}
