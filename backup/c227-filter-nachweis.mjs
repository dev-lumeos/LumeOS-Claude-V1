// C-227-Nachweis: Mehrfachauswahl peptide + aas — erwartet 91 Treffer
// (60 + 31, live gezaehlt). Headless, Anmeldung wie tools/schuss.mjs.
import { chromium } from '@playwright/test'

const BASIS = 'http://localhost:3200'
const KONTO = 'dev@lumeos.app'
const WORT = process.env.LUMEOS_WORT ?? 'LumeosDev2026'

const browser = await chromium.launch({ headless: true })
const seite = await browser.newPage({ viewport: { width: 1440, height: 900 } })

try {
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  if (await seite.locator('input[type=email]').count()) {
    await seite.fill('input[type=email]', KONTO)
    await seite.fill('input[type=password]', WORT)
    await Promise.all([
      seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
      seite.click('button[type=submit]'),
    ])
  }

  await seite.goto(`${BASIS}/v2/supplements?tab=catalog`,
    { waitUntil: 'networkidle', timeout: 120_000 })
  await seite.click('button:has-text("peptide · 60")')
  await seite.click('button:has-text("aas · 31")')
  const zeile = await seite.locator('text=/\\d+ Treffer/').first().textContent()
  console.log('TREFFERZEILE:', zeile)
  await seite.screenshot({ path: 'backup/c227-filter-peptide-aas.png' })

  // Und der eigene Zustand der Unzugeordneten.
  await seite.click('button:has-text("peptide · 60")')
  await seite.click('button:has-text("aas · 31")')
  await seite.click('button:has-text("unzugeordnet · 276")')
  console.log('UNZUGEORDNET:', await seite.locator('text=/\\d+ Treffer/').first().textContent())
  await seite.screenshot({ path: 'backup/c227-filter-unzugeordnet.png' })
} finally {
  await browser.close()
}
