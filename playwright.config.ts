import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  // The dev server compiles routes on first visit; allow for that under parallel load.
  expect: { timeout: 15_000 },
  // Uses the installed Chrome so no Playwright browser download is needed.
  use: { baseURL: "http://localhost:3000", channel: "chrome" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    env: { CONTENT_SOURCE: "fs", AI_PROVIDER: "mock" },
  },
});
