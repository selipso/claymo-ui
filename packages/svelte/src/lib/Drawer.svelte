<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { DialogCloseReason } from "@claymo/core";
  import { attachDialog, setDialogOpen } from "@claymo/core/behavior/dialog";
  import type { DrawerOptions } from "@claymo/core/overlays";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "oncancel" | "onclose">, DrawerOptions {
    "aria-label": string;
    /** When provided, the parent decides whether to close a temporary drawer by updating `open`. */
    onClose?: (event: Event, reason: DialogCloseReason) => void;
    children?: Snippet;
    actions?: Snippet;
  }

  let {
    variant = "temporary",
    open = $bindable(false),
    onClose,
    anchor = "left",
    width = 280,
    hideBackdrop = false,
    class: className,
    children,
    actions,
    ...rest
  }: Props = $props();

  let dialog = $state<HTMLDialogElement>();
  $effect(() => {
    if (dialog) setDialogOpen(dialog, open);
  });

  function requestClose(event: Event, reason: DialogCloseReason) {
    if (onClose) onClose(event, reason);
    else open = false;
  }

  // A native form or close() can close independently of the controlled prop.
  function closed(event: Event) {
    if (!open) return;
    onClose?.(event, "escapeKeyDown");
    open = false;
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
    bind:this={dialog}
    class={["clay clay-drawer", className]}
    data-variant={variant}
    data-anchor={anchor}
    data-hide-backdrop={hideBackdrop ? "" : undefined}
    style:--clay-drawer-width="{width}px"
    {...rest}
    {@attach (node) => attachDialog(node, { requestClose, closed })}
  >
    {@render panel()}
  </dialog>
{:else}
  <aside
    class={["clay clay-drawer", className]}
    data-variant={variant}
    data-anchor={anchor}
    style:--clay-drawer-width="{width}px"
    {...rest}
    hidden={variant === "persistent" && !open ? true : rest.hidden}
  >
    {@render panel()}
  </aside>
{/if}
