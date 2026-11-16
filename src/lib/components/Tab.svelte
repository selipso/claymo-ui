<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { TabsContext, TabValue } from "./Tabs.svelte";

  interface Props extends Omit<HTMLButtonAttributes, "value" | "role" | "children"> {
    label: string;
    value: TabValue;
    icon?: Snippet;
    disabled?: boolean;
  }

  let {
    label,
    value,
    icon,
    disabled = false,
    class: className = "",
    onclick,
    onkeydown,
    ...rest
  }: Props = $props();

  const ctx = getContext<TabsContext>("clay-tabs");
  if (!ctx) throw new Error("<Tab> must be rendered inside <Tabs>.");

  const selected = $derived(ctx.value === value);

  $effect(() => {
    if (disabled) return;
    return ctx.register(value);
  });

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    (onclick as ((e: typeof event) => void) | undefined)?.(event);
    if (!event.defaultPrevented) ctx.select(event, value);
  }

  // Automatic activation: arrow keys move focus and select.
  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    (onkeydown as ((e: typeof event) => void) | undefined)?.(event);
    if (event.defaultPrevented) return;

    const list = event.currentTarget.closest<HTMLElement>('[role="tablist"]');
    if (!list) return;
    const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)')];
    const index = tabs.indexOf(event.currentTarget);
    if (index < 0) return;

    const rtl = getComputedStyle(list).direction === "rtl";
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = index + (rtl ? -1 : 1);
        break;
      case "ArrowLeft":
        next = index + (rtl ? 1 : -1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const target = tabs[(next + tabs.length) % tabs.length];
    target.focus();
    target.click();
  }
</script>

<button
  type="button"
  role="tab"
  id={ctx.tabId(value)}
  class="clay tab {className}"
  class:selected
  class:full-width={ctx.variant === "fullWidth"}
  data-clay-interactive
  aria-selected={selected}
  aria-controls={ctx.panelId(value)}
  tabindex={ctx.isTabbable(value) ? 0 : -1}
  {disabled}
  {...rest}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  {#if icon}<span class="icon">{@render icon()}</span>{/if}
  <span class="label">{label}</span>
</button>

<style>
  .tab {
    --clay-radius: 18px;
    --clay-d: 5px;
    --clay-color: var(--clay-surface);
    position: relative;
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-sizing: border-box;
    min-height: 48px;
    padding: 0 22px;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: var(--clay-ink-muted);
    font: 600 1rem/1 var(--clay-font);
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  .full-width {
    flex: 1 1 0;
  }
  .icon {
    display: inline-flex;
    align-items: center;
    font-size: 1.25em;
    line-height: 0;
  }

  .tab:not(.selected):is(:hover, :focus-visible):not(:disabled) {
    background: var(--clay-surface);
    box-shadow: var(--clay-raised);
    color: var(--clay-ink);
  }

  /* Selected: pressed well, coloured text and a 4px underline pill. */
  .selected {
    background: var(--clay-page);
    --clay-color: var(--clay-page);
    box-shadow: var(--clay-well);
    color: var(--c-ink);
  }
  .selected:hover:not(:disabled) {
    transform: none;
  }
  .selected::after {
    content: "";
    position: absolute;
    inset-inline: 22%;
    bottom: 5px;
    height: 4px;
    border-radius: 999px;
    background: var(--c);
  }

  @media (forced-colors: active) {
    .selected::after {
      forced-color-adjust: none;
      background: Highlight;
    }
  }
</style>
