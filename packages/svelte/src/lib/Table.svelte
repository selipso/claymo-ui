<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { tableDefaults, type TableOptions } from "@claymo/core/display";

  interface Props
    extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "tabindex" | "aria-label">, TableOptions {
    /** Native <thead>, <tbody>, <tr>, <th>, <td>. */
    children?: Snippet;
  }

  let {
    size = tableDefaults.size,
    padding = tableDefaults.padding,
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
  class="clay clay-table {className}"
  data-sticky-header={stickyHeader ? "" : undefined}
  data-size={size}
  data-padding={padding}
  role="region"
  tabindex="0"
  aria-label={label}
  {...rest}
>
  <table class="clay-table__table">
    {@render children?.()}
  </table>
</div>
