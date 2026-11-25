<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { MotionPreset } from "@claymo/core";
  import {
    snackbarAnchorOrigin,
    snackbarAutoHideDuration,
    type SnackbarAnchorOrigin,
    type SnackbarCloseReason,
  } from "@claymo/core/overlays";
  import { attachSnackbar } from "@claymo/core/behavior/overlays";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    open?: boolean;
    /** Initial visibility when `open` is omitted. */
    defaultOpen?: boolean;
    message?: string;
    action?: Snippet;
    /** ms before closing with reason "timeout"; `null` keeps it open. */
    autoHideDuration?: number | null;
    resumeHideDuration?: number;
    disableWindowBlurListener?: boolean;
    /** When provided, the parent decides whether to close by updating `open`. */
    onClose?: (event: Event | null, reason: SnackbarCloseReason) => void;
    anchorOrigin?: SnackbarAnchorOrigin;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    /** Replaces message/action, typically an Alert. */
    children?: Snippet;
  }

  let {
    open,
    defaultOpen = false,
    message,
    action,
    autoHideDuration = snackbarAutoHideDuration,
    resumeHideDuration,
    disableWindowBlurListener = false,
    onClose,
    anchorOrigin = snackbarAnchorOrigin,
    motion,
    class: className,
    children,
    ...rest
  }: Props = $props();

  let localOpen = $state(untrack(() => open ?? defaultOpen));
  $effect.pre(() => {
    if (open !== undefined) localOpen = open;
  });
  const isOpen = $derived(onClose && open !== undefined ? open : localOpen);

  function requestClose(event: Event | null, reason: SnackbarCloseReason) {
    if (onClose) onClose(event, reason);
    else localOpen = false;
  }
</script>

<!-- Keep the live region mounted before content arrives. -->
<div
  {...rest}
  class={["clay-snackbar", className]}
  role="status"
  aria-live="polite"
  aria-atomic="true"
  data-vertical={anchorOrigin.vertical}
  data-horizontal={anchorOrigin.horizontal}
  data-clay-open={isOpen ? "" : undefined}
  data-clay-auto-hide={autoHideDuration ?? undefined}
  data-clay-resume-hide={resumeHideDuration}
  data-clay-ignore-window-blur={disableWindowBlurListener ? "" : undefined}
  data-motion={motion}
  {@attach (node) => attachSnackbar(node, requestClose)}
>
  <div class="clay-snackbar__wrapper" hidden={!isOpen} inert={!isOpen}>
    {#if children}
      {@render children()}
    {:else}
      <div class="clay clay-snackbar__bar">
        <span class="clay-snackbar__message">{message}</span>
        {#if action}<div class="clay-snackbar__action">{@render action()}</div>{/if}
      </div>
    {/if}
  </div>
</div>
