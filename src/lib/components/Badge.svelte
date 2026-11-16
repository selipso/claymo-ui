<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { Color } from "../types";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
    badgeContent?: string | number;
    /** MUI's default is "default"; clay fixes "primary" (documented deviation). */
    color?: Color;
    /** Numbers above `max` render as `${max}+`. */
    max?: number;
    showZero?: boolean;
    invisible?: boolean;
    variant?: "standard" | "dot";
    children?: Snippet;
  }

  let {
    badgeContent,
    color = "primary",
    max = 99,
    showZero = false,
    invisible = false,
    variant = "standard",
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const empty = $derived(
    badgeContent === undefined ||
      badgeContent === "" ||
      (Number(badgeContent) === 0 && !showZero),
  );
  const hidden = $derived(invisible || (variant === "standard" && empty));
  const text = $derived(
    typeof badgeContent === "number" && badgeContent > max ? `${max}+` : badgeContent,
  );
</script>

<span class="root {className}" {...rest}>
  {@render children?.()}
  {#if !hidden}
    <span class="clay badge" class:dot={variant === "dot"} class:anchored={!!children} data-color={color}>
      {#if variant === "standard"}{text}{/if}
    </span>
  {/if}
</span>

<style>
  .root {
    position: relative;
    display: inline-flex;
    flex: none;
    vertical-align: middle;
  }
  .badge {
    --clay-color: var(--c);
    --clay-radius: 999px;
    --clay-d: 2px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    color: var(--c-on);
    font: 600 0.75rem/1 var(--clay-font);
    white-space: nowrap;
    animation: pop 300ms var(--clay-ease);
  }
  .badge[data-color="inherit"] { --clay-color: var(--clay-surface); color: inherit; }
  .dot { min-width: 10px; width: 10px; height: 10px; padding: 0; }
  .badge.anchored {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    z-index: 1;
  }
  .badge.anchored.dot { transform: translate(40%, -40%); }

  @keyframes pop {
    from { opacity: 0; scale: 0.4; }
    to { opacity: 1; scale: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .badge { animation: none; }
  }
</style>
