<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    children?: Snippet;
  }

  let { class: className = "", children, ...rest }: Props = $props();
</script>

<span class="list-item-icon {className}" {...rest}>
  {@render children?.()}
</span>

<style>
  .list-item-icon {
    display: inline-flex;
    align-items: center;
    flex: none;
    min-width: 40px;
    color: inherit;
    font-size: 1.5rem;
    line-height: 0;
  }
  .list-item-icon :global(svg) {
    width: 1em;
    height: 1em;
  }
</style>
