<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Remove the 8px gap between actions. */
    disableSpacing?: boolean;
    children?: Snippet;
  }

  let { disableSpacing = false, class: className = "", children, ...rest }: Props = $props();
</script>

<div class="card-actions {className}" class:no-spacing={disableSpacing} {...rest}>
  {@render children?.()}
</div>

<style>
  .card-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    padding: 8px 16px 16px;
  }
  .no-spacing {
    gap: 0;
  }
</style>
