// G-461 — die Trendgrafik nach dem Hochziehen des Hooks.
// `[read]` Gemessen wird die WIRKUNG: traegt das SVG einen
// Verlauf, und zeigt die Flaeche darauf?
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({ viewport: { width: 1600, height: 1100 } })).newPage()
const fehler = []
s.on('pageerror', e => fehler.push(e.message.slice(0, 160)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
const r = await s.goto(`${BASIS}/v2/nutrition?tab=insights`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const m = await s.evaluate(() => {
  const verlaeufe = Array.from(document.querySelectorAll('linearGradient'))
  const flaechen = Array.from(document.querySelectorAll('path[fill^="url(#"]'))
  return {
    verlaeufe: verlaeufe.length,
    ids: verlaeufe.map(g => g.id).slice(0, 3),
    flaechen: flaechen.length,
    // Zeigt jede Flaeche auf einen Verlauf, den es gibt?
    tote: flaechen.filter(f => {
      const id = (f.getAttribute('fill') ?? '').replace(/^url\(#|\)$/g, '')
      return !document.getElementById(id)
    }).length,
  }
})
console.log(JSON.stringify(m, null, 2))
console.log('status', r?.status(), 'fehler', fehler)
await b.close()
