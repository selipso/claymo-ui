<script lang="ts">
  import { getContext } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { checkboxRecipe, type CheckboxOptions } from "@claymo/core";
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
  }

  let {
    checked = $bindable(),
    indeterminate = false,
    disabled = false,
    color,
    size,
    onChange,
    onchange,
    class: className,
    ...rest
  }: Props = $props();

  // FormControlLabel shares its `disabled` through context.
  const form = getContext<{ readonly disabled: boolean } | undefined>("clay-form-control");
  const recipe = $derived(checkboxRecipe({ color, size }));

  let input: HTMLInputElement | undefined = $state();

  // Re-binds when the parent changes `indeterminate`; core restores it after clicks and form reset.
  $effect(() => {
    if (input) return bindIndeterminate(input, () => indeterminate);
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
  disabled={disabled || !!form?.disabled}
  bind:checked
  onchange={handleChange}
  {...rest}
/>
