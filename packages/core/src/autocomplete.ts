export type AutocompleteOption = string | { label: string; value?: string };
export type AutocompleteValue<Multiple extends boolean = boolean> = Multiple extends true
  ? string[]
  : string | null;

export interface AutocompleteProps<Multiple extends boolean = boolean> {
  options: readonly AutocompleteOption[];
  label: string;
  multiple?: Multiple;
  freeSolo?: boolean;
  value?: AutocompleteValue<Multiple>;
  defaultValue?: AutocompleteValue<Multiple>;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  id?: string;
  name?: string;
  filterSelectedOptions?: boolean;
  noOptionsText?: string;
  addOptionText?: string;
}

export const autocompleteDefaults = {
  addOptionText: 'Add "{input}"',
  noOptionsText: "No options",
} as const;

interface AutocompleteItem {
  label: string;
  value: string;
}

type NormalizedOption = AutocompleteItem & { searchLabel: string };

/** The first option for each value supplies its display label and position in the list. */
export function normalizeAutocompleteOptions(options: readonly AutocompleteOption[]) {
  const normalized = new Map<string, NormalizedOption>();
  for (const option of options) {
    const label = typeof option === "string" ? option : option.label;
    const value = typeof option === "string" ? option : (option.value ?? label);
    if (!normalized.has(value))
      normalized.set(value, { label, value, searchLabel: label.toLowerCase() });
  }
  return normalized;
}

/** Selected values share one representation internally, regardless of selection mode. */
export function autocompleteSelectedValues(
  value: AutocompleteValue | undefined,
  multiple: boolean,
): string[] {
  if (multiple) return Array.isArray(value) ? [...new Set(value)] : [];
  return typeof value === "string" ? [value] : [];
}

export function autocompleteValue(selected: string[], multiple: boolean): AutocompleteValue {
  return multiple ? selected : (selected[0] ?? null);
}

export function autocompleteInputValue(
  options: ReadonlyMap<string, AutocompleteItem>,
  selected: readonly string[],
  multiple: boolean,
): string {
  if (multiple || selected.length === 0) return "";
  return options.get(selected[0])?.label ?? selected[0];
}

export interface AutocompleteMatches {
  items: AutocompleteItem[];
  /** The existing or new value Enter can commit in freeSolo mode without an active option. */
  typedValue: string | undefined;
}

export function filterAutocompleteOptions(
  options: ReadonlyMap<string, NormalizedOption>,
  input: string,
  selected: readonly string[],
  {
    filterSelectedOptions = false,
    freeSolo = false,
    addOptionText = autocompleteDefaults.addOptionText,
  }: Pick<AutocompleteProps, "filterSelectedOptions" | "freeSolo" | "addOptionText"> = {},
): AutocompleteMatches {
  const text = input.trim();
  const query = text.toLowerCase();
  const excluded = filterSelectedOptions && selected.length > 0 ? new Set(selected) : undefined;
  const items: AutocompleteItem[] = [];
  let exact: string | undefined;
  for (const option of options.values()) {
    if (option.searchLabel === query) exact ??= option.value;
    if (!excluded?.has(option.value) && option.searchLabel.includes(query)) items.push(option);
  }

  if (!freeSolo || !query) return { items, typedValue: undefined };
  // A literal that collides with an option's value cannot represent a distinct choice.
  if (exact !== undefined || options.has(text)) return { items, typedValue: exact ?? text };
  if (!selected.includes(text)) {
    items.push({ label: addOptionText.replaceAll("{input}", () => text), value: text });
  }
  return { items, typedValue: text };
}

export function nextAutocompleteIndex(index: number, count: number, step: 1 | -1): number {
  if (count === 0) return -1;
  if (index < 0 || index >= count) return step === 1 ? 0 : count - 1;
  return (index + step + count) % count;
}

export function addAutocompleteValue(
  selected: string[],
  value: string,
  multiple: boolean,
): string[] {
  if (selected.includes(value)) return selected;
  return multiple ? [...selected, value] : [value];
}

export function removeAutocompleteValue(selected: string[], value: string): string[] {
  const index = selected.indexOf(value);
  return index < 0 ? selected : selected.filter((_, i) => i !== index);
}
