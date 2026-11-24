<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { DialogCloseReason, MotionPreset } from "@claymo/core";
  import { attachDialog, setDialogOpen } from "@claymo/core/behavior/dialog";
  import type { DrawerOptions } from "@claymo/core/overlays";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "oncancel" | "onclose">, DrawerOptions {
    "aria-label": string;
    /** Initial visibility when `open` is omitted. */
    defaultOpen?: boolean;
    /** When provided, the parent decides whether to close a temporary drawer by updating `open`. */
    onClose?: (event: Event, reason: DialogCloseReason) => void;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    children?: Snippet;
    actions?: Snippet;
  }

  let {
    variant = "temporary",
    open,
    defaultOpen = false,
    onClose,
    anchor = "left",
    width = 280,
    hideBackdrop = false,
    motion,
    class: className,
    children,
    actions,
    ...rest
  }: Props = $props();

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

  // A native form or close() can close independently of the controlled prop.
  function closed(event: Event) {
    if (!isOpen) return;
    localOpen = false;
    onClose?.(event, "escapeKeyDown");
  }
</script>

{#snippet panel()}
  <div class="clay-drawer__panel">
    {@render children?.()}
    {#if actions}<div class="clay-drawer__actions">{@render actions()}</div>{/if}
  </div>
{/snippet}

{#if variant === "temporary"}
  <dialog
    {...rest}
    bind:this={dialog}
    class={["clay clay-drawer", className]}
    data-variant={variant}
    data-anchor={anchor}
    data-hide-backdrop={hideBackdrop ? "" : undefined}
    data-motion={motion}
    style:--clay-drawer-width="{width}px"
    {@attach (node) => attachDialog(node, { requestClose, closed })}
  >
    {@render panel()}
  </dialog>
{:else}
  <aside
    {...rest}
    class={["clay clay-drawer", className]}
    data-variant={variant}
    data-anchor={anchor}
    data-motion={motion}
    style:--clay-drawer-width="{width}px"
    hidden={variant === "persistent" && !isOpen ? true : rest.hidden}
  >
    {@render panel()}
  </aside>
{/if}
