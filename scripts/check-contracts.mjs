import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { convertToTsx } from "@astrojs/astro2tsx";
import {
  frameworks as runtimeFrameworks,
  getComponent,
  getSetup,
  listComponents,
  listThemes,
  modes,
  theme,
} from "@claymo/core/reference";
import { svelte2tsx } from "svelte2tsx";
import ts from "typescript";
import { differences, schemaShape, typeShape } from "./contract-shapes.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);
const packages = join(root, "packages");
const source = {
  astro: join(packages, "astro/src"),
  svelte: join(packages, "svelte/src/lib"),
  solid: join(packages, "solid/src"),
};
const requested = process.argv.slice(2);
const frameworks = requested.length ? [...new Set(requested)] : Object.keys(source);
for (const framework of frameworks) {
  if (!Object.hasOwn(source, framework)) throw new Error(`Unknown bridge: ${framework}`);
}
const issues = [];
const read = (file) => readFileSync(file, "utf8");
const virtual = new Map();
const virtualComponents = new Map();
const entries = frameworks.map((framework) => join(source[framework], "index.ts"));
const astroSlots = new Map();

function collectAstroSlots(name, code) {
  const tree = ts.createSourceFile(
    `${name}.tsx`,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const names = new Set();
  const visit = (node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(tree) === "slot"
    ) {
      const attr = node.attributes.properties.find(
        (prop) => ts.isJsxAttribute(prop) && prop.name.getText(tree) === "name",
      );
      if (!attr) names.add("default");
      else if (attr.initializer && ts.isStringLiteral(attr.initializer))
        names.add(attr.initializer.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return names;
}

for (const framework of frameworks) {
  if (framework === "solid") continue;
  for (const file of readdirSync(source[framework])) {
    if (!file.endsWith(`.${framework}`)) continue;
    const filename = join(source[framework], file);
    const text = read(filename);
    const shim = `${filename}.${framework === "astro" ? "tsx" : "ts"}`;
    let code;
    if (framework === "astro") {
      const converted = convertToTsx(text, { filename, ambientTypes: true });
      if (converted.hasParseErrors) {
        issues.push(
          `${file}: Astro transform failed: ${converted.diagnostics.map(({ message }) => message).join("; ")}`,
        );
      }
      code = converted.code;
      astroSlots.set(file.split(".")[0], collectAstroSlots(file, code));
    } else {
      code = svelte2tsx(text, { filename, isTsFile: true, mode: "dts" }).code;
    }
    virtual.set(shim, code);
    virtualComponents.set(filename, shim);
  }
}

// Use current source for exported core types, not a potentially stale build's dist declarations.
const core = join(packages, "core");
const coreExports = Object.entries(JSON.parse(read(join(core, "package.json"))).exports);
const paths = Object.fromEntries(
  coreExports.flatMap(([key, value]) => {
    const match = typeof value === "object" && /^\.\/dist\/(.+)\.d\.ts$/.exec(value.types);
    return match ? [[`@claymo/core${key.slice(1)}`, [join(core, "src", `${match[1]}.ts`)]]] : [];
  }),
);
const options = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.Preserve,
  jsxImportSource: "@solidjs/web",
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  allowImportingTsExtensions: true,
  types: [],
  paths,
};
const host = ts.createCompilerHost(options, true);
const original = { ...host };
host.fileExists = (file) => virtual.has(file) || original.fileExists(file);
host.readFile = (file) => virtual.get(file) ?? original.readFile(file);
host.getSourceFile = (file, target, ...rest) =>
  virtual.has(file)
    ? ts.createSourceFile(file, virtual.get(file), target, true)
    : original.getSourceFile(file, target, ...rest);
const resolution = ts.createModuleResolutionCache(root, host.getCanonicalFileName, options);
host.resolveModuleNames = (names, containingFile) =>
  names.map((name) => {
    const component =
      name.startsWith(".") && virtualComponents.get(resolve(dirname(containingFile), name));
    if (component)
      return {
        resolvedFileName: component,
        extension: component.endsWith(".tsx") ? ts.Extension.Tsx : ts.Extension.Ts,
      };
    return ts.resolveModuleName(name, containingFile, options, host, resolution).resolvedModule;
  });

const probe = join(root, "__claymo_contract_probe.ts");
const docs = frameworks.flatMap((framework) =>
  listComponents(framework).map((name) => getComponent(framework, name)),
);
// Use actual runtime results as fresh literals, so extra keys and missing/incorrect
// return types in the hand-written public reference declarations fail TypeScript.
virtual.set(
  probe,
  `import { frameworks, getComponent, getSetup, listComponents, listThemes, modes, theme } from "@claymo/core/reference";
;(${JSON.stringify(runtimeFrameworks)}) satisfies typeof frameworks;
;(${JSON.stringify(modes)}) satisfies typeof modes;
;(${JSON.stringify(theme)}) satisfies typeof theme;
const observedThemes = ${JSON.stringify(listThemes())} satisfies ReturnType<typeof listThemes>;
declare const declaredThemes: ReturnType<typeof listThemes>;
declaredThemes satisfies typeof observedThemes;
declare const declaredNames: ReturnType<typeof listComponents>;
${frameworks
  .map(
    (
      framework,
    ) => `const ${framework}Names = ${JSON.stringify(listComponents(framework))} satisfies ReturnType<typeof listComponents>;
declaredNames satisfies typeof ${framework}Names;
;(${JSON.stringify(getSetup(framework))}) satisfies ReturnType<typeof getSetup>;`,
  )
  .join("\n")}
${docs.map((doc) => `;(${JSON.stringify(doc)}) satisfies ReturnType<typeof getComponent>;`).join("\n")}
type AstroEvents = HTMLElementEventMap;
${
  frameworks.includes("solid")
    ? `
import type { JSX } from "@solidjs/web";
type SolidContent = JSX.Element;
type SolidPropertyAttribute = {
  [Tag in keyof JSX.IntrinsicElements]: Extract<keyof JSX.IntrinsicElements[Tag], \`prop:\${string}\`>;
}[keyof JSX.IntrinsicElements];
`
    : ""
}
${frameworks
  .filter((framework) => framework !== "astro")
  .map(
    (framework) => `
import { Autocomplete as ${framework}Autocomplete } from ${JSON.stringify(join(source[framework], "index.ts"))};
type ${framework}AutocompleteProps = Parameters<typeof ${framework}Autocomplete<boolean>>[${framework === "svelte" ? 1 : 0}];
`,
  )
  .join("\n")}
`,
);
const shimRoots = frameworks.includes("svelte")
  ? [
      require.resolve("svelte2tsx/svelte-shims-v4.d.ts"),
      require.resolve("svelte2tsx/svelte-jsx-v4.d.ts"),
    ]
  : [];
const eventRoots = frameworks.includes("astro")
  ? Object.entries(paths)
      .filter(([name]) => name.startsWith("@claymo/core/behavior/"))
      .map(([, [file]]) => file)
  : [];
const regression = join(root, "__claymo_contract_regression.ts");
virtual.set(
  regression,
  `
export interface Negative {
  variant: "primary" | "ghost";
  options: readonly { label?: string; value: number; selected?: boolean }[];
}
`,
);
const program = ts.createProgram(
  [probe, regression, ...entries, ...shimRoots, ...eventRoots],
  options,
  host,
);
const checker = program.getTypeChecker();
const probeFile = program.getSourceFile(probe);
for (const { messageText } of program.getSemanticDiagnostics(probeFile)) {
  issues.push(`@claymo/core/reference: ${ts.flattenDiagnosticMessageText(messageText, " ")}`);
}
const probeType = (name) => {
  const declaration = probeFile.statements.find(
    (statement) => ts.isTypeAliasDeclaration(statement) && statement.name.text === name,
  );
  return declaration && checker.getTypeAtLocation(declaration);
};
const astroEventMap = probeType("AstroEvents");
const solidContent = probeType("SolidContent");
const solidPropertyAttributes = new Set(
  (probeType("SolidPropertyAttribute")?.types ?? []).flatMap((type) =>
    type.isStringLiteral() ? [type.value] : [],
  ),
);

// DOM attributes (including native handlers) are intentionally not enumerated by the
// JSON reference. This tests each declaration's provenance, not a name/prefix allowlist.
function isNative(doc, prop) {
  const declarations = prop.declarations ?? [];
  if (
    declarations.length &&
    declarations.every((decl) =>
      /\/node_modules\/(?:astro\/(?:astro-jsx|dist\/types\/public\/elements)\.d\.ts|svelte\/elements\.d\.ts|@solidjs\/web\/types\/jsx\.d\.ts|typescript\/lib\/lib\.dom\.d\.ts)$/.test(
        decl.getSourceFile().fileName,
      ),
    )
  )
    return true;
  return (
    doc.framework === "solid" && !declarations.length && solidPropertyAttributes.has(prop.name)
  );
}

// Locally redeclared to forward native values to the concrete control or wrapper.
const forwardedAttributes = new Set([
  "astro/Autocomplete.class",
  "astro/Autocomplete.aria-describedby",
  "svelte/Autocomplete.class",
  "svelte/Autocomplete.aria-describedby",
  "svelte/Chip.onclick",
  "solid/Autocomplete.class",
  "solid/Autocomplete.ref",
  "solid/Autocomplete.aria-describedby",
  "solid/Chip.onClick",
  "solid/TextField.onInput",
  "solid/TextField.ref",
]);
const callSignatures = (type) => checker.getSignaturesOfType(type, ts.SignatureKind.Call);
const membersOf = (type) => (type.isUnion() ? type.types : [type]);
const isSnippet = (member) =>
  callSignatures(member).some((sig) => sig.getDeclaration()?.parent?.name?.getText() === "Snippet");
const isJsx = (type) =>
  solidContent &&
  !(type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) &&
  checker.isTypeAssignableTo(type, solidContent) &&
  checker.isTypeAssignableTo(solidContent, type);
const isContent = (type, framework) =>
  framework === "svelte" ? membersOf(type).some(isSnippet) : framework === "solid" && isJsx(type);
const mentions = (lines, name, ignoreCase = false) =>
  lines.some((line) =>
    new RegExp(
      `(?<![\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`,
      ignoreCase ? "i" : "",
    ).test(line),
  );
const isCallback = (type) => membersOf(type).some((member) => callSignatures(member).length);

// These public JSX-valued props also expose their meaningful text/data subset in
// JSON. Null, booleans, DOM nodes, and arrays in JSX represent rendering rather
// than configuration values for these props. Check the scalar subset explicitly.
const jsxScalars = new Map([
  ["solid/Alert.icon", ts.TypeFlags.BooleanLiteral],
  [
    "solid/Badge.badgeContent",
    ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.Intersection,
  ],
  ["solid/CardHeader.title", ts.TypeFlags.StringLike | ts.TypeFlags.Intersection],
  ["solid/CardHeader.subheader", ts.TypeFlags.StringLike | ts.TypeFlags.Intersection],
  ["solid/FormControlLabel.label", ts.TypeFlags.StringLike | ts.TypeFlags.Intersection],
  ["solid/ListItemText.primary", ts.TypeFlags.StringLike | ts.TypeFlags.Intersection],
  ["solid/ListItemText.secondary", ts.TypeFlags.StringLike | ts.TypeFlags.Intersection],
]);

function projectProp(doc, prop, propType, expected) {
  const key = prop.name;
  const location = `${doc.framework}/${doc.name}.${key}`;
  const native =
    isNative(doc, prop) ||
    (doc.framework === "solid" && doc.name === "TextField" && (key === "cols" || key === "wrap")); // Native textarea attrs redeclared on a mixed control.
  const expectedMembers = expected.kind === "union" ? expected.members : [expected];
  const jsxScalar = jsxScalars.get(location);
  const jsx = doc.framework === "solid" && isJsx(propType);
  return typeShape(
    checker,
    propType,
    (type, path) => {
      if (path !== key || type === propType) return;
      const isFalse =
        type.flags & ts.TypeFlags.BooleanLiteral && checker.typeToString(type) === "false";
      if (jsx && location === "solid/Alert.icon" && !isFalse) return { kind: "never" };
      if (
        jsxScalar &&
        jsx &&
        (!(type.flags & jsxScalar) ||
          (type.flags & ts.TypeFlags.Intersection &&
            !checker.isTypeAssignableTo(checker.getStringType(), type)))
      )
        return { kind: "never" };
      if (jsx && !jsxScalar) throw new Error("JSX content must not be declared as a JSON prop");
      // A snippet can substitute for text; it is checked separately as content.
      if (isSnippet(type)) return { kind: "never" };
      // Inherited DOM attributes permit null as omission and, in Astro/Svelte, the
      // legacy Booleanish string form of a native boolean. The reference describes
      // the canonical scalar spelling, not these alternative DOM representations.
      if (
        native &&
        type.flags & ts.TypeFlags.Null &&
        !expectedMembers.some(({ kind }) => kind === "null")
      ) {
        return { kind: "never" };
      }
      if (native && expected.kind === "boolean" && type.flags & ts.TypeFlags.String) {
        return { kind: "never" };
      }
      if (native && doc.framework === "solid") {
        // Solid's RemoveAttribute=false and BooleanAttribute="" are native JSX
        // spellings, not additional Claymo configuration values.
        if (
          isFalse &&
          !expectedMembers.some(({ kind, value }) => kind === "boolean" || value === false)
        ) {
          return { kind: "never" };
        }
        if (expected.kind === "boolean" && type.isStringLiteral() && type.value === "") {
          return { kind: "never" };
        }
      }
    },
    key,
  );
}

function checkBindings(doc, component) {
  if (doc.framework !== "svelte") return;
  const { name, content, events, examples, props } = doc;
  const declarations = checker.getPropertyOfType(component, "z_$$bindings");
  const actual = declarations
    ? membersOf(checker.getTypeOfSymbol(declarations)).flatMap((member) =>
        member.isStringLiteral() && member.value ? [member.value] : [],
      )
    : [];
  const documented = new Set(
    [
      ...content,
      ...events,
      ...Object.values(props.properties).map((prop) => prop.description ?? ""),
    ].flatMap((text) => [...text.matchAll(/\bbind:([\w$]+)\b/g)].map((match) => match[1])),
  );
  // Examples can contain other bridges' components or native form controls. Only
  // treat a binding on this component's opening tag as evidence for this component.
  for (const { source: example } of examples) {
    for (const match of example.matchAll(new RegExp(`<${name}\\b[^>]*`, "g"))) {
      for (const [, binding] of match[0].matchAll(/\bbind:([\w$]+)\b/g)) documented.add(binding);
    }
  }
  documented.delete("this"); // Every Svelte component has the language's bind:this directive.
  for (const binding of documented) {
    if (!actual.includes(binding))
      issues.push(`svelte/${name}: documented bind:${binding} is not bindable`);
  }
  for (const binding of actual) {
    if (!documented.has(binding))
      issues.push(`svelte/${name}: bind:${binding} is missing from the reference`);
  }
}

function checkComponent(doc, component, signature) {
  const { framework, name, props, content, events } = doc;
  const prefix = `${framework}/${name}`;
  const parameter = signature.parameters[framework === "svelte" ? 1 : 0];
  if (!parameter && !Object.keys(props.properties).length && !content.length && !events.length)
    return;
  if (!parameter) {
    issues.push(`${prefix}: no public props parameter`);
    return;
  }
  // Taking both concrete boolean cases tests the actual distributive
  // Autocomplete conditional type instead of accepting an opaque generic.
  const propsType =
    (name === "Autocomplete" &&
      framework !== "astro" &&
      probeType(`${framework}AutocompleteProps`)) ||
    checker.getTypeOfSymbol(parameter);
  if (propsType.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    issues.push(`${prefix}: public props resolved to ${checker.typeToString(propsType)}`);
    return;
  }
  const required = new Set(props.required ?? []);
  for (const key of required) {
    if (!Object.hasOwn(props.properties, key))
      issues.push(`${prefix}.${key}: required prop has no schema`);
  }
  for (const [key, schema] of Object.entries(props.properties)) {
    const actual = checker.getPropertyOfType(propsType, key);
    if (!actual) {
      issues.push(`${prefix}.${key}: schema prop is not declared`);
      continue;
    }
    if (required.has(key) === Boolean(actual.flags & ts.SymbolFlags.Optional)) {
      issues.push(
        `${prefix}.${key}: schema is ${required.has(key) ? "required" : "optional"}; declaration is ${required.has(key) ? "optional" : "required"}`,
      );
    }
    try {
      const expected = schemaShape(schema);
      issues.push(
        ...differences(
          expected,
          projectProp(doc, actual, checker.getTypeOfSymbol(actual), expected),
          `${prefix}.${key}`,
        ),
      );
    } catch (error) {
      issues.push(`${prefix}.${key}: ${error.message}`);
    }
  }
  for (const prop of checker.getPropertiesOfType(propsType)) {
    const key = prop.name;
    if (framework === "svelte" && ["$$events", "$$slots"].includes(key)) continue; // Generated legacy metadata.
    const native =
      (isNative(doc, prop) || forwardedAttributes.has(`${prefix}.${key}`)) &&
      prop.flags & ts.SymbolFlags.Optional;
    if (native && !Object.hasOwn(props.properties, key)) continue;
    const propType = checker.getTypeOfSymbol(prop);
    if (isContent(propType, framework)) {
      if (!mentions(content, key)) issues.push(`${prefix}.${key}: content prop is not documented`);
      if (
        !(prop.flags & ts.SymbolFlags.Optional) &&
        !required.has(key) &&
        !content.some((line) => mentions([line], key) && /\brequired\b/i.test(line))
      ) {
        issues.push(`${prefix}.${key}: required content prop is not described as required`);
      }
    }
    if (/^on[A-Z]/.test(key) && isCallback(propType)) {
      if (!Object.hasOwn(props.properties, key))
        issues.push(`${prefix}.${key}: callback is missing from schema props`);
      if (!mentions(events, key)) issues.push(`${prefix}.${key}: callback is missing from events`);
      continue;
    }
    if (Object.hasOwn(props.properties, key) || isContent(propType, framework)) continue;
    issues.push(`${prefix}.${key}: declared prop is missing from schema`);
  }
  if (framework === "astro") {
    for (const name of astroSlots.get(doc.name) ?? []) {
      if (!mentions(content, name, name === "default"))
        issues.push(`${prefix}: slot ${name} is missing from content`);
    }
    for (const event of events.flatMap((text) =>
      [...text.matchAll(/(?<![.\w-])clay-[\w-]+\b/g)].map(([name]) => name),
    )) {
      if (!checker.getPropertyOfType(astroEventMap, event))
        issues.push(`${prefix}: ${event} is not in the DOM event map`);
    }
  } else {
    for (const event of events.flatMap((text) =>
      [...text.matchAll(/\b(on[A-Za-z]+)(?=\()/g)].map(([, name]) => name),
    )) {
      const prop = checker.getPropertyOfType(propsType, event);
      if (!prop || !isCallback(checker.getTypeOfSymbol(prop))) {
        issues.push(`${prefix}.${event}: documented handler is not a public callback`);
      }
    }
  }
  checkBindings(doc, component);
}

function exportsOf(file) {
  const tree = program.getSourceFile(file);
  const module = tree && checker.getSymbolAtLocation(tree);
  if (!module) throw new Error(`Cannot load public declarations from ${file}`);
  return checker
    .getExportsOfModule(module)
    .map((symbol) => [
      symbol.name,
      symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol,
    ]);
}

for (const [i, framework] of frameworks.entries()) {
  const names = new Set(listComponents(framework));
  const exports = new Map(
    exportsOf(entries[i]).filter(
      ([name, symbol]) => /^[A-Z]/.test(name) && symbol.flags & ts.SymbolFlags.Value,
    ),
  );
  for (const name of names) {
    const component = exports.get(name);
    if (!component) {
      issues.push(`${framework}/${name}: documented component is not publicly exported`);
      continue;
    }
    const type = checker.getTypeOfSymbol(component);
    const [signature] = callSignatures(type);
    if (!signature) issues.push(`${framework}/${name}: public export has no call signature`);
    else checkComponent(getComponent(framework, name), type, signature);
  }
  for (const name of exports.keys()) {
    if (!names.has(name))
      issues.push(`${framework}/${name}: public component is missing from the catalog`);
  }
}

// Cross-framework MCP reference parity checks (when checking all frameworks together).
if (frameworks.length === runtimeFrameworks.length) {
  const stripDesc = (value) => {
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(stripDesc);
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => k !== "description")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, stripDesc(v)]),
    );
  };
  const reactiveOnlyProps = new Set(["defaultOpen", "defaultValue"]);
  const astroOnlyProps = new Set([
    "dismissible",
    "deletable",
    "clickableRows",
    "id",
    "tabs",
    "tabsId",
    "selected",
  ]);
  const byFramework = Object.fromEntries(
    frameworks.map((fw) => [fw, new Map(listComponents(fw).map((n) => [n, getComponent(fw, n)]))]),
  );
  for (const name of listComponents("astro")) {
    const astro = byFramework.astro.get(name);
    const svelte = byFramework.svelte.get(name);
    const solid = byFramework.solid.get(name);
    if (!svelte || !solid) {
      issues.push(`parity/${name}: missing in one or more frameworks`);
      continue;
    }
    // Svelte and Solid must expose identical prop keys and requiredness.
    const svelteKeys = Object.keys(svelte.props.properties).sort();
    const solidKeys = Object.keys(solid.props.properties).sort();
    if (JSON.stringify(svelteKeys) !== JSON.stringify(solidKeys)) {
      issues.push(
        `parity/${name}: svelte props (${svelteKeys.join(", ")}) != solid props (${solidKeys.join(", ")})`,
      );
    }
    if (
      JSON.stringify([...svelte.props.required].sort()) !==
      JSON.stringify([...solid.props.required].sort())
    ) {
      issues.push(`parity/${name}: svelte required != solid required`);
    }
    // Every prop shared by two or more frameworks must agree on schema shape and default.
    const allProps = new Set([...Object.keys(astro.props.properties), ...svelteKeys, ...solidKeys]);
    for (const key of allProps) {
      const present = frameworks.filter((fw) =>
        Object.hasOwn(byFramework[fw].get(name).props.properties, key),
      );
      if (present.length === 1 && present[0] === "astro" && !astroOnlyProps.has(key)) {
        issues.push(`parity/${name}.${key}: astro-only prop is not an allowed Astro idiom`);
      }
      if (
        present.length === 2 &&
        !present.includes("astro") &&
        !/^on[A-Z]/.test(key) &&
        !reactiveOnlyProps.has(key)
      ) {
        issues.push(`parity/${name}.${key}: missing in astro`);
      }
      if (present.length > 1 && !(name === "TextField" && key === "type")) {
        const shapes = new Map(
          present.map((fw) => [
            fw,
            JSON.stringify(stripDesc(byFramework[fw].get(name).props.properties[key])),
          ]),
        );
        if (new Set(shapes.values()).size > 1) {
          issues.push(
            `parity/${name}.${key}: schema/default differs across frameworks (${[...shapes.entries()].map(([f, s]) => `${f}=${s}`).join(" vs ")})`,
          );
        }
      }
    }
    // Prevent cross-framework prose leaks in single-framework MCP responses.
    for (const [key, prop] of Object.entries(astro.props.properties)) {
      if (/\bSvelte\b|\bbind:/.test(prop.description ?? ""))
        issues.push(`astro/${name}.${key}: description leaks Svelte prose`);
    }
    for (const [key, prop] of Object.entries(svelte.props.properties)) {
      if (/\bAstro\b/.test(prop.description ?? ""))
        issues.push(`svelte/${name}.${key}: description leaks Astro prose`);
    }
  }
}

// Guard against regressions that a one-way assignability check would miss.
const [, negative] = exportsOf(regression)[0];
const negativeType = checker.getDeclaredTypeOfSymbol(negative);
const negativeIssues = differences(
  schemaShape({
    type: "object",
    required: ["variant", "options"],
    properties: {
      variant: { enum: ["primary", "secondary"] },
      options: {
        type: "array",
        items: {
          type: "object",
          required: ["label", "value"],
          properties: {
            label: { type: "string" },
            value: { type: "string" },
            typo: { type: "boolean" },
          },
        },
      },
    },
  }),
  typeShape(checker, negativeType),
  "negative",
);
for (const expected of [
  'negative.variant: schema documents "secondary"',
  'negative.variant: declaration accepts undocumented "ghost"',
  "negative.options[].label: schema is required; declaration is optional",
  "negative.options[].value: schema is string; declaration is number",
  "negative.options[].typo: schema field is not declared",
  "negative.options[].selected: declared field is missing",
]) {
  if (!negativeIssues.some((issue) => issue.startsWith(expected)))
    issues.push(`Negative regression missed: ${expected}`);
}

if (issues.length) {
  console.error([...new Set(issues)].join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Claymo public contracts agree for ${docs.length} component declarations (${frameworks.join(", ")}).`,
  );
}
