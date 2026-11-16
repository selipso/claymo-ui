<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { TabsContext, TabValue } from "./Tabs.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    value: TabValue;
    children?: Snippet;
  }

  let { value, class: className = "", children, ...rest }: Props = $props();

  const ctx = getContext<TabsContext>("clay-tabs");
  if (!ctx) throw new Error("<TabPanel> must be rendered inside <Tabs>.");

  const selected = $derived(ctx.value === value);
</script>

<div
  role="tabpanel"
  id={ctx.panelId(value)}
  class="tabpanel {className}"
  aria-labelledby={ctx.tabId(value)}
  hidden={!selected}
  {...rest}
>
  {@render children?.()}
</div>
