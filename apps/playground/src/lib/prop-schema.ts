type Schema = Record<string, unknown>;

/** A JSON Schema prop as a short TypeScript-like type: `"small" | "medium"`, `string[]`. */
export function propType(schema: Schema): string {
  if (Array.isArray(schema.enum))
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  if (schema.type === "array")
    return `${schema.items ? propType(schema.items as Schema) : "unknown"}[]`;
  if (Array.isArray(schema.type)) return schema.type.join(" | ");
  return typeof schema.type === "string" ? schema.type : "unknown";
}

/** The default as source text, or an empty string when the prop has none. */
export function propDefault(schema: Schema): string {
  return "default" in schema ? JSON.stringify(schema.default) : "";
}
