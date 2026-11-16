<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Paper from "./Paper.svelte";

  /** Same surface props as Paper (variant, elevation, inflated, as, children); Card is always rounded, so `square` is not exposed. */
  type Props = Omit<ComponentProps<typeof Paper>, "square">;

  let {
    variant = "elevation",
    elevation = 1,
    inflated = false,
    as = "div",
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<Paper {variant} {elevation} {inflated} {as} class="clay-card {className}" {...rest}>
  {@render children?.()}
</Paper>

<style>
  /* Paper's own scoped rule sets 28px; the extra classes win on specificity without depending on style order. */
  :global(.clay.paper.clay-card) {
    --clay-radius: 32px;
  }
</style>
