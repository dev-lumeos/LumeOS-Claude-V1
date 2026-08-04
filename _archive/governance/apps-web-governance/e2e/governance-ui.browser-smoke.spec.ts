import fs from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

const routes = [
  { path: '/governance', heading: 'Dashboard', marker: 'Product Work Gate' },
  { path: '/governance/batches', heading: 'Batches', marker: 'Operator Actions' },
  { path: '/governance/doctor', heading: 'Doctor', marker: 'Doctor Diagnosis' },
  { path: '/governance/approvals', heading: 'Approvals', marker: 'Approval Controls' },
  { path: '/governance/dossiers', heading: 'Dossiers', marker: 'Dossier Timeline' },
  { path: '/governance/workorders', heading: 'Workorders', marker: 'Workorder Graph' },
  { path: '/governance/promotion', heading: 'Promotion', marker: 'Promotion Review' },
  { path: '/governance/learning', heading: 'Learning', marker: 'Current Governance Handover' },
  { path: '/governance/runtime', heading: 'Runtime', marker: 'Runtime Routes' },
  { path: '/governance/settings', heading: 'Settings', marker: 'Safety Rules' },
]

const screenshotDir = path.join(process.cwd(), 'tmp', 'governance-ui-browser-smoke', 'screenshots')

test.describe('Governance UI browser smoke', () => {
  test.beforeAll(() => {
    fs.mkdirSync(screenshotDir, { recursive: true })
  })

  for (const route of routes) {
    test(`${route.path} renders governance shell`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'networkidle' })

      await expect(page.getByText('Governance Console')).toBeVisible()
      await expect(page.getByRole('navigation')).toContainText('Dashboard')
      await expect(page.getByRole('heading', { name: route.heading, exact: true })).toBeVisible()
      await expect(page.getByText(route.marker, { exact: false }).first()).toBeVisible()
      await expect(page.getByText('No Supabase push/reset, migrations, approval auto-grants, or product batches are exposed here.')).toBeVisible()

      await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error')
      await expect(page.locator('body')).not.toContainText('Application error')
      await expect(page.locator('body')).not.toContainText('This page could not be found')
      await expect(page.locator('body')).not.toContainText('NEXT_NOT_FOUND')

      await page.screenshot({
        path: path.join(screenshotDir, `${route.path.replace(/^\//, '').replace(/\//g, '-') || 'governance'}.png`),
        fullPage: true,
      })
    })
  }
})
