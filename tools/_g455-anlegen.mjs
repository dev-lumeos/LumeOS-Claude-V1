// G-455/A1 — eine Allergie ueber die OBERFLAECHE anlegen.
// `[read]` Ueber die Oberflaeche, nicht per SQL: A1 verlangt genau
// das, und nur so ist der Schreibweg belegt.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const STOFF = process.argv[2] ?? 'Magnesium Stearate'
const ART = process.argv[3] ?? 'supplement'
const SCHWERE = process.argv[4] ?? 'unvertraeglichkeit'
const FOTO = process.argv[5] ?? null

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/settings`, { waitUntil: 'networkidle' })
await s.waitForSelector('.v2-allergie-form', { timeout: 30000 })
await s.waitForTimeout(800)

const vorher = await s.evaluate(() => document.querySelectorAll('.v2-allergie-zeile').length)
await s.fill('input[aria-label="Stoff"]', STOFF)
await s.selectOption('select[aria-label="Art"]', ART)
await s.selectOption('select[aria-label="Schwere"]', SCHWERE)
await s.locator('button:has-text("Hinzufügen")').first().click()
// Auf die neue Zeile warten, nicht auf eine feste Zeit.
await s.waitForFunction(
  n => document.querySelectorAll('.v2-allergie-zeile').length > n,
  vorher, { timeout: 30000 }).catch(() => {})
await s.waitForTimeout(1200)

const m = await s.evaluate(() => ({
  zeilen: Array.from(document.querySelectorAll('.v2-allergie-zeile'))
    .map(z => z.textContent.trim().replace(/\s+/g, ' ').slice(0, 80)),
}))
if (FOTO) {
  await s.locator('.v2-allergie-form').first().scrollIntoViewIfNeeded().catch(()=>{})
  await s.waitForTimeout(500)
  await s.screenshot({ path: FOTO })
}
console.log(JSON.stringify({ stoff: STOFF, art: ART, schwere: SCHWERE,
  vorher, nachher: m.zeilen.length, zeilen: m.zeilen }, null, 2))
await b.close()
