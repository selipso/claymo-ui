<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { Snippet } from "svelte";
  import type {
    HTMLInputAttributes,
    HTMLSelectAttributes,
    HTMLTextareaAttributes,
  } from "svelte/elements";
  import type { Color, Size } from "@claymo/core";
  import { afterFormReset } from "@claymo/core/behavior/input";
  import { textFieldDefaults, textFieldRecipe, type TextFieldOption } from "@claymo/core/input";

  interface Props extends Omit<
    HTMLInputAttributes,
    | "color"
    | "size"
    | "value"
    | "children"
    | "id"
    | "name"
    | "placeholder"
    | "required"
    | "disabled"
  > {
    /** MUI `standard` is not supported. */
    variant?: "outlined" | "filled";
    label?: string;
    helperText?: string;
    error?: boolean;
    required?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    multiline?: boolean;
    rows?: number;
    /** Native textarea column width in multiline mode. */
    cols?: number | string;
    /** Native textarea wrap mode in multiline mode. */
    wrap?: "hard" | "soft" | "off";
    /** Renders a native <select>; pass options or use an option/optgroup snippet. */
    select?: boolean;
    options?: readonly TextFieldOption[];
    size?: Exclude<Size, "large">;
    color?: Color;
    name?: string;
    id?: string;
    placeholder?: string;
    value?: string | number | null;
    defaultValue?: string | number | null;
    /** Fires on every input (MUI semantics); for `select` on change. */
    onChange?: (event: Event) => void;
    /** Icon-sized content (about 20px) inside the left edge. */
    startAdornment?: Snippet;
    /** Icon-sized content (about 20px) inside the right edge. */
    endAdornment?: Snippet;
    children?: Snippet;
  }

  let {
    variant,
    label,
    helperText,
    error = false,
    required = false,
    disabled = false,
    fullWidth = false,
    multiline = false,
    rows = textFieldDefaults.rows,
    cols,
    wrap,
    select = false,
    options,
    size,
    color,
    type = textFieldDefaults.type,
    name,
    id: idProp,
    placeholder,
    value,
    defaultValue,
    onChange,
    startAdornment,
    endAdornment,
    children,
    oninput,
    onchange,
    "aria-describedby": ariaDescribedby,
    "aria-invalid": ariaInvalid,
    class: className = "",
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const id = $derived(idProp ?? `clay-tf-${uid}`);
  const recipe = $derived(
    textFieldRecipe({
      id,
      variant,
      size,
      color,
      error,
      disabled,
      fullWidth,
      select,
      multiline,
      hasStart: !!startAdornment,
      hasEnd: !!endAdornment,
      helperText,
      describedBy: ariaDescribedby,
    }),
  );
  const chevronSize = $derived(size === "small" ? 16 : 20);
  const invalidAttr = $derived(ariaInvalid ?? recipe.input["aria-invalid"]);
  const controlledText = $derived(value === undefined ? undefined : String(value ?? ""));
  const initialDefault = untrack(() => defaultValue);
  const resetText = $derived(
    controlledText !== undefined ? controlledText : String(initialDefault ?? ""),
  );
  const selectedMatch = $derived(value !== undefined ? value : initialDefault);

  // rest is typed for <input>; narrow it per element.
  const textareaRest = $derived(rest as unknown as HTMLTextareaAttributes);
  const selectRest = $derived(rest as unknown as HTMLSelectAttributes);

  let control = $state<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>();

  $effect(() => {
    if (control && controlledText !== undefined && control.value !== controlledText) {
      control.value = controlledText;
    }
  });

  onMount(() => {
    if (!control) return;
    if (control instanceof HTMLSelectElement && !options) {
      const start = value !== undefined ? value : initialDefault;
      if (start != null) {
        const expected = String(start);
        control.value = expected;
        for (const option of control.options) option.defaultSelected = option.value === expected;
      }
    }
    return afterFormReset(control, () => {
      if (control && controlledText !== undefined) control.value = controlledText;
    });
  });

  function callUser(handler: unknown, event: Event) {
    if (typeof handler === "function") handler(event);
  }
  function syncControlled() {
    if (value !== undefined) {
      queueMicrotask(() => {
        if (control && controlledText !== undefined && control.value !== controlledText) {
          control.value = controlledText;
        }
      });
    }
  }
  function handleInput(event: Event) {
    callUser(oninput, event);
    onChange?.(event);
    syncControlled();
  }
  function handleSelectChange(event: Event) {
    callUser(onchange, event);
    onChange?.(event);
    syncControlled();
  }
</script>

<div class={["clay-text-field", className]} {...recipe.root}>
  {#if label}
    <label class="clay-text-field__label" for={id}>
      {label}{#if required}<span aria-hidden="true"> *</span>{/if}
    </label>
  {/if}

  <div class="clay-text-field__control" {...recipe.control}>
    {#if startAdornment}
      <span class="clay-text-field__adornment clay-text-field__adornment--start"
        >{@render startAdornment()}</span
      >
    {/if}

    {#if multiline}
      <textarea
        {...textareaRest}
        bind:this={control}
        class="clay clay-text-field__input"
        {id}
        {name}
        {placeholder}
        {required}
        {disabled}
        {rows}
        cols={cols !== undefined ? Number(cols) : undefined}
        {wrap}
        aria-describedby={recipe.input["aria-describedby"]}
        aria-invalid={invalidAttr}
        defaultValue={resetText}
        oninput={handleInput}
        onchange={onchange as HTMLTextareaAttributes["onchange"]}>{resetText}</textarea
      >
    {:else if select}
      <select
        {...selectRest}
        bind:this={control}
        class="clay clay-text-field__input"
        {id}
        {name}
        {required}
        {disabled}
        aria-describedby={recipe.input["aria-describedby"]}
        aria-invalid={invalidAttr}
        oninput={oninput as HTMLSelectAttributes["oninput"]}
        onchange={handleSelectChange}
      >
        {#if options}
          {#each options as option}
            <option
              value={option.value}
              disabled={option.disabled}
              selected={selectedMatch != null && String(option.value) === String(selectedMatch)}
              >{option.label}</option
            >
          {/each}
        {:else}
          {@render children?.()}
        {/if}
      </select>
      <svg
        class="clay-text-field__chevron"
        aria-hidden="true"
        width={chevronSize}
        height={chevronSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    {:else}
      <input
        {...rest}
        bind:this={control}
        class="clay clay-text-field__input"
        {type}
        {id}
        {name}
        {placeholder}
        {required}
        {disabled}
        aria-describedby={recipe.input["aria-describedby"]}
        aria-invalid={invalidAttr}
        defaultValue={resetText}
        oninput={handleInput}
        {onchange}
      />
    {/if}

    {#if endAdornment}
      <span class="clay-text-field__adornment clay-text-field__adornment--end"
        >{@render endAdornment()}</span
      >
    {/if}
  </div>

  {#if helperText}
    <p class="clay-text-field__helper" id={recipe.helperId}>
      {#if error}<span aria-hidden="true">!&nbsp;</span>{/if}{helperText}
    </p>
  {/if}
</div>
