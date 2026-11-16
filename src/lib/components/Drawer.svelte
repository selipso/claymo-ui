<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Reason = "escapeKeyDown" | "backdropClick";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "oncancel" | "onclose"> {
    variant?: "permanent" | "temporary";
    /** Only used by `temporary`. */
    open?: boolean;
    /** When provided it decides; the parent must set `open = false`. Without it the Drawer closes itself. */
    onClose?: (event: Event, reason: Reason) => void;
    anchor?: "left" | "right";
    /** px */
    width?: number;
    "aria-label": string;
    children?: Snippet;
  }

  let {
    variant = "temporary",
    open = $bindable(false),
    onClose,
    anchor = "left",
    width = 280,
    "aria-label": ariaLabel,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let dialog = $state<HTMLDialogElement>();

  // Same native <dialog> lifecycle as Dialog: showModal() = focus trap, Escape, focus restoration to the opener.
  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  });

  function requestClose(event: Event, reason: Reason) {
    if (onClose) onClose(event, reason);
    else open = false;
  }

  function onCancel(event: Event) {
    event.preventDefault();
    requestClose(event, "escapeKeyDown");
  }

  function onNativeClose(event: Event) {
    if (!open) return;
    onClose?.(event, "escapeKeyDown");
    open = false;
  }

  // Backdrop clicks target the <dialog> itself (the inner wrapper fills it). Pointer-only by design:
  // the keyboard equivalent is Escape, handled by the native cancel event.
  function backdrop(node: HTMLDialogElement) {
    let pressedOnBackdrop = false;
    const down = (event: PointerEvent) => (pressedOnBackdrop = event.target === node);
    const click = (event: MouseEvent) => {
      if (pressedOnBackdrop && event.target === node) requestClose(event, "backdropClick");
      pressedOnBackdrop = false;
    };
    node.addEventListener("pointerdown", down);
    node.addEventListener("click", click);
    return () => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("click", click);
    };
  }
</script>

{#if variant === "permanent"}
  <aside
    class="clay drawer permanent {anchor} {className}"
    aria-label={ariaLabel}
    style:--drawer-w="{width}px"
    {...rest}
  >
    <div class="inner">{@render children?.()}</div>
  </aside>
{:else}
  <dialog
    bind:this={dialog}
    class="clay drawer temporary {anchor} {className}"
    aria-label={ariaLabel}
    style:--drawer-w="{width}px"
    {...rest}
    oncancel={onCancel}
    onclose={onNativeClose}
    {@attach backdrop}
  >
    <div class="inner">{@render children?.()}</div>
  </dialog>
{/if}

<style>
  .drawer {
    --clay-color: var(--clay-surface);
    --clay-d: 10px;
    box-sizing: border-box;
    width: var(--drawer-w);
    color: var(--clay-ink);
  }
  .left {
    --clay-radius: 0 28px 28px 0;
  }
  .right {
    --clay-radius: 28px 0 0 28px;
  }
  .inner {
    box-sizing: border-box;
    min-height: 100%;
    padding: 12px;
  }

  .permanent {
    flex: none;
    align-self: stretch;
    overflow-y: auto;
  }

  .temporary {
    position: fixed;
    top: 0;
    bottom: 0;
    height: 100dvh;
    max-height: none;
    width: min(var(--drawer-w), calc(100vw - 48px));
    max-width: none;
    margin: 0;
    padding: 0;
    border: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .temporary.left {
    left: 0;
    right: auto;
  }
  .temporary.right {
    right: 0;
    left: auto;
  }
  .temporary[open].left {
    animation: slide-left var(--clay-time) var(--clay-ease);
  }
  .temporary[open].right {
    animation: slide-right var(--clay-time) var(--clay-ease);
  }
  .temporary::backdrop {
    background: color-mix(in oklab, #000, transparent 45%);
  }
  .temporary[open]::backdrop {
    animation: fade var(--clay-time) ease;
  }

  @keyframes slide-left {
    from {
      transform: translateX(-100%);
    }
  }
  @keyframes slide-right {
    from {
      transform: translateX(100%);
    }
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .temporary[open],
    .temporary[open]::backdrop {
      animation: none;
    }
  }

  /* Scroll lock while any modal dialog is open (shared with Dialog). */
  :global(body:has(dialog[open])) {
    overflow: hidden;
  }
</style>
