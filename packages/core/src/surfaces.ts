import { flag } from "./attrs.ts";
import type { PaperOptions } from "./paper.ts";

export interface AppBarOptions {
  /** Sticky by default so the bar remains in flow; use fixed for an overlay. */
  position?: "static" | "sticky" | "fixed" | "absolute" | "relative";
  color?:
    | "primary"
    | "default"
    | "inherit"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | "transparent";
}

export interface CardOptions extends Omit<PaperOptions, "square"> {
  /** Increase the default depth; explicit elevation takes precedence. */
  raised?: boolean;
}

export function cardElevation(
  elevation: CardOptions["elevation"],
  raised?: boolean,
): NonNullable<CardOptions["elevation"]> {
  return elevation ?? (raised ? 2 : 1);
}

export interface DividerOptions {
  orientation?: "horizontal" | "vertical";
  /** Stretch to the height of a flex row (use with orientation="vertical"). */
  flexItem?: boolean;
  variant?: "fullWidth" | "inset" | "middle";
}

const variantTags = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle1: "p",
  subtitle2: "p",
  body1: "p",
  body2: "p",
  inherit: "p",
  button: "span",
  caption: "span",
  overline: "span",
} as const;

export type TypographyVariant = keyof typeof variantTags;
export type TypographyElement =
  (typeof variantTags)[TypographyVariant] | "div" | "label" | "legend";

export interface TypographyOptions {
  variant?: TypographyVariant;
  /** Set the native tag without changing the visual variant. */
  as?: TypographyElement;
  variantMapping?: Partial<Record<TypographyVariant, TypographyElement>>;
  color?:
    | "inherit"
    | "text.primary"
    | "text.secondary"
    | "text.disabled"
    | "textPrimary"
    | "textSecondary"
    | "textDisabled"
    | "primary"
    | "secondary"
    | "error"
    | "success"
    | "info"
    | "warning";
  gutterBottom?: boolean;
  noWrap?: boolean;
  align?: "inherit" | "left" | "center" | "right" | "justify";
}

export function typographyTag(
  variant: TypographyVariant,
  as?: TypographyElement,
  mapping?: TypographyOptions["variantMapping"],
): TypographyElement {
  return as ?? mapping?.[variant] ?? variantTags[variant];
}

export interface AccordionOptions {
  /** Explicit expanded state takes precedence over defaultExpanded. */
  expanded?: boolean;
  /** Initial expanded state when expanded is omitted; false by default. */
  defaultExpanded?: boolean;
  disabled?: boolean;
}

export function accordionRecipe({ expanded, defaultExpanded, disabled }: AccordionOptions) {
  return {
    open: expanded ?? defaultExpanded ?? false,
    summaryAttrs: {
      "aria-disabled": disabled ? ("true" as const) : undefined,
      "data-disabled": flag(disabled),
      tabindex: disabled ? -1 : undefined,
    },
  };
}
