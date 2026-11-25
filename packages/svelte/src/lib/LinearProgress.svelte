<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import {
    linearProgress,
    progressDefaults,
    type LinearProgressOptions,
  } from "@claymo/core/display";

  interface Props
    extends
      Omit<
        HTMLAttributes<HTMLDivElement>,
        | keyof LinearProgressOptions
        | "role"
        | "aria-valuemin"
        | "aria-valuemax"
        | "aria-valuenow"
        | "children"
      >,
      LinearProgressOptions {
    "aria-label": string;
  }

  let {
    variant = progressDefaults.variant,
    min,
    max,
    value,
    valueBuffer,
    color = progressDefaults.color,
    "aria-label": ariaLabel,
    class: className = "",
    ...rest
  }: Props = $props();

  const progress = $derived(linearProgress({ variant, min, max, value, valueBuffer }));
</script>

<div
  {...rest}
  class={["clay clay-linear-progress", className]}
  data-variant={variant}
  role="progressbar"
  aria-label={ariaLabel}
  aria-valuemin={progress.range?.min}
  aria-valuemax={progress.range?.max}
  aria-valuenow={progress.range?.now}
  data-color={color}
>
  {#if progress.buffer !== undefined}
    <div
      class="clay-linear-progress__buffer"
      style:--clay-linear-progress-fraction={progress.buffer}
    ></div>
  {/if}
  <div
    class="clay clay-linear-progress__bar"
    data-empty={progress.range?.fraction === 0 ? "" : undefined}
    style:--clay-linear-progress-fraction={progress.range?.fraction}
  ></div>
</div>
