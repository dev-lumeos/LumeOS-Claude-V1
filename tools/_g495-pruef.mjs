// G-495/A3+A5+A7 -- der Etikett-Reiter am Schirm.
//
// A3  ein Produkt OHNE Bild: das Rueckfallbild
// A5  der Link zur NIH-Seite steht
// A7  die anderen drei Reiter unveraendert
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const SUCHFELD = 'input[aria-label="Produkt suchen"]'

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
const fehler=[]; s.on('pageerror', e=>fehler.push(String(e).slice(0,200)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=heute`, { waitUntil: 'domcontentloaded' })
await s.evaluate(async () => {
  await fetch('/api/supplements/filter', { method:'PUT',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({ status:'On Market', kategorie:null, form:null,
                           marken:[], allergienAn:true, leisteOffen:false }) })
})
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector(SUCHFELD, { timeout: 40000 })
await s.waitForTimeout(1500)
await s.locator(SUCHFELD).type('Gold Standard 100% Whey Chocolate Peanut Butter', { delay: 15 })
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 40000 })
await s.waitForTimeout(2500)
await s.locator('.v2-tbl tbody tr', { hasText: 'ON Optimum Nutrition' })
  .first().locator('td').first().click()
await s.locator('.v2-supp-prod-tafel').waitFor({ timeout: 40000 })
await s.waitForTimeout(1500)

// ── A7: die anderen drei Reiter ──────────────────────────────────
const reiter = await s.evaluate(() =>
  [...document.querySelectorAll('.v2-supp-reiter-knopf')].map(k => (k.textContent ?? '').trim()))
console.log('A7 REITER:', JSON.stringify(reiter))

// ── A3/A5: der Etikett-Reiter ────────────────────────────────────
await s.locator('.v2-supp-reiter-knopf', { hasText: 'Etikett' }).first().click()
await s.waitForTimeout(1200)
const d = await s.evaluate(() => {
  const a = document.querySelector('[data-probe="etikett-link"]')
  return {
    rueckfallDa: !!document.querySelector('[data-probe="etikett-rueckfall"]'),
    satz: document.querySelector('[data-probe="etikett-rueckfall"]')
      ?.textContent?.trim().slice(0, 180) ?? null,
    linkDa: !!a,
    linkZiel: a ? a.getAttribute('href') : null,
    // [read] Ein Link, der in DIESEM Fenster oeffnet, riss den
    // Nutzer aus der Liste -- das ist Teil der Zusage.
    neuesFenster: a ? a.getAttribute('target') : null,
  }
})
console.log('\nA3/A5 ETIKETT:', JSON.stringify(d, null, 2))
await s.screenshot({ path: '../../backup/x-g495-a3-rueckfall.png' })
console.log('\nSeitenfehler:', fehler.slice(0,2))
await b.close().catch(()=>{})
