// G-460/A1 — WIRKEN die vier ebene-Stellen, oder sind sie tot?
//
// `[read]` Gemessen wird die WIRKUNG am Schirm: traegt die
// Muskelliste eine Einrueckung, die aus `ebene` stammt? `[cmd]` Ein
// `undefined` ergaebe `paddingLeft: NaN` -- das faellt nicht auf,
// solange niemand hinsieht (die Lehre aus G-450).
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({ viewport: { width: 1600, height: 1100 } })).newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/recovery?tab=muscles`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)

const m = await s.evaluate(() => {
  const zeilen = Array.from(document.querySelectorAll('[data-muskelzeile]'))
  const einrueckungen = zeilen.map(z => {
    const el = z
    return Math.round(parseFloat(getComputedStyle(el).paddingLeft) || 0)
  })
  return {
    zeilen: zeilen.length,
    // `ebene` steckt in paddingLeft = (ebene - 1) * 14.
    einrueckungen: [...new Set(einrueckungen)].sort((a, b) => a - b),
    // Ein NaN aus `undefined` faende sich hier.
    nan: einrueckungen.filter(x => Number.isNaN(x)).length,
    schriftgroessen: [...new Set(zeilen.map(z =>
      getComputedStyle(z).fontSize))].sort(),
  }
})
console.log(JSON.stringify(m, null, 2))
await b.close()
