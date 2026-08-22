// C-224-Nachweis: Zuteilung aus der Detailansicht in den gewaehlten
// Stack — angemeldet als dev@lumeos.app, headless, kein Fenster.
// Anmeldesequenz wie tools/schuss.mjs.
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

  await seite.goto(`${BASIS}/v2/supplements?tab=catalog&substanz=sub_9f9bb8c160`,
    { waitUntil: 'networkidle', timeout: 120_000 })
  await seite.waitForSelector('[role=dialog]', { timeout: 30_000 })

  // Stackwahl steht auf dem ersten (aktiven) Stack; Dosis und Einheit
  // tippt der Nutzer — hier der Nachweislauf.
  await seite.fill('[aria-label=Dosis]', '5')
  await seite.fill('[aria-label=Einheit]', 'g')
  await seite.screenshot({ path: 'backup/c224-zuteilung-vorher.png' })
  await seite.click('button:has-text("Zuteilen")')
  await seite.waitForSelector('text=/Zugeteilt zu/', { timeout: 30_000 })
  await seite.screenshot({ path: 'backup/c224-zuteilung-nachher.png' })
  console.log('MELDUNG:', await seite.locator('text=/Zugeteilt zu/').textContent())
} finally {
  await browser.close()
}
