<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { Color, Size } from "../types";

  interface Props extends Omit<HTMLButtonAttributes, "color" | "size" | "aria-label"> {
    /** Required: an icon-only control has no visible text label. */
    "aria-label": string;
    /** MUI default is "default". */
    color?: Color;
    size?: Size;
    disabled?: boolean;
    href?: string;
    loading?: boolean;
    inflated?: boolean;
    /** The icon. */
    children?: Snippet;
  }

  let {
    color = "default",
    size = "medium",
    disabled = false,
    href,
    loading = false,
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
  class="clay icon-btn {className}"
  class:loading
  data-color={color}
  data-size={size}
  data-clay-interactive
  data-inflated={inflated || undefined}
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
  {:else}
    <span class="icon">{@render children?.()}</span>
  {/if}
</svelte:element>

<style>
  .icon-btn {
    corner-shape: round;
    --clay-radius: 999px;
    --clay-d: 5px;
    --clay-color: var(--c);
    --size: 44px;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    box-sizing: border-box;
    width: var(--size);
    height: var(--size);
    padding: 0;
    border: 0;
    color: var(--c-on);
    font: inherit;
    text-decoration: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  .icon-btn[data-size="small"] {
    --size: 36px;
    --clay-d: 4px;
  }
  .icon-btn[data-size="large"] {
    --size: 52px;
    --clay-d: 6px;
  }

  /* inherit colour: keep a visible surface and let the text colour follow the parent */
  .icon-btn[data-color="inherit"] {
    --clay-color: var(--clay-surface);
    color: inherit;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    line-height: 0;
  }
  .icon-btn[data-size="small"] .icon {
    font-size: 1.25rem;
  }
  .icon-btn[data-size="large"] .icon {
    font-size: 1.75rem;
  }
  .icon :global(svg) {
    width: 1em;
    height: 1em;
  }

  .spinner {
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex: none;
  }
  .loading {
    cursor: progress;
    opacity: 1;
  }
  .loading:disabled {
    opacity: 0.85;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
      border-right-color: currentColor;
    }
  }
</style>
