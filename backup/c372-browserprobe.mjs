// C-372/G-306: die Werkbank durch die OBERFLAECHE.
//
// `[read]` **Ein gruener Endpunkt beweist nicht, dass ein Knopf ihn
// erreicht** (G-298). Und die entscheidende Zeile des Auftrags:
// *gesperrt zu sein, ohne einen Weg zu haben, ist schlimmer als gar
// keine Sperre* — also wird beides gefahren: die Sperre UND der Weg.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1500, height: 1600 } })
const fehler = []
seite.on('console', m => { if (m.type() === 'error') fehler.push(m.text()) })

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
console.log(`angemeldet als ${KONTO}\n`)

const gehe = async () => {
  await seite.goto(`${BASIS}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
  await seite.waitForTimeout(1200)
}
const text = async () => await seite.locator('body').innerText()

await gehe()

// ══ C-372: einen Plan MIT Wochen anlegen ═════════════════════════
console.log('── C-372: „Neuer Plan" mit 2 Wochen ──')
await seite.getByRole('button', { name: 'Neuer Plan' }).click()
await seite.waitForTimeout(600)
const form = await seite.getByLabel('Planname').count()
console.log(`  Formular offen: ${form > 0}`)
// `[read]` **Nur die Karte „Neuer Plan" lesen** — auf der Seite steht
// noch der alte Aktivierungsdialog, und der fragt beides. Der erste
// Lauf hat deshalb „Startdatum: true" gemeldet, obwohl das neue
// Formular es nicht fragt.
// `[read]` **Nach dem FELD suchen, nicht nach dem Wort.** Der erste
// Lauf meldete „Startdatum: true", weil der Erklaersatz des Formulars
// das Wort enthaelt (*„… werden beim Aktivieren gewählt, nicht
// hier"*). **Dasselbe Muster wie G-216: das Wort statt der Wirkung.**
const karte = seite.locator('.v2-card').filter({ hasText: 'Neuer Plan' }).first()
const datumsfeld = await karte.locator('input[type="date"]').count()
const zyklusknopf = await karte.getByRole('button', { name: /läuft einmal ab/ }).count()
const wochenfeld = await karte.getByLabel('Anzahl Wochen').count()
console.log(`  Feld fuer Startdatum: ${datumsfeld}`)
console.log(`  Knopf fuer Lebenszyklus: ${zyklusknopf}`)
console.log(`  Feld fuer Wochen: ${wochenfeld}`)

await seite.getByLabel('Planname').fill('C-372 Browserplan')
await seite.getByLabel('Anzahl Wochen').fill('2')
await seite.getByRole('button', { name: /Plan mit .* Wochen anlegen/ }).click()
await seite.waitForTimeout(2800)

const t1 = await text()
const zeile = t1.split('\n').find(z => z.includes('Wochen ·')) ?? '(nicht gefunden)'
console.log(`  nach dem Anlegen: ${zeile.trim()}`)

// ══ G-306: die Sperre am aktiven Plan ════════════════════════════
console.log('\n── G-306: die Sperre und ihr Ausweg ──')
const gesperrt = await seite.getByText('Positionen eingefroren').count()
const kopie = await seite.getByRole('button', { name: /Kopie bearbeiten/ }).count()
console.log(`  Marke „Positionen eingefroren": ${gesperrt}`)
console.log(`  Knopf „Kopie bearbeiten": ${kopie}`)

if (kopie > 0) {
  await seite.getByRole('button', { name: /Kopie bearbeiten/ }).first().click()
  await seite.waitForTimeout(600)
  const t2 = await text()
  const hinweis = t2.split('\n').find(z => z.includes('Entwurf')) ?? ''
  console.log(`  Hinweis: ${hinweis.trim().slice(0, 110)}`)
  await seite.getByRole('button', { name: 'Kopie anlegen' }).click()
  await seite.waitForTimeout(2800)
  const t3 = await text()
  console.log(`  Kopie entstanden: ${t3.includes('(Kopie)')}`)
}

// ══ Und der Beweis, dass die Sperre wirklich sperrt ══════════════
console.log('\n── Die Sperre am Schreibweg (nicht nur in der Anzeige) ──')
// `[read]` **Die ECHTE Position eines aktiven Plans** - mit einer
// erfundenen id kaeme 404 und bewiese nichts.
const POS = process.env.C372_POSITION ?? ''
const FOOD = process.env.C372_FOOD ?? ''
const antwort = await seite.evaluate(async ([id, food]) => {
  const r = await fetch('/api/nutrition/plan', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      art: 'eintrag_aendern', id,
      typ: 'bls', quelleId: food, mahlzeit: 'lunch', menge: 999,
    }),
  })
  return { status: r.status, koerper: (await r.text()).slice(0, 220) }
}, [POS, FOOD])
console.log(`  Aenderung an einem AKTIVEN Plan -> HTTP ${antwort.status}`)
console.log(`  ${antwort.koerper}`)
console.log(`  ADR #17 verlangt 409: ${antwort.status === 409 ? 'JA' : 'NEIN'}`)

console.log(`\nKonsolenfehler: ${fehler.length}`)
fehler.slice(0, 3).forEach(f => console.log(`  ${f.replace(/\s+/g, ' ').slice(0, 130)}`))
await seite.screenshot({ path: 'backup/c372-werkbank.png', fullPage: false })
await browser.close()
