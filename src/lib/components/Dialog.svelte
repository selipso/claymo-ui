<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";

  type Reason = "escapeKeyDown" | "backdropClick";

  interface Props extends Omit<HTMLDialogAttributes, "open" | "title" | "oncancel" | "onclose"> {
    open?: boolean;
    /** When provided it decides; the parent must set `open = false`. Without it the Dialog closes itself. */
    onClose?: (event: Event, reason: Reason) => void;
    fullWidth?: boolean;
    maxWidth?: "xs" | "sm" | "md";
    /** Rendered as an <h2> and wired to the dialog with aria-labelledby. */
    title?: string;
    children?: Snippet;
    actions?: Snippet;
  }

  let {
    open = $bindable(false),
    onClose,
    fullWidth = false,
    maxWidth = "sm",
    title,
    class: className = "",
    children,
    actions,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const titleId = `${uid}-title`;
  const widths = { xs: 320, sm: 444, md: 600 } as const;

  let dialog = $state<HTMLDialogElement>();

  // showModal() gives the native focus trap, inert page, Escape handling and focus restoration to the opener.
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

  // Browsers may close natively (e.g. a second Escape without interaction, or a form method="dialog"): resync state.
  function onNativeClose(event: Event) {
    if (!open) return;
    onClose?.(event, "escapeKeyDown");
    open = false;
  }

  // Backdrop clicks target the <dialog> itself (the panel fills it). Require the press to start there too,
  // so dragging a text selection out of the panel does not dismiss it. Pointer-only by design:
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

<dialog
  bind:this={dialog}
  class="clay dialog {className}"
  class:full-width={fullWidth}
  aria-labelledby={title ? titleId : undefined}
  style:--dialog-w="{widths[maxWidth]}px"
  {...rest}
  oncancel={onCancel}
  onclose={onNativeClose}
  {@attach backdrop}
>
  <div class="panel">
    {#if title}<h2 id={titleId} class="title">{title}</h2>{/if}
    <div class="content">{@render children?.()}</div>
    {#if actions}<div class="actions">{@render actions()}</div>{/if}
  </div>
</dialog>

<style>
  .dialog {
    --clay-radius: 32px;
    --clay-d: 10px;
    box-sizing: border-box;
    width: fit-content;
    min-width: min(280px, calc(100% - 32px));
    max-width: min(var(--dialog-w), calc(100% - 32px));
    max-height: calc(100dvh - 32px);
    padding: 0;
    border: 0;
    overflow: auto;
    overscroll-behavior: contain;
    color: var(--clay-ink);
  }
  .full-width {
    width: 100%;
  }
  .dialog[open] {
    animation: pop var(--clay-time) var(--clay-ease);
  }
  .dialog::backdrop {
    background: color-mix(in oklab, #000, transparent 45%);
  }
  .dialog[open]::backdrop {
    animation: fade var(--clay-time) ease;
  }

  .title {
    margin: 0;
    padding: 24px 24px 8px;
    font: 600 1.25rem/1.3 var(--clay-font);
  }
  .content {
    padding: 8px 24px;
  }
  .panel > :first-child:is(.content) {
    padding-top: 24px;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    padding: 8px 24px 24px;
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .dialog[open],
    .dialog[open]::backdrop {
      animation: none;
    }
  }

  /* Scroll lock while any modal dialog is open (shared with Drawer). */
  :global(body:has(dialog[open])) {
    overflow: hidden;
  }
</style>
