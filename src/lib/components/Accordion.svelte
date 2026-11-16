<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLDetailsAttributes } from "svelte/elements";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";

  interface Props extends Omit<HTMLDetailsAttributes, "open" | "bind:open"> {
    /** Two-way: kept in sync with the native `toggle` event. */
    expanded?: boolean;
    disabled?: boolean;
    /** Contents of the always-visible <summary> row. */
    summary: Snippet;
    /** Called when the user (not the parent) opens or closes the panel. */
    onChange?: (event: Event, expanded: boolean) => void;
    children?: Snippet;
  }

  let {
    expanded = $bindable(false),
    disabled = false,
    summary,
    onChange,
    ontoggle,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  function handleToggle(event: Event & { currentTarget: HTMLDetailsElement }) {
    const open = event.currentTarget.open;
    // A programmatic change of `expanded` also fires `toggle`; only react to real differences.
    if (open !== expanded) {
      expanded = open;
      onChange?.(event, open);
    }
    (ontoggle as ((e: Event) => void) | null | undefined)?.(event);
  }

  function blockWhenDisabled(event: MouseEvent) {
    if (disabled) event.preventDefault();
  }
</script>

<details class="accordion {className}" open={expanded} ontoggle={handleToggle} {...rest}>
  <!--
    Enter/Space on a <summary> synthesise a click, so a click handler covers the keyboard too.
  -->
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <summary
    class="clay head"
    data-clay-interactive
    data-disabled={disabled || undefined}
    aria-disabled={disabled ? "true" : undefined}
    onclick={blockWhenDisabled}
  >
    <span class="title">{@render summary()}</span>
    <span class="chevron" aria-hidden="true"><ChevronDown size={20} strokeWidth={2.5} /></span>
  </summary>
  <div class="clay content">
    {@render children?.()}
  </div>
</details>

<style>
  .accordion {
    box-sizing: border-box;
    width: 100%;
    color: var(--clay-ink);
  }
  .head {
    --clay-radius: 24px;
    --clay-d: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-sizing: border-box;
    min-height: 56px;
    padding: 8px 20px;
    font-weight: 600;
    list-style: none;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .head::-webkit-details-marker { display: none; }
  .title { flex: 1 1 auto; min-width: 0; }
  .chevron {
    display: inline-flex;
    flex: none;
    line-height: 0;
    transition: transform var(--clay-time) var(--clay-ease);
  }
  .accordion[open] > .head .chevron { transform: rotate(180deg); }

  .content {
    --clay-color: var(--clay-page);
    --clay-radius: 20px;
    --clay-d: 5px;
    box-sizing: border-box;
    margin-top: 12px;
    padding: 16px 20px;
    box-shadow: var(--clay-well);
  }

  /* the panel still reports its state through the rotated chevron; only the turn animation goes */
  @media (prefers-reduced-motion: reduce) {
    .chevron { transition: none; }
  }
</style>
