// G-190: der Nachweis, kalt und warm.
//
// `[read]` **„Kalt" heisst im Dev-Modus: die Route ist noch nicht
// uebersetzt.** Das ist der Zustand, in dem ein Nutzer eine Seite zum
// ersten Mal aufruft — und genau dort faellt eine sequenzielle Kette
// am staerksten ins Gewicht, weil sich Uebersetzung UND Abfragen
// addieren.
//
// `[read]` **Der Nachweis gilt nur, wenn BEIDE Laeufe schneller
// sind.** Ein einzelner Wert sagt nichts: der erste Aufruf einer
// Route uebersetzt mit, der zweite nicht. Wer nur warm misst,
// verwechselt einen Cache mit einer Verbesserung — genau der Fehler,
// den Tom bei C-189 schon einmal widerlegt hat.
//
// Aufruf: node backup/g190-kalt-warm.mjs [laeufe]
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const LAEUFE = Number(process.argv[2] ?? 5)
const BASIS = 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const PFAD = '/v2/supplements?tab=stack'

const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await s.newPage()

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type="email"]', KONTO)
await p.fill('input[type="password"]', wortFuer(KONTO))
await p.click('button[type="submit"]')
await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })

/** Die Zeit der HAUPTANFRAGE, nicht die des ganzen Bildes.
 *
 * `[read]` `networkidle` misst auch Skripte und Schriften mit — die
 * aendert dieser Umbau nicht. Was sich aendern MUSS, ist die Zeit bis
 * das Dokument da ist: dort warten die Abfragen. */
async function messen() {
  await p.goto('about:blank')
  const t0 = Date.now()
  const antwort = await p.goto(`${BASIS}${PFAD}`, { waitUntil: 'domcontentloaded' })
  const gesamt = Date.now() - t0
  const dokument = await p.evaluate(() => {
    const e = performance.getEntriesByType('navigation')[0]
    return e ? Math.round(e.responseEnd - e.requestStart) : null
  })
  return { status: antwort.status(), gesamt, dokument }
}

const werte = []
for (let i = 0; i < LAEUFE; i++) {
  const m = await messen()
  werte.push(m)
  console.log(`  Lauf ${i + 1}: Dokument ${String(m.dokument).padStart(5)} ms`
    + `  ·  bis DOM ${String(m.gesamt).padStart(5)} ms  (HTTP ${m.status})`)
}

const dok = werte.map(w => w.dokument).filter(x => x !== null)
const warm = dok.slice(1)
console.log('\n' + JSON.stringify({
  pfad: PFAD, konto: KONTO, laeufe: LAEUFE,
  kalt_dokument_ms: dok[0],
  warm_dokument_ms: warm,
  warm_median_ms: warm.length
    ? [...warm].sort((a, b) => a - b)[Math.floor(warm.length / 2)] : null,
  warm_min_ms: warm.length ? Math.min(...warm) : null,
}, null, 2))

await b.close()
