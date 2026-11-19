/**
 * Runs an idempotent controller upgrade on first load and after every Astro ClientRouter page swap
 * (`astro:page-load`). Bundled component scripts execute once per session, so without this, markup
 * swapped in by view transitions is never upgraded.
 */
export function onEveryPage(upgrade: () => void): void {
  upgrade();
  document.addEventListener("astro:page-load", () => upgrade());
}
