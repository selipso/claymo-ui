import {
  overlayOpen,
  snackbarHideDelay,
  type SnackbarCloseReason,
  type TooltipCloseReason,
} from "../overlays.ts";
import { DIALOG_REQUEST_CLOSE_EVENT } from "./dialog.ts";
import { disposableUpgrader } from "./upgrade.ts";

export const OVERLAY_REQUEST_CLOSE_EVENT = DIALOG_REQUEST_CLOSE_EVENT;
export const TOOLTIP_REQUEST_OPEN_EVENT = "clay-request-open";
export type SnackbarRequestCloseEvent = CustomEvent<{ reason: SnackbarCloseReason }>;
export type TooltipRequestCloseEvent = CustomEvent<{ reason: TooltipCloseReason }>;

declare global {
  interface HTMLElementEventMap {
    "clay-request-open": CustomEvent<null>;
  }
}

const OPEN = "data-clay-open";
const AUTO_HIDE = "data-clay-auto-hide";
const RESUME_HIDE = "data-clay-resume-hide";
const IGNORE_WINDOW_BLUR = "data-clay-ignore-window-blur";
const TOOLTIP_CONTENT = "data-clay-tooltip-content";
const DESCRIBED_BY = "aria-describedby";

function duration(node: HTMLElement, attr: string): number | null {
  const attribute = node.getAttribute(attr);
  const value = attribute === null ? NaN : Number(attribute);
  return Number.isFinite(value) ? value : null;
}

export function attachSnackbar(
  root: HTMLElement,
  requestClose: (event: Event | null, reason: SnackbarCloseReason) => void,
  setVisible?: (visible: boolean) => void,
): () => void {
  const doc = root.ownerDocument;
  const view = doc.defaultView ?? window;
  let listeners: AbortController | undefined;
  let timer: number | undefined;
  let armTimer: number | undefined;
  let hovered = false;
  let focused = false;
  let blurred = false;
  let resumed = false;
  let armed = false;
  let autoHide: number | null = null;
  let resumeHide: number | null = null;
  let ignoreWindowBlur = false;

  const paused = () => hovered || focused || (blurred && !ignoreWindowBlur);
  const close = (event: Event | null, reason: SnackbarCloseReason) => {
    if (!root.isConnected) destroy();
    else if (overlayOpen(root.getAttribute(OPEN))) requestClose(event, reason);
  };
  const schedule = () => {
    view.clearTimeout(timer);
    const delay = snackbarHideDelay(autoHide, resumeHide, resumed);
    timer =
      listeners && !paused() && delay !== null
        ? view.setTimeout(() => close(null, "timeout"), delay)
        : undefined;
  };
  const pauseFor = (source: "hover" | "focus" | "window", value: boolean) => {
    const wasPaused = paused();
    if (source === "hover") hovered = value;
    else if (source === "focus") focused = value;
    else blurred = value;
    if (wasPaused === paused()) return;
    resumed = true;
    schedule();
  };

  function start() {
    listeners = new AbortController();
    const { signal } = listeners;
    hovered = root.matches(":hover");
    focused = root.contains(doc.activeElement);
    resumed = armed = false;
    // Opening from a click must not make that same click count as click-away.
    armTimer = view.setTimeout(() => (armed = true), 0);
    root.addEventListener("mouseenter", () => pauseFor("hover", true), { signal });
    root.addEventListener("mouseleave", () => pauseFor("hover", false), { signal });
    root.addEventListener("focusin", () => pauseFor("focus", true), { signal });
    root.addEventListener(
      "focusout",
      (event) => {
        if (!root.contains(event.relatedTarget as Node | null)) pauseFor("focus", false);
      },
      { signal },
    );
    view.addEventListener("blur", () => pauseFor("window", true), { signal });
    view.addEventListener("focus", () => pauseFor("window", false), { signal });
    view.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape" || event.defaultPrevented) return;
        const blockedByModal = [...doc.querySelectorAll("dialog")].some(
          (dialog) => dialog.matches(":modal") && !dialog.contains(root),
        );
        if (!blockedByModal) close(event, "escapeKeyDown");
      },
      { signal },
    );
    view.addEventListener(
      "click",
      (event) => {
        if (armed && !event.composedPath().includes(root)) close(event, "clickaway");
      },
      { signal },
    );
  }

  function stop() {
    listeners?.abort();
    listeners = undefined;
    view.clearTimeout(timer);
    view.clearTimeout(armTimer);
    blurred = false;
  }

  function sync() {
    const open = overlayOpen(root.getAttribute(OPEN)) === true;
    const wasOpen = listeners !== undefined;
    const nextAutoHide = duration(root, AUTO_HIDE);
    const nextResumeHide = duration(root, RESUME_HIDE);
    const nextIgnoreWindowBlur = root.hasAttribute(IGNORE_WINDOW_BLUR);
    const optionsChanged =
      autoHide !== nextAutoHide ||
      resumeHide !== nextResumeHide ||
      ignoreWindowBlur !== nextIgnoreWindowBlur;
    autoHide = nextAutoHide;
    resumeHide = nextResumeHide;
    ignoreWindowBlur = nextIgnoreWindowBlur;
    if (open !== wasOpen) {
      setVisible?.(open);
      if (open) start();
      else stop();
    }
    if (open && (!wasOpen || optionsChanged)) schedule();
  }

  const observer = new MutationObserver(sync);
  observer.observe(root, {
    attributeFilter: [OPEN, AUTO_HIDE, RESUME_HIDE, IGNORE_WINDOW_BLUR],
  });
  sync();

  function destroy() {
    stop();
    observer.disconnect();
  }
  return destroy;
}

