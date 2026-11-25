<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    title?: string | Snippet;
    subheader?: string | Snippet;
    avatar?: Snippet;
    action?: Snippet;
    disableTypography?: boolean;
  }

  let {
    title,
    subheader,
    avatar,
    action,
    disableTypography = false,
    class: className,
    ...rest
  }: Props = $props();
</script>

{#snippet label(value: string | Snippet)}
  {#if typeof value === "string"}{value}{:else}{@render value()}{/if}
{/snippet}

<div {...rest} class={["clay-card-header", className]}>
  {#if avatar}<div class="clay-card-header__avatar">{@render avatar()}</div>{/if}
  <div class="clay-card-header__text">
    {#if title !== undefined}
      {#if disableTypography}
        {@render label(title)}
      {:else}
        <div class="clay-card-header__title">{@render label(title)}</div>
      {/if}
    {/if}
    {#if subheader !== undefined}
      {#if disableTypography}
        {@render label(subheader)}
      {:else}
        <div class="clay-card-header__subheader">{@render label(subheader)}</div>
      {/if}
    {/if}
  </div>
  {#if action}<div class="clay-card-header__action">{@render action()}</div>{/if}
</div>
