import { flag, type Attrs } from "./attrs.ts";

export type TabValue = string | number;
export type TabsVariant = "standard" | "fullWidth";

export interface TabIds {
  tab(value: TabValue): string;
  panel(value: TabValue): string;
}

function tabKey(value: TabValue): string {
  const escaped = String(value).replace(
    /[^a-zA-Z0-9-]/g,
    (char) => `_${char.charCodeAt(0).toString(16)}_`,
  );
  return `${typeof value === "number" ? "n" : "s"}-${escaped}`;
}

/** Tab and panel ids derived from one per-tablist base, so SSR and hydration agree. */
export function tabIds(base: string): TabIds {
  return {
    tab: (value: TabValue) => `${base}-tab-${tabKey(value)}`,
    panel: (value: TabValue) => `${base}-panel-${tabKey(value)}`,
  };
}

/** Roving tabindex: the selected tab, or the first enabled tab when nothing enabled is selected. */
export function isTabbable(
  value: TabValue,
  selected: TabValue | undefined,
  enabled: readonly TabValue[],
): boolean {
  if (selected === undefined || !enabled.includes(selected))
    return value === (enabled[0] ?? selected);
  return value === selected;
}

/** Index of the tab a key moves to (automatic activation), or undefined when the key is not handled. */
export function tabKeyTarget(
  key: string,
  index: number,
  count: number,
  rtl: boolean,
): number | undefined {
  if (index < 0 || count === 0) return undefined;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const step = key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0;
  if (!step) return undefined;
  return (index + (rtl ? -step : step) + count) % count;
}

export function tabListRecipe(o: { variant?: TabsVariant; label: string }): {
  className: string;
  attrs: Attrs;
} {
  return {
    className: "clay-tabs__list",
    attrs: {
      role: "tablist",
      "aria-label": o.label,
      "aria-orientation": "horizontal",
      "data-color": "primary",
      "data-variant": o.variant ?? "standard",
    },
  };
}

export interface TabState {
  value: TabValue;
  selected: TabValue | undefined;
  enabled: readonly TabValue[];
  ids: TabIds;
}

export function tabRecipe(s: TabState): { className: string; attrs: Attrs } {
  return {
    className: "clay clay-tab",
    attrs: {
      type: "button",
      role: "tab",
      id: s.ids.tab(s.value),
      "aria-selected": String(s.value === s.selected),
      "aria-controls": s.ids.panel(s.value),
      tabindex: isTabbable(s.value, s.selected, s.enabled) ? 0 : -1,
      "data-value": String(s.value),
      "data-value-numeric": flag(typeof s.value === "number"),
      "data-clay-interactive": "",
    },
  };
}

export function tabPanelRecipe(s: Omit<TabState, "enabled">): { className: string; attrs: Attrs } {
  return {
    className: "clay-tab-panel",
    attrs: {
      role: "tabpanel",
      id: s.ids.panel(s.value),
      "aria-labelledby": s.ids.tab(s.value),
      hidden: s.value !== s.selected ? true : undefined,
    },
  };
}
