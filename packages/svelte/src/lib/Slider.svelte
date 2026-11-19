<script lang="ts">
  import { onMount } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Color, Size } from "@claymo/core";
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
  }

  let {
    value = $bindable(),
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
    class: className = "",
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const id = $derived(idProp ?? `clay-slider-${uid}`);

  const resetValue = $derived(sliderValue(defaultValue ?? min, min, max, step));
  const currentValue = $derived(
    value === undefined ? resetValue : sliderValue(value, min, max, step),
  );
  const pct = $derived(sliderPercent(currentValue, min, max));
  const ticks = $derived(marks ? sliderMarks(min, max, step) : []);

  onMount(() => {
    value ??= currentValue;
  });

  function handleInput(event: InputEv) {
    oninput?.(event);
    onChange?.(event, Number(event.currentTarget.value));
  }
</script>

<div
  class={["clay-slider", className]}
  data-disabled={disabled || undefined}
  data-has-label={valueLabelDisplay !== "off" || undefined}
  data-has-marks={ticks.length > 0 || undefined}
  data-color={color}
  data-size={size}
  data-label={valueLabelDisplay}
  style:--clay-slider-percent={pct}
>
  {#if valueLabelDisplay !== "off"}
    <!-- The range input already exposes its value to assistive tech; the bubble is visual only. -->
    <span class="clay clay-slider__bubble" aria-hidden="true">{currentValue}</span>
  {/if}
  <input
    type="range"
    class="clay clay-slider__input"
    {id}
    {min}
    {max}
    {step}
    {disabled}
    defaultValue={resetValue}
    bind:value={() => currentValue, (next) => (value = next)}
    oninput={handleInput}
    {...rest}
  />
  {#if ticks.length > 0}
    <span class="clay-slider__marks" aria-hidden="true">
      {#each ticks as tick (tick)}
        <span
          class="clay-slider__tick"
          data-value={tick}
          data-active={tick <= currentValue || undefined}
          style:--clay-slider-tick={`${sliderPercent(tick, min, max)}%`}
        ></span>
      {/each}
    </span>
  {/if}
</div>
