// G-455/A6 — Daumen hoch: steht das Produkt oben?
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
// Eine kurze Liste, damit die Wanderung sichtbar ist.
await s.fill('input[aria-label="Produkt suchen"]', 'Gold Standard 100% Whey Chocolate')
// `[read]` **Auf die ANTWORT warten, nicht auf eine Frist** — beim
// ersten Versuch stand noch die ungefilterte 458er-Liste da, und der
// Klick traf das falsche Produkt.
await s.waitForFunction(() => {
  const z = document.querySelectorAll('.v2-tbl tbody tr')
  return z.length > 0 && z.length < 200
    && /Gold Standard/i.test(z[0].textContent ?? '')
}, null, { timeout: 30000 }).catch(() => {})
await s.waitForTimeout(1200)

const namen = () => s.evaluate(() => Array.from(
  document.querySelectorAll('.v2-tbl tbody tr')).slice(0, 6)
  .map(t => t.querySelector('td')?.textContent?.trim().slice(0, 46)))

const vorher = await namen()
// Das FUENFTE Produkt hochdaumen -- dann ist die Wanderung eindeutig.
const zeilen = s.locator('.v2-tbl tbody tr')
const zielName = (await zeilen.nth(4).locator('td').first().textContent())?.trim().slice(0,46)
await zeilen.nth(4).locator('button[aria-label*="mag ich"]').first().click()
await s.waitForTimeout(2500)
const nachher = await namen()
await s.screenshot({ path: 'backup/x-g455-a6-daumen.png' })

// Und wieder aufheben, damit die Daten sauber bleiben? NEIN -- A6
// verlangt den Beleg. Der Zustand bleibt und wird im Bericht genannt.
console.log(JSON.stringify({ zielName, vorher, nachher,
  vorherPlatz: vorher.indexOf(zielName) + 1,
  nachherPlatz: nachher.indexOf(zielName) + 1,
  // Die Zusage ist die WANDERUNG nach oben, nicht Platz 1: ein schon
  // frueher hochgedaumtes Produkt steht zu Recht davor.
  nachObenGewandert: nachher.indexOf(zielName) < vorher.indexOf(zielName),
}, null, 2))
await b.close()
