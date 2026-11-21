import type { AutocompleteValue } from "../autocomplete.ts";
import type { TabValue } from "../tabs.ts";

export const CHANGE_EVENT = "clay-change";
export type ClayChangeEvent<T> = CustomEvent<{ value: T }>;

declare global {
  interface HTMLElementEventMap {
    [CHANGE_EVENT]: ClayChangeEvent<TabValue | AutocompleteValue>;
  }
}
