<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLUListElement> {
    dense?: boolean;
    disablePadding?: boolean;
    /** Visible heading above the items; also the list's accessible name unless you give another. */
    subheader?: string;
    children?: Snippet;
  }

  let {
    dense = false,
    disablePadding = false,
    subheader,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const named = $derived(rest["aria-label"] !== undefined || rest["aria-labelledby"] !== undefined);
</script>

<ul
  {...rest}
  class={["clay-list", className]}
  data-dense={dense ? "" : undefined}
  data-padded={!disablePadding ? "" : undefined}
  role={rest.role ?? "list"}
  aria-label={named ? rest["aria-label"] : subheader || undefined}
>
  {#if subheader}<li class="clay-list__subheader" aria-hidden="true">{subheader}</li>{/if}
  {@render children?.()}
</ul>
