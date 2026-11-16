<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "title"> {
    title: string;
    placement?: "top" | "bottom" | "left" | "right";
    /** A single element: it receives aria-describedby pointing at the bubble. */
    children?: Snippet;
  }

  let { title, placement = "bottom", class: className = "", children, ...rest }: Props = $props();

  const uid = $props.id();
  const tipId = `${uid}-tip`;

  let wrapper: HTMLSpanElement | undefined = $state();
  let dismissed = $state(false);

  // Wire aria-describedby on the wrapped element (kept in sync with `title`/`children`).
  $effect(() => {
    void title;
    void children;
    const child = wrapper?.querySelector(":scope > :not([role='tooltip'])");
    if (!child) return;
    const ids = (child.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    if (!ids.includes(tipId)) child.setAttribute("aria-describedby", [...ids, tipId].join(" "));
    return () => {
      const rest = (child.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter((id) => id && id !== tipId);
      if (rest.length) child.setAttribute("aria-describedby", rest.join(" "));
      else child.removeAttribute("aria-describedby");
    };
  });

  // Escape dismisses (WCAG 1.4.13) until the pointer and focus have both left.
  // Listeners are attached imperatively: static elements may not take handlers
  // without tripping Svelte's a11y checks, and the tooltip itself is not interactive.
  $effect(() => {
    const el = wrapper;
    if (!el) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || untrack(() => dismissed) || !title) return;
      if (el.matches(":hover, :focus-within")) {
        dismissed = true;
        event.stopPropagation(); // the first Escape only closes the tooltip, not an enclosing dialog
        event.preventDefault();
      }
    };
    const onPointerLeave = () => {
      if (!el.matches(":focus-within")) dismissed = false;
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!el.contains(event.relatedTarget as Node | null) && !el.matches(":hover"))
        dismissed = false;
    };
    const onFocusIn = () => {
      dismissed = false;
    };
    document.addEventListener("keydown", onKeydown, true);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("focusout", onFocusOut);
    el.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeydown, true);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("focusout", onFocusOut);
      el.removeEventListener("focusin", onFocusIn);
    };
  });
</script>

<span
  bind:this={wrapper}
  class="clay-tooltip tip {className}"
  class:dismissed
  data-placement={placement}
  {...rest}
>
  {@render children?.()}
  <span id={tipId} role="tooltip" class="clay bubble">{title}</span>
</span>

<style>
  .tip {
    position: relative;
    display: inline-flex;
  }
  .bubble {
    --clay-color: var(--clay-ink);
    --clay-radius: 12px;
    --clay-d: 3px;
    position: absolute;
    z-index: 1000;
    box-sizing: border-box;
    width: max-content;
    max-width: 280px;
    padding: 6px 12px;
    color: var(--clay-page);
    font: 600 0.875rem/1.3 var(--clay-font);
    text-align: center;
    white-space: normal;
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 150ms ease,
      visibility 150ms;
  }
  .tip:is(:hover, :focus-within):not(.dismissed) > .bubble {
    visibility: visible;
    opacity: 1;
  }

  /* invisible bridge so the pointer can travel from trigger to bubble (WCAG 1.4.13 hoverable) */
  .bubble::after {
    content: "";
    position: absolute;
  }

  [data-placement="bottom"] > .bubble {
    top: calc(100% + 8px);
    left: 50%;
    translate: -50% 0;
  }
  [data-placement="bottom"] > .bubble::after {
    top: -9px;
    left: 0;
    right: 0;
    height: 9px;
  }
  [data-placement="top"] > .bubble {
    bottom: calc(100% + 8px);
    left: 50%;
    translate: -50% 0;
  }
  [data-placement="top"] > .bubble::after {
    bottom: -9px;
    left: 0;
    right: 0;
    height: 9px;
  }
  [data-placement="left"] > .bubble {
    right: calc(100% + 8px);
    top: 50%;
    translate: 0 -50%;
  }
  [data-placement="left"] > .bubble::after {
    right: -9px;
    top: 0;
    bottom: 0;
    width: 9px;
  }
  [data-placement="right"] > .bubble {
    left: calc(100% + 8px);
    top: 50%;
    translate: 0 -50%;
  }
  [data-placement="right"] > .bubble::after {
    left: -9px;
    top: 0;
    bottom: 0;
    width: 9px;
  }

  @media (prefers-reduced-motion: reduce) {
    .bubble {
      transition: none;
    }
  }
</style>
