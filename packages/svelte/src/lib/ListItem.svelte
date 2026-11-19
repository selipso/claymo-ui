<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLLiAttributes } from "svelte/elements";

  interface Props extends HTMLLiAttributes {
    /** Drop the row padding, e.g. when it wraps a `ListItemButton`. */
    disablePadding?: boolean;
    disableGutters?: boolean;
    divider?: boolean;
    secondaryAction?: Snippet;
    children?: Snippet;
  }

  let {
    disablePadding = false,
    disableGutters = false,
    divider = false,
    secondaryAction,
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<li
  class={["clay-list-item", className]}
  data-padded={!disablePadding ? "" : undefined}
  data-gutters={!disableGutters ? "" : undefined}
  data-divider={divider ? "" : undefined}
  {...rest}
>
  {@render children?.()}
  {#if secondaryAction}
    <span class="clay-list-item__secondary-action">{@render secondaryAction()}</span>
  {/if}
</li>
