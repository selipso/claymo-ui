import { flag, type Attrs } from "./attrs.ts";
import type { Color, Size } from "./types.ts";

export * from "./autocomplete.ts";

export interface TextFieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface RadioGroupOption extends TextFieldOption {
  color?: Color;
  size?: Exclude<Size, "large">;
}

export const textFieldDefaults = {
  variant: "outlined",
  size: "medium",
  color: "primary",
  rows: 3,
  type: "text",
} as const;

export interface TextFieldRecipeOptions {
  id: string;
  variant?: "outlined" | "filled";
  size?: Exclude<Size, "large">;
  color?: Color;
  error?: boolean;
  /** Native disabled, as bridges receive it (an attribute may arrive as a string). */
  disabled?: boolean | string | null;
  fullWidth?: boolean;
  select?: boolean;
  multiline?: boolean;
  hasStart?: boolean;
  hasEnd?: boolean;
  helperText?: string;
  /** Consumer-supplied aria-describedby, kept after the helper text. */
  describedBy?: string | null;
}

export interface TextFieldRecipe {
  helperId: string;
  /** Data attributes for the field wrapper. */
  root: Attrs;
  /** Layout flags for the control row (adornments, select chevron, textarea). */
  control: Attrs;
  /** Accessibility attributes for the native input, textarea or select. */
  input: { "aria-invalid": "true" | undefined; "aria-describedby": string | undefined };
}

/** One source for TextField defaults, helper-text association and state attributes in both bridges. */
export function textFieldRecipe(o: TextFieldRecipeOptions): TextFieldRecipe {
  const helperId = `${o.id}-helper`;
  const select = !!o.select && !o.multiline;
  const describedBy = [o.helperText ? helperId : undefined, o.describedBy]
    .filter(Boolean)
    .join(" ");
  const disabled =
    o.disabled === true ||
    o.disabled === "" ||
    (typeof o.disabled === "string" && o.disabled !== "false");
  return {
    helperId,
    root: {
      "data-full-width": flag(o.fullWidth),
      "data-disabled": flag(disabled),
      "data-color": o.color ?? textFieldDefaults.color,
      "data-size": o.size ?? textFieldDefaults.size,
      "data-variant": o.variant ?? textFieldDefaults.variant,
      "data-error": flag(o.error),
    },
    control: {
      "data-has-start": flag(o.hasStart),
      "data-has-end": flag(o.hasEnd || select),
      "data-select": flag(select),
      "data-multiline": flag(o.multiline),
    },
    input: {
      "aria-invalid": o.error ? "true" : undefined,
      "aria-describedby": describedBy || undefined,
    },
  };
}

function decimalPlaces(value: number): number {
  const text = String(value);
  const exponent = text.indexOf("e");
  const end = exponent === -1 ? text.length : exponent;
  const point = text.indexOf(".");
  return (
    (point === -1 ? 0 : end - point - 1) - (exponent === -1 ? 0 : Number(text.slice(exponent + 1)))
  );
}

// Account for floating-point noise immediately below an integer (e.g. 0.3 / 0.1).
function stepIndex(index: number): number {
  const integer = Math.round(index);
  return Math.abs(index - integer) <= Number.EPSILON * Math.abs(index) * 2 ? integer : index;
}

function valueAtStep(min: number, step: number, index: number, precision: number): number {
  const value = min + index * step;
  return precision <= 100 ? Number(value.toFixed(precision)) : value;
}

/** Native range values are bounded and aligned to the step grid, with ties toward the maximum. */
export function sliderValue(value: number, min: number, max: number, step: number): number {
  if (max <= min) return min;
  const clamped = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
  const increment = step > 0 && Number.isFinite(step) ? step : 1;
  const precision = Math.max(0, decimalPlaces(min), decimalPlaces(increment));
  const last = Math.floor(stepIndex((max - min) / increment));
  const nearest = Math.floor(stepIndex((clamped - min) / increment + 0.5));
  return Math.min(max, valueAtStep(min, increment, Math.min(last, nearest), precision));
}

export function sliderPercent(value: number, min: number, max: number): number {
  return max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
}

/** Draw at most 20 intervals, omitting a max that doesn't fall on the step grid. */
export function sliderMarks(min: number, max: number, step: number): number[] {
  if (!(step > 0) || !Number.isFinite(step) || !(max > min)) return [];
  const last = Math.floor(stepIndex((max - min) / step));
  if (!(last >= 1 && last <= 20)) return [];
  const precision = Math.max(0, decimalPlaces(min), decimalPlaces(step));
  return Array.from({ length: last + 1 }, (_, index) => valueAtStep(min, step, index, precision));
}
