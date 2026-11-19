<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import {
    actionIconAttrs,
    closeIconPath,
    isChipDeleteKey,
    type ChipSize,
    type ChipVariant,
  } from "@claymo/core/actions";
  import type { Color } from "@claymo/core";

  /*
   * A <button> cannot contain another <button>, so the chip root is a <span>
   * holding sibling controls: the main body (a <button> when clickable or when
   * `onclick` is given, else a <span>) and, when `onDelete` is set, a separate
   * remove <button aria-label="Remove {label}">. `onclick` goes to the body.
   */
  interface Props extends Omit<HTMLAttributes<HTMLElement>, "color"> {
    label: string;
    variant?: ChipVariant;
    color?: Color;
    size?: ChipSize;
    icon?: Snippet;
    avatar?: Snippet;
    deleteIcon?: Snippet;
    onDelete?: (event: MouseEvent | KeyboardEvent) => void;
    clickable?: boolean;
    disabled?: boolean;
  }

  let {
    label,
    variant = "filled",
    color = "default",
    size = "medium",
    icon,
    avatar,
    deleteIcon,
    onDelete,
    clickable = false,
    disabled = false,
    class: className = "",
    onclick,
    ...rest
  }: Props = $props();

  const interactive = $derived(clickable || !!onclick);

  function onBodyKeydown(event: KeyboardEvent) {
    if (disabled || !onDelete) return;
    if (isChipDeleteKey(event.key)) {
      event.preventDefault();
      onDelete(event);
    }
  }
  function onRemoveClick(event: MouseEvent) {
    if (disabled) return;
    onDelete?.(event);
  }
</script>

{#snippet bodyContent()}
  {#if avatar}<span class="clay-chip__lead clay-chip__avatar">{@render avatar()}</span>{/if}
  {#if icon}<span class="clay-chip__lead clay-chip__icon">{@render icon()}</span>{/if}
  <span class="clay-chip__label">{label}</span>
{/snippet}

<span
  class={["clay clay-chip", className]}
  data-variant={variant}
  data-deletable={onDelete ? "" : undefined}
  data-color={color}
  data-size={size}
  data-clay-interactive={interactive ? "" : undefined}
  data-disabled={disabled ? "" : undefined}
  {...rest}
>
  {#if interactive}
    <button
      type="button"
      class="clay-chip__body"
      {disabled}
      onclick={onclick as ((e: MouseEvent) => void) | undefined}
      onkeydown={onBodyKeydown}
    >
      {@render bodyContent()}
    </button>
  {:else}
    <span class="clay-chip__body">
      {@render bodyContent()}
    </span>
  {/if}
  {#if onDelete}
    <button
      type="button"
      class="clay-chip__remove"
      aria-label="Remove {label}"
      {disabled}
      onclick={onRemoveClick}
      onkeydown={onBodyKeydown}
    >
      {#if deleteIcon}
        {@render deleteIcon()}
      {:else}
        <svg {...actionIconAttrs} width="14" height="14" stroke-width="2.5">
          <path d={closeIconPath} />
        </svg>
      {/if}
    </button>
  {/if}
</span>
