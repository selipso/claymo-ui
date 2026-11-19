<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
  import { buttonRecipe, type ButtonOptions } from "@claymo/core";

  interface Props
    extends
      Omit<HTMLButtonAttributes, keyof ButtonOptions>,
      Pick<HTMLAnchorAttributes, "target" | "rel">,
      ButtonOptions {
    startIcon?: Snippet;
    endIcon?: Snippet;
    children?: Snippet;
  }

  let {
    variant,
    color,
    size,
    disabled,
    fullWidth,
    href,
    type,
    loading = false,
    loadingPosition,
    disableElevation,
    inflated,
    class: className,
    startIcon,
    endIcon,
    children,
    onclick,
    ...rest
  }: Props = $props();

  const recipe = $derived(
    buttonRecipe({
      variant,
      color,
      size,
      disabled,
      fullWidth,
      href,
      type,
      loading,
      loadingPosition,
      disableElevation,
      inflated,
    }),
  );

  function handleClick(event: MouseEvent) {
    if (recipe.inert) {
      event.preventDefault();
      return;
    }
    (onclick as ((e: MouseEvent) => void) | undefined)?.(event);
  }
</script>

<svelte:element
  this={recipe.tag}
  {...recipe.attrs}
  class={[recipe.className, className]}
  onclick={handleClick}
  {...rest}
>
  {#if loading}
    <span class="clay-button__spinner" role="progressbar" aria-label="Loading"></span>
  {/if}
  {#if startIcon}<span class="clay-button__icon">{@render startIcon()}</span>{/if}
  <span class="clay-button__label">{@render children?.()}</span>
  {#if endIcon}<span class="clay-button__icon">{@render endIcon()}</span>{/if}
</svelte:element>
