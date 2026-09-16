// G-455/A5 — ein Meidestoff MARKIERT, statt zu entfernen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const SUCHE = process.argv[2] ?? '100% Casein Protein Chocolate Cream'
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
await s.fill('input[aria-label="Produkt suchen"]', SUCHE)
await s.waitForFunction(t => {
  const z = document.querySelectorAll('.v2-tbl tbody tr')
  return z.length > 0 && z.length < 200 && (z[0].textContent ?? '').includes(t.slice(0, 14))
}, SUCHE, { timeout: 30000 }).catch(()=>{})
await s.waitForTimeout(1200)

const trefferZahl = await s.evaluate(() => document.querySelectorAll('.v2-tbl tbody tr').length)
// `[cmd]` **NICHT die erste Zeile** — der hochgedaumte Treffer steht
// seit A6 zuoberst. `[read]` **Die Zeile mit dem gesuchten NAMEN
// klicken**, sonst belegt die Probe ein anderes Produkt (dieselbe
// Falle wie in G-453/A7).
const zeilen = s.locator('.v2-tbl tbody tr')
let geklickt = false
for (let i = 0; i < await zeilen.count(); i++) {
  const txt = (await zeilen.nth(i).textContent()) ?? ''
  if (!txt.includes(SUCHE.slice(0, 22))) continue
  await zeilen.nth(i).click()
  geklickt = true
  break
}
if (!geklickt) throw new Error('Zeile mit dem gesuchten Namen nicht gefunden')
await s.waitForSelector('.v2-supp-prod-tafel', { timeout: 30000 }).catch(()=>{})
await s.waitForTimeout(1500)

const m = await s.evaluate(() => {
  const t = document.querySelector('.v2-supp-prod-tafel')
  return {
    name: t?.querySelector('.v2-supp-prod-name')?.textContent?.trim(),
    meidemarke: (t?.textContent?.match(/Meidestoff: [^\n]{0,40}/) ?? [])[0] ?? null,
    nochInDerListe: document.querySelectorAll('.v2-tbl tbody tr').length,
  }
})
await s.screenshot({ path: 'backup/x-g455-a5-meidestoff.png' })
console.log(JSON.stringify({ suche: SUCHE, trefferZahl, ...m }, null, 2))
await b.close()
