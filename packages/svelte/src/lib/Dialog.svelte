<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";
  import { dialogRecipe, type DialogCloseReason, type DialogMaxWidth } from "@claymo/core";
  import type { MotionPreset } from "@claymo/core";
  import { attachDialog, setDialogOpen } from "@claymo/core/behavior/dialog";
  import IconButton from "./IconButton.svelte";

  interface Props extends Omit<HTMLDialogAttributes, "open" | "title" | "oncancel" | "onclose"> {
    open?: boolean;
    /** When provided it decides; the parent must set `open = false`. Without it the Dialog closes itself. */
    onClose?: (event: Event, reason: DialogCloseReason) => void;
    fullWidth?: boolean;
    maxWidth?: DialogMaxWidth;
    /** Show a close (X) button in the top corner; it requests close with reason "closeButton". */
    dismissible?: boolean;
    /** Accessible name of the close button. */
    closeText?: string;
    /** Rendered as an <h2> and wired to the dialog with aria-labelledby. */
    title?: string;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    children?: Snippet;
    actions?: Snippet;
  }

  let {
    open = $bindable(false),
    onClose,
    fullWidth,
    maxWidth,
    dismissible = false,
    closeText = "Close",
    title,
    motion,
    class: className,
    children,
    actions,
    ...rest
  }: Props = $props();

  const idBase = $props.id();
  const recipe = $derived(
    dialogRecipe({ idBase, hasTitle: !!title, fullWidth, maxWidth, dismissible }),
  );

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if (dialog) setDialogOpen(dialog, open);
  });

  function requestClose(event: Event, reason: DialogCloseReason) {
    if (onClose) onClose(event, reason);
    else open = false;
  }

  // The browser closed without asking: resync. A close caused by `open = false` arrives with open already false.
  function closed(event: Event) {
    if (!open) return;
    onClose?.(event, "escapeKeyDown");
    open = false;
  }
</script>

<dialog
  bind:this={dialog}
  {...recipe.attrs}
  class={[recipe.className, className]}
  data-motion={motion}
  {...rest}
  {@attach (node) => attachDialog(node, { requestClose, closed })}
>
  <div class="clay-dialog__panel">
    {#if dismissible}
      <IconButton
        size="small"
        class="clay-dialog__close"
        aria-label={closeText}
        data-clay-dialog-close
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </IconButton>
    {/if}
    {#if title}<h2 id={recipe.titleId} class="clay-dialog__title">{title}</h2>{/if}
    <div class="clay-dialog__content">{@render children?.()}</div>
    {#if actions}<div class="clay-dialog__actions">{@render actions()}</div>{/if}
  </div>
</dialog>
