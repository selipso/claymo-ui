<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    selected?: boolean;
    disabled?: boolean;
    /** Renders an <a>; a selected link row gets aria-current="page". */
    href?: string;
    children?: Snippet;
  }

  let {
    selected = false,
    disabled = false,
    href,
    type = "button",
    class: className = "",
    children,
    onclick,
    ...rest
  }: Props = $props();

  const tag = $derived(href ? "a" : "button");

  function handleClick(event: MouseEvent) {
    if (disabled) {
      event.preventDefault();
      return;
    }
    (onclick as ((e: MouseEvent) => void) | undefined)?.(event);
  }
</script>

<svelte:element
  this={tag}
  class="clay item {className}"
  class:selected
  data-clay-interactive
  href={href && !disabled ? href : undefined}
  type={href ? undefined : type}
  disabled={!href && disabled ? true : undefined}
  aria-disabled={href && disabled ? "true" : undefined}
  aria-current={selected ? (href ? "page" : "true") : undefined}
  tabindex={href && disabled ? -1 : undefined}
  onclick={handleClick}
  {...rest}
>
  {@render children?.()}
</svelte:element>

<style>
  .item {
    --clay-color: var(--clay-surface);
    --clay-radius: 18px;
    --clay-d: 4px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    min-height: var(--list-min, 48px);
    padding: 6px 16px;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: var(--clay-ink);
    font: inherit;
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .item:is(:hover, :focus-visible):not(:disabled, [aria-disabled="true"]) {
    background: var(--clay-color);
    box-shadow: var(--clay-raised);
  }
  .item.selected,
  .item.selected:is(:hover, :focus-visible):not(:disabled, [aria-disabled="true"]) {
    background: var(--clay-color);
    box-shadow: var(--clay-well);
  }
  .item.selected { font-weight: 600; }
</style>
