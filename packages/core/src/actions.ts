export type { ButtonVariant } from "./button.ts";

export type AlertVariant = "standard" | "filled" | "outlined";
export type ChipVariant = "filled" | "outlined";
export type ChipSize = "small" | "medium";
export type ButtonGroupOrientation = "horizontal" | "vertical";
export type IconButtonEdge = "start" | "end" | false;

export const actionIconAttrs = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
} as const;

/** Stroke paths in a shared 24×24 view box; both renderers emit ordinary SVG. */
export const closeIconPath = "m18 6-12 12M6 6l12 12";
export const alertIcons = {
  success: { label: "Success", path: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM9 12l2 2 4-4" },
  info: { label: "Info", path: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 16v-4m0-4h.01" },
  warning: {
    label: "Warning",
    path: "M21.73 18 13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3ZM12 9v4m0 4h.01",
  },
  error: { label: "Error", path: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 8v4m0 4h.01" },
} as const;

export interface NativeActionOptions {
  href?: string;
  type?: "button" | "submit" | "reset" | null;
  disabled?: boolean | null;
}

/** A native button or anchor, with no navigation or tab stop for a disabled link. */
export function nativeAction({ href, type, disabled }: NativeActionOptions) {
  if (href) {
    return disabled
      ? {
          tag: "a" as const,
          attrs: { role: "link" as const, "aria-disabled": "true" as const, tabindex: -1 },
        }
      : { tag: "a" as const, attrs: { href } };
  }
  return {
    tag: "button" as const,
    attrs: { type: type ?? "button", disabled: disabled || undefined },
  };
}

export function isChipDeleteKey(key: string): boolean {
  return key === "Backspace" || key === "Delete";
}
