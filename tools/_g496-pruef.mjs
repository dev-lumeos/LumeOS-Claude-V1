// G-496/A12+A5+A7+A9 -- der Etikett-Reiter am Schirm.
//
// A12  das Bild wird gezeigt, kein PDF gerendert
// A5   ein Produkt OHNE Etikett: das Rueckfallfeld
// A7   der NIH-Link steht in allen Faellen
// A9   die anderen drei Reiter unveraendert
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const SUCHFELD = 'input[aria-label="Produkt suchen"]'

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1300}})).newPage()
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

// ── Die Route selbst: traegt sie? ────────────────────────────────
const route = await s.evaluate(async () => {
  const aus = []
  for (const [was, id] of [['echt', 296171], ['unbekannt', 999999999],
                           ['keine Zahl', 'abc']]) {
    const a = await fetch(`/api/supplements/etikett?dsld_id=${id}`)
    aus.push({ was, status: a.status, typ: a.headers.get('content-type') })
  }
  return aus
})
console.log('ROUTE:', JSON.stringify(route, null, 2))

// ── Die Tafel ────────────────────────────────────────────────────
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

const reiter = await s.evaluate(() =>
  [...document.querySelectorAll('.v2-supp-reiter-knopf')].map(k => (k.textContent ?? '').trim()))
console.log('\nA9 REITER:', JSON.stringify(reiter))

await s.locator('.v2-supp-reiter-knopf', { hasText: 'Etikett' }).first().click()
// [read] Auf das BILD warten, nicht auf die Uhr -- der Abruf laeuft
// ueber unsere Route zur NIH (Median 291 ms, langsamster 1,5 s).
await s.locator('[data-probe="etikett-bild"]').waitFor({ timeout: 30000 }).catch(()=>{})
await s.waitForTimeout(4000)

const d = await s.evaluate(() => {
  const i = document.querySelector('[data-probe="etikett-bild"]')
  const a = document.querySelector('[data-probe="etikett-link"]')
  return {
    // [read] `naturalWidth > 0` belegt, dass das Bild WIRKLICH
    // geladen ist -- ein <img> steht auch dann im DOM, wenn die
    // Quelle fehlschlaegt.
    bildDa: !!i,
    geladen: i ? i.naturalWidth > 0 : false,
    groesse: i ? `${i.naturalWidth}x${i.naturalHeight}` : null,
    sichtbar: i ? getComputedStyle(i).display !== 'none' : false,
    rueckfall: !!document.querySelector('[data-probe="etikett-rueckfall"]'),
    linkDa: !!a,
    linkZiel: a ? a.getAttribute('href') : null,
    quelle: document.querySelector('[data-probe="etikett-quelle"]')
      ?.textContent?.trim().slice(0, 120) ?? null,
    // A12: KEIN PDF-Betrachter, kein iframe.
    iframes: document.querySelectorAll('iframe,embed,object').length,
  }
})
console.log('\nA12/A7/A14 ETIKETT:', JSON.stringify(d, null, 2))
await s.screenshot({ path: '../../backup/x-g496-a12-bild.png' })
console.log('\nSeitenfehler:', fehler.slice(0,2))
await b.close().catch(()=>{})
