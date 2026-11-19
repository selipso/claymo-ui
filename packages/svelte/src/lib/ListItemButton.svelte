<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
  import { nativeAction } from "@claymo/core/actions";

  interface Props extends HTMLButtonAttributes, Pick<HTMLAnchorAttributes, "target" | "rel"> {
    selected?: boolean;
    disabled?: boolean;
    dense?: boolean;
    disableGutters?: boolean;
    /** Renders an <a>; a selected link row gets aria-current="page". */
    href?: string;
    children?: Snippet;
  }

  let {
    selected = false,
    disabled = false,
    dense = false,
    disableGutters = false,
    href,
    type = "button",
    class: className = "",
    children,
    onclick,
    ...rest
  }: Props = $props();

  const action = $derived(nativeAction({ href, type, disabled }));

  function handleClick(event: MouseEvent) {
    if (disabled) {
      event.preventDefault();
      return;
    }
    (onclick as ((e: MouseEvent) => void) | undefined)?.(event);
  }
</script>

<svelte:element
  this={action.tag}
  {...rest}
  {...action.attrs}
  class={["clay clay-list-item-button", className]}
  data-selected={selected ? "" : undefined}
  data-dense={dense ? "" : undefined}
  data-gutters={!disableGutters ? "" : undefined}
  data-clay-interactive
  aria-current={rest["aria-current"] ?? (selected ? (href ? "page" : "true") : undefined)}
  onclick={handleClick}
>
  {@render children?.()}
</svelte:element>
