import { defineConfig, devices } from "@playwright/test";

// Smoke tests for the signed-out app (e2e/). They run against a live site: BASE_URL, or the production
// site by default. CI runs them after each Vercel production deploy (.github/workflows/e2e.yml).
//   npm run test:e2e                                   production, local Chrome
//   BASE_URL=http://localhost:3000 npm run test:e2e    a local dev server
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "https://shadowing-app-liard.vercel.app",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "phone",
      // Locally the installed Chrome is used, so no browser download is needed.
      use: { ...devices["Pixel 7"], channel: process.env.CI ? undefined : "chrome" },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome" },
    },
  ],
});
