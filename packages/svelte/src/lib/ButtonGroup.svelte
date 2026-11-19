<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";
  import type { Color, Size } from "@claymo/core";
  import type { ButtonGroupOrientation, ButtonVariant } from "@claymo/core/actions";

  interface Props extends Omit<HTMLFieldsetAttributes, "color" | "disabled"> {
    variant?: ButtonVariant;
    color?: Color;
    size?: Size;
    orientation?: ButtonGroupOrientation;
    disabled?: boolean;
    fullWidth?: boolean;
    disableElevation?: boolean;
    children?: Snippet;
  }

  let {
    variant = "contained",
    color = "primary",
    size = "medium",
    orientation = "horizontal",
    disabled = false,
    fullWidth = false,
    disableElevation = false,
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<fieldset
  class={["clay clay-button-group", className]}
  data-variant={variant}
  data-orientation={orientation}
  data-full-width={fullWidth ? "" : undefined}
  data-no-elevation={disableElevation ? "" : undefined}
  data-color={color}
  data-size={size}
  {disabled}
  {...rest}
>
  {@render children?.()}
</fieldset>
