<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLHRElement> {
    orientation?: "horizontal" | "vertical";
    /** Stretch to the height of a flex row (use with `orientation="vertical"`). */
    flexItem?: boolean;
    variant?: "fullWidth" | "inset";
  }

  let {
    orientation = "horizontal",
    flexItem = false,
    variant = "fullWidth",
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<hr
  class="divider {orientation} {variant} {className}"
  class:flex-item={flexItem}
  aria-orientation={orientation}
  {...rest}
/>

<style>
  .divider {
    flex: none;
    box-sizing: border-box;
    margin: 0;
    border: 0;
  }
  .horizontal {
    width: 100%;
    border-top: var(--clay-border-width) solid var(--clay-edge);
  }
  .horizontal.inset {
    width: auto;
    margin-inline-start: 72px;
  }

  .vertical {
    width: var(--clay-border-width);
    height: 100%;
    min-height: 1em;
    border-left: var(--clay-border-width) solid var(--clay-edge);
  }
  .vertical.flex-item {
    height: auto;
    align-self: stretch;
  }
  .vertical.inset {
    margin-block: 8px;
  }
</style>
