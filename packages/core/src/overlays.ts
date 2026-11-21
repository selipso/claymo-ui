export type DrawerVariant = "temporary" | "permanent" | "persistent";
export type DrawerAnchor = "left" | "right" | "top" | "bottom";

export interface DrawerOptions {
  variant?: DrawerVariant;
  anchor?: DrawerAnchor;
  width?: number;
  open?: boolean;
  hideBackdrop?: boolean;
}

export type SnackbarCloseReason = "timeout" | "escapeKeyDown" | "clickaway";
export interface SnackbarAnchorOrigin {
  vertical: "top" | "bottom";
  horizontal: "left" | "center" | "right";
}

export const snackbarAnchorOrigin: SnackbarAnchorOrigin = {
  vertical: "bottom",
  horizontal: "center",
};
export const snackbarAutoHideDuration = 4000;

/** A missing duration disables auto-hide; an explicit resume duration can be zero. */
export function snackbarHideDelay(
  autoHideDuration: number | null,
  resumeHideDuration: number | null,
  resumed: boolean,
): number | null {
  return autoHideDuration === null
    ? null
    : ((resumed ? resumeHideDuration : null) ?? autoHideDuration);
}

export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipCloseReason = "leave" | "escapeKeyDown";

/** Missing means uncontrolled; explicit false is different for an automatically triggered overlay. */
export function overlayOpen(value: string | null): boolean | undefined {
  if (value === "" || value === "true") return true;
  if (value === "false") return false;
  return undefined;
}
