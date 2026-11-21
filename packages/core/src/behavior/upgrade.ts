/**
 * For renderers without a client runtime (Astro, plain HTML): attach a controller to every
 * matching element under `scope`, once per element, so repeated calls are safe.
 */
export function upgrader<T extends Element>(
  selector: string,
  attach: (element: T) => void,
): (scope?: ParentNode) => void {
  const seen = new WeakSet<Element>();
  return (scope = document) => {
    for (const element of scope.querySelectorAll<T>(selector)) {
      if (seen.has(element)) continue;
      seen.add(element);
      attach(element);
    }
  };
}

/** Like `upgrader`, but can also release controllers below a removed parent. */
export function disposableUpgrader<T extends Element>(
  selector: string,
  attach: (element: T) => (() => void) | undefined,
) {
  const controllers = new WeakMap<T, (() => void) | undefined>();
  function upgrade(scope: ParentNode = document) {
    for (const element of scope.querySelectorAll<T>(selector)) {
      if (!controllers.has(element)) controllers.set(element, attach(element));
    }
  }
  function disconnectRemoved(scope: ParentNode) {
    for (const element of scope.querySelectorAll<T>(selector)) {
      if (element.isConnected) continue;
      controllers.get(element)?.();
      controllers.delete(element);
    }
  }
  return Object.assign(upgrade, { disconnectRemoved });
}