function attachSnackbarElement(root: HTMLElement): (() => void) | undefined {
  const content = root.querySelector<HTMLElement>(":scope > .clay-snackbar__wrapper");
  if (!content) return;
  const detach = attachSnackbar(
    root,
    (_event, reason) => {
      const request: SnackbarRequestCloseEvent = new CustomEvent(OVERLAY_REQUEST_CLOSE_EVENT, {
        bubbles: false,
        cancelable: true,
        detail: { reason },
      });
      if (root.dispatchEvent(request)) root.removeAttribute(OPEN);
    },
    (visible) => {
      content.hidden = content.inert = !visible;
    },
  );
  const onCommand = (event: Event) => {
    if (event.target !== root || event.defaultPrevented) return;
    const { command } = event as Event & { command: string };
    if (command === "--clay-show") root.setAttribute(OPEN, "true");
    else if (command === "--clay-hide") root.removeAttribute(OPEN);
  };
  root.addEventListener("command", onCommand);
  return () => {
    root.removeEventListener("command", onCommand);
    detach();
  };
}

export const upgradeSnackbars = disposableUpgrader<HTMLElement>(
  "[data-clay-snackbar]",
  attachSnackbarElement,
);

interface TooltipHandlers {
  requestOpen?(event: Event): boolean | void;
  requestClose?(event: Event, reason: TooltipCloseReason): boolean | void;
}

let nextTooltipId = 0;

