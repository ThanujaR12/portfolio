import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  // The dev server compiles routes on first visit; allow for that under parallel load.
  expect: { timeout: 15_000 },
  // One retry absorbs clicks that land before hydration while the dev server is still
  // compiling routes on a cold start. A test that only passes on retry is reported as flaky.
  retries: 1,
  // Uses the installed Chrome so no Playwright browser download is needed.
  use: { baseURL: "http://localhost:3000", channel: "chrome" },
  projects: [
    {
      name: "desktop",
      testIgnore: /admin\.spec/,
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1280, height: 800 } },
    },
    { name: "mobile", testIgnore: /admin\.spec/, use: { ...devices["Pixel 7"], channel: "chrome" } },
    // Edits content on disk, so it runs alone after the read-only suites.
    {
      name: "admin",
      testMatch: /admin\.spec/,
      dependencies: ["desktop", "mobile"],
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1400, height: 900 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    env: { CONTENT_SOURCE: "fs", AI_PROVIDER: "mock", ADMIN_DEV_LOGIN: "1" },
  },
});
