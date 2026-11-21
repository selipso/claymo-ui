<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { DividerOptions } from "@claymo/core/surfaces";

  interface Props extends HTMLAttributes<HTMLHRElement>, DividerOptions {}

  let {
    orientation = "horizontal",
    flexItem = false,
    variant = "fullWidth",
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<hr
  class={["clay-divider", className]}
  data-orientation={orientation}
  data-variant={variant}
  data-flex-item={flexItem ? "" : undefined}
  aria-orientation={orientation}
  {...rest}
/>
