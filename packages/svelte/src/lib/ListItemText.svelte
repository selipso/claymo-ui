<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    primary?: string | Snippet;
    secondary?: string | Snippet;
    children?: Snippet;
  }

  let { primary, secondary, children, class: className = "", ...rest }: Props = $props();
</script>

<span class={["clay-list-item-text", className]} {...rest}>
  {#if primary || children}
    <span class="clay-list-item-text__primary">
      {#if primary}
        {#if typeof primary === "string"}{primary}{:else}{@render primary()}{/if}
      {:else}
        {@render children?.()}
      {/if}
    </span>
  {/if}
  {#if secondary}
    <span class="clay-list-item-text__secondary">
      {#if typeof secondary === "string"}{secondary}{:else}{@render secondary()}{/if}
    </span>
  {/if}
</span>
