import { flag, type Attrs } from "./attrs.ts";

export type DialogCloseReason = "escapeKeyDown" | "backdropClick";
export type DialogMaxWidth = "xs" | "sm" | "md";

export interface DialogOptions {
  /** Base for internal ids (the title id is `${idBase}-title`). */
  idBase: string;
  hasTitle: boolean;
  fullWidth?: boolean;
  /** xs/sm/md = 320/444/600px. */
  maxWidth?: DialogMaxWidth;
}

export function dialogRecipe(o: DialogOptions): {
  className: string;
  titleId: string;
  attrs: Attrs;
} {
  const titleId = `${o.idBase}-title`;
  return {
    className: "clay clay-dialog",
    titleId,
    attrs: {
      "data-full-width": flag(o.fullWidth),
      "data-max-width": o.maxWidth ?? "sm",
      "aria-labelledby": o.hasTitle ? titleId : undefined,
    },
  };
}
