// G-469/A3+A4 — wohin die Zeit geht: Anmeldung, Uebersetzung, Daten.
//
// Aufruf:  node tools/_g469-abschnitte.mjs [route]
//
// [read] Drei Abschnitte, je einzeln gemessen:
//
//   Anmeldung    der Login-Weg, einmal je Sitzung
//   Uebersetzung der Unterschied erster/zweiter Aufruf
//   Daten        was der eingeschwungene Aufruf noch braucht
//
// [cmd] Und die Frage aus D: laeuft die Anmeldung je `fetch` neu?
// Das sagen die Netzantworten — `set-cookie` bei jeder Antwort
// hiesse: die Sitzung wird staendig erneuert.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
// [cmd] OHNE fuehrenden Schraegstrich uebergeben — Git Bash macht
// aus `/v2/goals` sonst `C:/Program Files/Git/v2/goals` (dieselbe
// Falle wie in `_g455-pruef.mjs`).
const ROUTE = '/' + (process.argv[2] ?? 'v2/supplements?tab=produkte')
  .replace(/^\/+/, '')

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()

// ── Jede Antwort mitschreiben: Kekse und Auth-Aufrufe ────────────
const antworten = []
s.on('response', r => {
  const u = r.url()
  if (!u.startsWith(BASIS)) {
    // Auth laeuft gegen Supabase, nicht gegen uns — DAS ist die Frage.
    if (/supabase|auth/i.test(u)) {
      antworten.push({ fremd: true, url: u.slice(0, 80), status: r.status() })
    }
    return
  }
  const h = r.headers()
  antworten.push({
    pfad: u.replace(BASIS, '').split('?')[0],
    status: r.status(),
    setzeKeks: !!h['set-cookie'],
  })
})

// ══ 1 — DIE ANMELDUNG ════════════════════════════════════════════
const tAnmeldung = Date.now()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
let anmeldungMs = null
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
  anmeldungMs = Date.now() - tAnmeldung
}

async function ruf() {
  const t0 = Date.now()
  await s.goto(`${BASIS}${ROUTE}`, { waitUntil: 'domcontentloaded' })
  await s.waitForFunction(() => {
    const t = document.body.textContent ?? ''
    return t.length > 3000
      || document.querySelectorAll('.v2-card, .v2-tbl tbody tr').length > 0
  }, { timeout: 90000 }).catch(() => {})
  return Date.now() - t0
}

// ══ 2 — ERSTER AUFRUF (mit Uebersetzung) ═════════════════════════
antworten.length = 0
const ersterMs = await ruf()
const beimErsten = antworten.map(a => ({ ...a }))

// ══ 3 — EINGESCHWUNGEN ═══════════════════════════════════════════
const weitere = []
for (let i = 0; i < 3; i++) {
  await s.goto(`${BASIS}/v2/dashboard`, { waitUntil: 'domcontentloaded' })
  await s.waitForTimeout(300)
  antworten.length = 0
  weitere.push(await ruf())
}
const beimZweiten = antworten.map(a => ({ ...a }))

const datenMs = Math.min(...weitere)
const uebersetzungMs = ersterMs - datenMs

// ── D: laeuft die Anmeldung je fetch neu? ────────────────────────
const eigene = beimZweiten.filter(a => !a.fremd)
const mitKeks = eigene.filter(a => a.setzeKeks)
const fremdAuth = beimZweiten.filter(a => a.fremd)

console.log(JSON.stringify({
  basis: BASIS,
  route: ROUTE,
  abschnitte: {
    anmeldungMs,
    ersterAufrufMs: ersterMs,
    uebersetzungMs,
    datenMs,
    weitereLaeufe: weitere,
  },
  anteile: {
    uebersetzungProzent: Math.round((uebersetzungMs / ersterMs) * 100),
    datenProzent: Math.round((datenMs / ersterMs) * 100),
  },
  anmeldungJeAnfrage: {
    antwortenImEingeschwungenen: eigene.length,
    // [read] Ein `set-cookie` je Antwort hiesse: die Sitzung wird
    // bei jeder Anfrage erneuert.
    mitSetCookie: mitKeks.length,
    pfadeMitSetCookie: mitKeks.map(a => a.pfad).slice(0, 8),
    auffaelligeFremdaufrufe: fremdAuth.length,
  },
  beimErstenAntworten: beimErsten.filter(a => !a.fremd).length,
}, null, 2))
await b.close()
