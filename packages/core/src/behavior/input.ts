import { sliderPercent } from "../input.ts";
import { afterFormReset } from "./form.ts";
import { disposableUpgrader } from "./upgrade.ts";

export * from "./autocomplete.ts";
export { afterFormReset };

export const upgradeSliders = disposableUpgrader<HTMLElement>("[data-clay-slider]", (root) => {
  const input = root.querySelector<HTMLInputElement>(".clay-slider__input");
  if (!input) return;
  const label = root.querySelector(".clay-slider__bubble");
  const ticks = root.querySelectorAll<HTMLElement>(".clay-slider__tick");

  const sync = () => {
    const value = input.valueAsNumber;
    const percent = sliderPercent(value, Number(input.min), Number(input.max));
    root.style.setProperty("--clay-slider-percent", String(percent));
    if (label && label.textContent !== input.value) label.textContent = input.value;
    for (const tick of ticks)
      tick.toggleAttribute("data-active", Number(tick.dataset.value) <= value);
  };

  input.addEventListener("input", sync);
  input.addEventListener("change", sync);
  const detachReset = afterFormReset(input, sync);
  sync();
  return () => {
    input.removeEventListener("input", sync);
    input.removeEventListener("change", sync);
    detachReset();
  };
});
