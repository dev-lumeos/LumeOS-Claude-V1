import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.GOVERNANCE_UI_PORT ?? 5001)
const HOST = '127.0.0.1'

export default defineConfig({
  testDir: './apps/web/e2e',
  timeout: 60_000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 1000 },
  },
  outputDir: './tmp/governance-ui-browser-smoke/playwright-output',
  webServer: {
    command: `pnpm --dir apps/web exec next dev -H ${HOST} -p ${PORT}`,
    url: `http://${HOST}:${PORT}/governance`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
