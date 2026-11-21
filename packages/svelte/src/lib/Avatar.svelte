<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { avatarDefaults, avatarInitial, type AvatarOptions } from "@claymo/core/display";
  import { watchAvatarImage } from "@claymo/core/behavior/display";

  interface Props extends HTMLAttributes<HTMLSpanElement>, AvatarOptions {
    /** Fallback content (e.g. initials) shown without `src` or when the image fails to load. */
    children?: Snippet;
  }

  let {
    src,
    srcSet,
    sizes,
    alt = avatarDefaults.alt,
    variant = avatarDefaults.variant,
    size = avatarDefaults.size,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const source = $derived(src || srcSet ? { src: src || undefined, srcSet, sizes } : undefined);
  let failedSource = $state.raw<typeof source>();
  const initial = $derived(avatarInitial(alt));

  function watchImage(image: HTMLImageElement) {
    const attemptedSource = source;
    return watchAvatarImage(image, () => (failedSource = attemptedSource));
  }
</script>

<span class="clay clay-avatar {className}" data-variant={variant} data-size={size} {...rest}>
  {#if source && failedSource !== source}
    {#key source}
      <img
        class="clay-avatar__image"
        src={source.src}
        srcset={source.srcSet}
        sizes={source.sizes}
        {alt}
        use:watchImage
      />
    {/key}
  {:else}
    <span
      class="clay-avatar__fallback"
      role={!children && initial ? "img" : undefined}
      aria-label={!children && initial ? alt : undefined}
    >
      {#if children}
        {@render children()}
      {:else if initial}
        {initial}
      {:else}
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path
            d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"
          />
        </svg>
      {/if}
    </span>
  {/if}
</span>
