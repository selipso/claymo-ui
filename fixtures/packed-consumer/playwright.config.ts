import { defineConfig, devices } from "@playwright/test";

const use = { baseURL: "http://localhost:4329", reducedMotion: "reduce" } as const;

export default defineConfig({
  testDir: "tests",
  webServer: { command: "node serve.mjs", port: 4329, env: { PORT: "4329" } },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], ...use } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], ...use } },
    { name: "webkit", use: { ...devices["Desktop Safari"], ...use } },
  ],
});
