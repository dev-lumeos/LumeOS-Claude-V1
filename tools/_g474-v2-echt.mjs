// G-474/A5 — eine /v2-Route im Produktionsbau, zweimal navigiert,
// im ECHTEN Browser.
//
// [cmd] Belegt: Chromium 121 (Playwright-Vorgabe) stirbt, Chrome 150
// und Edge 150 nicht. Diese Probe zeigt, was ein Nutzer sieht.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTE = '/' + (process.argv[2] ?? 'v2/dashboard').replace(/^\/+/, '')
const FOTO = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null
const KANAL = process.env.LUMEOS_KANAL ?? 'chrome'

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

const b = await chromium.launch({ headless: true, channel: KANAL })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
let tot = false
const fehler = []
s.on('crash', () => { tot = true })
s.on('pageerror', e => fehler.push(String(e).slice(0, 160)))

// Anmelden — damit die Route echten Inhalt zeigt.
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', 'dev@lumeos.app')
await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)

const laeufe = []
for (let i = 0; i < 2 && !tot; i++) {
  const r = await mitFrist(
    s.goto(`${BASIS}${ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 25000 })
      .then(x => ({ status: x?.status() ?? null })), 28000, { frist: true })
  await s.waitForFunction(() => (document.body.textContent ?? '').length > 3000,
    { timeout: 30000 }).catch(() => {})
  await new Promise(x => setTimeout(x, 1200))
  const lage = tot ? null : await mitFrist(
    s.evaluate(() => ({ p: location.pathname, n: document.body.textContent.length,
                        kacheln: document.querySelectorAll('.v2-card').length }))
      .then(v => ({ v })), 6000, { frist: true })
  laeufe.push({
    nr: i + 1,
    stand: tot || r.frist ? 'TOT' : (r.status ?? '?'),
    seite: lage?.v ?? null,
  })
}
if (FOTO && !tot) await s.screenshot({ path: FOTO })
console.log(JSON.stringify({
  browser: `${KANAL} ${b.version()}`, route: ROUTE,
  zweimalNavigiertOhneAbsturz: laeufe.length === 2 && laeufe.every(l => l.stand === 200),
  laeufe, fehler: fehler.slice(0, 3),
}, null, 2))
await b.close().catch(() => {})
