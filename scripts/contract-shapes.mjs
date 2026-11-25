import ts from "typescript";

const shape = (kind, fields = {}) => ({ kind, ...fields });
const literal = (value) => (value === null ? shape("null") : shape("literal", { value }));
const array = (items) => shape("array", { items });
const object = (fields = {}, additional) => shape("object", { fields, additional });

function union(members) {
  const types = members.flatMap((member) => (member.kind === "union" ? member.members : [member]));
  const keys = new Set(types.map((member) => member.kind));
  if (types.some(({ value }) => value === true) && types.some(({ value }) => value === false)) {
    types.push(shape("boolean"));
    keys.add("boolean");
  }
  const unique = new Map();
  for (const member of types) {
    if (member.kind === "never") continue;
    if (member.kind === "literal" && keys.has(typeof member.value)) continue;
    unique.set(JSON.stringify(member), member);
  }
  if (keys.has("unknown")) return shape("unknown");
  const values = [...unique.values()];
  if (values.length === 0) return shape("never");
  if (values.length === 1) return values[0];
  return shape("union", { members: values });
}

export function schemaShape(schema) {
  if (schema === true) return shape("unknown");
  if (schema === false) return shape("never");
  if (Object.hasOwn(schema, "const")) return literal(schema.const);
  if (Array.isArray(schema.enum)) return union(schema.enum.map(literal));
  if (schema.oneOf || schema.anyOf) return union((schema.oneOf ?? schema.anyOf).map(schemaShape));
  if (Array.isArray(schema.type)) {
    return union(schema.type.map((type) => schemaShape({ ...schema, type })));
  }
  switch (schema.type) {
    case "array":
      return array(schemaShape(schema.items ?? true));
    case "object": {
      const names = schema.propertyNames?.enum;
      if (
        schema.propertyNames &&
        (!Array.isArray(names) || names.some((name) => typeof name !== "string"))
      ) {
        throw new Error("Only named string enums are supported for propertyNames");
      }
      const properties = {
        ...Object.fromEntries(
          (names ?? []).map((name) => [name, schema.additionalProperties ?? true]),
        ),
        ...schema.properties,
      };
      const fields = Object.fromEntries(
        Object.entries(properties).map(([name, value]) => [
          name,
          { required: schema.required?.includes(name) ?? false, type: schemaShape(value) },
        ]),
      );
      for (const name of schema.required ?? []) {
        if (!Object.hasOwn(fields, name)) throw new Error(`Required field ${name} has no schema`);
      }
      return object(
        fields,
        names || schema.additionalProperties === undefined || schema.additionalProperties === false
          ? undefined
          : schemaShape(schema.additionalProperties),
      );
    }
    case "integer":
      // TypeScript does not distinguish integer or bounded values from other numbers.
      return shape("number");
    case "string":
    case "number":
    case "boolean":
    case "null":
      return shape(schema.type);
    case undefined:
      // The reference uses description-only entries for code-valued API such as getRowId.
      return shape("function");
    default:
      throw new Error(`Unsupported JSON Schema type ${schema.type}`);
  }
}

