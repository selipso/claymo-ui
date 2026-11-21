import { flag, type Attrs } from "./attrs.ts";

export type DialogCloseReason = "escapeKeyDown" | "backdropClick" | "closeButton";
export type DialogMaxWidth = "xs" | "sm" | "md";

export interface DialogOptions {
  /** Base for internal ids (the title id is `${idBase}-title`). */
  idBase: string;
  hasTitle: boolean;
  fullWidth?: boolean;
  /** xs/sm/md = 320/444/600px. */
  maxWidth?: DialogMaxWidth;
  /** Shows the close (X) button; the title and first content row keep clear of it. */
  dismissible?: boolean;
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
      "data-dismissible": flag(o.dismissible),
      "aria-labelledby": o.hasTitle ? titleId : undefined,
    },
  };
}
