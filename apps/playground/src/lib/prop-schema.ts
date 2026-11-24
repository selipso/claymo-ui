type Schema = Record<string, unknown>;

/** A JSON Schema prop as a short TypeScript-like type: `"small" | "medium"`, `string[]`. */
export function propType(schema: Schema): string {
  if (Array.isArray(schema.enum))
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  const variants = Array.isArray(schema.oneOf)
    ? schema.oneOf
    : Array.isArray(schema.anyOf)
      ? schema.anyOf
      : undefined;
  if (variants) return variants.map((variant) => propType(variant as Schema)).join(" | ");
  if (schema.type === "array") {
    const inner = schema.items ? propType(schema.items as Schema) : "unknown";
    return inner.includes(" | ") ? `(${inner})[]` : `${inner}[]`;
  }
  if (Array.isArray(schema.type)) return schema.type.join(" | ");
  if (typeof schema.type === "string") return schema.type;
  if (typeof schema.description === "string" && schema.description.includes("=>"))
    return "function";
  return "unknown";
}

/** The default as source text, or an empty string when the prop has none. */
export function propDefault(schema: Schema): string {
  return "default" in schema ? JSON.stringify(schema.default) : "";
}
