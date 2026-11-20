<script lang="ts">
  import { getContext, untrack } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { checkboxRecipe, type CheckboxOptions } from "@claymo/core";
  import type { MotionPreset } from "@claymo/core";
  import { bindIndeterminate } from "@claymo/core/behavior/checkbox";

  type ChangeEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface Props
    extends
      Omit<HTMLInputAttributes, "color" | "size" | "type" | "checked" | "value" | "children">,
      CheckboxOptions {
    checked?: boolean;
    /** Mixed state. Drives the DOM `indeterminate` property; the parent owns it (controlled, like MUI). */
    indeterminate?: boolean;
    value?: string | number;
    onChange?: (event: ChangeEv, checked: boolean) => void;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
  }

  let {
    checked = $bindable(),
    indeterminate = false,
    disabled = false,
    color,
    size,
    onChange,
    onchange,
    motion,
    class: className,
    ...rest
  }: Props = $props();

  // FormControlLabel shares its `disabled` through context.
  const form = getContext<{ readonly disabled: boolean } | undefined>("clay-form-control");
  const recipe = $derived(checkboxRecipe({ color, size }));

  let input: HTMLInputElement | undefined = $state();

  // Prop updates only write the property; the listeners stay attached to the same input.
  $effect(() => {
    if (input && input.indeterminate !== indeterminate) input.indeterminate = indeterminate;
  });

  $effect(() => {
    if (input) return bindIndeterminate(input, () => untrack(() => indeterminate));
  });

  function handleChange(event: ChangeEv) {
    onchange?.(event);
    onChange?.(event, event.currentTarget.checked);
  }
</script>

<input
  bind:this={input}
  type="checkbox"
  {...recipe.attrs}
  class={[recipe.className, className]}
  data-motion={motion}
  disabled={disabled || !!form?.disabled}
  bind:checked
  onchange={handleChange}
  {...rest}
/>
