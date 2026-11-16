<script lang="ts">
  import { getContext } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Color, Size } from "../types";

  type ChangeEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface GroupContext {
    readonly name: string;
    readonly value: string | number | undefined;
    readonly disabled: boolean;
    select(value: string | number, event: ChangeEv): void;
  }

  interface Props
    extends Omit<HTMLInputAttributes, "color" | "size" | "type" | "checked" | "value" | "children" | "group"> {
    /** Standalone use only; inside a RadioGroup the group's `value` decides. */
    checked?: boolean;
    value: string | number;
    name?: string;
    disabled?: boolean;
    color?: Color;
    size?: Exclude<Size, "large">;
    onChange?: (event: ChangeEv, value: string | number) => void;
  }

  let {
    checked = false,
    value,
    name,
    disabled = false,
    color = "primary",
    size = "medium",
    onChange,
    onchange,
    class: className = "",
    ...rest
  }: Props = $props();

  const group = getContext<GroupContext | undefined>("clay-radio-group");
  const form = getContext<{ readonly disabled: boolean } | undefined>("clay-form-control");

  const isChecked = $derived(
    group ? group.value !== undefined && String(group.value) === String(value) : checked,
  );
  const inputName = $derived(name ?? group?.name);
  const isDisabled = $derived(disabled || !!group?.disabled || !!form?.disabled);

  function handleChange(event: ChangeEv) {
    onchange?.(event);
    group?.select(value, event);
    onChange?.(event, value);
  }
</script>

<input
  type="radio"
  class="clay radio {className}"
  data-color={color}
  data-size={size}
  name={inputName}
  {value}
  checked={isChecked}
  disabled={isDisabled}
  onchange={handleChange}
  {...rest}
/>

<style>
  .radio {
    --clay-color: var(--clay-page);
    --clay-d: 3px;
    --clay-radius: 50%;
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
    border: 2px solid var(--clay-edge);
    /* Keep a true circle where squircle corners are supported. */
    corner-shape: round;
    box-shadow: var(--clay-well);
    vertical-align: middle;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .radio[data-size="small"] { width: 24px; height: 24px; }
  .radio:disabled { cursor: not-allowed; }
  .radio:hover:not(:disabled) { transform: translateY(-1px); }
  .radio:active:not(:disabled) { transform: translateY(1px) scale(0.94); }

  .radio:checked {
    --clay-color: var(--c);
    border-color: var(--c-ink);
    box-shadow: var(--clay-raised);
  }

  /* 10px dot, centred. */
  .radio::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--c-on);
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
    transition:
      transform var(--clay-time) var(--clay-ease),
      opacity 120ms ease;
    pointer-events: none;
  }
  .radio[data-size="small"]::after { width: 8px; height: 8px; }
  .radio:checked::after {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  @media (prefers-reduced-motion: reduce) {
    .radio::after { transition: none; }
  }
</style>
