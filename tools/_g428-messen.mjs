// G-428/A1 - WARUM ist der Injektionsreiter leer?
//
// `[read]` **Nicht raten, messen.** Drei Moeglichkeiten standen im
// Auftrag: ein Fehler beim Rendern, ein falscher Zweig, oder eine
// Abfrage ohne Ergebnis. **Diese Probe unterscheidet sie.**
//
// `[cmd]` **Sie misst je Adresse:**
//   - wieviele Kacheln UNTER der Reiterleiste stehen
//   - ob ein Seitenfehler geworfen wurde (Rendern)
//   - welcher Reiter als aktiv markiert ist (Zweig)
//   - wieviele Zeilen der Leseweg geliefert hat (Abfrage)
//
// `[read]` **Zwei Adressen, weil Tom `?tab=injektionen` genannt hat
// und der Code `injection` fuehrt** - der Unterschied ist die halbe
// Antwort.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()

const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 200)))
const konsole = []
p.on('console', m => { if (m.type() === 'error') konsole.push(m.text().slice(0, 200)) })

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

/**
 * Was steht unter der Reiterleiste?
 *
 * `[read]` **Der Reiterleiste selbst folgt EIN Behaelter** - in
 * `ansicht.tsx` ist es das `<div>`, das alle `tab === '...'`-Zweige
 * traegt. **Seine Hoehe und sein Textumfang sind die Messgroesse**,
 * nicht die Zahl der Knoepfe oben.
 */
async function messen(adresse) {
  fehler.length = 0
  konsole.length = 0
  await p.goto(`${ZIEL}${adresse}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1800)

  const m = await p.evaluate(() => {
    // Die Reiterleiste finden: der Knopf "Injections"/"Injektionen"
    // sitzt darin.
    const knoepfe = [...document.querySelectorAll('button, a')]
    const reiterKnopf = knoepfe.find(k =>
      /injection|injektion/i.test(k.textContent ?? ''))
    const aktiv = knoepfe
      .filter(k => /v2-tab/.test(k.className) || k.getAttribute('aria-selected') === 'true')
      .filter(k => k.getAttribute('aria-selected') === 'true'
        || /active|aktiv/.test(k.className))
      .map(k => (k.textContent ?? '').trim())

    // Alle Karten der Seite - das ist der Inhalt unter der Leiste.
    const karten = [...document.querySelectorAll('.v2-card')]
    // `[read]` **Verschachtelte Karten zaehlen einmal** - eine Karte
    // in einer Karte ist eine Kachel, kein Paar.
    const aeussere = karten.filter(k => !k.parentElement?.closest('.v2-card'))

    // Die drei Sachen, die vor G-389 dastanden.
    const text = document.body.innerText
    return {
      reiterKnopfDa: !!reiterKnopf,
      aktiv,
      karten: karten.length,
      aeussereKarten: aeussere.length,
      kartenTitel: aeussere
        .map(k => (k.querySelector('.v2-eyebrow, h2, h3, .v2-card-title')?.textContent ?? '')
          .trim().slice(0, 44))
        .filter(Boolean).slice(0, 30),
      hatRotationskarte: /rotation map/i.test(text),
      hatKonfiguration: /injektionsflaechen|konfiguration|configured/i.test(text),
      hatProtokollListe: /site guide|schedule/i.test(text),
      // Die Karte selbst ist ein SVG mit Koerperpfaden.
      svgPfade: document.querySelectorAll('svg path').length,
      textLaenge: text.length,
    }
  })

  return { adresse, ...m, seitenfehler: [...fehler], konsolenfehler: [...konsole] }
}

const adressen = [
  '/v2/supplements?tab=injektionen',   // was Tom in den Befund schrieb
  '/v2/supplements?tab=injection',     // was der Code fuehrt
  '/v2/supplements',                   // der Standardreiter, zum Vergleich
]

console.log(`\n=== G-428/A1 — Konto ${KONTO} ===\n`)
for (const a of adressen) {
  const r = await messen(a)
  console.log(`--- ${r.adresse}`)
  console.log(`    Reiterleiste da        ${r.reiterKnopfDa}`)
  console.log(`    aktiver Reiter         ${JSON.stringify(r.aktiv)}`)
  console.log(`    Kacheln (aeussere)     ${r.aeussereKarten}   (alle: ${r.karten})`)
  console.log(`    Titel                  ${JSON.stringify(r.kartenTitel)}`)
  console.log(`    "Rotation map"         ${r.hatRotationskarte}`)
  console.log(`    Konfiguration          ${r.hatKonfiguration}`)
  console.log(`    Schedule/Site guide    ${r.hatProtokollListe}`)
  console.log(`    SVG-Pfade (Koerper)    ${r.svgPfade}`)
  console.log(`    Textlaenge             ${r.textLaenge}`)
  console.log(`    Seitenfehler           ${r.seitenfehler.length}  ${JSON.stringify(r.seitenfehler)}`)
  console.log(`    Konsolenfehler         ${r.konsolenfehler.length}  ${JSON.stringify(r.konsolenfehler.slice(0, 3))}`)
  console.log('')
}

await b.close()
