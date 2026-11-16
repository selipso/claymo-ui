<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLLiAttributes } from "svelte/elements";

  interface Props extends HTMLLiAttributes {
    /** Drop the row padding, e.g. when it wraps a `ListItemButton`. */
    disablePadding?: boolean;
    children?: Snippet;
  }

  let { disablePadding = false, class: className = "", children, ...rest }: Props = $props();
</script>

<li class="list-item {className}" class:padded={!disablePadding} {...rest}>
  {@render children?.()}
</li>

<style>
  .list-item {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    color: var(--clay-ink);
  }
  .padded { padding: 8px 16px; }
</style>
