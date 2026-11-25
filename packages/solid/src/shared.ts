import { omit as omitKeys } from "solid-js";

/** Keep forwarded DOM attributes reactive while consuming component-specific props. */
export function omit<P extends object, K extends keyof P>(props: P, keys: readonly K[]) {
  return omitKeys(props, ...keys);
}

/** Solid native handlers can be functions or [handler, boundData] tuples. */
export function callHandler<E extends Event, D>(
  handler: ((event: E) => void) | { 0: (data: D, event: E) => void; 1: D } | undefined,
  event: E,
) {
  if (typeof handler === "function") handler(event);
  else if (handler) handler[0](handler[1], event);
}
