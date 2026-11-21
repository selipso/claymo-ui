<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { paperRecipe, type PaperOptions } from "@claymo/core";

  interface Props extends HTMLAttributes<HTMLElement>, PaperOptions {
    children?: Snippet;
  }

  let {
    elevation,
    variant,
    square,
    inflated,
    as,
    class: className,
    children,
    ...rest
  }: Props = $props();

  const recipe = $derived(paperRecipe({ elevation, variant, square, inflated, as }));
</script>

<svelte:element this={recipe.tag} {...recipe.attrs} class={[recipe.className, className]} {...rest}>
  {@render children?.()}
</svelte:element>
