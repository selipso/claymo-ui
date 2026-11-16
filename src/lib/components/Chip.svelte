<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import X from "@lucide/svelte/icons/x";
  import type { Color } from "../types";

  /*
   * A <button> cannot contain another <button>, so the chip root is a <span>
   * holding sibling controls: the main body (a <button> when clickable or when
   * `onclick` is given, else a <span>) and, when `onDelete` is set, a separate
   * remove <button aria-label="Remove {label}">. `onclick` goes to the body.
   */
  interface Props extends Omit<HTMLAttributes<HTMLElement>, "color"> {
    label: string;
    variant?: "filled" | "outlined";
    color?: Color;
    size?: "small" | "medium";
    icon?: Snippet;
    avatar?: Snippet;
    onDelete?: (event: MouseEvent | KeyboardEvent) => void;
    clickable?: boolean;
    disabled?: boolean;
  }

  let {
    label,
    variant = "filled",
    color = "default",
    size = "medium",
    icon,
    avatar,
    onDelete,
    clickable = false,
    disabled = false,
    class: className = "",
    onclick,
    ...rest
  }: Props = $props();

  const interactive = $derived(clickable || !!onclick);

  function onBodyKeydown(event: KeyboardEvent) {
    if (disabled || !onDelete) return;
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      onDelete(event);
    }
  }
  function onRemoveClick(event: MouseEvent) {
    if (disabled) return;
    onDelete?.(event);
  }
</script>

<span
  class="clay chip {variant} {className}"
  class:deletable={!!onDelete}
  data-color={color}
  data-size={size}
  data-clay-interactive={interactive || undefined}
  data-disabled={disabled || undefined}
  {...rest}
>
  {#if interactive}
    <button
      type="button"
      class="body"
      {disabled}
      onclick={onclick as ((e: MouseEvent) => void) | undefined}
      onkeydown={onBodyKeydown}
    >
      {#if avatar}<span class="lead avatar">{@render avatar()}</span>{/if}
      {#if icon}<span class="lead icon">{@render icon()}</span>{/if}
      <span class="label">{label}</span>
    </button>
  {:else}
    <span class="body">
      {#if avatar}<span class="lead avatar">{@render avatar()}</span>{/if}
      {#if icon}<span class="lead icon">{@render icon()}</span>{/if}
      <span class="label">{label}</span>
    </span>
  {/if}
  {#if onDelete}
    <button
      type="button"
      class="remove"
      aria-label="Remove {label}"
      {disabled}
      onclick={onRemoveClick}
      onkeydown={onBodyKeydown}
    >
      <X size={14} strokeWidth={2.5} aria-hidden="true" />
    </button>
  {/if}
</span>

<style>
  .chip {
    --clay-radius: 999px;
    --clay-d: 4px;
    --clay-color: var(--c);
    --h: 36px;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    min-height: var(--h);
    max-width: 100%;
    color: var(--c-on);
    font: 600 0.875rem/1 var(--clay-font);
    vertical-align: middle;
  }
  .chip[data-size="small"] {
    --h: 28px;
    --clay-d: 3px;
    font-size: 0.8125rem;
  }

  .outlined {
    --clay-color: var(--clay-surface);
    color: var(--c-ink);
    border: 2px solid var(--c-ink);
  }
  .chip[data-color="inherit"] {
    --clay-color: var(--clay-surface);
    color: inherit;
  }

  .body {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-sizing: border-box;
    align-self: stretch;
    min-width: 0;
    padding: 0 14px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: inherit;
    font: inherit;
    -webkit-tap-highlight-color: transparent;
  }
  .chip[data-size="small"] .body {
    padding: 0 10px;
  }
  button.body {
    cursor: pointer;
  }
  button.body:disabled {
    cursor: not-allowed;
  }
  .deletable .body {
    padding-inline-end: 6px;
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lead {
    display: inline-flex;
    align-items: center;
    flex: none;
    line-height: 0;
  }
  .icon {
    font-size: 1.125rem;
    margin-inline-start: -4px;
  }
  .avatar {
    margin-inline-start: -10px;
  }
  .avatar :global(.avatar) {
    width: calc(var(--h) - 8px);
    height: calc(var(--h) - 8px);
    font-size: 0.75rem;
  }

  .remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    box-sizing: border-box;
    width: 22px;
    height: 22px;
    margin-inline-end: 6px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .chip[data-size="small"] .remove {
    width: 20px;
    height: 20px;
    margin-inline-end: 4px;
  }
  .remove:hover:not(:disabled) {
    background: color-mix(in oklab, currentColor, transparent 82%);
  }
  .remove:disabled {
    cursor: not-allowed;
  }
</style>
