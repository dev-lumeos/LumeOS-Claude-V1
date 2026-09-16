// G-455/A7 — mehrere Marken gleichzeitig.
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
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
await s.locator('button[aria-controls="v2-supp-prod-filter"]').click()
await s.waitForSelector('.v2-supp-prod-filter', { timeout: 20000 })
await s.waitForTimeout(1200)

const fuss = () => s.evaluate(() => document.body.textContent.match(/[\d.]+ von [\d.]+ geladen/)?.[0])
const marken = () => s.evaluate(() => [...new Set(Array.from(
  document.querySelectorAll('.v2-tbl tbody tr td:nth-child(2)'))
  .map(t => t.textContent.trim()).filter(Boolean))])

const aus = { schritte: [] }
for (const m of ['NOW', 'Solgar', 'Swanson']) {
  await s.selectOption('select[aria-label="Marke auswählen"]', m)
  //  **Auf die ANTWORT warten, nicht auf eine Frist** — die
  // Zahl in der Fusszeile ist das Signal.
  await s.waitForFunction(alt => {
    const j = document.body.textContent.match(/[\d.]+ von ([\d.]+) geladen/)
    return j && j[1] !== alt
  }, (await fuss() ?? '').split(' von ')[1]?.split(' ')[0] ?? '', { timeout: 20000 }).catch(()=>{})
  await s.waitForTimeout(900)
  aus.schritte.push({ dazu: m, fuss: await fuss(), markenInListe: await marken() })
}
// Die Pillen, die jetzt dastehen.
aus.pillen = await s.evaluate(() => Array.from(
  document.querySelectorAll('.v2-supp-prod-filter button[aria-label*="entfernen"]'))
  .map(x => x.textContent.trim()))
aus.hinweis = await s.evaluate(() => (document.body.textContent
  .match(/\d+ Marken — ODER-verknüpft[^·]*/) ?? [])[0] ?? null)
await s.screenshot({ path: 'backup/x-g455-a7-marken.png' })

// Eine wieder weg -> die Zahl muss sinken.
await s.locator('.v2-supp-prod-filter button[aria-label*="entfernen"]').first().click()
await s.waitForTimeout(2600)
aus.nachEntfernen = { fuss: await fuss(), markenInListe: await marken() }
console.log(JSON.stringify(aus, null, 2))
await b.close()
