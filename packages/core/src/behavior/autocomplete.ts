import {
  addAutocompleteValue,
  autocompleteDefaults,
  autocompleteInputValue,
  autocompleteValue,
  filterAutocompleteOptions,
  nextAutocompleteIndex,
  normalizeAutocompleteOptions,
  removeAutocompleteValue,
  type AutocompleteMatches,
  type AutocompleteOption,
  type AutocompleteValue,
} from "../autocomplete.ts";
import { upgradeChips } from "./actions.ts";
import { CHANGE_EVENT, type ClayChangeEvent } from "./events.ts";
import { afterFormReset } from "./form.ts";
import { disposableUpgrader } from "./upgrade.ts";

export { CHANGE_EVENT as AUTOCOMPLETE_CHANGE_EVENT };
export type AutocompleteChangeEvent = ClayChangeEvent<AutocompleteValue>;

export const upgradeAutocompletes = disposableUpgrader<HTMLElement>(
  "[data-clay-autocomplete]",
  (root) => {
    const input = root.querySelector<HTMLInputElement>(".clay-autocomplete__query");
    const popup = root.querySelector<HTMLElement>(".clay-autocomplete__popup");
    const list = popup?.querySelector<HTMLElement>("[role=listbox]");
    const status = popup?.querySelector<HTMLElement>("[role=status]");
    const chips = root.querySelector<HTMLElement>(".clay-autocomplete__chips");
    const chipTemplate = root.querySelector<HTMLTemplateElement>("template");
    const fields = root.querySelector<HTMLElement>("[data-autocomplete-fields]");
    const data = root.dataset;
    if (!input || !popup || !list || !status || !fields || !data.options || !data.selected) return;

    const options = normalizeAutocompleteOptions(JSON.parse(data.options) as AutocompleteOption[]);
    const initial = JSON.parse(data.selected) as string[];
    const multiple = data.multiple !== undefined;
    const required = input.getAttribute("aria-required") === "true";
    const filter = {
      filterSelectedOptions: data.filterSelectedOptions !== undefined,
      freeSolo: data.freeSolo !== undefined,
      addOptionText: data.addOptionText ?? autocompleteDefaults.addOptionText,
    };
    const { name } = data;
    const controller = new AbortController();
    const listener = { signal: controller.signal };
    let selected = initial;
    let draft = "";
    let active = -1;
    let results: AutocompleteMatches;

    const syncValidity = () => {
      input.required = required && selected.length === 0;
      input.setCustomValidity(input.required && input.value !== "" ? "Select a value." : "");
    };

    const syncSelection = () => {
      if (chips && chipTemplate) {
        chips.replaceChildren(
          ...selected.map((value) => {
            const chip = chipTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
            const label = options.get(value)?.label ?? value;
            chip.dataset.autocompleteValue = value;
            chip.dataset.clayChipDelete = label;
            chip.querySelector(".clay-chip__label")!.textContent = label;
            chip.querySelector(".clay-chip__remove")!.setAttribute("aria-label", `Remove ${label}`);
            return chip;
          }),
        );
        upgradeChips(chips);
      }
      if (name) {
        const formAttr = input.getAttribute("form");
        fields.replaceChildren(
          ...selected.map((value) => {
            const field = root.ownerDocument.createElement("input");
            field.type = "hidden";
            field.name = name;
            field.value = value;
            field.disabled = input.disabled;
            if (formAttr) field.setAttribute("form", formAttr);
            return field;
          }),
        );
      }
      syncValidity();
    };

    const showOptions = () => {
      if (input.disabled) return;
      popup.hidden = false;
      input.setAttribute("aria-expanded", "true");
      input.removeAttribute("aria-activedescendant");
      active = -1;
      results = filterAutocompleteOptions(options, draft, selected, filter);
      list.replaceChildren(
        ...results.items.map(({ label, value }, index) => {
          const option = root.ownerDocument.createElement("button");
          option.type = "button";
          option.tabIndex = -1;
          option.id = `${list.id}-${index}`;
          option.value = value;
          option.className = "clay-autocomplete__option";
          option.setAttribute("role", "option");
          option.setAttribute("aria-selected", String(selected.includes(value)));
          option.textContent = label;
          return option;
        }),
      );
      list.scrollTop = 0;
      status.hidden = results.items.length > 0;
    };

    const close = () => {
      popup.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      input.value = autocompleteInputValue(options, selected, multiple);
      active = -1;
      draft = "";
      syncValidity();
    };

    function announceChange() {
      root.dispatchEvent(
        new CustomEvent<AutocompleteChangeEvent["detail"]>(CHANGE_EVENT, {
          bubbles: true,
          detail: { value: multiple ? [...selected] : autocompleteValue(selected, false) },
        }),
      );
    }

    function select(value: string) {
      const next = addAutocompleteValue(selected, value, multiple);
      const changed = next !== selected;
      selected = next;
      close();
      if (changed) {
        syncSelection();
        announceChange();
      }
    }

    const remove = (value: string) => {
      const next = removeAutocompleteValue(selected, value);
      if (next === selected) return;
      selected = next;
      syncSelection();
      if (!popup.hidden) showOptions();
      announceChange();
    };

    input.addEventListener(
      "click",
      () => {
        if (popup.hidden) showOptions();
      },
      listener,
    );
    input.addEventListener("blur", close, listener);
    input.addEventListener(
      "input",
      () => {
        draft = input.value;
        const clear = !multiple && draft === "" && selected.length > 0;
        if (clear) {
          selected = [];
          syncSelection();
        } else syncValidity();
        showOptions();
        if (clear) announceChange();
      },
      listener,
    );
    input.addEventListener(
      "keydown",
      (event) => {
        if (event.isComposing || event.defaultPrevented || input.disabled) return;
        switch (event.key) {
          case "ArrowDown":
          case "ArrowUp": {
            event.preventDefault();
            if (popup.hidden) showOptions();
            list.children[active]?.removeAttribute("data-active");
            active = nextAutocompleteIndex(
              active,
              results.items.length,
              event.key === "ArrowDown" ? 1 : -1,
            );
            const option = list.children[active];
            if (!option) return;
            option.setAttribute("data-active", "");
            input.setAttribute("aria-activedescendant", option.id);
            option.scrollIntoView({ block: "nearest" });
            break;
          }
          case "Enter": {
            const value = popup.hidden
              ? undefined
              : (results.items[active]?.value ?? results.typedValue);
            if (value === undefined) return;
            event.preventDefault();
            select(value);
            break;
          }
          case "Escape":
            if (!popup.hidden) {
              event.preventDefault();
              close();
            }
            break;
          case "Tab":
            if (!popup.hidden) close();
            break;
          case "Backspace":
            if (multiple && input.value === "" && selected.length > 0) {
              event.preventDefault();
              remove(selected[selected.length - 1]);
            }
            break;
        }
      },
      listener,
    );

    list.addEventListener(
      "mousedown",
      (event) => {
        event.preventDefault();
      },
      listener,
    );
    list.addEventListener(
      "click",
      (event) => {
        if (popup.hidden || input.disabled || !(event.target instanceof HTMLButtonElement)) return;
        input.focus();
        select(event.target.value);
      },
      listener,
    );
    chips?.addEventListener(
      "clay-delete",
      (event) => {
        if (event.defaultPrevented || input.disabled || !(event.target instanceof HTMLElement))
          return;
        const value = event.target.dataset.autocompleteValue;
        if (value === undefined) return;
        event.preventDefault();
        input.focus();
        remove(value);
      },
      listener,
    );

    if (chips) upgradeChips(chips);
    syncValidity();
    const detachReset = afterFormReset(input, () => {
      selected = initial;
      close();
      syncSelection();
    });
    return () => {
      controller.abort();
      detachReset();
    };
  },
);
