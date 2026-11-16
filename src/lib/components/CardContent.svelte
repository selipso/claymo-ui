<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet;
  }

  let { class: className = "", children, ...rest }: Props = $props();
</script>

<div class="card-content {className}" {...rest}>
  {@render children?.()}
</div>

<style>
  .card-content {
    box-sizing: border-box;
    padding: 24px;
  }
</style>
