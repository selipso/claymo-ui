/** Attributes a bridge spreads onto the native element. `undefined` means "omit". */
export type Attrs = Record<string, string | number | boolean | undefined>;

/** Presence-only data attribute: rendered empty when on, omitted when off. */
export const flag = (on: boolean | undefined): "" | undefined => (on ? "" : undefined);

/** A stable, attribute-safe id fragment derived from a value or label. */
export const slug = (value: string | number): string =>
  String(value)
    .trim()
    .replace(/[^\w-]+/g, "-");
