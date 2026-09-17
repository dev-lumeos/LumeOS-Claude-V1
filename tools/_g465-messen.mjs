// G-465 — wo die Zeit im Produktreiter wirklich hingeht.
//
// Aufruf:  node tools/_g465-messen.mjs [tippwort]
//
// [read] Gemessen wird IM BROWSER, ueber die Netzwerkereignisse von
// Playwright — nicht geschaetzt und nicht ueber `docker exec`.
// [cmd] Die Punktdatei warnt eigens davor: dieselbe Abfrage mass
// 40 ms in psql und 1.100 ms ueber `docker exec`. Der Aufwand des
// Aufrufs ist nicht die Abfrage.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const WORT = process.argv[2] ?? 'whey'

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()

// ── Jede Anfrage an unsere API mit Start, Ende und Groesse ────────
const anfragen = []
s.on('request', r => {
  if (!r.url().includes('/api/supplements/')) return
  anfragen.push({
    url: r.url().replace(BASIS, '').split('?')[0],
    frage: r.url().includes('?') ? r.url().split('?')[1].slice(0, 60) : '',
    methode: r.method(),
    start: Date.now(),
    ende: null, status: null, bytes: null, abgebrochen: false,
  })
})
s.on('requestfinished', async r => {
  if (!r.url().includes('/api/supplements/')) return
  const e = [...anfragen].reverse().find(x => !x.ende
    && r.url().startsWith(BASIS + x.url))
  if (!e) return
  e.ende = Date.now()
  try {
    const resp = await r.response()
    e.status = resp?.status() ?? null
    const body = await resp?.body().catch(() => null)
    e.bytes = body ? body.length : null
  } catch { /* Antwort schon verworfen */ }
})
s.on('requestfailed', r => {
  if (!r.url().includes('/api/supplements/')) return
  const e = [...anfragen].reverse().find(x => !x.ende
    && r.url().startsWith(BASIS + x.url))
  if (e) { e.ende = Date.now(); e.abgebrochen = true }
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

// ══ PHASE 1 — das OEFFNEN ════════════════════════════════════════
anfragen.length = 0
const t0 = Date.now()
await s.goto(`${BASIS}/v2/supplements?tab=produkte`,
  { waitUntil: 'domcontentloaded' })

// [read] „Erste Anzeige" ist, wenn die erste Produktzeile steht —
// nicht wenn das HTML da ist. Das ist die Zahl, die Tom spuert.
let ersteAnzeige = null
try {
  await s.waitForFunction(
    () => document.querySelectorAll('.v2-tbl tbody tr').length > 0,
    { timeout: 60000 })
  ersteAnzeige = Date.now() - t0
} catch { /* nichts erschienen */ }
await s.waitForTimeout(3000)
const beimOeffnen = anfragen.map(a => ({ ...a }))

// ══ PHASE 2 — das TIPPEN ═════════════════════════════════════════
anfragen.length = 0
const feld = s.locator('input[aria-label="Produkt suchen"]')
await feld.click()
const tTipp = Date.now()
await feld.type(WORT, { delay: 60 })
await s.waitForTimeout(4000)
const beimTippen = anfragen.map(a => ({ ...a }))

function fasse(liste) {
  return liste.map(a => ({
    route: a.url.replace('/api/supplements/', ''),
    ms: a.ende ? a.ende - a.start : null,
    status: a.status,
    kb: a.bytes != null ? Math.round(a.bytes / 102.4) / 10 : null,
    abgebrochen: a.abgebrochen,
    // Wann ging sie los, relativ zur ersten Anfrage der Phase?
    abMs: liste.length ? a.start - Math.min(...liste.map(x => x.start)) : 0,
  }))
}

// ── Nacheinander oder parallel? ───────────────────────────────────
// [read] Ueberlappen sich die Zeitfenster, laufen sie parallel.
// Die SUMME gegen die SPANNE zu halten sagt es ohne Vermutung.
function ueberlappung(liste) {
  const mit = liste.filter(a => a.ende)
  if (!mit.length) return null
  const summe = mit.reduce((n, a) => n + (a.ende - a.start), 0)
  const spanne = Math.max(...mit.map(a => a.ende)) - Math.min(...mit.map(a => a.start))
  return {
    anfragen: mit.length,
    summeMs: summe,
    spanneMs: spanne,
    // ~1 = nacheinander, deutlich >1 = parallel
    gleichzeitigkeit: Math.round((summe / Math.max(spanne, 1)) * 100) / 100,
  }
}

console.log(JSON.stringify({
  wort: WORT,
  ersteAnzeigeMs: ersteAnzeige,
  oeffnen: {
    anzahl: beimOeffnen.length,
    ...ueberlappung(beimOeffnen),
    anfragen: fasse(beimOeffnen),
  },
  tippen: {
    zeichen: WORT.length,
    anzahl: beimTippen.length,
    // A3: wie viele Anfragen je Tastendruck?
    jeTaste: Math.round((beimTippen.length / WORT.length) * 100) / 100,
    anfragen: fasse(beimTippen),
  },
}, null, 2))
await b.close()
