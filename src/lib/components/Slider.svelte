<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Color, Size } from "../types";

  type InputEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface Props extends Omit<
    HTMLInputAttributes,
    "color" | "size" | "type" | "value" | "min" | "max" | "step" | "children" | "aria-label" | "id"
  > {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    color?: Color;
    size?: Exclude<Size, "large">;
    valueLabelDisplay?: "off" | "auto" | "on";
    /** Tick marks at every `step`; only drawn when there are at most 20 steps. */
    marks?: boolean;
    id?: string;
    /** Required: a slider has no visible text label of its own. */
    "aria-label": string;
    onChange?: (event: InputEv, value: number) => void;
  }

  let {
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    color = "primary",
    size = "medium",
    valueLabelDisplay = "off",
    marks = false,
    id: idProp,
    onChange,
    oninput,
    class: className = "",
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const id = $derived(idProp ?? `clay-slider-${uid}`);

  const pct = $derived(
    max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0,
  );

  const tickCount = $derived.by(() => {
    if (!marks || !(step > 0) || !(max > min)) return 0;
    const n = Math.round((max - min) / step);
    return n >= 1 && n <= 20 ? n : 0;
  });
  const ticks = $derived(Array.from({ length: tickCount + 1 }, (_, i) => min + i * step));

  function handleInput(event: InputEv) {
    oninput?.(event);
    onChange?.(event, Number(event.currentTarget.value));
  }
</script>

<div
  class="slider-wrap {className}"
  class:disabled
  class:has-bubble={valueLabelDisplay !== "off"}
  class:has-marks={tickCount > 0}
  data-color={color}
  data-size={size}
  data-label={valueLabelDisplay}
  style:--pct={pct}
>
  {#if valueLabelDisplay !== "off"}
    <!-- The range input already exposes its value to assistive tech; the bubble is visual only. -->
    <output class="clay bubble" for={id} aria-hidden="true">{value}</output>
  {/if}
  <input
    type="range"
    class="clay slider"
    {id}
    {min}
    {max}
    {step}
    {disabled}
    bind:value
    oninput={handleInput}
    {...rest}
  />
  {#if tickCount > 0}
    <span class="marks" aria-hidden="true">
      {#each ticks as tick (tick)}
        <span class="tick" class:active={tick <= value}></span>
      {/each}
    </span>
  {/if}
</div>

<style>
  .slider-wrap {
    --thumb: 28px;
    --track: 12px;
    --hit: 44px;
    --pt: 0px;
    --fill: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--pct) / 100);
    position: relative;
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding-top: var(--pt);
  }
  .slider-wrap[data-size="small"] {
    --thumb: 20px;
    --track: 8px;
    --hit: 36px;
  }
  .has-bubble {
    --pt: 30px;
  }
  .has-marks {
    padding-bottom: 12px;
  }

  .slider {
    --clay-color: var(--clay-surface);
    --clay-d: 4px;
    appearance: none;
    -webkit-appearance: none;
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: var(--hit);
    margin: 0;
    padding: 0;
    background: transparent;
    border-radius: 8px;
    box-shadow: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .slider:disabled {
    cursor: not-allowed;
  }

  /* Track: an inset well with a 2px edge ring (ring is a shadow so it does not shift the thumb). */
  .slider::-webkit-slider-runnable-track {
    height: var(--track);
    border: 0;
    border-radius: 999px;
    background:
      linear-gradient(to right, var(--c) var(--fill), transparent var(--fill)), var(--clay-page);
    box-shadow:
      0 0 0 2px var(--clay-edge),
      inset 2px 3px 5px var(--clay-shade),
      inset -2px -2px 4px var(--clay-light);
  }
  .slider::-moz-range-track {
    height: var(--track);
    border: 0;
    border-radius: 999px;
    background: var(--clay-page);
    box-shadow:
      0 0 0 2px var(--clay-edge),
      inset 2px 3px 5px var(--clay-shade),
      inset -2px -2px 4px var(--clay-light);
  }
  .slider::-moz-range-progress {
    height: var(--track);
    border-radius: 999px;
    background: var(--c);
  }

  /* Thumb: 28px clay ball with a coloured ring (ring keeps it visible on the track). */
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    box-sizing: border-box;
    width: var(--thumb);
    height: var(--thumb);
    margin-top: calc((var(--track) - var(--thumb)) / 2);
    border: 3px solid var(--c-ink);
    border-radius: 50%;
    background: var(--clay-color);
    box-shadow: var(--clay-raised);
    transition: transform var(--clay-time) var(--clay-ease);
  }
  .slider::-moz-range-thumb {
    box-sizing: border-box;
    width: var(--thumb);
    height: var(--thumb);
    border: 3px solid var(--c-ink);
    border-radius: 50%;
    background: var(--clay-color);
    box-shadow: var(--clay-raised);
    transition: transform var(--clay-time) var(--clay-ease);
  }
  .slider:not(:disabled):active::-webkit-slider-thumb {
    transform: scale(0.94);
    box-shadow: var(--clay-pressed);
  }
  .slider:not(:disabled):active::-moz-range-thumb {
    transform: scale(0.94);
    box-shadow: var(--clay-pressed);
  }

  /* Value bubble, centred over the thumb. */
  .bubble {
    --clay-color: var(--c);
    --clay-d: 3px;
    --clay-radius: 10px;
    position: absolute;
    top: 0;
    left: var(--fill);
    box-sizing: border-box;
    min-width: 32px;
    height: 28px;
    padding: 0 8px;
    color: var(--c-on);
    font: 600 0.875rem/28px var(--clay-font);
    text-align: center;
    white-space: nowrap;
    opacity: 0;
    transform: translate(-50%, 6px) scale(0.8);
    transition:
      opacity 150ms ease,
      transform var(--clay-time) var(--clay-ease);
    pointer-events: none;
  }
  .slider-wrap[data-label="on"] .bubble,
  .slider-wrap[data-label="auto"]:is(:hover, :focus-within, :has(.slider:active)) .bubble {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
  .disabled[data-label="on"] .bubble,
  .disabled[data-label="auto"]:is(:hover, :focus-within) .bubble {
    opacity: 0.55;
  }

  /* Tick marks sit just under the track; first/last ticks line up with the thumb centre extremes. */
  .marks {
    position: absolute;
    left: calc(var(--thumb) / 2);
    right: calc(var(--thumb) / 2);
    top: calc(var(--pt) + var(--hit) / 2 + var(--thumb) / 2 + 4px);
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }
  .tick {
    width: 2px;
    height: 6px;
    margin-inline: -1px;
    border-radius: 1px;
    background: var(--clay-edge);
  }
  .tick.active {
    background: var(--c-ink);
  }
  .disabled .marks {
    opacity: 0.55;
  }

  @media (prefers-reduced-motion: reduce) {
    .bubble,
    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb {
      transition: none;
    }
    .slider:active::-webkit-slider-thumb,
    .slider:active::-moz-range-thumb {
      transform: none;
    }
    .bubble {
      transform: translate(-50%, 0);
    }
  }
</style>
