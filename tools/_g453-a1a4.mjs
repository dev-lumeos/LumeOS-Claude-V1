// G-453/A1 + A4 — Markenfilter per Eingabe, Kategorienfilter.
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
await s.waitForTimeout(2000)
const fuss = () => s.evaluate(() => document.body.textContent.match(/[\d.]+ von [\d.]+ Treffern/)?.[0])

const vorher = await fuss()
// ── A1: tippen ────────────────────────────────────────────────────
await s.click('input[aria-label="Marke filtern"]')
await s.fill('input[aria-label="Marke filtern"]', 'optimum')
await s.waitForTimeout(700)
const getippt = await s.evaluate(() => ({
  treffer: Array.from(document.querySelectorAll('.v2-supp-prod-markenknopf')).map(x=>x.textContent.trim()),
  sichtbar: !!document.querySelector('.v2-supp-prod-markenliste'),
}))
await s.screenshot({ path: 'backup/x-g453-a1-marke-tippen.png' })
// Eine Marke waehlen
//  **Genau treffen, nicht "enthaelt"** — es gibt  (210 Produkte) UND  (2), und
//  nahm den falschen. Die Zahl auf dem Schirm war dann 2
// statt 210, und das sah nach einem kaputten Filter aus.
const knopf = s.locator('.v2-supp-prod-markenknopf').filter({ hasText: /^ON Optimum Nutrition$/ }).first()
const gabs = await knopf.count() > 0
if (gabs) { await knopf.click(); await s.waitForTimeout(2000) }
const nachMarke = await fuss()
await s.screenshot({ path: 'backup/x-g453-a1-marke-gewaehlt.png' })

// ── A4: Kategorie ─────────────────────────────────────────────────
await s.locator('button:has-text("amino acid")').first().click()
await s.waitForTimeout(2500)
const nachKategorie = await fuss()
await s.screenshot({ path: 'backup/x-g453-a4-kategorie.png' })

console.log(JSON.stringify({
  A1: { vorher, getippteTreffer: getippt.treffer.slice(0,6), anzahl: getippt.treffer.length,
        listeSichtbar: getippt.sichtbar, nachMarke },
  A4: { nachKategorie },
}, null, 2))
await b.close()
