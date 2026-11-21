<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import type {
    HTMLInputAttributes,
    HTMLSelectAttributes,
    HTMLTextareaAttributes,
  } from "svelte/elements";
  import type { Color, Size } from "@claymo/core";
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
    select = false,
    options,
    size,
    color,
    type = textFieldDefaults.type,
    name,
    id: idProp,
    placeholder,
    value = $bindable(),
    defaultValue,
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

  // rest is typed for <input>; narrow it per element.
  const textareaRest = $derived(rest as unknown as HTMLTextareaAttributes);
  const selectRest = $derived(
    defaultValue === undefined
      ? (rest as unknown as HTMLSelectAttributes)
      : ({ ...rest, defaultValue } as unknown as HTMLSelectAttributes),
  );

  // The native bindings own live values (including an empty number field's undefined).
  // Render the supplied default before mount so it is also present in server HTML.
  let mounted = $state(false);
  let control = $state<HTMLInputElement | HTMLTextAreaElement>();
  const fieldValue = $derived(value === undefined && !mounted ? defaultValue : value);

  onMount(() => {
    if (control && value === undefined && defaultValue != null) {
      if (
        control instanceof HTMLInputElement &&
        (control.type === "number" || control.type === "range")
      ) {
        const number = control.valueAsNumber;
        value = Number.isNaN(number) ? undefined : number;
      } else {
        value = control.value;
      }
    }
    mounted = true;
  });

  function setFieldValue(next: string | number | null | undefined) {
    value = next;
  }

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
        bind:this={control}
        class="clay clay-text-field__input"
        {id}
        {name}
        {placeholder}
        {required}
        {disabled}
        {rows}
        {...recipe.input}
        defaultValue={defaultValue ?? ""}
        bind:value={() => fieldValue, setFieldValue}
        oninput={handleInput}
        onchange={onchange as HTMLTextareaAttributes["onchange"]}
        {...textareaRest}></textarea>
    {:else if select}
      <select
        class="clay clay-text-field__input"
        {id}
        {name}
        {required}
        {disabled}
        {...recipe.input}
        bind:value
        oninput={oninput as HTMLSelectAttributes["oninput"]}
        onchange={handleSelectChange}
        {...selectRest}
      >
        {#if options}
          {#each options as option}
            <option value={option.value} disabled={option.disabled}>{option.label}</option>
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
        bind:this={control}
        class="clay clay-text-field__input"
        {type}
        {id}
        {name}
        {placeholder}
        {required}
        {disabled}
        {...recipe.input}
        defaultValue={defaultValue ?? ""}
        bind:value={() => fieldValue, setFieldValue}
        oninput={handleInput}
        {onchange}
        {...rest}
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
