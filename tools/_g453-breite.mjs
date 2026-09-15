// G-453/A2 — der Augenweg je Zeile, gemessen.
// `[cmd]` Toms Befund: „nicht so verstreut auf die breite". Die Zahl
// dazu ist die Breite der Zeile vom ersten bis zum letzten Zeichen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'networkidle' })
await s.waitForTimeout(1500)
await s.fill('input[aria-label="Produkt suchen"]', '#Shatter SX-7 Black Onyx Ripped Cherry')
await s.waitForFunction(() => document.querySelectorAll('.v2-tbl tbody tr').length > 0, { timeout: 30000 }).catch(()=>{})
await s.waitForTimeout(900)
await s.locator('.v2-tbl tbody tr').first().click()
await s.waitForTimeout(1800)
const m = await s.evaluate(() => {
  // Neue Bauform: die Zutatzeile. Alte: die <tr> im Detail.
  const neu = Array.from(document.querySelectorAll('.v2-supp-prod-zutat'))
  const alt = Array.from(document.querySelectorAll('.v2-supp-tafel-zeile .v2-tbl tbody tr'))
  const zs = neu.length ? neu : alt
  const breiten = zs.map(z => Math.round(z.getBoundingClientRect().width))
  return {
    bauform: neu.length ? 'G-453 (Buendel)' : 'G-452 (Vierspaltentabelle)',
    zeilen: zs.length,
    breiteMax: Math.max(0, ...breiten),
    fensterbreite: window.innerWidth,
  }
})
console.log(JSON.stringify(m, null, 2))
await b.close()
