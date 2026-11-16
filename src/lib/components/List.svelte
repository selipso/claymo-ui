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
  class="list {className}"
  class:padded={!disablePadding}
  style:--list-min={dense ? "36px" : "48px"}
  style:--list-gap={dense ? "2px" : "4px"}
  {...rest}
>
  {@render children?.()}
</ul>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--list-gap);
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .padded { padding-block: 8px; }
</style>
