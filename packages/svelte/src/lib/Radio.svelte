<script lang="ts">
  import { getContext, untrack } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Color, MotionPreset, Size } from "@claymo/core";

  type ChangeEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface GroupContext {
    readonly name: string;
    readonly value: string | number | undefined;
    readonly resetValue: string | number | undefined;
    readonly disabled: boolean;
    readonly required: boolean;
    select(value: string | number, event: ChangeEv): void;
  }

  interface Props extends Omit<
    HTMLInputAttributes,
    "color" | "size" | "type" | "checked" | "value" | "children" | "group"
  > {
    /** Standalone use only; inside a RadioGroup the group's `value` decides. */
    checked?: boolean;
    defaultChecked?: boolean;
    value: string | number;
    name?: string;
    disabled?: boolean;
    color?: Color;
    size?: Exclude<Size, "large">;
    onChange?: (event: ChangeEv, value: string | number) => void;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
  }

  let {
    checked,
    defaultChecked,
    value,
    name,
    disabled = false,
    required = false,
    color = "primary",
    size = "medium",
    onChange,
    onchange,
    motion,
    class: className = "",
    ...rest
  }: Props = $props();

  const group = getContext<GroupContext | undefined>("clay-radio-group");
  const form = getContext<{ readonly disabled: boolean } | undefined>("clay-form-control");
  const initialChecked = untrack(() => defaultChecked ?? false);

  const isChecked = $derived(
    group
      ? group.value !== undefined && String(group.value) === String(value)
      : (checked ?? initialChecked),
  );
  const isDefaultChecked = $derived(
    group
      ? group.resetValue !== undefined && String(group.resetValue) === String(value)
      : (defaultChecked ?? false),
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
  class={["clay clay-radio", className]}
  data-color={color}
  data-size={size}
  data-motion={motion}
  name={inputName}
  {value}
  data-clay-radio-member={group ? "" : undefined}
  defaultChecked={isDefaultChecked}
  checked={isChecked}
  required={required || !!group?.required}
  disabled={isDisabled}
  onchange={handleChange}
  {...rest}
/>
