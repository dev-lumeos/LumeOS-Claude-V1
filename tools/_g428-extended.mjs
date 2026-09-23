// G-428/A4 - wo stehen Zyklen und Protokolle im Extended-Reiter?
//
// `[read]` **Die Frage ist nicht, OB sie da sind** - sondern ob sie
// IN einer Kachel der Vorlage stehen oder davor.
//
// `[cmd]` **Gemessen wird die REIHENFOLGE der Kacheltitel** und, ob
// die beiden Karten innerhalb des Vorlagenrasters (`.v2-grid-14`)
// liegen. **Ein Titel allein sagt nichts ueber den Ort.**
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'
const BILD = process.argv[4] ?? 'docs/bilder/g428/extended-vorher.png'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()

const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 200)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

await p.goto(`${ZIEL}/v2/supplements?tab=extended`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)

const m = await p.evaluate(() => {
  const titelVon = k => (k.querySelector('.v2-card-title, h2, h3, .v2-eyebrow')
    ?.textContent ?? '').trim().slice(0, 48)

  const alle = [...document.querySelectorAll('.v2-card')]
  // `[read]` **Nur die aeusseren** - eine Karte in einer Karte ist
  // eine Kachel, kein Paar.
  const aeussere = alle.filter(k => !k.parentElement?.closest('.v2-card'))

  // Das Vorlagenraster: `.v2-grid-14` ist die zweispaltige Flaeche
  // aus `module-supplements.jsx:1204`.
  const raster = document.querySelector('.v2-grid-14')

  return {
    reihenfolge: aeussere.map(titelVon).filter(Boolean),
    // Die Frage von A4: liegen sie IM Raster?
    zyklenImRaster: !!raster && [...raster.querySelectorAll('.v2-card')]
      .some(k => /^Zyklen/.test(titelVon(k))),
    protokolleImRaster: !!raster && [...raster.querySelectorAll('.v2-card')]
      .some(k => /^Protokolle/.test(titelVon(k))),
    rasterDa: !!raster,
    // Steht etwas VOR dem Raster? Das war Toms Befund.
    vorDemRaster: raster
      ? aeussere.filter(k => raster.compareDocumentPosition(k)
          & Node.DOCUMENT_POSITION_PRECEDING).map(titelVon).filter(Boolean)
      : [],
    kachelnGesamt: aeussere.length,
  }
})

console.log(`\n=== G-428/A4 — Extended, ${KONTO} ===\n`)
console.log(`Raster (.v2-grid-14) da     ${m.rasterDa}`)
console.log(`Kacheln gesamt              ${m.kachelnGesamt}`)
console.log(`Zyklen IM Raster            ${m.zyklenImRaster}`)
console.log(`Protokolle IM Raster        ${m.protokolleImRaster}`)
console.log(`VOR dem Raster              ${JSON.stringify(m.vorDemRaster)}`)
console.log(`Reihenfolge                 ${JSON.stringify(m.reihenfolge, null, 1)}`)
console.log(`Seitenfehler                ${fehler.length} ${JSON.stringify(fehler)}`)

await p.screenshot({ path: BILD, fullPage: true })
console.log(`\nBild: ${BILD}`)

await b.close()
