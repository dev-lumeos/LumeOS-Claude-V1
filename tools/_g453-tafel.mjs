// G-453 — Foto und Messung der Produkttafel.
// `[read]` Gemessen wird die WIRKUNG: Einrueckung ueber
// getComputedStyle, nicht ueber den Klassennamen (G-452).
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const SUCHE = process.argv[2] ?? ''
const ZIEL = process.argv[3] ?? 'backup/g453-tafel.png'
const STATUS = process.argv.includes('--status') ? process.argv[process.argv.indexOf('--status')+1] : null
const SCROLL = process.argv.includes('--scrollZu') ? process.argv[process.argv.indexOf('--scrollZu')+1] : null

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
if (STATUS) { await s.locator(`button:has-text("${STATUS}")`).first().click(); await s.waitForTimeout(900) }
await s.fill('input[aria-label="Produkt suchen"]', SUCHE)
await s.waitForFunction(() => document.querySelectorAll('.v2-tbl tbody tr').length > 0, { timeout: 30000 }).catch(()=>{})
await s.waitForTimeout(1000)
const zeilen = s.locator('.v2-tbl tbody tr')
if (await zeilen.count() > 0) {
  await zeilen.first().click()
  await s.waitForFunction(() => !!document.querySelector('.v2-supp-prod-tafel'), { timeout: 30000 }).catch(()=>{})
  await s.waitForTimeout(1200)
}
let gescrollt = null
if (SCROLL) {
  try { await s.locator(`text=${SCROLL}`).first().scrollIntoViewIfNeeded({ timeout: 15000 }); gescrollt = true
        await s.waitForTimeout(600) }
  catch (e) { gescrollt = 'FEHLGESCHLAGEN: ' + e.message.split('\n')[0] }
}
const m = await s.evaluate(() => {
  const t = document.querySelector('.v2-supp-prod-tafel')
  if (!t) return { fehler: 'keine Tafel' }
  const zs = Array.from(t.querySelectorAll('.v2-supp-prod-zutat'))
  return {
    buendel: Array.from(t.querySelectorAll('.v2-supp-prod-abschnitt .v2-eyebrow')).map(e=>e.textContent.trim()),
    zeilen: zs.length,
    eingerueckt: zs.filter(z => parseFloat(getComputedStyle(z).paddingLeft) > 10).length,
    mischungskoepfe: zs.filter(z => z.hasAttribute('data-mischung')).length,
    ohneMenge: zs.filter(z => z.textContent.includes('ohne Mengenangabe')).length,
    auswertbar: zs.filter(z => z.textContent.includes('auswertbar')).length,
    kacheln: Array.from(t.querySelectorAll('.v2-supp-prod-kachel')).map(c=>c.textContent.trim().slice(0,42)),
    bilanz: t.querySelector('.v2-supp-prod-bilanz')?.textContent?.trim(),
    kennt: t.textContent.match(/\d+ von \d+ Zutaten kennt LumeOS/)?.[0] ?? null,
    hinweis: t.textContent.includes('Das Etikett nennt keinen Einnahmehinweis')
      ? 'KEINER' : (t.querySelector('.v2-supp-prod-zitat')?.textContent?.trim().slice(0,70) ?? null),
    firmen: Array.from(t.querySelectorAll('.v2-supp-prod-firma')).map(f=>f.textContent.trim().slice(0,60)),
    // Die breiteste Zeile: wie weit ist der Augenweg wirklich?
    breiteste: Math.round(Math.max(0, ...zs.map(z => z.getBoundingClientRect().width))),
  }
})
await s.screenshot({ path: ZIEL })
console.log(JSON.stringify({ suche: SUCHE, gescrollt, ...m }, null, 2))
await b.close()
