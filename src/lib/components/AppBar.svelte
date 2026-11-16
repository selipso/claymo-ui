<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "color"> {
    position?: "static" | "sticky" | "fixed";
    color?: "primary" | "default" | "inherit";
    children?: Snippet;
  }

  let {
    position = "sticky",
    color = "primary",
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<header class="clay appbar {position} {className}" data-color={color} {...rest}>
  {@render children?.()}
</header>

<style>
  .appbar {
    --clay-focus: var(--c-on);
    --clay-color: var(--c);
    --clay-radius: 0 0 28px 28px;
    --clay-d: 8px;
    z-index: 1100;
    display: flex;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    width: 100%;
    min-height: 64px;
    padding-inline: 16px;
    color: var(--c-on);
  }
  /* inherit: a transparent fill would erase the clay shading, so keep the surface and the inherited text colour. */
  .appbar[data-color="inherit"] {
    --clay-color: var(--clay-surface);
    color: inherit;
  }
  .static {
    position: static;
  }
  .sticky {
    position: sticky;
    top: 0;
  }
  .fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }
</style>
