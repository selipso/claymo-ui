<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { DividerOptions } from "@claymo/core/surfaces";

  interface Props extends Omit<HTMLAttributes<HTMLHRElement>, "children">, DividerOptions {}

  let {
    orientation = "horizontal",
    flexItem = false,
    variant = "fullWidth",
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<hr
  {...rest}
  class={["clay-divider", className]}
  data-orientation={orientation}
  data-variant={variant}
  data-flex-item={flexItem ? "" : undefined}
  aria-orientation={orientation}
/>
