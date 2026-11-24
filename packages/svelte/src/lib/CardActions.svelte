<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Remove the 12px gap between actions. */
    disableSpacing?: boolean;
    children?: Snippet;
  }

  let { disableSpacing = false, class: className = "", children, ...rest }: Props = $props();
</script>

<div
  {...rest}
  class={["clay-card-actions", className]}
  data-no-spacing={disableSpacing ? "" : undefined}
>
  {@render children?.()}
</div>
