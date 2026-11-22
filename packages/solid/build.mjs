import solid from "@solidjs/vite-plugin";
import { build } from "vite";

// Keep the consumer's reactive runtime and core recipes shared between every component.
const external = (id) => /^(?:solid-js|@solidjs\/web|@claymo\/core)(?:\/|$)/.test(id);
for (const ssr of [false, true]) {
  await build({
    configFile: false,
    plugins: [solid({ ssr: true })],
    build: {
      ssr,
      emptyOutDir: !ssr,
      lib: { entry: "src/index.ts", formats: ["es"] },
      rolldownOptions: { external, output: { entryFileNames: ssr ? "server.js" : "client.js" } },
    },
  });
}
