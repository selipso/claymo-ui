<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Color, MotionPreset, Size } from "@claymo/core";
  import { afterFormReset } from "@claymo/core/behavior/input";
  import { sliderMarks, sliderPercent, sliderValue } from "@claymo/core/input";

  type InputEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface Props extends Omit<
    HTMLInputAttributes,
    "color" | "size" | "type" | "value" | "min" | "max" | "step" | "children" | "aria-label" | "id"
  > {
    value?: number;
    defaultValue?: number;
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
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
  }

  let {
    value,
    defaultValue,
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
    motion,
    class: className = "",
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const id = $derived(idProp ?? `clay-slider-${uid}`);

  const initialDefault = untrack(() => defaultValue ?? min);
  let localValue = $state(untrack(() => sliderValue(initialDefault, min, max, step)));
  const currentValue = $derived(sliderValue(value ?? localValue, min, max, step));
  const resetValue = $derived(sliderValue(value ?? initialDefault, min, max, step));
  const pct = $derived(sliderPercent(currentValue, min, max));
  const ticks = $derived(marks ? sliderMarks(min, max, step) : []);
  let input = $state<HTMLInputElement>();

  $effect(() => {
    if (input && input.value !== String(currentValue)) input.value = String(currentValue);
  });

  onMount(() => {
    if (!input) return;
    return afterFormReset(input, () => {
      if (value === undefined) localValue = sliderValue(initialDefault, min, max, step);
      if (input) input.value = String(currentValue);
    });
  });

  function handleInput(event: InputEv) {
    const next = Number(event.currentTarget.value);
    if (value === undefined) localValue = next;
    oninput?.(event);
    onChange?.(event, next);
    if (value !== undefined) {
      queueMicrotask(() => {
        if (input && input.value !== String(currentValue)) input.value = String(currentValue);
      });
    }
  }
</script>

<div
  class={["clay-slider", className]}
  data-disabled={disabled ? "" : undefined}
  data-has-label={valueLabelDisplay !== "off" ? "" : undefined}
  data-has-marks={ticks.length > 0 ? "" : undefined}
  data-color={color}
  data-size={size}
  data-label={valueLabelDisplay}
  data-motion={motion}
  style:--clay-slider-percent={pct}
>
  {#if valueLabelDisplay !== "off"}
    <!-- The range input already exposes its value to assistive tech; the bubble is visual only. -->
    <span class="clay clay-slider__bubble" aria-hidden="true">{currentValue}</span>
  {/if}
  <input
    {...rest}
    bind:this={input}
    type="range"
    class="clay clay-slider__input"
    {id}
    {min}
    {max}
    {step}
    {disabled}
    defaultValue={resetValue}
    value={currentValue}
    oninput={handleInput}
  />
  {#if ticks.length > 0}
    <span class="clay-slider__marks" aria-hidden="true">
      {#each ticks as tick (tick)}
        <span
          class="clay-slider__tick"
          data-value={tick}
          data-active={tick <= currentValue ? "" : undefined}
          style:--clay-slider-tick={`${sliderPercent(tick, min, max)}%`}
        ></span>
      {/each}
    </span>
  {/if}
</div>
