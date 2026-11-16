<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    variant?: "text" | "rectangular" | "rounded" | "circular";
    /** px when a number, otherwise any CSS length. */
    width?: number | string;
    height?: number | string;
    animation?: "pulse" | "wave" | false;
  }

  let {
    variant = "text",
    width,
    height,
    animation = "pulse",
    class: className = "",
    ...rest
  }: Props = $props();

  const css = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v);
  // A circle needs both sides; default to 40px and mirror whichever side was given.
  const w = $derived(css(width ?? (variant === "circular" ? (height ?? 40) : undefined)));
  const h = $derived(css(height ?? (variant === "circular" ? (width ?? 40) : undefined)));
</script>

<span
  class="clay skeleton {variant} {className}"
  class:pulse={animation === "pulse"}
  class:wave={animation === "wave"}
  aria-hidden="true"
  style:width={w}
  style:height={h}
  {...rest}
></span>

<style>
  .skeleton {
    --clay-color: var(--clay-page);
    --clay-d: 3px;
    --clay-radius: 18px;
    position: relative;
    display: block;
    box-sizing: border-box;
    max-width: 100%;
    overflow: hidden;
    box-shadow: var(--clay-well);
  }
  .text {
    --clay-radius: 8px;
    width: 100%;
    height: 1em;
    margin-block: 0.25em;
  }
  .rectangular {
    --clay-radius: 0px;
    width: 100%;
    min-height: 1em;
  }
  .rounded {
    width: 100%;
    min-height: 1em;
  }
  .circular {
    --clay-radius: 50%;
  }

  .pulse {
    animation: pulse 2s ease-in-out 0.5s infinite;
  }
  .wave::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--clay-light), transparent 45%), transparent);
    transform: translateX(-100%);
    animation: wave 1.6s linear 0.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes wave {
    to { transform: translateX(100%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .pulse { animation: none; }
    .wave::after { animation: none; display: none; }
  }
</style>
