// G-491/A1 — welche Suchbegriffe laufen im Browser leer?
//
// [read] API und Schirm im SELBEN Lauf, mit derselben Sitzung --
// sonst vergleicht man zwei Zustaende statt einer Sache.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const WORTE = (process.argv[2] ?? 'Gold Standard 100% Whey Vanilla Ice Cream|Ultraplex Vitamin D3|Vitamin D3|Creatine|Whey|Micronized Creatine Monohydrate').split('|')

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1100}})).newPage()
const fehler=[]; s.on('pageerror', e=>fehler.push(String(e).slice(0,160)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}

const aus = []
for (const wort of WORTE) {
  // [read] Je Begriff ein FRISCHER Seitenaufbau -- sonst traegt der
  // vorige Lauf seinen Zustand mit (G-487).
  await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
  await s.waitForSelector('input[aria-label="Produkt suchen"]', { timeout: 40000 })
  await s.waitForTimeout(1200)
  await s.locator('input[aria-label="Produkt suchen"]').type(wort, { delay: 15 })
  await s.waitForTimeout(3500)
  const d = await s.evaluate(async (q) => {
    const a = await fetch(`/api/supplements/produkte?q=${encodeURIComponent(q)}&status=alle`)
    const j = await a.json().catch(() => null)
    const t = document.body.textContent ?? ''
    return {
      api: (j?.zeilen ?? []).length,
      apiErste: (j?.zeilen ?? [])[0]?.name_en ?? null,
      schirm: document.querySelectorAll('.v2-tbl tbody tr').length,
      hinweis: (t.match(/Kein Produktname enth[^.]{0,80}\.|Kein Produkt passt[^.]{0,40}\./) ?? [])[0] ?? null,
    }
  }, wort)
  aus.push({ wort, ...d })
}
console.log(JSON.stringify({ aus, fehler: fehler.slice(0,3) }, null, 2))
await b.close().catch(()=>{})
