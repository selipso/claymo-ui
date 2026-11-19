<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import {
    snackbarAnchorOrigin,
    snackbarAutoHideDuration,
    type SnackbarAnchorOrigin,
    type SnackbarCloseReason,
  } from "@claymo/core/overlays";
  import { attachSnackbar } from "@claymo/core/behavior/overlays";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    open?: boolean;
    message?: string;
    action?: Snippet;
    /** ms before closing with reason "timeout"; `null` keeps it open. */
    autoHideDuration?: number | null;
    resumeHideDuration?: number;
    disableWindowBlurListener?: boolean;
    /** When provided, the parent decides whether to close by updating `open`. */
    onClose?: (event: Event | null, reason: SnackbarCloseReason) => void;
    anchorOrigin?: SnackbarAnchorOrigin;
    /** Replaces message/action, typically an Alert. */
    children?: Snippet;
  }

  let {
    open = $bindable(false),
    message,
    action,
    autoHideDuration = snackbarAutoHideDuration,
    resumeHideDuration,
    disableWindowBlurListener = false,
    onClose,
    anchorOrigin = snackbarAnchorOrigin,
    class: className,
    children,
    ...rest
  }: Props = $props();

  function requestClose(event: Event | null, reason: SnackbarCloseReason) {
    if (onClose) onClose(event, reason);
    else open = false;
  }

  const motionMs = () =>
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 300;
  const offset = $derived(anchorOrigin.vertical === "top" ? -24 : 24);
</script>

<!-- Keep the live region mounted before content arrives. -->
<div
  class={["clay-snackbar", className]}
  role="status"
  aria-live="polite"
  aria-atomic="true"
  data-vertical={anchorOrigin.vertical}
  data-horizontal={anchorOrigin.horizontal}
  data-clay-open={open ? "" : undefined}
  data-clay-auto-hide={autoHideDuration ?? undefined}
  data-clay-resume-hide={resumeHideDuration}
  data-clay-ignore-window-blur={disableWindowBlurListener ? "" : undefined}
  {...rest}
  {@attach (node) => attachSnackbar(node, requestClose)}
>
  {#if open}
    <div
      class="clay-snackbar__wrapper"
      transition:fly={{ y: offset, duration: motionMs(), easing: cubicOut }}
    >
      {#if children}
        {@render children()}
      {:else}
        <div class="clay clay-snackbar__bar">
          <span class="clay-snackbar__message">{message}</span>
          {#if action}<div class="clay-snackbar__action">{@render action()}</div>{/if}
        </div>
      {/if}
    </div>
  {/if}
</div>
