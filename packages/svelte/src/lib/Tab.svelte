<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { tabRecipe, type TabValue } from "@claymo/core";
  import type { MotionPreset } from "@claymo/core";
  import { moveTabFocus } from "@claymo/core/behavior/tabs";
  import type { TabsContext } from "./Tabs.svelte";

  interface Props extends Omit<HTMLButtonAttributes, "value" | "role" | "children"> {
    label: string;
    value: TabValue;
    icon?: Snippet;
    disabled?: boolean;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
  }

  let {
    label,
    value,
    icon,
    disabled = false,
    motion,
    class: className,
    onclick,
    onkeydown,
    ...rest
  }: Props = $props();

  const ctx = getContext<TabsContext>("clay-tabs");
  if (!ctx) throw new Error("<Tab> must be rendered inside <Tabs>.");

  const recipe = $derived(
    tabRecipe({ value, selected: ctx.value, enabled: ctx.enabled, ids: ctx.ids }),
  );

  $effect(() => {
    if (disabled) return;
    return ctx.register(value);
  });

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    (onclick as ((e: typeof event) => void) | undefined)?.(event);
    if (!event.defaultPrevented) ctx.select(event, value);
  }

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) {
    (onkeydown as ((e: typeof event) => void) | undefined)?.(event);
    if (!event.defaultPrevented) moveTabFocus(event, event.currentTarget);
  }
</script>

<button
  {...recipe.attrs}
  class={[recipe.className, className]}
  data-motion={motion}
  {disabled}
  {...rest}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  {#if icon}<span class="clay-tab__icon">{@render icon()}</span>{/if}
  <span class="clay-tab__label">{label}</span>
</button>
