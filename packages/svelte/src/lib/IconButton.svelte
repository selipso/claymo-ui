<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
  import type { Color, MotionPreset, Size } from "@claymo/core";
  import { nativeAction, type IconButtonEdge } from "@claymo/core/actions";

  interface Props
    extends
      Omit<HTMLButtonAttributes, "color" | "size" | "aria-label">,
      Pick<
        HTMLAnchorAttributes,
        "download" | "hreflang" | "ping" | "referrerpolicy" | "rel" | "target"
      > {
    /** Required: an icon-only control has no visible text label. */
    "aria-label": string;
    /** MUI default is "default". */
    color?: Color;
    size?: Size;
    disabled?: boolean;
    href?: string;
    loading?: boolean | null;
    loadingIndicator?: Snippet;
    edge?: IconButtonEdge;
    inflated?: boolean;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    /** The icon. */
    children?: Snippet;
  }

  let {
    color = "default",
    size = "medium",
    disabled = false,
    href,
    loading = false,
    loadingIndicator,
    edge = false,
    inflated = false,
    motion,
    type = "button",
    class: className = "",
    children,
    onclick,
    ...rest
  }: Props = $props();

  const isDisabled = $derived(disabled || loading);
  const action = $derived(nativeAction({ href, type, disabled: isDisabled }));

  function handleClick(event: MouseEvent) {
    if (isDisabled) {
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
  class={["clay clay-icon-button", className]}
  data-loading={loading ? "" : undefined}
  data-edge={edge || undefined}
  data-color={color}
  data-size={size}
  data-clay-interactive
  data-inflated={inflated ? "" : undefined}
  data-motion={motion}
  aria-busy={loading ? "true" : rest["aria-busy"]}
  onclick={handleClick}
>
  {#if loading}
    {#if loadingIndicator}
      {@render loadingIndicator()}
    {:else}
      <span class="clay-icon-button__spinner" role="progressbar" aria-label="Loading"></span>
    {/if}
  {:else}
    <span class="clay-icon-button__icon">{@render children?.()}</span>
  {/if}
</svelte:element>
