<script lang="ts">
  import { getContext, tick } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Color, Size } from "../types";

  type ChangeEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface Props extends Omit<
    HTMLInputAttributes,
    "color" | "size" | "type" | "checked" | "value" | "children"
  > {
    checked?: boolean;
    /** Mixed state. Drives the DOM `indeterminate` property; the parent owns it (controlled, like MUI). */
    indeterminate?: boolean;
    disabled?: boolean;
    required?: boolean;
    color?: Color;
    size?: Exclude<Size, "large">;
    name?: string;
    value?: string | number;
    id?: string;
    onChange?: (event: ChangeEv, checked: boolean) => void;
  }

  let {
    checked = $bindable(false),
    indeterminate = false,
    disabled = false,
    required = false,
    color = "primary",
    size = "medium",
    name,
    value,
    id,
    onChange,
    onchange,
    class: className = "",
    ...rest
  }: Props = $props();

  // FormControlLabel shares its `disabled` through context.
  const form = getContext<{ readonly disabled: boolean } | undefined>("clay-form-control");
  const isDisabled = $derived(disabled || !!form?.disabled);

  let el: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (el) el.indeterminate = indeterminate;
  });

  function handleChange(event: ChangeEv) {
    onchange?.(event);
    onChange?.(event, event.currentTarget.checked);
    // The browser clears `indeterminate` on click; restore whatever the parent says.
    tick().then(() => {
      if (el) el.indeterminate = indeterminate;
    });
  }
</script>

<input
  bind:this={el}
  type="checkbox"
  class="clay checkbox {className}"
  data-color={color}
  data-size={size}
  disabled={isDisabled}
  {required}
  {name}
  {value}
  {id}
  bind:checked
  onchange={handleChange}
  {...rest}
/>

<style>
  .checkbox {
    --clay-color: var(--clay-page);
    --clay-d: 3px;
    --clay-radius: 9px;
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    display: inline-block;
    flex: none;
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    margin: 0;
    padding: 0;
    border: var(--clay-border-width) solid var(--clay-edge);
    box-shadow: var(--clay-well);
    vertical-align: middle;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .checkbox[data-size="small"] {
    width: 24px;
    height: 24px;
    --clay-radius: 8px;
  }
  .checkbox:disabled {
    cursor: not-allowed;
  }
  .checkbox:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  .checkbox:active:not(:disabled) {
    transform: translateY(1px) scale(0.94);
  }

  .checkbox:checked,
  .checkbox:indeterminate {
    --clay-color: var(--c);
    border-color: var(--c-ink);
    box-shadow: var(--clay-raised);
  }

  /* Tick: 6x12px, 3px stroke, rotated 45deg. */
  .checkbox::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    box-sizing: border-box;
    width: 6px;
    height: 12px;
    border: solid var(--c-on);
    border-width: 0 3px 3px 0;
    opacity: 0;
    transform: translate(-50%, -62%) rotate(45deg) scale(0);
    transition:
      transform var(--clay-time) var(--clay-ease),
      opacity 120ms ease;
    pointer-events: none;
  }
  .checkbox[data-size="small"]::after {
    width: 5px;
    height: 10px;
    border-width: 0 2px 2px 0;
  }
  .checkbox:checked::after {
    opacity: 1;
    transform: translate(-50%, -62%) rotate(45deg) scale(1);
  }

  /* Indeterminate: 12x3px dash. Declared after :checked so it wins when both apply. */
  .checkbox:indeterminate::after {
    width: 12px;
    height: 3px;
    border: 0;
    border-radius: 2px;
    background: var(--c-on);
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  .checkbox[data-size="small"]:indeterminate::after {
    width: 10px;
    height: 3px;
    border-width: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .checkbox::after {
      transition: none;
    }
  }
</style>
