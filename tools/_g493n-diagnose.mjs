// G-493/N1 -- welche Schluessel loesen in DIESER Datei auf?
//
// [read] Nach zwei erfolglosen Vermutungen (Nachrichten fehlen?
// Bundle veraltet?) wird der Fall HALBIERT: in derselben Komponente
// drei Schluessel desselben Namensraums rendern.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
// Filter leeren -- von einem NEUTRALEN Reiter aus (G-491).
await s.goto(`${BASIS}/v2/supplements?tab=heute`, { waitUntil: 'domcontentloaded' })
await s.evaluate(async () => {
  await fetch('/api/supplements/filter', { method:'PUT',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({ status:'On Market', kategorie:null, form:null,
                           marken:[], allergienAn:true, leisteOffen:false }) })
})
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector('input[aria-label="Produkt suchen"]', { timeout: 40000 })
await s.waitForTimeout(1500)
await s.locator('input[aria-label="Produkt suchen"]').type('Whey', { delay: 15 })
await s.waitForTimeout(5000)
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 }).catch(()=>{})

const d = await s.evaluate(() => ({
  zeilen: document.querySelectorAll('.v2-tbl tbody tr').length,
  knopf: document.querySelector('[data-probe="zeile-add"]')?.textContent?.trim() ?? null,
  // [cmd] Drei Schluessel DESSELBEN Namensraums, DIESELBE Komponente.
  diagnose: document.querySelector('[data-probe="n1-diagnose"]')?.textContent?.trim() ?? null,
}))
console.log(JSON.stringify(d, null, 2))
await b.close().catch(()=>{})
