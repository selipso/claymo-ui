<script lang="ts" generics="Multiple extends boolean = false">
  import { onMount, untrack } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { afterFormReset } from "@claymo/core/behavior/input";
  import {
    addAutocompleteValue,
    autocompleteDefaults,
    autocompleteInputValue,
    autocompleteSelectedValues,
    autocompleteValue,
    filterAutocompleteOptions,
    nextAutocompleteIndex,
    normalizeAutocompleteOptions,
    removeAutocompleteValue,
    textFieldRecipe,
    type AutocompleteProps,
    type AutocompleteValue,
  } from "@claymo/core/input";
  import Chip from "./Chip.svelte";

  type Props = AutocompleteProps<Multiple> & {
    class?: HTMLAttributes<HTMLDivElement>["class"];
    /** Id of the associated form when the control is not nested in it. */
    form?: string;
    "aria-describedby"?: string;
    onChange?: (event: Event, value: AutocompleteValue<Multiple>) => void;
  };

  let {
    options,
    label,
    multiple,
    freeSolo = false,
    value,
    defaultValue,
    placeholder,
    helperText,
    error = false,
    disabled = false,
    required = false,
    fullWidth = false,
    size,
    id: idProp,
    name,
    form,
    "aria-describedby": describedBy,
    class: className,
    filterSelectedOptions = false,
    noOptionsText = autocompleteDefaults.noOptionsText,
    addOptionText = autocompleteDefaults.addOptionText,
    onChange,
  }: Props = $props();

  const uid = $props.id();
  const id = $derived(idProp ?? `clay-ac-${uid}`);
  const labelId = $derived(`${id}-label`);
  const listId = $derived(`${id}-listbox`);
  const recipe = $derived(
    textFieldRecipe({ id, size, error, disabled, fullWidth, helperText, describedBy }),
  );
  const normalized = $derived(normalizeAutocompleteOptions(options));
  const initialDefault = untrack(() => defaultValue);
  let internal = $state(initialDefault);
  const selected = $derived(
    autocompleteSelectedValues(value === undefined ? internal : value, !!multiple),
  );

  let input = $state<HTMLInputElement>();
  let list = $state<HTMLElement>();
  let draft = $state<string>();
  let open = $state(false);
  let active = $state(-1);
  const expanded = $derived(open && !disabled);
  const inputValue = $derived(draft ?? autocompleteInputValue(normalized, selected, !!multiple));
  const matches = $derived(
    filterAutocompleteOptions(normalized, draft ?? "", selected, {
      filterSelectedOptions,
      freeSolo,
      addOptionText,
    }),
  );
  const activeId = $derived(expanded && matches.items[active] ? `${listId}-${active}` : undefined);

  onMount(() => {
    if (input) {
      return afterFormReset(input, () => {
        if (value === undefined) internal = initialDefault;
        close();
        queueMicrotask(() => {
          if (input) input.value = inputValue;
        });
      });
    }
  });

  $effect(() => {
    input?.setCustomValidity(
      required && selected.length === 0 && inputValue !== "" ? "Select a value." : "",
    );
  });

  $effect(() => {
    if (activeId) list?.children[active]?.scrollIntoView({ block: "nearest" });
  });

  $effect(() => {
    if (expanded && matches.items && list) list.scrollTop = 0;
  });

  $effect(() => {
    if (disabled) close();
  });

  function close() {
    open = false;
    active = -1;
    draft = undefined;
  }

  function update(event: Event, next: string[]) {
    if (next === selected) return;
    // The shared runtime representation is converted using the same mode parameter as Props.
    const nextValue = autocompleteValue(next, !!multiple) as AutocompleteValue<Multiple>;
    if (value === undefined) internal = nextValue;
    onChange?.(event, nextValue);
  }

  function select(event: Event, item: string) {
    close();
    update(event, addAutocompleteValue(selected, item, !!multiple));
  }

  function remove(event: Event, item: string) {
    input?.focus();
    active = -1;
    update(event, removeAutocompleteValue(selected, item));
  }

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    draft = event.currentTarget.value;
    active = -1;
    open = true;
    if (!multiple && draft === "" && selected.length > 0) update(event, []);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.isComposing || event.defaultPrevented || disabled) return;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        open = true;
        active = nextAutocompleteIndex(
          active,
          matches.items.length,
          event.key === "ArrowDown" ? 1 : -1,
        );
        break;
      case "Enter": {
        const item = expanded ? (matches.items[active]?.value ?? matches.typedValue) : undefined;
        if (item === undefined) return;
        event.preventDefault();
        select(event, item);
        break;
      }
      case "Escape":
        if (expanded) {
          event.preventDefault();
          close();
        }
        break;
      case "Tab":
        if (expanded) close();
        break;
      case "Backspace":
        if (multiple && inputValue === "" && selected.length > 0) {
          event.preventDefault();
          remove(event, selected[selected.length - 1]);
        }
        break;
    }
  }
</script>

<div class={["clay-text-field clay-autocomplete", className]} {...recipe.root}>
  <label class="clay-text-field__label" id={labelId} for={id}>
    {label}{#if required}<span aria-hidden="true"> *</span>{/if}
  </label>
  <div class="clay-text-field__control">
    <div class="clay clay-text-field__input clay-autocomplete__field">
      {#if multiple}
        {#each selected as item (item)}
          <Chip
            label={normalized.get(item)?.label ?? item}
            size="small"
            {disabled}
            onDelete={(event) => remove(event, item)}
          />
        {/each}
      {/if}
      <input
        bind:this={input}
        class="clay-autocomplete__query"
        {id}
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-required={required || undefined}
        required={required && selected.length === 0}
        {placeholder}
        {disabled}
        {form}
        {...recipe.input}
        value={inputValue}
        onclick={() => (open = true)}
        onblur={close}
        oninput={handleInput}
        onkeydown={handleKeydown}
      />
    </div>
    <div class="clay clay-autocomplete__popup" hidden={!expanded}>
      <!-- svelte-ignore a11y_interactive_supports_focus -->
      <div
        class="clay-autocomplete__list"
        bind:this={list}
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        aria-multiselectable={multiple || undefined}
        onmousedown={(event) => event.preventDefault()}
      >
        {#if expanded}
          {#each matches.items as item, index (item.value)}
            <button
              type="button"
              role="option"
              tabindex="-1"
              class="clay-autocomplete__option"
              id={`${listId}-${index}`}
              aria-selected={selected.includes(item.value)}
              data-active={active === index ? "" : undefined}
              onmousedown={(event) => event.preventDefault()}
              onclick={(event) => {
                input?.focus();
                select(event, item.value);
              }}>{item.label}</button
            >
          {/each}
        {/if}
      </div>
      <p
        class="clay-autocomplete__empty"
        role="status"
        hidden={!expanded || matches.items.length > 0}
      >
        {noOptionsText}
      </p>
    </div>
  </div>
  {#if helperText}
    <p class="clay-text-field__helper" id={recipe.helperId}>
      {#if error}<span aria-hidden="true">!&nbsp;</span>{/if}{helperText}
    </p>
  {/if}
  {#if name}
    {#each selected as item (item)}
      <input type="hidden" {name} value={item} {disabled} {form} />
    {/each}
  {/if}
</div>
