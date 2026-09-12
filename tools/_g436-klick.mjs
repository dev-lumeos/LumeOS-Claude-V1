// G-436/A5 + A6 - anwaehlbar, und Karte gegen Liste.
//
// **A5:** *„jede Zeile anwaehlbar — Gruppe UND Muskel."*
// **A6:** *„Klick auf Karte und in Liste zeigen dasselbe."*
//
// `[read]` **Gemessen wird, WAS SICH OEFFNET** - nicht, ob ein
// `onClick` im Quelltext steht.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1600 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 160)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

async function hin() {
  await p.goto(`${ZIEL}/v2/recovery?tab=muscles`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1500)
}

/** Was steht im offenen Fenster? */
async function fenster() {
  return p.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    if (!d) return null
    return {
      titel: d.querySelector('div[style*="font-weight: 600"]')?.textContent?.trim() ?? null,
      koepfe: [...d.querySelectorAll('.v2-eyebrow')].map(x => x.textContent?.trim() ?? ''),
      text: (d.textContent ?? '').replace(/\s+/g, ' ').slice(0, 260),
    }
  })
}

async function zu() {
  await p.keyboard.press('Escape')
  await p.waitForTimeout(400)
}

// ══ A5a: eine GRUPPE anklicken ══════════════════════════════════
await hin()
console.log('\n=== A5: anwaehlbar ===\n')
for (const [was, name, bild] of [
  ['GRUPPE', 'Arms', 'docs/bilder/g436/a5-gruppe.png'],
  ['MUSKEL', 'Biceps', 'docs/bilder/g436/a5-muskel.png'],
]) {
  const z = p.locator(`[data-muskelzeile="${name}"]`).first()
  const n = await z.count()
  if (n === 0) { console.log(`  ${was.padEnd(7)} "${name}" NICHT gefunden`); continue }
  await z.click()
  await p.waitForTimeout(900)
  const f = await fenster()
  console.log(`  ${was.padEnd(7)} "${name}" -> ${f ? 'Fenster offen' : 'NICHTS'}`)
  if (f) {
    console.log(`          Titel: ${f.titel}`)
    console.log(`          Koepfe: ${f.koepfe.join(' | ').slice(0, 120)}`)
    await p.screenshot({ path: bild })
    console.log(`          Bild: ${bild}`)
  }
  await zu()
}

// ══ A6: Karte gegen Liste ═══════════════════════════════════════
//
// `[read]` **Dieselbe Flaeche von beiden Seiten** - was sich oeffnet,
// muss uebereinstimmen.
console.log('\n=== A6: Karte gegen Liste ===\n')
const FLAECHE = 'biceps'
const NAME = 'Biceps'

await hin()
// Auf der Karte einen Punkt suchen, der WIRKLICH auf der Flaeche
// liegt (die Lehre aus der Sichel in G-432).
const t = await p.evaluate((code) => {
  for (const g of document.querySelectorAll(`[data-muskel="${code}"]`)) {
    const r = g.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue
    for (let i = 1; i <= 29; i += 1) {
      for (let j = 1; j <= 29; j += 1) {
        const x = r.left + (r.width * i) / 30, y = r.top + (r.height * j) / 30
        if (document.elementFromPoint(x, y)?.closest('[data-muskel]')
          ?.getAttribute('data-muskel') === code) return { x, y }
      }
    }
  }
  return null
}, FLAECHE)

let vonKarte = null
if (!t) console.log(`  kein Treffpunkt auf "${FLAECHE}"`)
else {
  await p.mouse.click(t.x, t.y)
  await p.waitForTimeout(900)
  vonKarte = await fenster()
  console.log(`  Karte  -> ${vonKarte?.titel ?? 'NICHTS'}`)
  await zu()
}

await hin()
await p.locator(`[data-muskelzeile="${NAME}"]`).first().click()
await p.waitForTimeout(900)
const vonListe = await fenster()
console.log(`  Liste  -> ${vonListe?.titel ?? 'NICHTS'}`)

const gleich = vonKarte && vonListe
  && vonKarte.titel === vonListe.titel
  && vonKarte.text === vonListe.text
console.log(`\n  DASSELBE? ${gleich ? 'JA' : 'NEIN'}`)
if (!gleich && vonKarte && vonListe) {
  console.log(`    Karte: ${vonKarte.text.slice(0, 110)}`)
  console.log(`    Liste: ${vonListe.text.slice(0, 110)}`)
}

console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()