export function typeShape(checker, type, project = () => undefined, path = "", seen = new Set()) {
  const projected = project(type, path);
  if (projected) return projected;
  const descend = (value, key = path) => typeShape(checker, value, project, key, seen);
  const { flags } = type;
  const F = ts.TypeFlags;
  if (flags & (F.Undefined | F.Void | F.Never)) return shape("never");
  if (flags & F.Null) return shape("null");
  if (flags & F.String) return shape("string");
  if (flags & F.Number) return shape("number");
  if (flags & F.Boolean) return shape("boolean");
  if (flags & (F.StringLiteral | F.NumberLiteral)) return literal(type.value);
  if (flags & F.BooleanLiteral) return literal(checker.typeToString(type) === "true");
  if (type.isUnion()) return union(type.types.map((member) => descend(member)));
  if (flags & F.TypeParameter) {
    const constraint = checker.getBaseConstraintOfType(type);
    return constraint ? descend(constraint) : shape("unknown");
  }
  // Framework native types use `string & {}` to preserve literal autocomplete while
  // still accepting arbitrary strings (e.g., HTML browsing-context names).
  if (flags & F.Intersection && checker.isTypeAssignableTo(checker.getStringType(), type)) {
    return shape("string");
  }
  if (flags & F.Unknown) return shape("unknown");
  if (flags & F.Any) return shape("unsupported", { name: checker.typeToString(type) });
  if (checker.getSignaturesOfType(type, ts.SignatureKind.Call).length) return shape("function");
  if (checker.isArrayType(type))
    return array(descend(checker.getTypeArguments(type)[0], `${path}[]`));
  if (flags & (F.Object | F.Intersection | F.NonPrimitive)) {
    // DOM instances are not a JSON object contract; avoid expanding the entire
    // cyclic lib.dom graph when a JSX node leaks into a documented data prop.
    if (
      seen.has(type) ||
      checker.isTupleType(type) ||
      type.symbol?.declarations?.some((decl) =>
        decl.getSourceFile().fileName.endsWith("/typescript/lib/lib.dom.d.ts"),
      )
    ) {
      return shape("unsupported", { name: checker.typeToString(type) });
    }
    seen.add(type);
    try {
      const fields = Object.fromEntries(
        checker.getPropertiesOfType(type).map((prop) => [
          prop.name,
          {
            required: !(prop.flags & ts.SymbolFlags.Optional),
            type: descend(checker.getTypeOfSymbol(prop), `${path}.${prop.name}`),
          },
        ]),
      );
      const index = checker.getIndexTypeOfType(type, ts.IndexKind.String);
      return object(fields, index && descend(index, `${path}.*`));
    } finally {
      seen.delete(type);
    }
  }
  return shape("unsupported", { name: checker.typeToString(type) });
}

function describe(type) {
  switch (type.kind) {
    case "unsupported":
      return type.name;
    case "literal":
      return JSON.stringify(type.value);
    case "union":
      return type.members.map(describe).sort().join(" | ");
    default:
      return type.kind;
  }
}

/** The schema and declaration must agree in both directions after JSON projection. */
export function differences(schema, declaration, path) {
  if (schema.kind === "union" || declaration.kind === "union") {
    const expected = schema.kind === "union" ? schema.members : [schema];
    const actual = declaration.kind === "union" ? declaration.members : [declaration];
    const unmatched = [...actual];
    const issues = [];
    for (const branch of expected) {
      const index = unmatched.findIndex(
        (candidate) => !differences(branch, candidate, path).length,
      );
      if (index >= 0) {
        unmatched.splice(index, 1);
        continue;
      }
      const indexByKind = unmatched.findIndex(
        (candidate) => candidate.kind === branch.kind && ["object", "array"].includes(branch.kind),
      );
      if (indexByKind >= 0) {
        issues.push(...differences(branch, unmatched.splice(indexByKind, 1)[0], path));
      } else {
        issues.push(
          `${path}: schema documents ${describe(branch)} not accepted by the declaration`,
        );
      }
    }
    for (const extra of unmatched) {
      issues.push(`${path}: declaration accepts undocumented ${describe(extra)}`);
    }
    return issues;
  }
  if (schema.kind !== declaration.kind || schema.value !== declaration.value) {
    return [`${path}: schema is ${describe(schema)}; declaration is ${describe(declaration)}`];
  }
  if (schema.kind === "array") return differences(schema.items, declaration.items, `${path}[]`);
  if (schema.kind !== "object") return [];

  const issues = [];
  for (const key of new Set([...Object.keys(schema.fields), ...Object.keys(declaration.fields)])) {
    const expected = Object.hasOwn(schema.fields, key) ? schema.fields[key] : undefined;
    const actual = Object.hasOwn(declaration.fields, key) ? declaration.fields[key] : undefined;
    if (!expected) issues.push(`${path}.${key}: declared field is missing from schema`);
    else if (!actual) issues.push(`${path}.${key}: schema field is not declared`);
    else {
      if (expected.required !== actual.required) {
        issues.push(
          `${path}.${key}: schema is ${expected.required ? "required" : "optional"}; declaration is ${actual.required ? "required" : "optional"}`,
        );
      }
      issues.push(...differences(expected.type, actual.type, `${path}.${key}`));
    }
  }
  // An open object with no named fields represents a dictionary of arbitrary row data.
  const extra =
    schema.additional ??
    (!Object.keys(schema.fields).length && declaration.additional?.kind === "unknown"
      ? shape("unknown")
      : undefined);
  if (extra && declaration.additional) {
    issues.push(...differences(extra, declaration.additional, `${path}.*`));
  } else if (extra || declaration.additional) {
    issues.push(`${path}: schema and declaration disagree on indexed fields`);
  }
  return issues;
}
