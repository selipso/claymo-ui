<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { tabPanelRecipe, type TabValue } from "@claymo/core";
  import type { TabsContext } from "./Tabs.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    value: TabValue;
    children?: Snippet;
  }

  let { value, class: className, children, ...rest }: Props = $props();

  const ctx = getContext<TabsContext>("clay-tabs");
  if (!ctx) throw new Error("<TabPanel> must be rendered inside <Tabs>.");

  const recipe = $derived(tabPanelRecipe({ value, selected: ctx.value, ids: ctx.ids }));
</script>

<div
  {...rest}
  {...recipe.attrs}
  class={[recipe.className, className]}
  hidden={recipe.attrs.hidden === true || rest.hidden}
>
  {@render children?.()}
</div>
