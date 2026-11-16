<script module lang="ts">
  export type TabValue = string | number;

  /** Shared by Tabs, Tab and TabPanel through `setContext("clay-tabs", …)`. */
  export interface TabsContext {
    readonly value: TabValue | undefined;
    readonly variant: "standard" | "fullWidth";
    /** Roving tabindex: the selected tab, or the first enabled tab when nothing matches `value`. */
    isTabbable(value: TabValue): boolean;
    select(event: Event, value: TabValue): void;
    tabId(value: TabValue): string;
    panelId(value: TabValue): string;
    /** Enabled tabs register so the roving tabindex has a fallback; returns an unregister function. */
    register(value: TabValue): () => void;
  }
</script>

<script lang="ts">
  import { setContext, untrack, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "onchange"> {
    value?: TabValue;
    onChange?: (event: Event, value: TabValue) => void;
    variant?: "standard" | "fullWidth";
    "aria-label": string;
    /** The `Tab` elements (rendered inside the tablist). */
    children?: Snippet;
    /** `TabPanel` elements, rendered after the tablist so they are not inside `role="tablist"`. */
    panels?: Snippet;
  }

  let {
    value = $bindable(),
    onChange,
    variant = "standard",
    "aria-label": ariaLabel,
    class: className = "",
    children,
    panels,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const slug = (v: TabValue) => String(v).replace(/\s+/g, "-");
  let registered = $state<TabValue[]>([]);

  setContext<TabsContext>("clay-tabs", {
    get value() {
      return value;
    },
    get variant() {
      return variant;
    },
    isTabbable: (v) => value === v || (!registered.includes(value as TabValue) && registered[0] === v),
    select(event, v) {
      if (v === value) return;
      value = v;
      onChange?.(event, v);
    },
    tabId: (v) => `${uid}-tab-${slug(v)}`,
    panelId: (v) => `${uid}-panel-${slug(v)}`,
    register(v) {
      untrack(() => registered.push(v));
      return () =>
        untrack(() => {
          const i = registered.indexOf(v);
          if (i >= 0) registered.splice(i, 1);
        });
    },
  });
</script>

<div class="tabs-root {className}" {...rest}>
  <div
    class="tabs"
    class:full-width={variant === "fullWidth"}
    role="tablist"
    aria-label={ariaLabel}
    aria-orientation="horizontal"
    data-color="primary"
  >
    {@render children?.()}
  </div>
  {@render panels?.()}
</div>

<style>
  .tabs {
    display: flex;
    gap: 8px;
    box-sizing: border-box;
    /* Room for the 3px focus ring + 3px offset and the clay shadows, which an overflow container would clip. */
    padding: 10px 12px 14px;
    overflow-x: auto;
  }
  .full-width {
    width: 100%;
  }
</style>
