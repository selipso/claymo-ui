<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { MotionPreset } from "@claymo/core";
  import { badgeDefaults, badgeLabel, type BadgeOptions } from "@claymo/core/display";

  interface Props
    extends Omit<HTMLAttributes<HTMLSpanElement>, "color">, Omit<BadgeOptions, "badgeContent"> {
    badgeContent?: BadgeOptions["badgeContent"] | Snippet;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    children?: Snippet;
  }

  let {
    badgeContent,
    color = badgeDefaults.color,
    max,
    showZero = false,
    invisible = false,
    variant = badgeDefaults.variant,
    anchorOrigin = badgeDefaults.anchorOrigin,
    overlap = badgeDefaults.overlap,
    motion,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const content = $derived(typeof badgeContent === "function" ? badgeContent : undefined);
  const text = $derived(
    badgeLabel(
      {
        badgeContent: typeof badgeContent !== "function" ? badgeContent : undefined,
        max,
        showZero,
        invisible,
        variant,
      },
      !!content,
    ),
  );
</script>

<span class="clay-badge {className}" data-motion={motion} {...rest}>
  {@render children?.()}
  {#if text !== undefined}
    <span
      class="clay clay-badge__indicator"
      data-variant={variant}
      data-anchored={children ? "" : undefined}
      data-vertical={anchorOrigin.vertical ?? badgeDefaults.anchorOrigin.vertical}
      data-horizontal={anchorOrigin.horizontal ?? badgeDefaults.anchorOrigin.horizontal}
      data-overlap={overlap}
      data-color={color}
    >
      {#if variant === "standard"}
        {#if content}{@render content()}{:else}{text}{/if}
      {/if}
    </span>
  {/if}
</span>
