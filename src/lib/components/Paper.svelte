<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {
    /** Depth level: 0 flat, 1 = 6px, 2 = 10px, 3 = 16px. */
    elevation?: 0 | 1 | 2 | 3;
    variant?: "elevation" | "outlined";
    square?: boolean;
    inflated?: boolean;
    as?: "div" | "section" | "article" | "nav" | "aside" | "header";
    children?: Snippet;
  }

  let {
    elevation = 1,
    variant = "elevation",
    square = false,
    inflated = false,
    as = "div",
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const depth = $derived(["0px", "6px", "10px", "16px"][elevation]);
  const flat = $derived(variant === "outlined" || elevation === 0);
</script>

<svelte:element
  this={as}
  class="clay paper {className}"
  class:outlined={variant === "outlined"}
  class:flat
  class:square
  data-inflated={inflated && !flat ? true : undefined}
  style:--clay-d={depth}
  {...rest}
>
  {@render children?.()}
</svelte:element>

<style>
  .paper {
    --clay-radius: 28px;
    box-sizing: border-box;
    color: var(--clay-ink);
  }
  .square { --clay-radius: 0px; }
  .flat { box-shadow: none; }
  .outlined { border: 2px solid var(--clay-edge); }
</style>
