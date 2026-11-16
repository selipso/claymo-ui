<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    primary?: string | Snippet;
    secondary?: string | Snippet;
  }

  let { primary, secondary, class: className = "", ...rest }: Props = $props();
</script>

<div class="list-item-text {className}" {...rest}>
  {#if primary}
    <span class="primary">
      {#if typeof primary === "string"}{primary}{:else}{@render primary()}{/if}
    </span>
  {/if}
  {#if secondary}
    <span class="secondary">
      {#if typeof secondary === "string"}{secondary}{:else}{@render secondary()}{/if}
    </span>
  {/if}
</div>

<style>
  .list-item-text {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
  }
  .primary {
    display: block;
    color: inherit;
    font-size: 1rem;
    line-height: 1.5;
  }
  .secondary {
    display: block;
    color: var(--clay-ink-muted);
    font-size: 0.875rem;
    line-height: 1.43;
  }
</style>
