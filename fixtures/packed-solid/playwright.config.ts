import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  use: { baseURL: "http://127.0.0.1:4334", reducedMotion: "reduce" },
  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 4334 --strictPort",
    url: "http://127.0.0.1:4334",
  },
  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    { name: "firefox", use: devices["Desktop Firefox"] },
    { name: "webkit", use: devices["Desktop Safari"] },
  ],
});
