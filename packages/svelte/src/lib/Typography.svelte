<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes, HTMLLabelAttributes } from "svelte/elements";
  import { typographyTag, type TypographyOptions } from "@claymo/core/surfaces";

  interface Props
    extends
      Omit<HTMLAttributes<HTMLElement>, "color">,
      Pick<HTMLLabelAttributes, "for">,
      TypographyOptions {
    children?: Snippet;
  }

  let {
    variant = "body1",
    as,
    variantMapping,
    color = "inherit",
    gutterBottom = false,
    noWrap = false,
    align = "inherit",
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const tag = $derived(typographyTag(variant, as, variantMapping));
</script>

<svelte:element
  this={tag}
  {...rest}
  class={["clay-typography", className]}
  data-variant={variant}
  data-gutter-bottom={gutterBottom ? "" : undefined}
  data-no-wrap={noWrap ? "" : undefined}
  data-tcolor={color}
  data-align={align}
>
  {@render children?.()}
</svelte:element>
