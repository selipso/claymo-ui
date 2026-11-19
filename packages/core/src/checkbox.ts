import type { Attrs } from "./attrs.ts";
import type { Color, Size } from "./types.ts";

export interface CheckboxOptions {
  color?: Color;
  size?: Exclude<Size, "large">;
}

/** Bridges render a literal <input type="checkbox">: labels, forms and reset work unchanged. */
export function checkboxRecipe(o: CheckboxOptions): { className: string; attrs: Attrs } {
  return {
    className: "clay clay-checkbox",
    attrs: {
      "data-color": o.color ?? "primary",
      "data-size": o.size ?? "medium",
    },
  };
}
