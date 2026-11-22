// Packs every publishable workspace and installs the tarballs into copies of the fixtures outside
// the repo (so hoisted workspace deps cannot mask a missing dependency). Each fixture's check-mcp.mjs
// acts as an agent against the installed claymo-mcp binary. Solid and Astro have browser tests;
// SvelteKit also validates the prerendered HTML and CSS returned by its setup.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const packages = ["core", "svelte", "astro", "solid", "mcp"];
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: "inherit" });

run("npm", ["run", "prepare"]);
for (const name of packages) run("npx", ["publint", "--strict", `packages/${name}`]);

const work = mkdtempSync(path.join(tmpdir(), "claymo-packed-"));
const packs = path.join(work, "packs");
const app = path.join(work, "app");
const kit = path.join(work, "sveltekit");
const solid = path.join(work, "solid");
mkdirSync(packs);
for (const name of packages)
  run(
    "npm",
    ["pack", "--ignore-scripts", "--pack-destination", packs],
    path.join(root, "packages", name),
  );
const copy = (fixture, to) =>
  cpSync(path.join(root, "fixtures", fixture), to, {
    recursive: true,
    filter: (src) => !/[\\/](node_modules|dist|build|\.astro|\.svelte-kit)$/.test(src),
  });
copy("packed-consumer", app);
copy("packed-sveltekit", kit);
copy("packed-solid", solid);

const packed = readdirSync(packs);
function install(dir, names) {
  const tarballs = names.map((name) => {
    const file = packed.find((p) => p.startsWith(`claymo-${name}-`));
    if (!file) throw new Error(`Missing packed ${name}`);
    return path.join(packs, file);
  });
  run("npm", ["install", "--no-audit", "--no-fund", ...tarballs], dir);
}
install(app, ["core", "svelte", "astro", "mcp"]);
install(kit, ["core", "svelte", "mcp"]);
install(solid, ["core", "solid", "mcp"]);
run("node", ["check-mcp.mjs"], solid);
run("npx", ["playwright", "test"], solid);
run("node", ["check-mcp.mjs"], kit);
run("node", ["check-mcp.mjs"], app);
run("npm", ["run", "check"], app);
run("npm", ["run", "build"], app);
run("npm", ["test"], app);
console.log(`\nPacked consumers passed: ${work}`);
