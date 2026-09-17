// G-469/A1 — erster gegen zweiten Aufruf derselben Route.
//
// Aufruf:  node tools/_g469-erster-zweiter.mjs [laeufe]
//
// [read] EINE Sitzung, dieselbe Route mehrfach. Die Anmeldung
// passiert VORHER und wird nicht mitgemessen — sonst misst man sie
// beim ersten Lauf mit und beim zweiten nicht.
//
// [cmd] Toms Hinweis: „normale ui changes sind nicht langsam."
// Wenn der zweite Aufruf schnell ist, ist der erste die
// Uebersetzung — und dann gibt es nichts zu reparieren.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const LAEUFE = Number(process.argv[2] ?? 4)

// [read] `/v2/coach` und `/v2/medical` wurden in dieser Sitzung noch
// NICHT geoeffnet — sie sind die ehrlichsten Faelle fuer „erster
// Aufruf". Die uebrigen sind teils schon uebersetzt.
const ROUTEN = (process.argv[3] ?? '').trim()
  ? process.argv[3].split(',')
  : [
      '/v2/coach',
      '/v2/medical',
      '/v2/recovery',
      '/v2/supplements?tab=produkte',
    ]

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
}

/**
 * Wie lange bis die Seite steht?
 *
 * [read] Gemessen bis `domcontentloaded` PLUS bis sichtbarer
 * Inhalt da ist — eine leere Seite „steht" sonst sofort.
 */
async function ruf(route) {
  const t0 = Date.now()
  const r = await s.goto(`${BASIS}${route}`, { waitUntil: 'domcontentloaded' })
  const html = Date.now() - t0
  // Auf Inhalt warten: irgendeine Kachel oder Tabelle.
  await s.waitForFunction(() => {
    const t = document.body.textContent ?? ''
    return t.length > 3000
      || document.querySelectorAll('.v2-card, .v2-tbl tbody tr').length > 0
  }, { timeout: 90000 }).catch(() => {})
  return { htmlMs: html, inhaltMs: Date.now() - t0, status: r?.status() ?? null }
}

const aus = []
for (const route of ROUTEN) {
  const laeufe = []
  for (let i = 0; i < LAEUFE; i++) {
    // [read] Zwischendurch woanders hin, damit der zweite Aufruf ein
    // echter Aufruf ist und nicht nur ein No-op der gleichen Adresse.
    if (i > 0) {
      await s.goto(`${BASIS}/v2/dashboard`, { waitUntil: 'domcontentloaded' })
      await s.waitForTimeout(400)
    }
    laeufe.push(await ruf(route))
  }
  aus.push({
    route,
    ersterMs: laeufe[0].inhaltMs,
    weitereMs: laeufe.slice(1).map(x => x.inhaltMs),
    // Die Sache: wie viel faellt nach dem ersten Mal weg?
    gespartMs: laeufe.length > 1
      ? laeufe[0].inhaltMs - Math.min(...laeufe.slice(1).map(x => x.inhaltMs))
      : null,
    htmlJeLauf: laeufe.map(x => x.htmlMs),
  })
}

console.log(JSON.stringify({ basis: BASIS, laeufe: LAEUFE, routen: aus }, null, 2))
await b.close()
