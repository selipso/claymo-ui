<script lang="ts">
  import { getContext } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Color, Size } from "../types";

  type ChangeEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface Props
    extends Omit<HTMLInputAttributes, "color" | "size" | "type" | "role" | "checked" | "value" | "children"> {
    checked?: boolean;
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

  const form = getContext<{ readonly disabled: boolean } | undefined>("clay-form-control");
  const isDisabled = $derived(disabled || !!form?.disabled);

  function handleChange(event: ChangeEv) {
    onchange?.(event);
    onChange?.(event, event.currentTarget.checked);
  }
</script>

<input
  type="checkbox"
  role="switch"
  class="clay switch {className}"
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
  .switch {
    --clay-color: var(--clay-page);
    --clay-d: 4px;
    --clay-radius: 999px;
    --thumb: 24px;
    --travel: 24px;
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    display: inline-block;
    flex: none;
    box-sizing: border-box;
    width: 56px;
    height: 32px;
    margin: 0;
    padding: 0;
    border: 2px solid var(--clay-edge);
    /* Keep a pill where squircle corners are supported. */
    corner-shape: round;
    box-shadow: var(--clay-well);
    vertical-align: middle;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .switch[data-size="small"] {
    --thumb: 18px;
    --travel: 18px;
    width: 44px;
    height: 26px;
  }
  .switch:disabled { cursor: not-allowed; }
  .switch:hover:not(:disabled) { transform: translateY(-1px); }
  .switch:active:not(:disabled) { transform: translateY(1px) scale(0.96); }

  .switch:checked {
    --clay-color: var(--c);
    border-color: var(--c-ink);
  }

  /* Thumb: a small clay ball. ::before cannot reuse the track's derived shadow
     variables (they are resolved from the track colour), so it carries its own. */
  .switch::before {
    border: 2px solid var(--clay-edge);
    --td: 3px;
    --t-fill: var(--clay-surface);
    --t-light: light-dark(
      color-mix(in oklab, var(--t-fill), white 60%),
      color-mix(in oklab, var(--t-fill), white 16%)
    );
    --t-shade: light-dark(
      color-mix(in oklab, var(--t-fill), black 24%),
      color-mix(in oklab, var(--t-fill), black 42%)
    );
    --t-drop: color-mix(in oklab, color-mix(in oklab, var(--t-fill), black 55%), transparent 50%);
    content: "";
    position: absolute;
    left: 2px;
    top: 2px;
    box-sizing: border-box;
    width: var(--thumb);
    height: var(--thumb);
    border-radius: 50%;
    background: var(--t-fill);
    box-shadow:
      calc(var(--td) * 1.2) calc(var(--td) * 1.6) calc(var(--td) * 3) 0 var(--t-drop),
      inset calc(var(--td) * -1) calc(var(--td) * -1) calc(var(--td) * 2) 0 var(--t-shade),
      inset var(--td) var(--td) calc(var(--td) * 2) 0 var(--t-light);
    transition: transform var(--clay-time) var(--clay-ease);
    pointer-events: none;
  }
  .switch:checked::before { transform: translateX(var(--travel)); }

  @media (prefers-reduced-motion: reduce) {
    .switch::before { transition: none; }
  }
</style>
