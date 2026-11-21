<script lang="ts">
  import { setContext } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLLabelAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLLabelAttributes, "children"> {
    label: string | Snippet;
    /** The Checkbox, Radio or Switch to label. */
    control: Snippet;
    labelPlacement?: "end" | "start" | "top" | "bottom";
    /** Dims the label and disables the wrapped control. */
    disabled?: boolean;
  }

  let {
    label,
    control,
    labelPlacement = "end",
    disabled = false,
    class: className = "",
    ...rest
  }: Props = $props();

  setContext("clay-form-control", {
    get disabled() {
      return disabled;
    },
  });
</script>

<label
  class={["clay-form-control-label", className]}
  data-disabled={disabled || undefined}
  data-placement={labelPlacement}
  {...rest}
>
  {@render control()}
  <span class="clay-form-control-label__text">
    {#if typeof label === "string"}{label}{:else}{@render label()}{/if}
  </span>
</label>
