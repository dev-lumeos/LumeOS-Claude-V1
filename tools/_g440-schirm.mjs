// G-440/A2 + A3 - Karte und Liste aus EINER Quelle?
//
// **Tom:** *„es korrespondiert von der grafik nicht in die liste,
// und zweidrittel der liste zeigt keine werte."*
//
// `[read]` **Gemessen wird die FARBE je Flaeche** - nicht „ist
// irgendwas gesetzt", sondern welcher Wert dahintersteht.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'
const BILD = process.argv[4] ?? 'docs/bilder/g440/a3-nachher.png'

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
  // ── Das ETIKETT ───────────────────────────────────────────────
  const marken = [...document.querySelectorAll('.v2-pill, [class*="pill"]')]
    .map(x => x.textContent?.trim() ?? '').filter(Boolean)
  const koepfe = [...document.querySelectorAll('.v2-card-sub, [class*="card-sub"]')]
    .map(x => x.textContent?.trim() ?? '').filter(Boolean)

  // ── Die KARTE: welche Flaeche traegt welche Farbe? ────────────
  const farben = {}
  for (const g of document.querySelectorAll('[data-muskel]')) {
    const code = g.getAttribute('data-muskel')
    const pfad = g.querySelector('path') ?? g
    farben[code] = getComputedStyle(pfad).fill
  }
  const verschieden = {}
  for (const [code, f] of Object.entries(farben)) {
    (verschieden[f] ??= []).push(code)
  }

  // ── Die LISTE ─────────────────────────────────────────────────
  const zeilen = []
  for (const z of document.querySelectorAll('[data-muskelzeile]')) {
    const t = (z.textContent ?? '').replace(/\s+/g, ' ')
    zeilen.push({
      name: z.getAttribute('data-muskelzeile'),
      wert: /(\d+)%/.exec(t)?.[1] ?? null,
      sitzung: /·\s*([A-Za-z][\w ]*)$/.exec(t)?.[1]?.trim() ?? null,
      mockupWort: /Push B|Pull A|Legs A|Core ·/.test(t),
    })
  }

  return {
    marken: marken.slice(0, 8),
    koepfe: koepfe.slice(0, 4),
    farbgruppen: Object.entries(verschieden)
      .map(([f, codes]) => ({ farbe: f, anzahl: codes.length, bsp: codes.slice(0, 4) }))
      .sort((a, b) => b.anzahl - a.anzahl),
    mitWert: zeilen.filter(z => z.wert).length,
    zeilen: zeilen.filter(z => z.wert).slice(0, 8),
    mockupWoerter: zeilen.filter(z => z.mockupWort).map(z => z.name),
  }
})

console.log('\n=== A3: das Etikett ===\n')
for (const m of d.marken) console.log(`  Marke:  ${m}`)
console.log('')
for (const k of d.koepfe) console.log(`  Unterzeile: ${k.slice(0, 100)}`)

console.log('\n=== A2: die Karte — welche Farben? ===\n')
for (const g of d.farbgruppen) {
  console.log(`  ${String(g.anzahl).padStart(3)}x  ${g.farbe.padEnd(26)} ${g.bsp.join(', ').slice(0, 50)}`)
}

console.log('\n=== Die Liste ===\n')
console.log(`  Zeilen mit Wert: ${d.mitWert}`)
for (const z of d.zeilen) {
  console.log(`    ${(z.name ?? '').padEnd(22)} ${z.wert}%  Sitzung: ${z.sitzung ?? '—'}`)
}

console.log(`\n  Mockup-Woerter („Push B · Wed" usw.): ${d.mockupWoerter.length}`)
if (d.mockupWoerter.length) console.log(`    ${d.mockupWoerter.join(', ')}`)

await p.screenshot({ path: BILD, fullPage: true })
console.log(`\n  Bild: ${BILD}`)
console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()

// ── Welche Karte ist das? Es gibt ZWEI ──────────────────────────
//
// `[cmd]` **`RecMuscleMapReferenz` ist die Mockup-Fassung unter der
// Trennlinie** (E-69) - die faerbt weiter aus dem Entwurf, und das
// ist richtig so. `[read]` **Die Messung oben zaehlte womoeglich
// BEIDE.**
const b2 = await chromium.launch()
const c2 = await b2.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 2400 } })
const p2 = await c2.newPage()
await p2.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p2.fill('input[type=email]', KONTO)
await p2.fill('input[type=password]', wortFuer(KONTO))
await p2.click('button[type=submit]')
await p2.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })
await p2.goto(`${ZIEL}/v2/recovery?tab=muscles`, { waitUntil: 'networkidle' })
await p2.waitForTimeout(1600)
const zwei = await p2.evaluate(() => {
  const karten = [...document.querySelectorAll('svg')].filter(
    s => s.querySelector('[data-muskel]'))
  return karten.map((s, i) => {
    const kachel = s.closest('.v2-card') ?? s.parentElement
    const titel = kachel?.querySelector('.v2-card-title, [class*="title"]')
      ?.textContent?.trim() ?? '?'
    const flaechen = [...s.querySelectorAll('[data-muskel]')]
    const gefaerbt = flaechen.filter(g => {
      const f = getComputedStyle(g.querySelector('path') ?? g).fill
      return !/0\.36 0\.005|rgba\(0, 0, 0, 0\)|none/.test(f)
    })
    return { i, titel, flaechen: flaechen.length, gefaerbt: gefaerbt.length }
  })
})
console.log('\n=== Wieviele Karten sind auf der Seite? ===\n')
for (const k of zwei) {
  console.log(`  Karte ${k.i}  „${k.titel}"  ${k.flaechen} Flaechen, ${k.gefaerbt} gefaerbt`)
}
await b2.close()
