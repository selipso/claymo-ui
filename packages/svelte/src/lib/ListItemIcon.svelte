<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Decorative by default (aria-hidden) because the row's text names it; an aria-label or aria-labelledby makes it announced. */
  interface Props extends HTMLAttributes<HTMLSpanElement> {
    children?: Snippet;
  }

  let { class: className = "", children, ...rest }: Props = $props();
  const hidden = $derived(
    rest["aria-hidden"] ?? (rest["aria-label"] || rest["aria-labelledby"] ? undefined : "true"),
  );
</script>

<span {...rest} class={["clay-list-item-icon", className]} aria-hidden={hidden}>
  {@render children?.()}
</span>
