import { render, type JSX } from "@solidjs/web";

/** Astro runs bundled scripts once; mount the replacement host after each client navigation. */
export function mountSolid(selector: string, view: (host: HTMLElement) => JSX.Element): void {
  let host: HTMLElement | null = null;
  let dispose: (() => void) | undefined;

  function unmount() {
    dispose?.();
    dispose = undefined;
    host = null;
  }

  function mount() {
    const next = document.querySelector<HTMLElement>(selector);
    if (next === host) return;
    unmount();
    if (!next) return;
    host = next;
    dispose = render(() => view(next), next);
  }

  // Disconnect old effects, timers, and overlays while their DOM is still present.
  document.addEventListener("astro:before-swap", unmount);
  document.addEventListener("astro:page-load", mount);
  mount();
}
