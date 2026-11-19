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
