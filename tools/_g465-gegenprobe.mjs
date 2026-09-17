// G-465/A5 — faellt eine kuenstlich langsame Antwort auf?
//
// [read] Die Messung behauptet, sie sehe die Laufzeit je Anfrage.
// Diese Probe zwingt EINE Route in die Verzoegerung und prueft, ob
// die Messung das meldet. [cmd] Ohne sie waere „3,6 Sekunden" eine
// Zahl, von der niemand weiss, ob sie ueberhaupt etwas misst.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const BREMSE_MS = Number(process.argv[2] ?? 4000)
const ZIEL = process.argv[3] ?? 'produkte'

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()

const anfragen = []
s.on('request', r => {
  if (r.url().includes('/api/supplements/')) {
    anfragen.push({ route: r.url().split('/api/supplements/')[1].split('?')[0],
                    start: Date.now(), ende: null })
  }
})
s.on('requestfinished', r => {
  if (!r.url().includes('/api/supplements/')) return
  const route = r.url().split('/api/supplements/')[1].split('?')[0]
  const e = [...anfragen].reverse().find(x => !x.ende && x.route === route)
  if (e) e.ende = Date.now()
})

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
}

// ── DIE BREMSE ───────────────────────────────────────────────────
// [read] Die Antwort wird nicht veraendert, nur VERZOEGERT — so
// misst die Probe die Laufzeit, nicht einen Fehlerfall.
await s.route(`**/api/supplements/${ZIEL}**`, async (route) => {
  await new Promise(r => setTimeout(r, BREMSE_MS))
  await route.continue()
})

anfragen.length = 0
const t0 = Date.now()
await s.goto(`${BASIS}/v2/supplements?tab=produkte`,
  { waitUntil: 'domcontentloaded' })
let ersteAnzeige = null
try {
  await s.waitForFunction(
    () => document.querySelectorAll('.v2-tbl tbody tr').length > 0,
    { timeout: 60000 })
  ersteAnzeige = Date.now() - t0
} catch { /* nichts erschienen */ }
await s.waitForTimeout(1500)

const gebremst = anfragen.filter(a => a.route === ZIEL && a.ende)
  .map(a => a.ende - a.start)
const andere = anfragen.filter(a => a.route !== ZIEL && a.ende)
  .map(a => ({ route: a.route, ms: a.ende - a.start }))

console.log(JSON.stringify({
  gebremsteRoute: ZIEL,
  bremseMs: BREMSE_MS,
  ersteAnzeigeMs: ersteAnzeige,
  gemesseneLaufzeiten: gebremst,
  // Die Sache: sieht die Messung die Bremse?
  bremseErkannt: gebremst.length > 0 && Math.min(...gebremst) >= BREMSE_MS,
  andereRouten: andere,
}, null, 2))
await b.close()
