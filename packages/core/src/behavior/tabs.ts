import { isTabbable, tabKeyTarget, type TabValue } from "../tabs.ts";
import { CHANGE_EVENT, type ClayChangeEvent } from "./events.ts";
import { upgrader } from "./upgrade.ts";

/** Fired on the tabs root when the user selects a tab; never fired by `select()`. */
export { CHANGE_EVENT as TABS_CHANGE_EVENT };
export type TabsChangeEvent = ClayChangeEvent<TabValue>;

/**
 * The single keyboard implementation for tablists: Arrow keys (RTL-aware), Home and End move focus
 * and activate the target (automatic activation). Returns true when it handled the key.
 */
export function moveTabFocus(event: KeyboardEvent, tab: HTMLElement): boolean {
  const list = tab.closest<HTMLElement>('[role="tablist"]');
  if (!list) return false;
  const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)')];
  const rtl = getComputedStyle(list).direction === "rtl";
  const next = tabKeyTarget(event.key, tabs.indexOf(tab), tabs.length, rtl);
  if (next === undefined) return false;
  event.preventDefault();
  tabs[next].focus();
  tabs[next].click();
  return true;
}

export interface TabsController {
  /** Application update: changes the selection without firing a change event. */
  select(value: TabValue): void;
  destroy(): void;
}

function readTabValue(tab: HTMLElement): TabValue {
  const value = tab.dataset.value!;
  return tab.hasAttribute("data-value-numeric") ? Number(value) : value;
}

/**
 * Controller for server-rendered tabs (`[data-clay-tabs]` root, `role="tab"` buttons with
 * `data-value`, panels linked by `aria-controls`). Frameworks with their own state use
 * `moveTabFocus` and the recipes instead.
 */
export function attachTabs(root: HTMLElement): TabsController {
  const list = root.querySelector<HTMLElement>('[role="tablist"]');
  if (!list) throw new Error("attachTabs: no [role=tablist] inside the root.");
  const tabs = () => [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];

  function select(value: TabValue | undefined) {
    const all = tabs();
    const enabled = all.filter((tab) => !tab.matches(":disabled")).map(readTabValue);
    for (const tab of all) {
      const own = readTabValue(tab);
      tab.setAttribute("aria-selected", String(own === value));
      tab.tabIndex = !tab.matches(":disabled") && isTabbable(own, value, enabled) ? 0 : -1;
      const panel = root.ownerDocument.getElementById(tab.getAttribute("aria-controls") ?? "");
      if (panel && root.contains(panel)) panel.hidden = own !== value;
    }
  }

  const onClick = (event: MouseEvent) => {
    const tab = (event.target as Element).closest<HTMLElement>('[role="tab"]');
    if (
      event.defaultPrevented ||
      !tab ||
      tab.matches(":disabled") ||
      tab.getAttribute("aria-selected") === "true"
    )
      return;
    const value = readTabValue(tab);
    select(value);
    root.dispatchEvent(new CustomEvent(CHANGE_EVENT, { bubbles: true, detail: { value } }));
  };
  const onKeydown = (event: KeyboardEvent) => {
    const tab = (event.target as Element).closest<HTMLElement>('[role="tab"]');
    if (tab && !event.defaultPrevented) moveTabFocus(event, tab);
  };

  if (root.hasAttribute("data-clay-tabs")) {
    // Tabs.value wins; composed Tab/TabPanel `selected` props cover a Tabs rendered without value.
    const initial = root.dataset.claySelected;
    const marked = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (initial !== undefined)
      select(root.hasAttribute("data-clay-selected-numeric") ? Number(initial) : initial);
    else select(marked ? readTabValue(marked) : undefined);
  }
  list.addEventListener("click", onClick);
  list.addEventListener("keydown", onKeydown);
  return {
    select,
    destroy() {
      list.removeEventListener("click", onClick);
      list.removeEventListener("keydown", onKeydown);
    },
  };
}

export const upgradeTabs = upgrader<HTMLElement>("[data-clay-tabs]", attachTabs);
