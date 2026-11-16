<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";
  import type { Color, Size } from "../types";

  /*
   * Button.svelte is read-only for this slice, so it cannot read a Svelte
   * context. Instead the group restyles its child `.btn` elements through
   * scoped :global() selectors and re-points their --c/--c-on/--c-ink
   * variables, so `variant`, `color` and `size` set on the group win over
   * whatever the child Buttons were given.
   *
   * Rendered as a <fieldset> (implicit role="group"): `disabled` then disables
   * every descendant button natively, with no per-child plumbing.
   */
  interface Props extends Omit<HTMLFieldsetAttributes, "color" | "disabled"> {
    variant?: "contained" | "outlined" | "text";
    color?: Color;
    size?: Size;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    fullWidth?: boolean;
    children?: Snippet;
  }

  let {
    variant = "contained",
    color = "primary",
    size = "medium",
    orientation = "horizontal",
    disabled = false,
    fullWidth = false,
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<fieldset
  class="clay group {variant} {orientation} {className}"
  class:full-width={fullWidth}
  data-color={color}
  data-size={size}
  {disabled}
  {...rest}
>
  {@render children?.()}
</fieldset>

<style>
  .group {
    --g-c: var(--c);
    --g-on: var(--c-on);
    --g-ink: var(--c-ink);
    --g-r: 22px;
    --g-ri: var(--g-r);
    --clay-d: 6px;
    --clay-radius: var(--g-r);
    display: inline-flex;
    box-sizing: border-box;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    vertical-align: middle;
  }
  .group[data-size="small"] {
    --g-r: 14px;
    --clay-d: 4px;
  }
  .group[data-size="large"] {
    --g-r: 26px;
    --clay-d: 8px;
  }
  .vertical {
    flex-direction: column;
  }
  .full-width {
    display: flex;
    width: 100%;
  }
  /* children dim themselves when disabled; do not dim the group a second time */
  .group:disabled {
    opacity: 1;
    cursor: auto;
  }

  .contained {
    --clay-color: var(--g-c);
    color: var(--g-on);
  }
  .contained[data-color="inherit"] {
    --clay-color: var(--clay-surface);
    color: inherit;
  }
  .outlined {
    --clay-color: var(--clay-surface);
    --g-ri: calc(var(--g-r) - 2px);
    color: var(--g-ink);
    border: 2px solid var(--g-ink);
  }
  .text {
    background: transparent;
    box-shadow: none;
    color: var(--g-ink);
  }

  /* ---- child Buttons: no own shadow or radius, shared colour/size ---- */
  .group :global(.btn.btn) {
    --c: var(--g-c);
    --c-on: var(--g-on);
    --c-ink: var(--g-ink);
    min-height: 48px;
    padding: 0 28px;
    font-size: 1rem;
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    transform: none;
    color: var(--g-on);
  }
  .group[data-size="small"] :global(.btn.btn) {
    min-height: 36px;
    padding: 0 16px;
    font-size: 0.875rem;
  }
  .group[data-size="large"] :global(.btn.btn) {
    min-height: 56px;
    padding: 0 36px;
    font-size: 1.125rem;
  }
  .full-width :global(.btn.btn) {
    flex: 1 1 0;
    min-width: 0;
  }
  .contained :global(.btn.btn) {
    --clay-color: var(--g-c);
    color: var(--g-on);
  }
  .outlined :global(.btn.btn),
  .text :global(.btn.btn) {
    --clay-color: var(--clay-surface);
    color: var(--g-ink);
  }
  .contained[data-color="inherit"] :global(.btn.btn) {
    --clay-color: var(--clay-surface);
    color: inherit;
  }

  /* ends follow the shared pill; middle children stay square */
  .horizontal :global(.btn.btn:first-child) {
    border-start-start-radius: var(--g-ri);
    border-end-start-radius: var(--g-ri);
  }
  .horizontal :global(.btn.btn:last-child) {
    border-start-end-radius: var(--g-ri);
    border-end-end-radius: var(--g-ri);
  }
  .vertical :global(.btn.btn:first-child) {
    border-start-start-radius: var(--g-ri);
    border-start-end-radius: var(--g-ri);
  }
  .vertical :global(.btn.btn:last-child) {
    border-end-start-radius: var(--g-ri);
    border-end-end-radius: var(--g-ri);
  }

  /* 2px dividers between children */
  .horizontal :global(.btn.btn:not(:first-child)) {
    border-inline-start: 2px solid var(--clay-edge);
  }
  .vertical :global(.btn.btn:not(:first-child)) {
    border-block-start: 2px solid var(--clay-edge);
  }

  /* states: tint on hover, inset on press, focus ring above neighbours */
  .contained :global(.btn.btn:is(:hover, :focus-visible):not(:disabled, [aria-disabled="true"])) {
    background: color-mix(in oklab, var(--clay-color), var(--g-on) 14%);
    box-shadow: none;
    transform: none;
  }
  .outlined :global(.btn.btn:is(:hover, :focus-visible):not(:disabled, [aria-disabled="true"])),
  .text :global(.btn.btn:is(:hover, :focus-visible):not(:disabled, [aria-disabled="true"])) {
    background: color-mix(in oklab, var(--clay-surface), var(--g-ink) 10%);
    box-shadow: none;
    transform: none;
  }
  .group :global(.btn.btn:active:not(:disabled, [aria-disabled="true"])) {
    box-shadow: inset 2px 3px 8px var(--clay-shade);
    transform: none;
  }
  .group :global(.btn.btn:focus-visible) {
    z-index: 1;
  }
</style>
