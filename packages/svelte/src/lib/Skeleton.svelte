<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { skeletonDefaults, skeletonDimensions, type SkeletonOptions } from "@claymo/core/display";

  type Props = Omit<
    HTMLAttributes<HTMLSpanElement>,
    "aria-hidden" | "children" | keyof SkeletonOptions
  > &
    SkeletonOptions;

  let {
    variant = skeletonDefaults.variant,
    width,
    height,
    animation = skeletonDefaults.animation,
    class: className = "",
    ...rest
  }: Props = $props();

  const dimensions = $derived(skeletonDimensions({ variant, width, height }));
</script>

<span
  {...rest}
  class={["clay clay-skeleton", className]}
  data-variant={variant}
  data-animation={animation || undefined}
  aria-hidden="true"
  style:width={dimensions.width}
  style:height={dimensions.height}
></span>
