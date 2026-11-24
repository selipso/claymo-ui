<script lang="ts">
  import { getContext, untrack } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { checkboxRecipe, type CheckboxOptions } from "@claymo/core";
  import type { MotionPreset } from "@claymo/core";
  import { bindIndeterminate } from "@claymo/core/behavior/checkbox";

  type ChangeEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface Props
    extends
      Omit<
        HTMLInputAttributes,
        "color" | "size" | "type" | "checked" | "defaultChecked" | "value" | "children"
      >,
      CheckboxOptions {
    checked?: boolean;
    defaultChecked?: boolean;
    /** Mixed state. Drives the DOM `indeterminate` property; the parent owns it (controlled, like MUI). */
    indeterminate?: boolean;
    value?: string | number;
    onChange?: (event: ChangeEv, checked: boolean) => void;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
  }

  let {
    checked,
    defaultChecked,
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
  const initialDefault = untrack(() => defaultChecked ?? false);
  const resetChecked = $derived(checked ?? initialDefault);

  let input: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (input && checked !== undefined && input.checked !== checked) input.checked = checked;
  });

  // Prop updates only write the property; the listeners stay attached to the same input.
  $effect(() => {
    if (input && input.indeterminate !== indeterminate) input.indeterminate = indeterminate;
  });

  $effect(() => {
    if (input) return bindIndeterminate(input, () => untrack(() => indeterminate));
  });

  function handleChange(event: ChangeEv) {
    const next = event.currentTarget.checked;
    onchange?.(event);
    onChange?.(event, next);
    if (checked !== undefined) {
      queueMicrotask(() => {
        if (input && checked !== undefined && input.checked !== checked) input.checked = checked;
      });
    }
  }
</script>

<input
  {...rest}
  bind:this={input}
  type="checkbox"
  {...recipe.attrs}
  class={[recipe.className, className]}
  data-motion={motion}
  disabled={disabled || !!form?.disabled}
  defaultChecked={resetChecked}
  checked={checked ?? initialDefault}
  onchange={handleChange}
/>
