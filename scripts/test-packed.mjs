// Packs every publishable workspace and installs the tarballs into copies of the fixtures outside
// the repo (so hoisted workspace deps cannot mask a missing dependency). Each fixture's check-mcp.mjs
// acts as an agent against the installed claymo-mcp binary; the Astro app is then type-checked,
// built and tested with Playwright, and the SvelteKit app is type-checked and built.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const packages = ["packages/core", "packages/svelte", "packages/astro", "packages/mcp"];
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: "inherit" });

run("npm", ["run", "build", "-w", "@claymo/core", "-w", "@claymo/svelte"]);
for (const dir of packages) run("npx", ["publint", "--strict", dir]);

const work = mkdtempSync(path.join(tmpdir(), "claymo-packed-"));
const packs = path.join(work, "packs");
const app = path.join(work, "app");
const kit = path.join(work, "sveltekit");
mkdirSync(packs);
for (const dir of packages) run("npm", ["pack", "--pack-destination", packs], path.join(root, dir));
const copy = (fixture, to) =>
  cpSync(path.join(root, "fixtures", fixture), to, {
    recursive: true,
    filter: (src) => !/[\\/](node_modules|dist|build|\.astro|\.svelte-kit)$/.test(src),
  });
copy("packed-consumer", app);
copy("packed-sveltekit", kit);

const tarballs = readdirSync(packs).map((file) => path.join(packs, file));
for (const dir of [app, kit]) run("npm", ["install", "--no-audit", "--no-fund", ...tarballs], dir);
run("node", ["check-mcp.mjs"], kit);
run("node", ["check-mcp.mjs"], app);
run("npm", ["run", "check"], app);
run("npm", ["run", "build"], app);
run("npm", ["test"], app);
console.log(`\nPacked consumers passed: ${work}`);
