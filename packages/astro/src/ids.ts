/**
 * A unique id for one rendered instance. Astro has no per-render id API and no hydration to keep
 * in sync, so a random UUID is safe; it keeps repeated components with identical props distinct.
 */
export function instanceId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
