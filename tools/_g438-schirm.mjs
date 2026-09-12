// G-438/A2 + A3 + A4 - Karte gegen Liste, am Schirm.
//
// **A2:** *„kein Muskel ist auf der Karte gefaerbt und in der Liste
// leer. Gemessen an ALLEN 43 Flaechen."*
//
// `[read]` **Das ist Toms Befund** - und es wird dort gemessen, wo
// er ihn gesehen hat: am Bildschirm, nicht im Quelltext.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'
const BILD = process.argv[4] ?? 'docs/bilder/g438/a2-nachher.png'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 2400 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 160)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })
await p.goto(`${ZIEL}/v2/recovery?tab=muscles`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)

const d = await p.evaluate(() => {
  // ── Welche Flaechen sind auf der Karte GEFAERBT? ──────────────
  //
  // `[read]` **Gefaerbt heisst: nicht die Grundfarbe** - gemessen
  // am `fill`, nicht an einem Datenattribut.
  const flaechen = [...document.querySelectorAll('[data-muskel]')]
  const gefaerbt = new Map()
  for (const g of flaechen) {
    const code = g.getAttribute('data-muskel')
    const pfad = g.querySelector('path') ?? g
    const f = getComputedStyle(pfad).fill
    // Die Grundfarbe der ungefaerbten Flaeche.
    const grund = ['rgb(38, 38, 42)', 'rgba(0, 0, 0, 0)', 'none']
    if (!grund.includes(f)) gefaerbt.set(code, f)
  }

  // ── Was steht in der LISTE? ───────────────────────────────────
  const zeilen = new Map()
  for (const z of document.querySelectorAll('[data-muskelzeile]')) {
    const name = z.getAttribute('data-muskelzeile')
    const t = (z.textContent ?? '').replace(/\s+/g, ' ')
    zeilen.set(name, {
      hatWert: /\d+%/.test(t),
      geliehen: /Wert von /.test(t),
      leer: t.includes('--'),
      text: t.slice(0, 70),
    })
  }

  // ── A4: sind die acht Wurzeln abgegrenzt? ─────────────────────
  const wurzeln = [...document.querySelectorAll('[data-muskelzeile]')]
    .filter(z => Math.round(parseFloat(getComputedStyle(z).paddingLeft)) === 0)
    .map(z => ({
      name: z.getAttribute('data-muskelzeile'),
      groesse: getComputedStyle(z).fontSize,
      dicke: getComputedStyle(z).fontWeight,
      gross: getComputedStyle(z).textTransform,
      abstand: getComputedStyle(z).paddingTop,
    }))
  const kind = [...document.querySelectorAll('[data-muskelzeile]')]
    .find(z => Math.round(parseFloat(getComputedStyle(z).paddingLeft)) === 14)

  return {
    gefaerbt: [...gefaerbt.keys()],
    zeilen: Object.fromEntries(zeilen),
    wurzeln,
    kindStil: kind ? {
      groesse: getComputedStyle(kind).fontSize,
      dicke: getComputedStyle(kind).fontWeight,
      gross: getComputedStyle(kind).textTransform,
    } : null,
    linien: document.querySelectorAll('[data-muskelzeile]').length > 0
      ? [...document.querySelectorAll('.v2-divider')].length
      : 0,
  }
})

console.log('\n=== A2: gefaerbt auf der Karte, leer in der Liste? ===\n')
console.log(`  Flaechen gefaerbt: ${d.gefaerbt.length}`)

// Welchen Namen zeigt eine Flaeche? Das weiss nur `ebenen.ts` —
// deshalb hier ueber die Liste zurueck: eine gefaerbte Flaeche muss
// IRGENDEINE Zeile mit Wert haben.
const { EBENEN } = await import('../apps/web/src/lib/koerper/ebenen.ts')
  .catch(() => ({ EBENEN: null }))

let widerspruch = []
if (EBENEN) {
  for (const code of d.gefaerbt) {
    const name = EBENEN[code]?.name
    if (!name) continue
    const z = d.zeilen[name]
    if (!z) { widerspruch.push(`${code} (${name}): keine Listenzeile`); continue }
    if (!z.hatWert) widerspruch.push(`${code} (${name}): ${z.text}`)
  }
}

if (!EBENEN) {
  console.log('  (ebenen.ts nicht ladbar — Abgleich in der Probe, nicht hier)')
} else if (widerspruch.length === 0) {
  console.log('  KEIN Widerspruch: jede gefaerbte Flaeche hat einen Listenwert.')
} else {
  console.log(`  ${widerspruch.length} WIDERSPRUCH:`)
  for (const w of widerspruch) console.log(`    ${w}`)
}

console.log('\n=== A3: geliehene Werte nennen ihre Herkunft ===\n')
const geliehen = Object.entries(d.zeilen).filter(([, z]) => z.geliehen)
console.log(`  ${geliehen.length} Zeilen mit „Wert von …":`)
for (const [n, z] of geliehen.slice(0, 6)) console.log(`    ${z.text}`)

console.log('\n=== A4: die Wurzeln abgegrenzt? ===\n')
console.log(`  Wurzeln: ${d.wurzeln.length}`)
for (const w of d.wurzeln) {
  console.log(`    ${(w.name ?? '').padEnd(12)} ${w.groesse.padStart(7)}  Dicke ${w.dicke}  ${w.gross}  Abstand ${w.abstand}`)
}
console.log(`\n  ein KIND zum Vergleich: ${JSON.stringify(d.kindStil)}`)
console.log(`  Trennlinien in der Kachel: ${d.linien}`)

await p.screenshot({ path: BILD, fullPage: true })
console.log(`\n  Bild: ${BILD}`)
console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()
