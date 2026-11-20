import { defineConfig, devices } from "@playwright/test";

const port = 4331;

export default defineConfig({
  testDir: "tests",
  // The dev server is what `npm start` runs from a fresh clone. `--ignore-lock` keeps it in the
  // foreground: Astro otherwise backgrounds itself under CI or an agent, which Playwright treats as an exit.
  webServer: {
    command: `npm run dev -- --port ${port} --ignore-lock`,
    port,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: `http://localhost:${port}`, reducedMotion: "reduce" },
  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    { name: "firefox", use: devices["Desktop Firefox"] },
    { name: "webkit", use: devices["Desktop Safari"] },
  ],
});
