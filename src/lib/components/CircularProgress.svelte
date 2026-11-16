<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import type { Color } from "../types";

  interface Props extends Omit<
    SVGAttributes<SVGSVGElement>,
    "role" | "color" | "width" | "height" | "viewBox"
  > {
    variant?: "determinate" | "indeterminate";
    /** 0–100, used by `determinate`. */
    value?: number;
    /** Diameter in px. */
    size?: number;
    /** Stroke width in px. */
    thickness?: number;
    color?: Color;
    "aria-label": string;
  }

  let {
    variant = "indeterminate",
    value = 0,
    size = 40,
    thickness = 4,
    color = "primary",
    "aria-label": ariaLabel,
    class: className = "",
    ...rest
  }: Props = $props();

  const determinate = $derived(variant === "determinate");
  const pct = $derived(Math.min(100, Math.max(0, value)));
  const radius = $derived((size - thickness) / 2);
  const circumference = $derived(2 * Math.PI * radius);
</script>

<svg
  class="circular {className}"
  class:indeterminate={!determinate}
  role="progressbar"
  aria-label={ariaLabel}
  aria-valuemin={determinate ? 0 : undefined}
  aria-valuemax={determinate ? 100 : undefined}
  aria-valuenow={determinate ? Math.round(pct) : undefined}
  data-color={color}
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  style:--circ="{circumference}px"
  {...rest}
>
  <circle
    class="track"
    cx={size / 2}
    cy={size / 2}
    r={radius}
    fill="none"
    stroke-width={thickness}
  />
  <circle
    class="arc"
    cx={size / 2}
    cy={size / 2}
    r={radius}
    fill="none"
    stroke-width={thickness}
    stroke-linecap="round"
    stroke-dasharray={determinate ? circumference : undefined}
    stroke-dashoffset={determinate ? circumference * (1 - pct / 100) : undefined}
  />
</svg>

<style>
  .circular {
    display: inline-block;
    flex: none;
    vertical-align: middle;
    transform: rotate(-90deg);
    filter: drop-shadow(1px 2px 2px color-mix(in oklab, var(--clay-ink), transparent 70%));
  }
  .track {
    stroke: color-mix(in oklab, var(--clay-page), var(--clay-edge) 35%);
  }
  .arc {
    stroke: var(--c);
    transition: stroke-dashoffset var(--clay-time) ease;
  }

  .indeterminate {
    animation: spin 1.4s linear infinite;
  }
  .indeterminate .arc {
    transition: none;
    animation: dash 1.4s ease-in-out infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(-90deg);
    }
    to {
      transform: rotate(270deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dasharray: calc(var(--circ) * 0.1) var(--circ);
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: calc(var(--circ) * 0.7) var(--circ);
      stroke-dashoffset: calc(var(--circ) * -0.15);
    }
    100% {
      stroke-dasharray: calc(var(--circ) * 0.1) var(--circ);
      stroke-dashoffset: calc(var(--circ) * -0.9);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .arc {
      transition: none;
    }
    .indeterminate {
      animation: none;
    }
    .indeterminate .arc {
      animation: none;
      stroke-dasharray: calc(var(--circ) * 0.3) var(--circ);
    }
  }
  @media (forced-colors: active) {
    .arc {
      stroke: Highlight;
    }
    .track {
      stroke: GrayText;
    }
  }
</style>
