<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    HTMLInputAttributes,
    HTMLSelectAttributes,
    HTMLTextareaAttributes,
  } from "svelte/elements";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import type { Color, Size } from "../types";

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
    /** Renders a native <select>; pass <option>s as `children`. */
    select?: boolean;
    size?: Exclude<Size, "large">;
    color?: Color;
    name?: string;
    id?: string;
    placeholder?: string;
    value?: string | number | null;
    /** Fires on every input (MUI semantics); for `select` on change. */
    onChange?: (event: Event) => void;
    /** Icon-sized content (about 20px) inside the left edge. */
    startAdornment?: Snippet;
    /** Icon-sized content (about 20px) inside the right edge. */
    endAdornment?: Snippet;
    children?: Snippet;
  }

  let {
    variant = "outlined",
    label,
    helperText,
    error = false,
    required = false,
    disabled = false,
    fullWidth = false,
    multiline = false,
    rows = 3,
    select = false,
    size = "medium",
    color = "primary",
    type = "text",
    name,
    id: idProp,
    placeholder,
    value = $bindable(),
    onChange,
    startAdornment,
    endAdornment,
    children,
    oninput,
    onchange,
    "aria-describedby": ariaDescribedby,
    class: className = "",
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const id = $derived(idProp ?? `clay-tf-${uid}`);
  const helperId = $derived(`${id}-helper`);
  const describedBy = $derived(
    [helperText ? helperId : undefined, ariaDescribedby].filter(Boolean).join(" ") || undefined,
  );

  // rest is typed for <input>; narrow it per element.
  const textareaRest = $derived(rest as unknown as HTMLTextareaAttributes);
  const selectRest = $derived(rest as unknown as HTMLSelectAttributes);

  function callUser(handler: unknown, event: Event) {
    if (typeof handler === "function") handler(event);
  }
  function handleInput(event: Event) {
    callUser(oninput, event);
    onChange?.(event);
  }
  function handleSelectChange(event: Event) {
    callUser(onchange, event);
    onChange?.(event);
  }
</script>

<div
  class="field {className}"
  class:full-width={fullWidth}
  class:disabled
  data-color={color}
  data-size={size}
  data-variant={variant}
  data-error={error || undefined}
>
  {#if label}
    <label class="label" for={id}>
      {label}{#if required}<span class="req" aria-hidden="true"> *</span>{/if}
    </label>
  {/if}

  <div
    class="control"
    class:has-start={!!startAdornment}
    class:has-end={!!endAdornment || select}
    class:is-select={select}
    class:is-multiline={multiline}
  >
    {#if startAdornment}
      <span class="adornment start">{@render startAdornment()}</span>
    {/if}

    {#if multiline}
      <textarea
        class="clay input"
        {id}
        {name}
        {placeholder}
        {required}
        {disabled}
        {rows}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        bind:value
        oninput={handleInput}
        onchange={onchange as HTMLTextareaAttributes["onchange"]}
        {...textareaRest}></textarea>
    {:else if select}
      <select
        class="clay input"
        {id}
        {name}
        {required}
        {disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        bind:value
        onchange={handleSelectChange}
        {...selectRest}
      >
        {@render children?.()}
      </select>
      <span class="chevron" aria-hidden="true"><ChevronDown size={size === "small" ? 16 : 20} strokeWidth={3} /></span>
    {:else}
      <input
        class="clay input"
        {type}
        {id}
        {name}
        {placeholder}
        {required}
        {disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        bind:value
        oninput={handleInput}
        {onchange}
        {...rest}
      />
    {/if}

    {#if endAdornment}
      <span class="adornment end">{@render endAdornment()}</span>
    {/if}
  </div>

  {#if helperText}
    <p class="helper" id={helperId}>
      {#if error}<span aria-hidden="true">!&nbsp;</span>{/if}{helperText}
    </p>
  {/if}
</div>

<style>
  .field {
    display: inline-flex;
    flex-direction: column;
    max-width: 100%;
    vertical-align: top;
    color: var(--clay-ink);
    font-family: var(--clay-font);
  }
  .full-width {
    display: flex;
    width: 100%;
  }

  .label {
    margin: 0 0 6px 4px;
    color: var(--clay-ink);
    font: 600 0.875rem/1.2 var(--clay-font);
  }
  .field:focus-within .label {
    color: var(--c-ink);
  }
  .field[data-error] .label,
  .field[data-error]:focus-within .label {
    color: var(--clay-error-ink);
  }
  .req {
    color: inherit;
  }
  .disabled .label,
  .disabled .helper {
    opacity: 0.55;
  }

  .control {
    position: relative;
    display: flex;
    width: 100%;
  }

  /* Native control styled as an inset clay well. */
  .input {
    --clay-color: var(--clay-page);
    --clay-d: 5px;
    --clay-radius: 18px;
    appearance: none;
    -webkit-appearance: none;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    min-height: 48px;
    margin: 0;
    padding: 0 16px;
    border: var(--clay-border-width) solid var(--clay-edge);
    box-shadow: var(--clay-well);
    color: var(--clay-ink);
    font: 400 1rem/1.5 var(--clay-font);
  }
  .input::placeholder {
    color: var(--clay-ink-muted);
    opacity: 1;
  }
  textarea.input {
    padding: 12px 16px;
    resize: vertical;
  }
  select.input {
    padding-right: 44px;
    cursor: pointer;
    text-overflow: ellipsis;
  }
  select.input:disabled {
    cursor: not-allowed;
  }
  select.input :global(option) {
    background: var(--clay-surface);
    color: var(--clay-ink);
  }

  .field[data-size="small"] .input {
    --clay-d: 4px;
    --clay-radius: 14px;
    min-height: 36px;
    padding: 0 12px;
    font-size: 0.875rem;
  }
  .field[data-size="small"] textarea.input {
    padding: 8px 12px;
  }
  .field[data-size="small"] select.input {
    padding-right: 40px;
  }

  /* Filled fields keep only the bottom edge on the surface fill. */
  .field[data-variant="filled"] .input {
    --clay-color: var(--clay-surface);
    border-width: 0 0 var(--clay-border-width);
    border-radius: var(--clay-radius) var(--clay-radius) 8px 8px;
  }

  /* Adornments sit over the input's padding. */
  .has-start .input {
    padding-left: 44px;
  }
  .has-end .input {
    padding-right: 44px;
  }
  .field[data-size="small"] .has-start .input {
    padding-left: 38px;
  }
  .field[data-size="small"] .has-end .input {
    padding-right: 38px;
  }
  .adornment {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    color: var(--clay-ink-muted);
  }
  .is-multiline .adornment {
    bottom: auto;
    height: 48px;
  }
  .adornment.start {
    left: 14px;
  }
  .adornment.end {
    right: 14px;
  }
  .is-select .adornment.end {
    right: 40px;
  }
  .field[data-size="small"] .adornment.start {
    left: 10px;
  }
  .field[data-size="small"] .adornment.end {
    right: 10px;
  }
  .field[data-size="small"] .is-select .adornment.end {
    right: 34px;
  }

  .chevron {
    position: absolute;
    right: 14px;
    top: 50%;
    display: flex;
    transform: translateY(-50%);
    color: var(--clay-ink);
    pointer-events: none;
  }
  .field[data-size="small"] .chevron {
    right: 10px;
  }
  .disabled .chevron {
    opacity: 0.55;
  }
  @media (forced-colors: active) {
    .chevron {
      color: CanvasText;
    }
  }

  .input:focus {
    border-color: var(--c-ink);
  }
  .field[data-error] .input,
  .field[data-error] .input:focus {
    border-color: var(--clay-error-ink);
  }

  /* Helper text: error adds a "!" glyph so colour is not the only cue. */
  .helper {
    margin: 6px 4px 0;
    color: var(--clay-ink-muted);
    font: 400 0.8125rem/1.3 var(--clay-font);
  }
  .field[data-error] .helper {
    color: var(--clay-error-ink);
  }
</style>
