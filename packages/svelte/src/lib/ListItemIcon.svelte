<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    children?: Snippet;
  }

  let { class: className = "", children, ...rest }: Props = $props();
</script>

<span class={["clay-list-item-icon", className]} {...rest}>
  {@render children?.()}
</span>
