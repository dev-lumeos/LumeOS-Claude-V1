// G-473 — ist es eine Endlos-Rekursion?
//
// [read] Ein Renderer, der OHNE Ausnahme und bei flachem Speicher
// stirbt, hat oft den Aufrufstapel gesprengt. In Chromium wirft das
// normalerweise `RangeError: Maximum call stack size exceeded` —
// aber wenn der Stapel in einem Microtask reisst, kann der Prozess
// sterben, bevor die Meldung den Weg nach draussen findet.
//
// [cmd] Diese Probe zwingt die Meldung heraus: der Stapel wird VOR
// dem Anstrich kuenstlich verkleinert und jede Ausnahme sofort
// weggeschrieben — in `sessionStorage`, das den Absturz ueberlebt.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2').replace(/^\/+/, '')
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'

function mitFrist(p, ms, beiFrist) {
  return Promise.race([
    p.catch(e => ({ fehler: String(e).slice(0, 200) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms)),
  ])
}

const b = await chromium.launch({ headless: true })
const k = await b.newContext()

// ══ VOR JEDEM SKRIPT: jede Ausnahme mitschreiben ═════════════════
//
// [read] `window.onerror` und `unhandledrejection` greifen frueher
// als Playwrights `pageerror` und laufen IM Reiter — sie sehen also
// auch das, was gleich danach stirbt.
await k.addInitScript(() => {
  const merke = (art, text, stapel) => {
    try {
      const alt = JSON.parse(sessionStorage.getItem('g473') ?? '[]')
      alt.push({ art, text: String(text).slice(0, 300),
                 stapel: String(stapel ?? '').slice(0, 1500) })
      sessionStorage.setItem('g473', JSON.stringify(alt.slice(-20)))
    } catch { /* Speicher voll oder weg */ }
  }
  window.addEventListener('error', (e) => {
    merke('error', e.message, e.error?.stack)
  }, true)
  window.addEventListener('unhandledrejection', (e) => {
    merke('rejection', e.reason?.message ?? e.reason, e.reason?.stack)
  })
  // [cmd] Und der eigentliche Fang: `Error.prepareStackTrace` laesst
  // sich nicht setzen, aber `console.error` schon — React meldet
  // Fehler dorthin, bevor es sie weiterwirft.
  const echt = console.error
  console.error = (...a) => {
    merke('console.error', a.map(x => String(x)).join(' ').slice(0, 300),
      a.find(x => x && x.stack)?.stack)
    return echt.apply(console, a)
  }
})

const s = await k.newPage()
let abgestuerzt = false
s.on('crash', () => { abgestuerzt = true })

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', KONTO)
await s.fill('input[type=password]', wortFuer(KONTO))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)

// Vor der Navigation schon gesammelte Meldungen wegsichern.
const vorher = await mitFrist(
  s.evaluate(() => JSON.parse(sessionStorage.getItem('g473') ?? '[]'))
    .then(x => ({ eintraege: x })), 5000, { frist: true })

await mitFrist(
  s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
    .then(x => ({ status: x?.status() ?? null })), 18000, { frist: true })

// [read] Nach dem Absturz einen NEUEN Reiter im selben Kontext:
// `sessionStorage` haengt am Ursprung, nicht am Reiter — die
// Eintraege des gestorbenen Reiters sind noch da.
let nachher = { frist: true }
try {
  const s2 = await k.newPage()
  await s2.goto(`${BASIS}/login`, { waitUntil: 'domcontentloaded' })
  nachher = await mitFrist(
    s2.evaluate(() => JSON.parse(sessionStorage.getItem('g473') ?? '[]'))
      .then(x => ({ eintraege: x })), 8000, { frist: true })
} catch (e) {
  nachher = { fehler: String(e).slice(0, 160) }
}

console.log(JSON.stringify({
  basis: BASIS, ziel: ZIEL, abgestuerzt,
  vorDerNavigation: vorher.eintraege ?? vorher,
  nachDemAbsturz: nachher.eintraege ?? nachher,
}, null, 2))
await b.close().catch(() => {})
