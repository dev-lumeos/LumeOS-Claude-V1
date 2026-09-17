// G-473 — der Befund in EINEM Lauf, wiederholbar.
//
// ══ WAS GEMESSEN WIRD ═══════════════════════════════════════════════
//
// [cmd] Der Reiter stirbt im Produktionsbau bei der ZWEITEN
// Navigation — egal wohin. Gemessen 2026-09-17:
//
//   /login        1. Aufruf 200, 2. Aufruf TOT
//   /dashboard    1. Aufruf 200, 2. Aufruf TOT
//   /v2/dashboard 1. Aufruf 200, 2. Aufruf TOT
//
// [read] Damit ist die Bedingung aus G-471 UEBERHOLT: es liegt weder
// an der Anmeldung noch an `/v2`. Beides waren Nebenwirkungen davon,
// dass die Proben mehrfach navigiert haben.
//
// [read] Der Dev-Server besteht fuenf Navigationen hintereinander.
import { chromium } from '@playwright/test'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTEN = ['/login', '/dashboard', '/v2/dashboard']

function mitFrist(p, ms, beiFrist) {
  return Promise.race([
    p.catch(e => ({ fehler: String(e).slice(0, 140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms)),
  ])
}

const b = await chromium.launch({ headless: true })
const aus = []
for (const route of ROUTEN) {
  // [read] JE ROUTE ein eigener Reiter — sonst misst man den Tod aus
  // dem vorigen Fall mit.
  const k = await b.newContext()
  const s = await k.newPage()
  let tot = false
  s.on('crash', () => { tot = true })
  const laeufe = []
  for (let i = 0; i < 2 && !tot; i++) {
    const r = await mitFrist(
      s.goto(`${BASIS}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
        .then(x => ({ status: x?.status() ?? null })),
      18000, { frist: true })
    await new Promise(x => setTimeout(x, 700))
    laeufe.push(tot || r.frist ? 'TOT' : (r.status ?? '?'))
  }
  aus.push({ route, laeufe })
  await k.close().catch(() => {})
}

console.log(JSON.stringify({
  basis: BASIS,
  // Die Sache: stirbt der ZWEITE Aufruf?
  zweiterAufrufStirbt: aus.every(a => a.laeufe[1] === 'TOT'),
  routen: aus,
}, null, 2))
await b.close().catch(() => {})
