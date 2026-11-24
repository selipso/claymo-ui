<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";
  import { dialogRecipe, type DialogCloseReason, type DialogMaxWidth } from "@claymo/core";
  import type { MotionPreset } from "@claymo/core";
  import { actionIconAttrs, closeIconPath } from "@claymo/core/actions";
  import { attachDialog, setDialogOpen } from "@claymo/core/behavior/dialog";
  import IconButton from "./IconButton.svelte";

  interface Props extends Omit<HTMLDialogAttributes, "open" | "title" | "oncancel" | "onclose"> {
    open?: boolean;
    /** Initial visibility when `open` is omitted. */
    defaultOpen?: boolean;
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
    open,
    defaultOpen = false,
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

  let localOpen = $state(untrack(() => open ?? defaultOpen));
  $effect.pre(() => {
    if (open !== undefined) localOpen = open;
  });
  const isOpen = $derived(onClose && open !== undefined ? open : localOpen);

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if (dialog) setDialogOpen(dialog, isOpen);
  });

  function requestClose(event: Event, reason: DialogCloseReason) {
    if (onClose) onClose(event, reason);
    else if (isOpen) localOpen = false;
    else if (dialog) setDialogOpen(dialog, false);
  }

  // The browser closed without asking: resync. A close caused by `open = false` arrives with isOpen already false.
  function closed(event: Event) {
    if (!isOpen) return;
    localOpen = false;
    onClose?.(event, "escapeKeyDown");
  }
</script>

<dialog
  {...rest}
  bind:this={dialog}
  {...recipe.attrs}
  class={[recipe.className, className]}
  data-motion={motion}
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
        <svg {...actionIconAttrs} width="18" height="18" stroke-width="2.5">
          <path d={closeIconPath} />
        </svg>
      </IconButton>
    {/if}
    {#if title}<h2 id={recipe.titleId} class="clay-dialog__title">{title}</h2>{/if}
    <div class="clay-dialog__content">{@render children?.()}</div>
    {#if actions}<div class="clay-dialog__actions">{@render actions()}</div>{/if}
  </div>
</dialog>
