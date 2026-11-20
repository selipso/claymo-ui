import type { DialogCloseReason } from "../dialog.ts";
import type { SnackbarCloseReason, TooltipCloseReason } from "../overlays.ts";
import { upgrader } from "./upgrade.ts";

export interface DialogHandlers {
  /** The user asked to close (Escape, backdrop or close button). The owner decides; nothing closes by itself. */
  requestClose(event: Event, reason: DialogCloseReason): void;
  /**
   * The browser closed the dialog without asking (form method="dialog", a forced second Escape).
   * Not called for a stale `close` event that arrives after the dialog was reopened.
   */
  closed?(event: Event): void;
}

/** Native showModal() gives the focus trap, inert page, Escape and focus restoration to the opener. */
export function setDialogOpen(dialog: HTMLDialogElement, open: boolean): void {
  if (open && !dialog.open) dialog.showModal();
  else if (!open && dialog.open) dialog.close();
}

/**
 * Routes Escape, backdrop clicks and the dialog's own close button (`[data-clay-dialog-close]`)
 * through `requestClose`. A backdrop press must start and end on the backdrop, so dragging a text
 * selection out of the panel does not dismiss. Pointer-only by design: the keyboard equivalent is
 * Escape. Returns a detach function.
 */
export function attachDialog(dialog: HTMLDialogElement, handlers: DialogHandlers): () => void {
  let pressedOnBackdrop = false;
  const onCancel = (event: Event) => {
    event.preventDefault();
    handlers.requestClose(event, "escapeKeyDown");
  };
  const onPointerDown = (event: PointerEvent) => (pressedOnBackdrop = event.target === dialog);
  const onClick = (event: MouseEvent) => {
    const closer = (event.target as Element).closest("[data-clay-dialog-close]");
    // A nested dialog's close button belongs to that dialog, not this one.
    if (closer?.closest("dialog") === dialog) handlers.requestClose(event, "closeButton");
    else if (pressedOnBackdrop && event.target === dialog)
      handlers.requestClose(event, "backdropClick");
    pressedOnBackdrop = false;
  };
  // `close` is queued as a task: if the owner reopened the dialog meanwhile, the event is stale.
  const onClose = (event: Event) => {
    if (!dialog.open) handlers.closed?.(event);
  };

  dialog.addEventListener("cancel", onCancel);
  dialog.addEventListener("pointerdown", onPointerDown);
  dialog.addEventListener("click", onClick);
  dialog.addEventListener("close", onClose);
  return () => {
    dialog.removeEventListener("cancel", onCancel);
    dialog.removeEventListener("pointerdown", onPointerDown);
    dialog.removeEventListener("click", onClick);
    dialog.removeEventListener("close", onClose);
  };
}

/** Fired (cancelable) on the dialog before a user-requested close; preventDefault() keeps it open. */
export const DIALOG_REQUEST_CLOSE_EVENT = "clay-request-close";
export type DialogRequestCloseEvent = CustomEvent<{ reason: DialogCloseReason }>;
/** The shared, cancelable close request of Dialog, Drawer, Snackbar and Tooltip (non-bubbling). */
export type ClayRequestCloseEvent = CustomEvent<{
  reason: DialogCloseReason | SnackbarCloseReason | TooltipCloseReason;
}>;

declare global {
  interface HTMLElementEventMap {
    "clay-request-close": ClayRequestCloseEvent;
  }
}

/**
 * Default owner for server-rendered dialogs (`dialog[data-clay-dialog]`): close unless a listener
 * rejects the request. `data-clay-open` opens it modally on upgrade; triggers can use the native
 * `commandfor` / `command="show-modal"` attributes with no script.
 */
export function attachDialogElement(dialog: HTMLDialogElement): () => void {
  const detach = attachDialog(dialog, {
    requestClose(_event, reason) {
      const request = new CustomEvent(DIALOG_REQUEST_CLOSE_EVENT, {
        cancelable: true,
        detail: { reason },
      });
      if (dialog.dispatchEvent(request)) dialog.close();
    },
  });
  if (dialog.hasAttribute("data-clay-open")) setDialogOpen(dialog, true);
  return detach;
}

export const upgradeDialogs = upgrader<HTMLDialogElement>(
  "dialog[data-clay-dialog]",
  attachDialogElement,
);
