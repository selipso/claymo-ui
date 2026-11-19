<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLUListElement> {
    dense?: boolean;
    disablePadding?: boolean;
    children?: Snippet;
  }

  let {
    dense = false,
    disablePadding = false,
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<ul
  class={["clay-list", className]}
  data-dense={dense ? "" : undefined}
  data-padded={!disablePadding ? "" : undefined}
  {...rest}
  role={rest.role ?? "list"}
>
  {@render children?.()}
</ul>
