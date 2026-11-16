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
  /* An embossed groove: darker line above a lighter line, derived from the surface token. */
  .divider {
    --shade: light-dark(
      color-mix(in oklab, var(--clay-surface), black 24%),
      color-mix(in oklab, var(--clay-surface), black 42%)
    );
    --light: light-dark(
      color-mix(in oklab, var(--clay-surface), white 60%),
      color-mix(in oklab, var(--clay-surface), white 16%)
    );
    flex: none;
    box-sizing: border-box;
    margin: 0;
    border: 0;
    border-radius: 1px;
  }
  .horizontal {
    width: 100%;
    height: 2px;
    background: linear-gradient(to bottom, var(--shade) 50%, var(--light) 50%);
  }
  .horizontal.inset {
    width: auto;
    margin-inline-start: 72px;
  }

  .vertical {
    width: 2px;
    height: 100%;
    min-height: 1em;
    background: linear-gradient(to right, var(--shade) 50%, var(--light) 50%);
  }
  .vertical.flex-item {
    height: auto;
    align-self: stretch;
  }
  .vertical.inset {
    margin-block: 8px;
  }
</style>
