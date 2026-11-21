type Upgrade = (() => void) & { disconnectRemoved?: (scope: ParentNode) => void };

const registered = new WeakSet<Upgrade>();
const disconnects = new Set<NonNullable<Upgrade["disconnectRemoved"]>>();
let previousBody: HTMLElement | undefined;

function captureBody() {
  previousBody = document.body;
}

function disconnectReplacedControllers() {
  const body = previousBody;
  previousBody = undefined;
  if (!body) return;
  // Astro moves persisted elements into the new body before this event.
  for (const disconnect of disconnects) disconnect(body);
}

/**
 * Runs an idempotent controller upgrade on first load and after every Astro ClientRouter page swap
 * (`astro:page-load`). Bundled component scripts execute once per session, so without this, markup
 * swapped in by view transitions is never upgraded.
 */
export function onEveryPage(upgrade: Upgrade): void {
  if (registered.has(upgrade)) return;
  registered.add(upgrade);
  if (upgrade.disconnectRemoved) {
    if (disconnects.size === 0) {
      document.addEventListener("astro:before-swap", captureBody);
      document.addEventListener("astro:after-swap", disconnectReplacedControllers);
    }
    disconnects.add(upgrade.disconnectRemoved);
  }
  upgrade();
  document.addEventListener("astro:page-load", () => upgrade());
}
