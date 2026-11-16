<script lang="ts">
  import { setContext } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLLabelAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLLabelAttributes, "children"> {
    label: string;
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
  class="form-control-label {className}"
  class:disabled
  data-placement={labelPlacement}
  {...rest}
>
  {@render control()}
  <span class="text">{label}</span>
</label>

<style>
  .form-control-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    color: var(--clay-ink);
    font: 400 1rem/1.4 var(--clay-font);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .form-control-label[data-placement="start"] { flex-direction: row-reverse; }
  .form-control-label[data-placement="top"] { flex-direction: column-reverse; gap: 4px; }
  .form-control-label[data-placement="bottom"] { flex-direction: column; gap: 4px; }
  .disabled {
    color: var(--clay-ink-muted);
    cursor: not-allowed;
  }
  .text { user-select: none; }
</style>
