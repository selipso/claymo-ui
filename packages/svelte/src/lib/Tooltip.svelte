<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { MotionPreset } from "@claymo/core";
  import { attachTooltip } from "@claymo/core/behavior/overlays";
  import type { TooltipCloseReason, TooltipPlacement } from "@claymo/core/overlays";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "title"> {
    title?: string;
    placement?: TooltipPlacement;
    arrow?: boolean;
    /** Omit to show on hover or focus, or control the visibility explicitly. */
    open?: boolean;
    onOpen?: (event: Event) => void;
    onClose?: (event: Event, reason: TooltipCloseReason) => void;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    /** One trigger element, described by the tooltip. */
    children?: Snippet;
    /** Noninteractive tooltip content replacing `title`. */
    content?: Snippet;
  }

  let {
    title,
    placement = "bottom",
    arrow = false,
    open,
    onOpen,
    onClose,
    motion,
    class: className,
    id,
    children,
    content,
    ...rest
  }: Props = $props();
  const uid = $props.id();
  const tipId = `${uid}-tip`;
  const hasContent = $derived(!!(content || title));
</script>

<span
  {...rest}
  {id}
  class={["clay-tooltip", className]}
  data-placement={placement}
  data-arrow={arrow ? "" : undefined}
  data-clay-open={open === undefined ? undefined : String(open)}
  data-clay-tooltip-content={hasContent ? "" : undefined}
  data-motion={motion}
  {@attach (node) =>
    attachTooltip(node, {
      requestOpen: (event) => onOpen?.(event),
      requestClose: (event, reason) => onClose?.(event, reason),
    })}
>
  {@render children?.()}
  <span id={tipId} role="tooltip" class="clay clay-tooltip__bubble">
    {#if content}{@render content()}{:else}{title}{/if}
  </span>
</span>
