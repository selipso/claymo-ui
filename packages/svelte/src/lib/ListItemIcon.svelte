<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Decorative by default (aria-hidden) because the row's text names it; an aria-label makes it announced. */
  interface Props extends HTMLAttributes<HTMLSpanElement> {
    children?: Snippet;
  }

  let { class: className = "", children, ...rest }: Props = $props();
  const hidden = $derived(rest["aria-hidden"] ?? (rest["aria-label"] ? undefined : "true"));
</script>

<span class={["clay-list-item-icon", className]} {...rest} aria-hidden={hidden}>
  {@render children?.()}
</span>
