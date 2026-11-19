import { defineConfig } from "astro/config";
import claymo from "@claymo/astro/integration";

export default defineConfig({
  integrations: [claymo({ svelte: true })],
  devToolbar: { enabled: false },
});
