<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import CircleCheck from "@lucide/svelte/icons/circle-check";
  import Info from "@lucide/svelte/icons/info";
  // Lucide names these TriangleAlert / CircleAlert; the installed package ships the real files under these names.
  import TriangleAlert from "@lucide/svelte/icons/triangle-exclamation-point";
  import CircleAlert from "@lucide/svelte/icons/circle-exclamation-point";
  import X from "@lucide/svelte/icons/x";
  import type { Severity } from "../types";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    severity?: Severity;
    variant?: "standard" | "filled" | "outlined";
    /** Custom icon snippet; `false` hides the icon. */
    icon?: Snippet | false;
    /** Replaces the close button when given. */
    action?: Snippet;
    /** When set, renders a close button (aria-label "Close"). */
    onClose?: (event: MouseEvent) => void;
    role?: string;
    children?: Snippet;
  }

  let {
    severity = "success",
    variant = "standard",
    icon,
    action,
    onClose,
    role = "alert",
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const defaultIcons = {
    success: CircleCheck,
    info: Info,
    warning: TriangleAlert,
    error: CircleAlert,
  } as const;
  const severityLabel = {
    success: "Success",
    info: "Info",
    warning: "Warning",
    error: "Error",
  } as const;
</script>

<div class="clay alert {variant} {className}" {role} data-color={severity} {...rest}>
  {#if icon !== false}
    <span class="icon" aria-hidden="true">
      {#if icon}
        {@render icon()}
      {:else}
        {@const Icon = defaultIcons[severity]}
        <Icon size={22} />
      {/if}
    </span>
  {/if}
  <div class="message">
    <span class="clay-sr-only">{severityLabel[severity]}: </span>
    {@render children?.()}
  </div>
  {#if action}
    <div class="action">{@render action()}</div>
  {:else if onClose}
    <div class="action">
      <button
        type="button"
        class="clay close"
        data-clay-interactive
        aria-label="Close"
        onclick={onClose}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  {/if}
</div>

<style>
  .alert {
    --clay-radius: 22px;
    --clay-d: 6px;
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    box-sizing: border-box;
    padding: 12px 16px 12px 28px;
    font: 400 1rem/1.4 var(--clay-font);
  }
  .icon {
    display: inline-flex;
    flex: none;
    padding-top: 3px;
    line-height: 0;
  }
  .message {
    flex: 1 1 auto;
    min-width: 0;
    padding: 4px 0;
  }
  .action {
    display: flex;
    flex: none;
    align-items: center;
    margin-inline-start: auto;
  }

  /* standard: raised surface, coloured bar + icon */
  .standard {
    --clay-color: var(--clay-surface);
    color: var(--clay-ink);
  }
  .standard::before {
    content: "";
    position: absolute;
    inset-block: 14px;
    inset-inline-start: 12px;
    border-inline-start: var(--clay-border-width) solid var(--c-ink);
  }
  .standard .icon {
    color: var(--c-ink);
  }

  /* filled: --c fill with its on-colour */
  .filled {
    --clay-focus: var(--c-on);
    --clay-color: var(--c);
    color: var(--c-on);
  }

  /* outlined: surface + coloured border */
  .outlined {
    --clay-color: var(--clay-surface);
    color: var(--clay-ink);
    border: var(--clay-border-width) solid var(--c-ink);
    padding-block: calc(12px - var(--clay-border-width));
    padding-inline-start: calc(16px - var(--clay-border-width));
  }
  .outlined .icon {
    color: var(--c-ink);
  }

  .close {
    --clay-color: var(--clay-surface);
    --clay-radius: 999px;
    --clay-d: 3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    color: var(--clay-ink);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .filled .close {
    --clay-color: var(--c);
    color: var(--c-on);
  }
</style>