export function attachTooltip(root: HTMLElement, handlers: TooltipHandlers = {}): () => void {
  const bubble = root.querySelector<HTMLElement>(":scope > .clay-tooltip__bubble");
  if (!bubble) return () => {};
  const doc = root.ownerDocument;
  if (!bubble.id) {
    let generated: string;
    do generated = `clay-tooltip-${++nextTooltipId}`;
    while (doc.getElementById(generated));
    bubble.id = generated;
  }
  const id = bubble.id;
  const listeners = new AbortController();
  const { signal } = listeners;
  let trigger: Element | undefined;
  let ownsDescription = false;
  let hasContent = false;
  let forceOpen: boolean | undefined;
  let hovered = root.matches(":hover");
  let focused = root.contains(doc.activeElement);
  let dismissed = false;
  let automaticOpen = hovered || focused;
  let visible = false;

  function descriptionIds(element: Element): string[] {
    return (element.getAttribute(DESCRIBED_BY) ?? "").split(/\s+/).filter(Boolean);
  }

  function removeDescription() {
    if (trigger && ownsDescription) {
      const ids = descriptionIds(trigger);
      if (ids.includes(id)) {
        const remaining = ids.filter((value) => value !== id);
        if (remaining.length) trigger.setAttribute(DESCRIBED_BY, remaining.join(" "));
        else trigger.removeAttribute(DESCRIBED_BY);
      }
    }
    trigger = undefined;
    ownsDescription = false;
  }

  function render() {
    const nextVisible = hasContent && (forceOpen ?? automaticOpen);
    if (nextVisible !== visible) {
      if (nextVisible) doc.addEventListener("keydown", keydown, true);
      else doc.removeEventListener("keydown", keydown, true);
      visible = nextVisible;
    }
    root.toggleAttribute("data-open", visible);
  }

  function sync() {
    const hadContent = hasContent;
    hasContent = root.hasAttribute(TOOLTIP_CONTENT);
    forceOpen = overlayOpen(root.getAttribute(OPEN));
    const first = root.firstElementChild;
    const nextTrigger = hasContent && first && first !== bubble ? first : undefined;
    if (trigger !== nextTrigger) {
      removeDescription();
      trigger = nextTrigger;
    }
    if (trigger) {
      const ids = descriptionIds(trigger);
      if (!ids.includes(id)) {
        ids.push(id);
        trigger.setAttribute(DESCRIBED_BY, ids.join(" "));
        ownsDescription = true;
      }
    }
    if (hasContent && !hadContent) automaticOpen = !dismissed && (hovered || focused);
    render();
  }

  function activity(source: "hover" | "focus", active: boolean, event: Event) {
    const wasActive = !dismissed && (hovered || focused);
    if (source === "hover") hovered = active;
    else focused = active;
    if (!hovered && !focused) dismissed = false;
    const isActive = !dismissed && (hovered || focused);
    if (!hasContent || wasActive === isActive) return;
    const accepted = isActive
      ? handlers.requestOpen?.(event)
      : handlers.requestClose?.(event, "leave");
    if (accepted !== false) automaticOpen = isActive;
    render();
  }

  /**
   * Escape belongs to the tooltip only while the user is on it: focus inside it, or the pointer over
   * it when no open modal dialog excludes it. A pinned tooltip elsewhere never swallows Escape.
   */
  function ownsEscape(): boolean {
    if (root.contains(doc.activeElement)) return true;
    const blockedByModal = [...doc.querySelectorAll("dialog")].some(
      (dialog) => dialog.matches(":modal") && !dialog.contains(root),
    );
    return hovered && !blockedByModal;
  }

  function keydown(event: KeyboardEvent) {
    if (!root.isConnected) {
      destroy();
      return;
    }
    if (event.key !== "Escape" || event.defaultPrevented || !ownsEscape()) return;
    const accepted = handlers.requestClose?.(event, "escapeKeyDown");
    // The first Escape is for the tooltip, not an enclosing dialog.
    event.preventDefault();
    event.stopPropagation();
    if (accepted === false) return;
    dismissed = hovered || focused;
    automaticOpen = false;
    render();
  }

  root.addEventListener(
    "pointerenter",
    (event) => {
      if (event.pointerType !== "touch") activity("hover", true, event);
    },
    { signal },
  );
  root.addEventListener("pointerleave", (event) => activity("hover", false, event), { signal });
  root.addEventListener("focusin", (event) => activity("focus", true, event), { signal });
  root.addEventListener(
    "focusout",
    (event) => {
      if (!root.contains(event.relatedTarget as Node | null)) activity("focus", false, event);
    },
    { signal },
  );
  const observer = new MutationObserver((records) => {
    if (records.some(({ target }) => target === root || target === trigger)) sync();
  });
  observer.observe(root, {
    attributeFilter: [OPEN, TOOLTIP_CONTENT, DESCRIBED_BY],
    childList: true,
    subtree: true,
  });
  sync();
  root.setAttribute("data-clay-tooltip-ready", "");

  function destroy() {
    listeners.abort();
    doc.removeEventListener("keydown", keydown, true);
    observer.disconnect();
    removeDescription();
    root.removeAttribute("data-clay-tooltip-ready");
    root.removeAttribute("data-open");
  }
  return destroy;
}

export const upgradeTooltips = disposableUpgrader<HTMLElement>("[data-clay-tooltip]", (root) => {
  return attachTooltip(root, {
    requestOpen() {
      return root.dispatchEvent(
        new CustomEvent(TOOLTIP_REQUEST_OPEN_EVENT, { bubbles: false, cancelable: true }),
      );
    },
    requestClose(_event, reason) {
      const request: TooltipRequestCloseEvent = new CustomEvent(OVERLAY_REQUEST_CLOSE_EVENT, {
        bubbles: false,
        cancelable: true,
        detail: { reason },
      });
      return root.dispatchEvent(request);
    },
  });
});
