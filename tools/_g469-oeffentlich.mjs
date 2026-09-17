// G-469/A2 — Dev gegen Produktionsbau, auf einer OEFFENTLICHEN Route.
//
// [cmd] Der Produktionsbau kann sich nicht anmelden: der
// Supabase-Client wirft dort serverseitig `document is not defined`.
// [read] Deshalb wird die Route gemessen, die KEINE Sitzung braucht —
// `/login`. Sie durchlaeuft denselben Next.js-Weg (Middleware,
// Server-Render, Buendel), nur ohne Datenabfrage.
//
// [read] Das misst die UEBERSETZUNG sauber: genau der Unterschied,
// um den es in diesem Auftrag geht.
import { chromium } from '@playwright/test'

const LAEUFE = Number(process.argv[2] ?? 4)
const BASEN = [
  ['Dev-Server (3200)', 'http://127.0.0.1:3200'],
  ['Produktionsbau (3251)', 'http://127.0.0.1:3251'],
]
const ROUTEN = ['/login', '/']

const b = await chromium.launch({ headless: true })
const aus = []
for (const [name, basis] of BASEN) {
  for (const route of ROUTEN) {
    // [read] EIGENER Kontext je Fall — ein warmer Browserzwischen-
    // speicher wuerde den zweiten Lauf schoenrechnen.
    const k = await b.newContext()
    const s = await k.newPage()
    const zeiten = []
    for (let i = 0; i < LAEUFE; i++) {
      const t0 = Date.now()
      const r = await s.goto(`${basis}${route}`, { waitUntil: 'domcontentloaded' })
      await s.waitForFunction(() => (document.body.textContent ?? '').length > 200,
        { timeout: 60000 }).catch(() => {})
      zeiten.push({ ms: Date.now() - t0, status: r?.status() ?? null })
    }
    await k.close()
    aus.push({
      server: name, route,
      ersterMs: zeiten[0].ms,
      weitereMs: zeiten.slice(1).map(x => x.ms),
      status: zeiten[0].status,
      gespartMs: zeiten[0].ms - Math.min(...zeiten.slice(1).map(x => x.ms)),
    })
  }
}
console.log(JSON.stringify(aus, null, 2))
await b.close()
