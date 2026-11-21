<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Remove the 8px gap between actions. */
    disableSpacing?: boolean;
    children?: Snippet;
  }

  let { disableSpacing = false, class: className = "", children, ...rest }: Props = $props();
</script>

<div
  class={["clay-card-actions", className]}
  data-no-spacing={disableSpacing ? "" : undefined}
  {...rest}
>
  {@render children?.()}
</div>
