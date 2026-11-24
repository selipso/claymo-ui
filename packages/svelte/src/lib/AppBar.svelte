<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { AppBarOptions } from "@claymo/core/surfaces";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "color">, AppBarOptions {
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

<header
  {...rest}
  class={["clay", "clay-app-bar", className]}
  data-position={position}
  data-color={color}
>
  {@render children?.()}
</header>
