<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import {
    actionIconAttrs,
    alertIcons,
    closeIconPath,
    type AlertVariant,
  } from "@claymo/core/actions";
  import type { MotionPreset, Severity } from "@claymo/core";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    severity?: Severity;
    color?: Severity;
    variant?: AlertVariant;
    /** Custom icon snippet; `false` hides the icon. */
    icon?: Snippet | false;
    /** Replaces the close button when given. */
    action?: Snippet;
    /** When set, renders a close button (aria-label "Close"). */
    onClose?: (event: MouseEvent) => void;
    closeText?: string;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    children?: Snippet;
  }

  let {
    severity = "success",
    color,
    variant = "standard",
    icon,
    action,
    onClose,
    closeText = "Close",
    role = "alert",
    motion,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const defaultIcon = $derived(alertIcons[severity]);
</script>

<div
  {...rest}
  class={["clay clay-alert", className]}
  {role}
  data-color={color ?? severity}
  data-variant={variant}
  data-motion={motion}
>
  {#if icon !== false}
    <span class="clay-alert__icon" aria-hidden="true">
      {#if icon}
        {@render icon()}
      {:else}
        <svg {...actionIconAttrs} width="22" height="22">
          <path d={defaultIcon.path} />
        </svg>
      {/if}
    </span>
  {/if}
  <div class="clay-alert__message">
    <span class="clay-sr-only">{defaultIcon.label}: </span>
    {@render children?.()}
  </div>
  {#if action}
    <div class="clay-alert__action">{@render action()}</div>
  {:else if onClose}
    <div class="clay-alert__action">
      <button
        type="button"
        class="clay clay-alert__close"
        data-clay-interactive
        aria-label={closeText}
        onclick={onClose}
      >
        <svg {...actionIconAttrs} width="18" height="18">
          <path d={closeIconPath} />
        </svg>
      </button>
    </div>
  {/if}
</div>
