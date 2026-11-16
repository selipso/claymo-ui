<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    title: string;
    subheader?: string;
    avatar?: Snippet;
    action?: Snippet;
  }

  let { title, subheader, avatar, action, class: className = "", ...rest }: Props = $props();
</script>

<div class="card-header {className}" {...rest}>
  {#if avatar}<div class="avatar">{@render avatar()}</div>{/if}
  <div class="text">
    <span class="title">{title}</span>
    {#if subheader}<span class="subheader">{subheader}</span>{/if}
  </div>
  {#if action}<div class="action">{@render action()}</div>{/if}
</div>

<style>
  .card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    padding: 24px 24px 0;
  }
  .avatar,
  .action {
    display: flex;
    flex: none;
    align-items: center;
  }
  .text {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
  }
  .title {
    font: 600 1.25rem/1.3 var(--clay-font);
    color: var(--clay-ink);
  }
  .subheader {
    font: 400 0.9375rem/1.4 var(--clay-font);
    color: var(--clay-ink-muted);
  }
</style>
