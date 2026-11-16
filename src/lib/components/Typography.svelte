<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Variant =
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "caption"
    | "overline";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "color"> {
    variant?: Variant;
    /** Replaces MUI's `component`: the rendered tag. */
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "label" | "legend";
    color?: "inherit" | "text.primary" | "text.secondary" | "primary" | "error";
    gutterBottom?: boolean;
    noWrap?: boolean;
    align?: "inherit" | "left" | "center" | "right" | "justify";
    children?: Snippet;
  }

  let {
    variant = "body1",
    as,
    color = "inherit",
    gutterBottom = false,
    noWrap = false,
    align = "inherit",
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const defaultTag: Record<Variant, NonNullable<Props["as"]>> = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    subtitle1: "p",
    subtitle2: "p",
    body1: "p",
    body2: "p",
    caption: "span",
    overline: "span",
  };
  const tag = $derived(as ?? defaultTag[variant]);
</script>

<svelte:element
  this={tag}
  class="typography {variant} {className}"
  class:gutter-bottom={gutterBottom}
  class:no-wrap={noWrap}
  data-tcolor={color}
  style:text-align={align === "inherit" ? undefined : align}
  {...rest}
>
  {@render children?.()}
</svelte:element>

<style>
  .typography {
    margin: 0;
    font-family: var(--clay-font);
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5;
  }
  .gutter-bottom {
    margin-bottom: 0.35em;
  }
  .no-wrap {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .h1 {
    font-size: 2.5rem;
    font-weight: 600;
    line-height: 1.15;
  }
  .h2 {
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.2;
  }
  .h3 {
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1.25;
  }
  .h4 {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
  }
  .h5 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.35;
  }
  .h6 {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
  }
  .subtitle1 {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
  }
  .subtitle2 {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.5;
  }
  .body1 {
    font-size: 1rem;
  }
  .body2 {
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .caption {
    font-size: 0.75rem;
    line-height: 1.4;
  }
  .overline {
    font-size: 0.75rem;
    line-height: 1.5;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  /* span-based variants need a box for margins/ellipsis to apply */
  .caption,
  .overline {
    display: inline-block;
  }
  span.caption.no-wrap,
  span.overline.no-wrap {
    max-width: 100%;
  }

  [data-tcolor="text.primary"] {
    color: var(--clay-ink);
  }
  [data-tcolor="text.secondary"] {
    color: var(--clay-ink-muted);
  }
  [data-tcolor="primary"] {
    color: var(--clay-primary-ink);
  }
  [data-tcolor="error"] {
    color: var(--clay-error-ink);
  }
</style>
