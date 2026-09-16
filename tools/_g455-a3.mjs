// G-455/A3 — eine Aenderung in Preferences wirkt in Settings.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
const zeilen = async (pfad) => {
  await s.goto(`${BASIS}${pfad}`, { waitUntil: 'networkidle' })
  await s.waitForSelector('.v2-allergie-form', { timeout: 30000 })
  await s.waitForTimeout(1000)
  return s.evaluate(() => Array.from(
    document.querySelectorAll('.v2-allergie-zeile'))
    .map(z => z.querySelector('.v2-allergie-stoff')?.textContent?.trim()))
}

// 1) In PREFERENCES anlegen.
await s.goto(`${BASIS}/v2/nutrition?tab=prefs`, { waitUntil: 'networkidle' })
await s.waitForSelector('.v2-allergie-form', { timeout: 30000 })
await s.waitForTimeout(1200)
const vorPrefs = await s.evaluate(() => document.querySelectorAll('.v2-allergie-zeile').length)
await s.fill('input[aria-label="Stoff"]', 'Soja')
await s.selectOption('select[aria-label="Art"]', 'nahrung')
await s.selectOption('select[aria-label="Schwere"]', 'anaphylaxie')
await s.locator('button:has-text("Hinzufügen")').first().click()
await s.waitForFunction(n => document.querySelectorAll('.v2-allergie-zeile').length > n,
  vorPrefs, { timeout: 30000 }).catch(()=>{})
await s.waitForTimeout(1200)
const inPrefs = await s.evaluate(() => Array.from(
  document.querySelectorAll('.v2-allergie-zeile'))
  .map(z => z.querySelector('.v2-allergie-stoff')?.textContent?.trim()))

// 2) In SETTINGS nachsehen.
const inSettings = await zeilen('/v2/settings')

console.log(JSON.stringify({
  angelegtIn: 'preferences', stoff: 'Soja',
  inPrefs, inSettings,
  sichtbarInSettings: inSettings.includes('Soja'),
}, null, 2))
await b.close()
