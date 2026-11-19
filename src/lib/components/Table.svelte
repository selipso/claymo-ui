<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "tabindex" | "aria-label"> {
    size?: "small" | "medium";
    /** Pins the header row while the wrapper scrolls; give the wrapper a max-height (via `class`/`style`). */
    stickyHeader?: boolean;
    /** Required accessible name for the scrollable region (MUI has no equivalent). */
    label: string;
    /** Native <thead>, <tbody>, <tr>, <th>, <td>. */
    children?: Snippet;
  }

  let {
    size = "medium",
    stickyHeader = false,
    label,
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<!--
  The wrapper scrolls horizontally, so it must be keyboard focusable
  (WCAG 2.1.1) and named; role=region + tabindex=0 is the intended pattern.
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="clay scroll {className}"
  class:sticky={stickyHeader}
  data-size={size}
  role="region"
  tabindex="0"
  aria-label={label}
  {...rest}
>
  <table>
    {@render children?.()}
  </table>
</div>

<style>
  .scroll {
    --clay-color: var(--clay-page);
    --clay-d: 5px;
    --clay-radius: 24px;
    --cell-y: 14px;
    --cell-x: 16px;
    box-sizing: border-box;
    max-width: 100%;
    overflow: auto;
    box-shadow: var(--clay-well);
    color: var(--clay-ink);
  }
  .scroll[data-size="small"] {
    --cell-y: 8px;
    --cell-x: 12px;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 1rem;
  }
  .scroll[data-size="small"] table {
    font-size: 0.875rem;
  }

  .scroll :global(th),
  .scroll :global(td) {
    padding: var(--cell-y) var(--cell-x);
    text-align: start;
    vertical-align: middle;
  }
  .scroll :global(th) {
    color: var(--clay-ink-muted);
    font-weight: 600;
  }
  .scroll :global(tbody th) {
    color: inherit;
  }

  /* Use cell borders so the divider moves with a sticky header. */
  .scroll :global(tr:not(:last-child) > :is(th, td)),
  .scroll :global(:is(thead, tbody, tfoot):not(:last-child) > tr:last-child > :is(th, td)) {
    border-block-end: var(--clay-border-width) solid var(--clay-edge);
  }
  .scroll :global(tbody tr:hover > *) {
    background-color: var(--clay-surface);
  }

  .sticky :global(thead th) {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--clay-page);
  }
</style>
