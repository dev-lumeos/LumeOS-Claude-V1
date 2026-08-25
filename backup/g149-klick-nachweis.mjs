// G-149-Nachweis: der Einnahme-Haken bucht auf den ANGESEHENEN Tag.
// Erwartung vorher: dev sieht den Protokolltag 2026-08-19 (juengster
// intake_date); der Klick muss auf 2026-08-19 buchen — die alte Logik
// haette auf das echte Heute (2026-08-23) gebucht.
// Headless, Anmeldung wie tools/schuss.mjs. Rueckbau macht die Messung.
import { chromium } from '@playwright/test'

const BASIS = 'http://localhost:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
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

  await seite.goto(`${BASIS}/v2/supplements?tab=today`,
    { waitUntil: 'networkidle', timeout: 120_000 })
  const knopf = seite.locator('button[aria-label="Als genommen markieren"]').first()
  await knopf.waitFor({ timeout: 30_000 })
  await seite.screenshot({ path: 'backup/g149-vorher-klick.png' })
  await knopf.click()
  await seite.waitForTimeout(2500)
  await seite.screenshot({ path: 'backup/g149-nach-klick.png' })
  console.log('GEKLICKT')
} finally {
  await browser.close()
}
