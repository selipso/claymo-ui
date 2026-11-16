<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { Color } from "../types";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "color"> {
    variant?: "determinate" | "indeterminate";
    /** 0–100, used by `determinate`. */
    value?: number;
    color?: Color;
    "aria-label": string;
  }

  let {
    variant = "indeterminate",
    value = 0,
    color = "primary",
    "aria-label": ariaLabel,
    class: className = "",
    ...rest
  }: Props = $props();

  const determinate = $derived(variant === "determinate");
  const pct = $derived(Math.min(100, Math.max(0, value)));
</script>

<div
  class="clay track {className}"
  role="progressbar"
  aria-label={ariaLabel}
  aria-valuemin={determinate ? 0 : undefined}
  aria-valuemax={determinate ? 100 : undefined}
  aria-valuenow={determinate ? Math.round(pct) : undefined}
  data-color={color}
  {...rest}
>
  <div
    class="clay bar"
    class:indeterminate={!determinate}
    class:empty={determinate && pct === 0}
    style:--pct={pct}
  ></div>
</div>

<style>
  .track {
    --clay-color: var(--clay-page);
    --clay-d: 3px;
    --clay-radius: 999px;
    position: relative;
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 16px;
    overflow: hidden;
    border: 2px solid var(--clay-edge);
    box-shadow: var(--clay-well);
  }
  .bar {
    --clay-color: var(--c);
    --clay-d: 2px;
    --clay-radius: 999px;
    position: absolute;
    inset-block: 1px;
    inset-inline-start: 1px;
    width: calc((100% - 2px) * var(--pct) / 100);
    transition: width var(--clay-time) ease;
  }
  .bar.empty {
    visibility: hidden;
  }
  .bar.indeterminate {
    width: 40%;
    animation: slide 1.6s ease-in-out infinite;
  }

  @keyframes slide {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(260%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .bar {
      transition: none;
    }
    .bar.indeterminate {
      animation: none;
      transform: none;
    }
  }
  @media (forced-colors: active) {
    .bar {
      forced-color-adjust: none;
      background: Highlight;
      border: 0;
    }
  }
</style>
