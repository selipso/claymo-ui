<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  type Reason = "timeout" | "escapeKeyDown" | "clickaway";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    open?: boolean;
    message?: string;
    action?: Snippet;
    /** ms before closing with reason "timeout"; `null` keeps it open. */
    autoHideDuration?: number | null;
    /** When provided it decides; the parent must set `open = false`. Without it the Snackbar closes itself. */
    onClose?: (event: Event | null, reason: Reason) => void;
    anchorOrigin?: { vertical: "top" | "bottom"; horizontal: "left" | "center" | "right" };
    /** Replaces message/action, typically an Alert. */
    children?: Snippet;
  }

  let {
    open = $bindable(false),
    message,
    action,
    autoHideDuration = 4000,
    onClose,
    anchorOrigin = { vertical: "bottom", horizontal: "center" },
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let hovered = $state(false);
  let focused = $state(false);
  const paused = $derived(hovered || focused);
  let wrapper: HTMLElement | undefined;
  // The click that opened the Snackbar is still bubbling to window; arm click-away one task later.
  let armed = false;

  function close(event: Event | null, reason: Reason) {
    if (onClose) onClose(event, reason);
    else open = false;
  }

  // Auto-hide timer: restarts whenever it resumes after a hover/focus pause.
  $effect(() => {
    if (!open || autoHideDuration == null || paused) return;
    const timer = setTimeout(() => close(null, "timeout"), autoHideDuration);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    if (!open) return;
    hovered = false;
    focused = false;
    armed = false;
    const timer = setTimeout(() => (armed = true), 0);
    return () => clearTimeout(timer);
  });

  function onWindowKeydown(event: KeyboardEvent) {
    if (open && event.key === "Escape" && !event.defaultPrevented) close(event, "escapeKeyDown");
  }

  function onWindowClick(event: MouseEvent) {
    if (!open || !armed || wrapper?.contains(event.target as Node | null)) return;
    close(event, "clickaway");
  }

  // Pointer and focus tracking via an attachment: these are not interactions on the element itself,
  // so they must not be template handlers on a non-interactive node.
  function track(node: HTMLElement) {
    wrapper = node;
    const enter = () => (hovered = true);
    const leave = () => (hovered = false);
    const focusIn = () => (focused = true);
    const focusOut = (event: FocusEvent) => {
      if (!node.contains(event.relatedTarget as Node | null)) focused = false;
    };
    node.addEventListener("mouseenter", enter);
    node.addEventListener("mouseleave", leave);
    node.addEventListener("focusin", focusIn);
    node.addEventListener("focusout", focusOut);
    return () => {
      node.removeEventListener("mouseenter", enter);
      node.removeEventListener("mouseleave", leave);
      node.removeEventListener("focusin", focusIn);
      node.removeEventListener("focusout", focusOut);
      if (wrapper === node) wrapper = undefined;
    };
  }

  const motionMs = () =>
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 300;
  const offset = $derived(anchorOrigin.vertical === "top" ? -24 : 24);
</script>

<svelte:window onkeydown={onWindowKeydown} onclick={onWindowClick} />

<!-- The live region stays mounted so assistive tech registers it before content arrives. -->
<div
  class="region {className}"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  data-vertical={anchorOrigin.vertical}
  data-horizontal={anchorOrigin.horizontal}
  {...rest}
>
  {#if open}
    <div
      class="wrapper"
      {@attach track}
      transition:fly={{ y: offset, duration: motionMs(), easing: cubicOut }}
    >
      {#if children}
        {@render children()}
      {:else}
        <div class="clay bar">
          <span class="message">{message}</span>
          {#if action}<div class="action">{@render action()}</div>{/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .region {
    position: fixed;
    z-index: 1400;
    display: flex;
    box-sizing: border-box;
    padding: 24px;
    pointer-events: none;
  }
  .region[data-vertical="top"] {
    top: 0;
  }
  .region[data-vertical="bottom"] {
    bottom: 0;
  }
  .region[data-horizontal="left"] {
    left: 0;
    justify-content: flex-start;
  }
  .region[data-horizontal="right"] {
    right: 0;
    justify-content: flex-end;
  }
  .region[data-horizontal="center"] {
    left: 0;
    right: 0;
    justify-content: center;
  }

  .wrapper {
    max-width: 100%;
    pointer-events: auto;
  }
  .bar {
    --clay-color: var(--clay-surface);
    --clay-radius: 20px;
    --clay-d: 6px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    min-width: 288px;
    max-width: 100%;
    padding: 10px 12px 10px 20px;
    color: var(--clay-ink);
    font: 400 1rem/1.4 var(--clay-font);
  }
  .message {
    flex: 1 1 auto;
    min-width: 0;
    padding: 4px 0;
  }
  .action {
    display: flex;
    flex: none;
    align-items: center;
    gap: 4px;
    margin-inline-start: auto;
  }

  @media (max-width: 599px) {
    .region {
      left: 0;
      right: 0;
      padding: 16px;
    }
    .wrapper,
    .bar {
      width: 100%;
    }
    .bar {
      min-width: 0;
    }
  }
</style>
