<script module lang="ts">
  import type { TabIds, TabValue, TabsVariant } from "@claymo/core";

  /** Shared by Tabs, Tab and TabPanel through `setContext("clay-tabs", …)`. */
  export interface TabsContext {
    readonly value: TabValue | undefined;
    readonly ids: TabIds;
    /** Enabled tabs in registration order, for the roving-tabindex fallback. */
    readonly enabled: readonly TabValue[];
    select(event: Event, value: TabValue): void;
    /** Enabled tabs register; returns an unregister function. */
    register(value: TabValue): () => void;
  }
</script>

<script lang="ts">
  import { setContext, untrack, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { tabIds, tabListRecipe } from "@claymo/core";
  import type { MotionPreset } from "@claymo/core";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "onchange"> {
    value?: TabValue;
    onChange?: (event: Event, value: TabValue) => void;
    variant?: TabsVariant;
    "aria-label": string;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    /** The `Tab` elements (rendered inside the tablist). */
    children?: Snippet;
    /** `TabPanel` elements, rendered after the tablist so they are not inside `role="tablist"`. */
    panels?: Snippet;
  }

  let {
    value = $bindable(),
    onChange,
    variant,
    motion,
    "aria-label": label,
    class: className,
    children,
    panels,
    ...rest
  }: Props = $props();

  // $props.id() is SSR-stable, so ids match between server HTML and hydration.
  const uid = $props.id();
  const ids = tabIds(uid);
  const list = $derived(tabListRecipe({ variant, label }));
  let enabled = $state<TabValue[]>([]);

  setContext<TabsContext>("clay-tabs", {
    get value() {
      return value;
    },
    get enabled() {
      return enabled;
    },
    ids,
    // User request only: parent-driven `value` updates never call onChange.
    select(event, next) {
      if (next === value) return;
      value = next;
      onChange?.(event, next);
    },
    register(own) {
      untrack(() => enabled.push(own));
      return () =>
        untrack(() => {
          const i = enabled.indexOf(own);
          if (i >= 0) enabled.splice(i, 1);
        });
    },
  });
</script>

<div class={["clay-tabs", className]} data-motion={motion} {...rest}>
  <div class={list.className} {...list.attrs}>
    {@render children?.()}
  </div>
  {@render panels?.()}
</div>
