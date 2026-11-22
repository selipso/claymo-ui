import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { detectFramework, detectSvelteIslands, readProject } from "./project.js";

test("an installed bridge wins; otherwise app frameworks take precedence over their islands", () => {
  assert.equal(detectFramework({ dependencies: { astro: "7", "@claymo/svelte": "0" } }), "svelte");
  assert.equal(
    detectFramework({ devDependencies: { "@sveltejs/kit": "3", svelte: "5" } }),
    "svelte",
  );
  // An Astro site with Svelte islands is an Astro project.
  assert.equal(detectFramework({ dependencies: { astro: "7", svelte: "5" } }), "astro");
  assert.equal(
    detectFramework({ dependencies: { astro: "7", "@claymo/astro": "0", "@claymo/svelte": "0" } }),
    "astro",
  );
  assert.equal(detectFramework({ dependencies: { react: "19" } }), undefined);
  assert.equal(
    detectFramework({ dependencies: { "@claymo/astro": "0", "@claymo/solid": "0" } }),
    undefined,
  );
});

test("detects the Solid bridge, SolidStart, and vanilla Solid dependencies", () => {
  assert.equal(
    detectFramework({ dependencies: { astro: "7" }, devDependencies: { "@claymo/solid": "0" } }),
    "solid",
  );
  assert.equal(
    detectFramework({ dependencies: { "@solidjs/start": "2", "solid-js": "2", svelte: "5" } }),
    "solid",
  );
  assert.equal(detectFramework({ dependencies: { "solid-js": "2" } }), "solid");
  assert.equal(detectFramework({ devDependencies: { "@solidjs/web": "2" } }), "solid");
  assert.equal(detectFramework({ dependencies: { astro: "7", "solid-js": "2" } }), "astro");
  assert.equal(
    detectFramework({ dependencies: { astro: "7", "@claymo/astro": "0", "@claymo/solid": "0" } }),
    "astro",
  );
});

test("detects Svelte islands only in Astro projects with a Svelte dependency", () => {
  assert.equal(detectSvelteIslands({ dependencies: { astro: "7", svelte: "5" } }), true);
  assert.equal(
    detectSvelteIslands({
      dependencies: { astro: "7", "@claymo/astro": "0" },
      devDependencies: { "@claymo/svelte": "0" },
    }),
    true,
  );
  assert.equal(detectSvelteIslands({ dependencies: { astro: "7" } }), false);
  assert.equal(detectSvelteIslands({ dependencies: { "@sveltejs/kit": "3", svelte: "5" } }), false);
  assert.equal(
    detectSvelteIslands({ dependencies: { "@solidjs/start": "2", svelte: "5" } }),
    false,
  );
  assert.equal(detectSvelteIslands({ dependencies: { astro: "7", "@claymo/svelte": "0" } }), false);
});

test("reads project defaults from package.json, tolerating absence but not invalid JSON", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "claymo-mcp-project-"));
  try {
    const manifest = path.join(dir, "package.json");
    assert.deepEqual(readProject(dir), { framework: undefined, svelteIslands: false });
    writeFileSync(manifest, JSON.stringify({ dependencies: { astro: "7", svelte: "5" } }));
    assert.deepEqual(readProject(dir), { framework: "astro", svelteIslands: true });
    writeFileSync(manifest, JSON.stringify({ devDependencies: { "@claymo/solid": "0" } }));
    assert.deepEqual(readProject(dir), { framework: "solid", svelteIslands: false });
    writeFileSync(manifest, "{");
    assert.throws(() => readProject(dir), SyntaxError);
  } finally {
    rmSync(dir, { recursive: true });
  }
});
