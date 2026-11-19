<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cardElevation, type CardOptions } from "@claymo/core/surfaces";
  import Paper from "./Paper.svelte";

  interface Props extends HTMLAttributes<HTMLElement>, CardOptions {
    children?: Snippet;
  }

  let {
    variant,
    elevation,
    inflated,
    raised,
    as,
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<Paper
  {variant}
  elevation={cardElevation(elevation, raised)}
  {inflated}
  {as}
  class={["clay-card", className]}
  {...rest}
>
  {@render children?.()}
</Paper>
