import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { getComponent } from "../reference/index.js";
import { dataTableDefaults } from "./data-table.ts";

// Inspect the actual prop, rather than copying DataTablePaginationModel into a test fixture.
function paginationContract() {
  const path = fileURLToPath(new URL("./data-table.ts", import.meta.url));
  const program = ts.createProgram([path], {
    module: ts.ModuleKind.NodeNext,
    strict: true,
    types: [],
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(path)!;
  const options = source.statements.find(
    (s): s is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(s) && s.name.text === "DataTableOptions",
  );
  assert.ok(options);
  const prop = checker.getTypeAtLocation(options).getProperty("paginationModel");
  assert.ok(prop);
  const model = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(prop, options));
  const fields = model.getProperties();
  return {
    requiredProp: !(prop.flags & ts.SymbolFlags.Optional),
    requiredFields: fields
      .filter((field) => !(field.flags & ts.SymbolFlags.Optional))
      .map((field) => field.name),
    fieldTypes: Object.fromEntries(
      fields.map((field) => [
        field.name,
        checker.typeToString(checker.getTypeOfSymbolAtLocation(field, options)),
      ]),
    ),
  };
}

test("DataTable pagination schemas match the TypeScript prop in both bridges", () => {
  const contract = paginationContract();
  for (const framework of ["astro", "svelte"] as const) {
    const { props } = getComponent(framework, "DataTable");
    const model = props.properties.paginationModel!;
    assert.equal(props.required.includes("paginationModel"), contract.requiredProp, framework);
    assert.equal(model.type, "object", framework);
    assert.deepEqual(
      new Set(model.required as string[]),
      new Set(contract.requiredFields),
      framework,
    );
    const properties = model.properties as Record<string, { type: string }>;
    assert.deepEqual(
      Object.fromEntries(Object.entries(properties).map(([key, field]) => [key, field.type])),
      contract.fieldTypes,
      framework,
    );
    assert.deepEqual(model.default, dataTableDefaults.paginationModel, framework);
  }
});
