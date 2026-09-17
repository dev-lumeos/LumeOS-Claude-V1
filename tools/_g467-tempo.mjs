// G-467/A6 — macht ein gesetzter Filter das Laden schneller?
//
// **Toms These:** *„wenn endlich die filters speicherbar waeren …
// wuerden die daten automatisch schrumpfen, denn dann wuerden auch
// kalt viel weniger daten kommen."*
//
// Aufruf:  node tools/_g467-tempo.mjs
//
// [read] Gemessen wird beides am selben Konto, im selben Lauf: erst
// ohne gespeicherten Filter, dann mit. Die Bytes der Antwort stehen
// daneben — „weniger Daten" ist eine Mengenaussage, keine Zeitaussage.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const LAEUFE = Number(process.argv[2] ?? 3)

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()

const netz = []
s.on('requestfinished', async r => {
  if (!r.url().includes('/api/supplements/produkte')) return
  try {
    const resp = await r.response()
    const body = await resp?.body().catch(() => null)
    netz.push({ bytes: body ? body.length : null })
  } catch { /* verworfen */ }
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

// ══ UEBER DIE OBERFLAECHE SETZEN, NICHT UEBER DIE ROUTE ══════════
//
// [cmd] Ein PUT wurde vom entprellten Selbstschreiber des Reiters
// (400 ms) sofort ueberschrieben: beide Messungen ergaben 418 Zeilen
// und 101,1 kB — der Unterschied war gar nicht hergestellt.
// [read] Wer den Zustand messen will, den ein Nutzer hat, muss ihn
// wie ein Nutzer herstellen.
async function zuruecksetzen() {
  await s.goto(`${BASIS}/v2/supplements?tab=produkte`,
    { waitUntil: 'domcontentloaded' })
  await s.waitForTimeout(1500)
  const z = s.locator('button', { hasText: /^Zurücksetzen$/ })
  if (await z.count() > 0) { await z.first().click(); await s.waitForTimeout(2000) }
}

async function setzeFilter() {
  const kat = s.locator('button', { hasText: /^vitamin/ })
  if (await kat.count() > 0) { await kat.first().click(); await s.waitForTimeout(1800) }
  // Eine Marke dazu — Toms „favoriten marken".
  const feld = s.locator('input[placeholder*="Marke"]')
  if (await feld.count() > 0) {
    await feld.first().click()
    await feld.first().type('NOW Foods', { delay: 40 })
    await s.waitForTimeout(1200)
    const treffer = s.locator('button', { hasText: /^NOW Foods$/ })
    if (await treffer.count() > 0) {
      await treffer.first().click()
      await s.waitForTimeout(1800)
    }
  }
  await s.waitForTimeout(1500)
}

async function miss() {
  const zeiten = []
  const mengen = []
  for (let i = 0; i < LAEUFE; i++) {
    netz.length = 0
    const t0 = Date.now()
    await s.goto(`${BASIS}/v2/supplements?tab=produkte`,
      { waitUntil: 'domcontentloaded' })
    await s.waitForFunction(
      () => document.querySelectorAll('.v2-tbl tbody tr').length > 0,
      { timeout: 60000 }).catch(() => {})
    zeiten.push(Date.now() - t0)
    await s.waitForTimeout(1200)
    const zeilen = await s.evaluate(() =>
      document.querySelectorAll('.v2-tbl tbody tr').length)
    mengen.push({
      zeilen,
      kb: netz.reduce((n, x) => n + (x.bytes ?? 0), 0) / 1024,
    })
  }
  return {
    msJeLauf: zeiten,
    zeilen: mengen.map(m => m.zeilen),
    kbJeLauf: mengen.map(m => Math.round(m.kb * 10) / 10),
  }
}

// ── 1: OHNE gespeicherten Filter (Vorgabe) ───────────────────────
await zuruecksetzen()
const ohne = await miss()

// ── 2: MIT einem engen Filter ────────────────────────────────────
// [read] Eine Marke plus Kategorie — das ist der Fall, den Tom
// beschreibt („meine favoriten marken").
await setzeFilter()
const mit = await miss()
const standNachher = await s.evaluate(async () => {
  const a = await fetch('/api/supplements/filter'); return await a.json()
})

const schnitt = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length)
console.log(JSON.stringify({
  gesetzterFilter: standNachher.filter,
  ohneFilter: { ...ohne, msSchnitt: schnitt(ohne.msJeLauf) },
  mitFilter: { ...mit, msSchnitt: schnitt(mit.msJeLauf) },
  // Toms These, in zwei Zahlen.
  zeitGespart: schnitt(ohne.msJeLauf) - schnitt(mit.msJeLauf),
  datenGespart: Math.round((schnitt(ohne.kbJeLauf) - schnitt(mit.kbJeLauf)) * 10) / 10,
}, null, 2))
await b.close()
