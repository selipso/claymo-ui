<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { Color, Size } from "../types";

  interface Props extends Omit<HTMLButtonAttributes, "color" | "size"> {
    /** MUI default is "text"; clay defaults to "contained" because the raised surface is the style's identity. */
    variant?: "contained" | "outlined" | "text";
    color?: Color;
    size?: Size;
    disabled?: boolean;
    fullWidth?: boolean;
    href?: string;
    startIcon?: Snippet;
    endIcon?: Snippet;
    loading?: boolean;
    loadingPosition?: "center" | "start" | "end";
    disableElevation?: boolean;
    inflated?: boolean;
    children?: Snippet;
  }

  let {
    variant = "contained",
    color = "primary",
    size = "medium",
    disabled = false,
    fullWidth = false,
    href,
    startIcon,
    endIcon,
    loading = false,
    loadingPosition = "center",
    disableElevation = false,
    inflated = false,
    type = "button",
    class: className = "",
    children,
    onclick,
    ...rest
  }: Props = $props();

  const isDisabled = $derived(disabled || loading);
  const tag = $derived(href ? "a" : "button");

  function handleClick(event: MouseEvent) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    (onclick as ((e: MouseEvent) => void) | undefined)?.(event);
  }
</script>

<svelte:element
  this={tag}
  class="clay btn {variant} {className}"
  class:full-width={fullWidth}
  class:no-elevation={disableElevation}
  class:loading
  data-color={color}
  data-size={size}
  data-clay-interactive
  data-inflated={inflated || undefined}
  data-loading-position={loading ? loadingPosition : undefined}
  href={href && !isDisabled ? href : undefined}
  type={href ? undefined : type}
  disabled={!href && isDisabled ? true : undefined}
  aria-disabled={href && isDisabled ? "true" : undefined}
  aria-busy={loading ? "true" : undefined}
  tabindex={href && isDisabled ? -1 : undefined}
  onclick={handleClick}
  {...rest}
>
  {#if loading}
    <span class="spinner" role="progressbar" aria-label="Loading"></span>
  {/if}
  {#if startIcon}<span class="icon">{@render startIcon()}</span>{/if}
  <span class="label">{@render children?.()}</span>
  {#if endIcon}<span class="icon">{@render endIcon()}</span>{/if}
</svelte:element>

<style>
  .btn {
    --clay-radius: 22px;
    --clay-d: 6px;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-sizing: border-box;
    min-height: 48px;
    padding: 0 28px;
    border: 0;
    font: 600 1rem/1 var(--clay-font);
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  .btn[data-size="small"] { min-height: 36px; padding: 0 16px; font-size: 0.875rem; --clay-radius: 14px; --clay-d: 4px; }
  .btn[data-size="large"] { min-height: 56px; padding: 0 36px; font-size: 1.125rem; --clay-radius: 26px; --clay-d: 8px; }
  .full-width { display: flex; width: 100%; }

  .contained { --clay-color: var(--c); color: var(--c-on); }
  .outlined {
    --clay-color: var(--clay-surface);
    color: var(--c-ink);
    border: 2px solid var(--c-ink);
  }
  .text {
    background: transparent;
    box-shadow: none;
    color: var(--c-ink);
  }
  .text:is(:hover, :focus-visible):not(:disabled, [aria-disabled="true"]) {
    background: var(--clay-surface);
    --clay-color: var(--clay-surface);
    box-shadow: var(--clay-raised);
  }
  /* inherit colour: let the contained variant keep its surface so text stays legible */
  .contained[data-color="inherit"] { --clay-color: var(--clay-surface); color: inherit; }

  .no-elevation { box-shadow: var(--clay-insets); }
  .no-elevation.text { box-shadow: none; }

  .icon { display: inline-flex; align-items: center; font-size: 1.25em; line-height: 0; }

  .spinner {
    width: 16px;
    height: 16px;
    box-sizing: border-box;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex: none;
  }
  .loading[data-loading-position="center"] .spinner {
    position: absolute;
    inset: 0;
    margin: auto;
  }
  .loading[data-loading-position="center"] .label,
  .loading[data-loading-position="center"] .icon { opacity: 0; }
  .loading[data-loading-position="end"] .spinner { order: 3; }
  .loading { cursor: progress; opacity: 1; }
  .loading:disabled { opacity: 0.85; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    .spinner { animation: none; border-right-color: currentColor; }
  }
</style>
