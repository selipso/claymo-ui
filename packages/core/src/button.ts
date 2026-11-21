import { nativeAction } from "./actions.ts";
import { flag, type Attrs } from "./attrs.ts";
import type { Color, Size } from "./types.ts";

export type ButtonVariant = "contained" | "outlined" | "text";
export type ButtonLoadingPosition = "center" | "start" | "end";

export interface ButtonOptions {
  /** MUI default is "text"; clay defaults to "contained" because the raised surface is the style's identity. */
  variant?: ButtonVariant;
  color?: Color;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Renders an <a>. A disabled link drops its href and leaves the tab order. */
  href?: string;
  type?: "button" | "submit" | "reset" | null;
  loading?: boolean;
  loadingPosition?: ButtonLoadingPosition;
  disableElevation?: boolean;
  /** Opt-in SVG dome shading; needs ClayLighting on the page. */
  inflated?: boolean;
}

export interface ButtonRecipe {
  tag: "a" | "button";
  className: string;
  /** True while disabled or loading: bridges must swallow activation. */
  inert: boolean;
  attrs: Attrs;
}

export function buttonRecipe(o: ButtonOptions): ButtonRecipe {
  const inert = !!(o.disabled || o.loading);
  // The shared native-action contract: a disabled link keeps no href and leaves the tab order.
  const action = nativeAction({ href: o.href, type: o.type, disabled: inert });
  return {
    tag: action.tag,
    className: "clay clay-button",
    inert,
    attrs: {
      "data-variant": o.variant ?? "contained",
      "data-color": o.color ?? "primary",
      "data-size": o.size ?? "medium",
      "data-full-width": flag(o.fullWidth),
      "data-no-elevation": flag(o.disableElevation),
      "data-inflated": flag(o.inflated),
      "data-loading": o.loading ? (o.loadingPosition ?? "center") : undefined,
      "data-clay-interactive": "",
      "aria-busy": o.loading ? "true" : undefined,
      ...action.attrs,
    },
  };
}
