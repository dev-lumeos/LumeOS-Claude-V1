// Der Kreis fuer die Wassermenge: eintragen -> aendern -> neu laden.
// Dazu der Zeilenschutz: fremde Id muss 404 geben.
//
// Meldet sich wie `schuss.mjs` selbst an und benutzt dieselbe Sitzung,
// damit die Route mit echtem Cookie laeuft (RLS greift sonst nicht).
import { chromium } from '@playwright/test'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const HEUTE = process.argv[2] ?? '2026-08-21'

const browser = await chromium.launch()
const page = await browser.newPage()

// Anmelden (wie tools/schuss.mjs).
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const WORT = process.env.LUMEOS_WORT ?? 'LumeosDev2026'
await page.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await page.locator('input[type=email]').count()) {
  await page.fill('input[type=email]', KONTO)
  await page.fill('input[type=password]', WORT)
  await Promise.all([
    page.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    page.click('button[type=submit]'),
  ])
}

const ruf = (pfad, init) => page.evaluate(async ([p, i]) => {
  const a = await fetch(p, i)
  let t = null
  try { t = await a.json() } catch { /* leer */ }
  return { status: a.status, body: t }
}, [pfad, init])

console.log('angemeldet als:', page.url())

// 1. Eintragen.
const neu = await ruf('/api/nutrition/water', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ entry_date: HEUTE, amount_ml: 500, source: 'manual' }),
})
console.log('POST 500 ml ->', neu.status)

// 2. Liste holen, den neuen Eintrag finden.
const liste = await ruf(`/api/nutrition/water?datum=${HEUTE}&liste=1`)
const eintraege = liste.body?.eintraege ?? []
const ziel = [...eintraege].reverse().find(e => e.amount_ml === 500)
console.log(`GET Liste -> ${liste.status}, ${eintraege.length} Eintraege`)
if (!ziel) { console.log('KEIN 500-ml-Eintrag gefunden — Abbruch.'); await browser.close(); process.exit(1) }
console.log('  Eintrag:', ziel.id, ziel.amount_ml, 'ml')
const vorherTag = liste.body?.tag?.logged_ml

// 3. Aendern auf 250.
const geaendert = await ruf(`/api/nutrition/water?datum=${HEUTE}`, {
  method: 'PATCH', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ id: ziel.id, amount_ml: 250 }),
})
console.log('PATCH 500 -> 250 ->', geaendert.status)
console.log('  Tag neu gerechnet: logged_ml',
  vorherTag, '->', geaendert.body?.tag?.logged_ml)

// 4. NEU LADEN — steht der geaenderte Wert wirklich in der Datenbank?
const nochmal = await ruf(`/api/nutrition/water?datum=${HEUTE}&liste=1`)
const wieder = (nochmal.body?.eintraege ?? []).find(e => e.id === ziel.id)
console.log('GET nach Neuladen -> Eintrag ist jetzt', wieder?.amount_ml, 'ml')

// 5. Zeilenschutz: fremde Id.
const fremd = await ruf(`/api/nutrition/water?datum=${HEUTE}`, {
  method: 'PATCH', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ id: '00000000-0000-0000-0000-000000000000', amount_ml: 999 }),
})
console.log('PATCH fremde Id ->', fremd.status, fremd.body?.code)

// 6. Aufraeumen: den Testeintrag wieder entfernen.
const weg = await ruf(
  `/api/nutrition/water?id=${encodeURIComponent(ziel.id)}&datum=${HEUTE}`,
  { method: 'DELETE' })
console.log('DELETE Testeintrag ->', weg.status,
  '| logged_ml jetzt', weg.body?.tag?.logged_ml)

await browser.close()
