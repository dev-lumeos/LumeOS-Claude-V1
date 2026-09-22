// G-493/A2+A5+A6 -- schreiben und gegen die Datenbank pruefen.
//
// A2  eine NEUE Mahlzeit im Modal anlegen und benutzen
// A5  ein neuer Stackeintrag traegt supplier_product_id
// A6  notes enthaelt keine Produkt-Id mehr
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const SUCHFELD = 'input[aria-label="Produkt suchen"]'
const PULVER = ['Gold Standard 100% Whey Chocolate Peanut Butter', 'ON Optimum Nutrition']

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

async function modalAuf() {
  await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
  await s.waitForSelector(SUCHFELD, { timeout: 40000 })
  await s.waitForTimeout(1500)
  await s.locator(SUCHFELD).type(PULVER[0], { delay: 15 })
  await s.waitForTimeout(4000)
  await s.locator('.v2-tbl tbody tr', { hasText: PULVER[1] }).first()
    .locator('[data-probe="zeile-add"]').click()
  await s.waitForTimeout(2500)
}

// ── A5/A6: in den Stack ──────────────────────────────────────────
await modalAuf()
await s.locator('[data-probe="aktion-stack"]').click()
await s.locator('[data-probe="stack-wahl"]').waitFor({ timeout: 30000 })
await s.waitForTimeout(1200)
await s.locator('[data-probe="stack-speichern"]').click()
// [read] Auf das Ergebnis warten, nicht auf die Uhr -- der erste
// POST kompiliert die Route (gemessen in G-492: ueber 4 s).
await Promise.race([
  s.locator('[data-probe="aktion-fertig"]').waitFor({ timeout: 45000 }),
  s.locator('[data-probe="aktion-fehler"]').waitFor({ timeout: 45000 }),
]).catch(() => {})
const a5 = await s.evaluate(() => ({
  fertig: document.querySelector('[data-probe="aktion-fertig"]')?.textContent?.trim() ?? null,
  fehler: document.querySelector('[data-probe="aktion-fehler"]')?.textContent?.trim() ?? null,
}))
console.log('A5 STACK:', JSON.stringify(a5))
await s.screenshot({ path: '../../backup/x-g493-a5-stack.png' })

// ── A2: eine NEUE Mahlzeit anlegen und benutzen ──────────────────
await modalAuf()
await s.locator('[data-probe="aktion-mahlzeit"]').click()
await s.locator('[data-probe="mahlzeit-portion"]').waitFor({ timeout: 30000 }).catch(()=>{})
await s.waitForTimeout(1200)
const vorher = await s.evaluate(() => {
  const w = document.querySelector('[data-probe="mahlzeit-wahl"]')
  return w ? [...w.options].map(o => o.textContent.trim()) : []
})
await s.locator('[data-probe="neue-mahlzeit-oeffnen"]').click()
await s.waitForTimeout(800)
// pre_workout waehlen -- genau der Fall, den Tom nannte.
await s.locator('[data-probe="neue-art"]').selectOption('pre_workout')
await s.locator('[data-probe="neue-zeit"]').fill('05:45')
await s.waitForTimeout(400)
await s.locator('[data-probe="neue-anlegen"]').click()
await s.waitForTimeout(6000)
const nachher = await s.evaluate(() => {
  const w = document.querySelector('[data-probe="mahlzeit-wahl"]')
  return {
    optionen: w ? [...w.options].map(o => o.textContent.trim()) : [],
    gewaehlt: w ? w.options[w.selectedIndex]?.textContent.trim() : null,
    formularZu: !document.querySelector('[data-probe="neue-mahlzeit"]'),
    fehler: document.querySelector('[data-probe="aktion-fehler"]')?.textContent?.trim() ?? null,
  }
})
console.log('\nA2 VORHER :', JSON.stringify(vorher))
console.log('A2 NACHHER:', JSON.stringify(nachher, null, 2))
await s.screenshot({ path: '../../backup/x-g493-a2-neue-angelegt.png' })

console.log('\nSeitenfehler:', fehler.slice(0,3))
await b.close().catch(()=>{})
