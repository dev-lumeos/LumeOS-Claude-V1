// G-471/A2 — welche Routen stuerzen ab?
//
// Aufruf:  node tools/_g471-routen.mjs [basis]
//
// [read] JE ROUTE ein eigener Reiter. Stirbt einer, ist nur dieser
// Fall verloren, nicht die ganze Messung.
//
// [cmd] Und alles mit harter Frist: `page.goto()` kehrt NICHT
// zurueck, wenn der Reiter waehrend der Navigation stirbt (gemessen
// 2026-09-17 — ein Lauf haengte 600 s ohne Ausgabe).
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'

const ROUTEN = [
  '/login', '/', '/dashboard',
  '/v2/settings', '/v2/goals', '/v2/nutrition',
  '/v2/training', '/v2/recovery', '/v2/medical',
  '/v2/supplements', '/v2/coach',
]

/** Eine Zusage mit Frist — nie laenger warten als erlaubt. */
function mitFrist(p, ms, beiFrist) {
  return Promise.race([
    p.catch(e => ({ fehler: String(e).slice(0, 160) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms)),
  ])
}

const b = await chromium.launch({ headless: true })
const k = await b.newContext()

// ── Einmal anmelden, Sitzung fuer alle Reiter ───────────────────
const anmeldeSeite = await k.newPage()
await anmeldeSeite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await anmeldeSeite.fill('input[type=email]', KONTO)
await anmeldeSeite.fill('input[type=password]', wortFuer(KONTO))
await anmeldeSeite.click('button[type=submit]')
await anmeldeSeite.waitForTimeout(5000)
const angemeldet = (await k.cookies()).some(c => c.name.includes('auth-token'))
await anmeldeSeite.close()

const aus = []
for (const route of ROUTEN) {
  const s = await k.newPage()
  let abgestuerzt = false
  const fehler = []
  s.on('crash', () => { abgestuerzt = true })
  s.on('pageerror', e => fehler.push(String(e).slice(0, 200)))

  const t0 = Date.now()
  const erg = await mitFrist(
    s.goto(`${BASIS}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      .then(r => ({ status: r?.status() ?? null })),
    25000,
    { frist: true },
  )
  // [read] Nach der Navigation kurz zusehen — der Absturz kommt
  // meist beim Anstrich, nicht beim Laden.
  const lebt = await mitFrist(
    s.evaluate(() => document.body.textContent.length).then(n => ({ zeichen: n })),
    8000,
    { frist: true },
  )
  aus.push({
    route,
    ms: Date.now() - t0,
    status: erg.status ?? null,
    abgestuerzt: abgestuerzt || lebt.frist === true,
    zeichen: lebt.zeichen ?? null,
    fehler: fehler.slice(0, 2),
    hinweis: erg.fehler ?? (erg.frist ? 'Navigation ohne Antwort' : null),
  })
  await s.close().catch(() => {})
}

console.log(JSON.stringify({ basis: BASIS, angemeldet, routen: aus }, null, 2))
await b.close().catch(() => {})
