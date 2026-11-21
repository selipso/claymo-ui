import { isChipDeleteKey } from "../actions.ts";
import { upgrader } from "./upgrade.ts";

export const ALERT_CLOSE_EVENT = "clay-close";
export const CHIP_DELETE_EVENT = "clay-delete";

export type AlertCloseEvent = CustomEvent<{ originalEvent: MouseEvent }>;
export type ChipDeleteEvent = CustomEvent<{
  label: string;
  originalEvent: MouseEvent | KeyboardEvent;
}>;

declare global {
  interface HTMLElementEventMap {
    "clay-close": AlertCloseEvent;
    "clay-delete": ChipDeleteEvent;
  }
}

function attachAlert(root: HTMLElement) {
  root
    .querySelector<HTMLButtonElement>(":scope > .clay-alert__action > .clay-alert__close")
    ?.addEventListener("click", (originalEvent) => {
      if (root.hidden || originalEvent.defaultPrevented) return;
      if (
        root.dispatchEvent(
          new CustomEvent<AlertCloseEvent["detail"]>(ALERT_CLOSE_EVENT, {
            bubbles: true,
            cancelable: true,
            detail: { originalEvent },
          }),
        )
      ) {
        root.hidden = true;
      }
    });
}

function attachChip(root: HTMLElement) {
  const remove = root.querySelector<HTMLButtonElement>(":scope > button.clay-chip__remove");
  if (!remove) return;

  const handleDelete = (originalEvent: MouseEvent | KeyboardEvent) => {
    if (root.hidden || originalEvent.defaultPrevented || remove.matches(":disabled")) return;
    if (originalEvent instanceof KeyboardEvent) {
      if (!isChipDeleteKey(originalEvent.key)) return;
      originalEvent.preventDefault();
    }
    const label = root.getAttribute("data-clay-chip-delete") ?? "";
    if (
      root.dispatchEvent(
        new CustomEvent<ChipDeleteEvent["detail"]>(CHIP_DELETE_EVENT, {
          bubbles: true,
          cancelable: true,
          detail: { label, originalEvent },
        }),
      )
    ) {
      root.hidden = true;
    }
  };

  remove.addEventListener("click", handleDelete);
  remove.addEventListener("keydown", handleDelete);
  root
    .querySelector<HTMLButtonElement>(":scope > button.clay-chip__body")
    ?.addEventListener("keydown", handleDelete);
}

/** Upgrade server-rendered dismissible actions once per root. */
export const upgradeAlerts = upgrader<HTMLElement>("[data-clay-alert-close]", attachAlert);
export const upgradeChips = upgrader<HTMLElement>("[data-clay-chip-delete]", attachChip);
