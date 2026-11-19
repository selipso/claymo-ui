import { afterFormReset } from "./form.ts";
import { upgrader } from "./upgrade.ts";

/**
 * Controlled mixed state (the parent owns it, like MUI). The browser clears `indeterminate` on click;
 * restore whatever `read()` says once the parent's change handlers and state updates have run
 * (before the next paint). Returns a detach function.
 */
export function bindIndeterminate(input: HTMLInputElement, read: () => boolean): () => void {
  const apply = () => (input.indeterminate = read());
  const afterChange = () => requestAnimationFrame(apply);
  apply();
  input.addEventListener("change", afterChange);
  // `indeterminate` is a DOM property with no attribute, and form reset ignores it: re-apply.
  const detachReset = afterFormReset(input, apply);
  return () => {
    input.removeEventListener("change", afterChange);
    detachReset();
  };
}

/**
 * Uncontrolled mixed state for server-rendered checkboxes: `data-clay-indeterminate` sets the
 * initial (and post-reset) state; a user click clears it natively.
 */
export function attachIndeterminate(input: HTMLInputElement): () => void {
  const apply = () => (input.indeterminate = true);
  apply();
  return afterFormReset(input, apply);
}

export const upgradeCheckboxes = upgrader<HTMLInputElement>(
  "input[data-clay-indeterminate]",
  attachIndeterminate,
);
