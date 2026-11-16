<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { Size } from "../types";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    src?: string;
    alt?: string;
    variant?: "circular" | "rounded" | "square";
    /** MUI has no size prop; clay maps small/medium/large to 32/40/56px (documented deviation). */
    size?: Size;
    /** Fallback content (e.g. initials) shown without `src` or when the image fails to load. */
    children?: Snippet;
  }

  let {
    src,
    alt = "",
    variant = "circular",
    size = "medium",
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  // Remember which src failed so a new src gets a fresh attempt.
  let failedSrc = $state<string | undefined>();
  const showImage = $derived(!!src && failedSrc !== src);
</script>

<span class="clay avatar {variant} {className}" data-size={size} {...rest}>
  {#if showImage}
    <img {src} {alt} onerror={() => (failedSrc = src)} />
  {:else}
    {@render children?.()}
  {/if}
</span>

<style>
  .avatar {
    corner-shape: round;
    --size: 40px;
    --ring: 3px;
    --clay-d: 4px;
    --clay-radius: 999px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: var(--size);
    height: var(--size);
    padding: var(--ring);
    overflow: hidden;
    color: var(--clay-ink);
    font: 600 1rem/1 var(--clay-font);
    user-select: none;
    vertical-align: middle;
  }
  .avatar[data-size="small"] {
    --size: 32px;
    --ring: 2px;
    --clay-d: 3px;
    font-size: 0.875rem;
  }
  .avatar[data-size="large"] {
    --size: 56px;
    --ring: 4px;
    --clay-d: 5px;
    font-size: 1.375rem;
  }
  .rounded {
    --clay-radius: 14px;
  }
  .square {
    --clay-radius: 6px;
  }
  .rounded,
  .square {
    corner-shape: squircle;
  }
  .avatar[data-size="small"].rounded {
    --clay-radius: 10px;
  }
  .avatar[data-size="large"].rounded {
    --clay-radius: 18px;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: calc(var(--clay-radius) - var(--ring));
  }
  .avatar > :global(svg) {
    width: 55%;
    height: 55%;
  }
</style>
