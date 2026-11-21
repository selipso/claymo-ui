<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Color, MotionPreset, Size } from "@claymo/core";

  type ChangeEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface Props extends Omit<
    HTMLInputAttributes,
    "color" | "size" | "type" | "role" | "checked" | "value" | "children"
  > {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    required?: boolean;
    color?: Color;
    size?: Exclude<Size, "large">;
    name?: string;
    value?: string | number;
    id?: string;
    onChange?: (event: ChangeEv, checked: boolean) => void;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
  }

  let {
    checked = $bindable(),
    defaultChecked,
    disabled = false,
    required = false,
    color = "primary",
    size = "medium",
    name,
    value,
    id,
    onChange,
    onchange,
    motion,
    class: className = "",
    ...rest
  }: Props = $props();

  const form = getContext<{ readonly disabled: boolean } | undefined>("clay-form-control");
  const isDisabled = $derived(disabled || !!form?.disabled);
  const isChecked = $derived(checked ?? defaultChecked ?? false);

  onMount(() => {
    checked ??= isChecked;
  });

  function handleChange(event: ChangeEv) {
    onchange?.(event);
    onChange?.(event, event.currentTarget.checked);
  }
</script>

<input
  type="checkbox"
  role="switch"
  class={["clay clay-switch", className]}
  data-color={color}
  data-size={size}
  data-motion={motion}
  disabled={isDisabled}
  {required}
  {name}
  {value}
  {id}
  defaultChecked={defaultChecked ?? false}
  bind:checked={() => isChecked, (next) => (checked = next)}
  onchange={handleChange}
  {...rest}
/>
