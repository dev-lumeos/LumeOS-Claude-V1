// C-229-Nachweis: Detail eingeklappt/aufgeklappt, Add-Dialog mit
// Stackwahl, Zuteilung in den gewaehlten Stack. Headless, Anmeldung
// wie tools/schuss.mjs.
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

  // Detail per Deep-Link — Start: alle Bloecke ZU.
  await seite.goto(`${BASIS}/v2/supplements?tab=database&substanz=sub_9f9bb8c160`,
    { waitUntil: 'networkidle', timeout: 120_000 })
  await seite.waitForSelector('[role=dialog]', { timeout: 30_000 })
  const offenVorher = await seite.locator('[aria-expanded=true]').count()
  console.log('BLOECKE OFFEN BEIM START:', offenVorher)
  await seite.screenshot({ path: 'backup/c229-detail-zu.png' })

  // Zwei Bloecke aufklappen.
  await seite.click('button:has-text("Pharmakokinetik")')
  await seite.click('button:has-text("Sicherheit")')
  await seite.screenshot({ path: 'backup/c229-detail-auf.png' })

  // Add ist separat: der Knopf oeffnet den Dialog mit Stackwahl.
  await seite.click('[role=dialog] button:has-text("Add to stack")')
  await seite.waitForSelector('select[aria-label=Stack]', { timeout: 30_000 })
  console.log('STACKWAHL:', await seite.locator('select[aria-label=Stack] option').allTextContents())
  await seite.fill('[aria-label=Dosis]', '5')
  await seite.selectOption('select[aria-label=Einheit]', 'g')
  await seite.screenshot({ path: 'backup/c229-add-dialog.png' })
  await seite.click('button:has-text("Add to stack"):not([aria-expanded])')
  await seite.waitForTimeout(2500)
  await seite.screenshot({ path: 'backup/c229-add-danach.png' })
} finally {
  await browser.close()
}
