<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import type { HTMLDetailsAttributes } from "svelte/elements";
  import type { MotionPreset } from "@claymo/core";
  import { accordionRecipe, type AccordionOptions } from "@claymo/core/surfaces";
  import { attachAccordion } from "@claymo/core/behavior/surfaces";

  interface Props extends Omit<HTMLDetailsAttributes, "open" | "bind:open">, AccordionOptions {
    /** Contents of the always-visible <summary> row. */
    summary: Snippet;
    /** Called when the user (not the parent) opens or closes the panel. */
    onChange?: (event: Event, expanded: boolean) => void;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    children?: Snippet;
  }

  let {
    expanded = $bindable(),
    defaultExpanded,
    disabled,
    summary,
    onChange,
    ontoggle,
    motion,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  // The default is read once; a parent-provided or bound value takes priority.
  const initialDefault = untrack(() => defaultExpanded);
  const recipe = $derived(accordionRecipe({ expanded, defaultExpanded: initialDefault, disabled }));

  const handleToggle: NonNullable<Props["ontoggle"]> = (event) => {
    const open = event.currentTarget.open;
    // Parent-driven changes also queue native toggles; they already match the state.
    if (open !== recipe.open) {
      expanded = open;
      onChange?.(event, open);
    }
    ontoggle?.(event);
  };
</script>

<details
  class={["clay-accordion", className]}
  data-motion={motion}
  open={recipe.open}
  ontoggle={handleToggle}
  {...rest}
  {@attach attachAccordion}
>
  <summary class="clay clay-accordion__summary" data-clay-interactive {...recipe.summaryAttrs}>
    <span class="clay-accordion__title">{@render summary()}</span>
    <svg
      class="clay-accordion__chevron"
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </summary>
  <div class="clay clay-accordion__content">
    {@render children?.()}
  </div>
</details>
