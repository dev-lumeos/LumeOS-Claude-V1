// G-496/A5+A6 -- das Rueckfallfeld, und kein Absturz.
//
// [read] Jedes Produkt in der Datenbank traegt eine `dsld_id`
// (gemessen: 0 ohne). Ein Produkt OHNE Etikett laesst sich deshalb
// nicht suchen -- es wird HERGESTELLT: die Route bekommt eine
// Kennung, die die NIH nicht kennt.
//
// [cmd] Gemessen: `s3/pdf/thumbnails/999999999.jpg` -> 403, und die
// Route macht daraus 404. Genau der Fall, den A5 verlangt.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const SUCHFELD = 'input[aria-label="Produkt suchen"]'

const b = await chromium.launch({ headless: true })
const ctx = await b.newContext({viewport:{width:1500,height:1300}})
const s = await ctx.newPage()
const fehler=[]; s.on('pageerror', e=>fehler.push(String(e).slice(0,200)))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}

// ── A6: die Schnittstelle ist nicht erreichbar ───────────────────
//
// [read] Der Abruf wird abgebrochen -- wie bei einer Stoerung. Die
// Flaeche muss das Rueckfallfeld zeigen, nicht abstuerzen.
await ctx.route('**/api/supplements/etikett**', r => r.abort())

await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector(SUCHFELD, { timeout: 40000 })
await s.waitForTimeout(1500)
await s.locator(SUCHFELD).type('Gold Standard 100% Whey Chocolate Peanut Butter', { delay: 15 })
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 40000 })
await s.waitForTimeout(2500)
await s.locator('.v2-tbl tbody tr', { hasText: 'ON Optimum Nutrition' })
  .first().locator('td').first().click()
await s.locator('.v2-supp-prod-tafel').waitFor({ timeout: 40000 })
await s.waitForTimeout(1200)
await s.locator('.v2-supp-reiter-knopf', { hasText: 'Etikett' }).first().click()
await s.locator('[data-probe="etikett-rueckfall"]').waitFor({ timeout: 30000 }).catch(()=>{})
await s.waitForTimeout(1500)

const d = await s.evaluate(() => {
  const a = document.querySelector('[data-probe="etikett-link"]')
  const r = document.querySelector('[data-probe="etikett-rueckfall"]')
  return {
    rueckfallDa: !!r,
    satz: r ? (r.textContent ?? '').trim().slice(0, 140) : null,
    bildSichtbar: (() => {
      const i = document.querySelector('[data-probe="etikett-bild"]')
      return i ? getComputedStyle(i).visibility === 'visible' : false
    })(),
    // A7: der Link steht AUCH hier.
    linkDa: !!a,
    linkZiel: a ? a.getAttribute('href') : null,
    quelleDa: !!document.querySelector('[data-probe="etikett-quelle"]'),
    // A6: die Tafel steht noch, nichts ist abgestuerzt.
    tafelDa: !!document.querySelector('.v2-supp-prod-tafel'),
    reiter: [...document.querySelectorAll('.v2-supp-reiter-knopf')].length,
  }
})
console.log('A5/A6/A7 RUECKFALL:', JSON.stringify(d, null, 2))
await s.screenshot({ path: '../../backup/x-g496-a5-rueckfall.png' })
console.log('\nSeitenfehler:', fehler.slice(0,2))
await b.close().catch(()=>{})
