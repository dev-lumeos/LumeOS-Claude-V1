// G-496/A1+A2 -- Toms Adresse pruefen, VOR dem Bauen.
//
// A  haelt s3/pdf/<dsld_id>.pdf? Wie viele antworten, wie viele
//    fallen?
// B  wie gross sind die PDFs? Median.
// C  hat `thumbnail` dieselbe Grundadresse? s3/thumbnails/<name>
//    -- MESSEN, nicht raten.
//
// [read] Dieselben zwanzig Ids wie in G-495, damit die Zahlen
// vergleichbar sind.
const IDS = process.argv.slice(2)
if (IDS.length === 0) { console.error('Ids fehlen'); process.exit(1) }

const API = 'https://api.ods.od.nih.gov/dsld/v9/label/'
const PDF = 'https://api.ods.od.nih.gov/dsld/s3/pdf/'
// [cmd] Toms Muster ist `s3/pdf/<id>.pdf`. Fuer C wird DERSELBE
// Praefix mit `thumbnails/` probiert -- das ist die naechstliegende
// Annahme, und sie wird gemessen, nicht behauptet.
// [cmd] Toms zweiter Fund (nih-dsld-client): die Adresse geht aus
// der ID, NICHT aus dem blanken Dateinamen -- darum fielen die
// sieben Versuche aus G-495.
const THUMB = 'https://api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/'

const zeilen = []
for (const id of IDS) {
  const z = { id }
  // Der Schnittstellensatz -- er nennt die Dateinamen.
  try {
    const a = await fetch(API + id, { signal: AbortSignal.timeout(20000) })
    if (a.ok) {
      const j = await a.json()
      z.thumbnailName = j.thumbnail || null
      z.pdfName = j.pdf || null
    }
  } catch { /* unten als fehlend sichtbar */ }

  // A/B: das PDF unter Toms Adresse.
  const t0 = Date.now()
  try {
    const a = await fetch(`${PDF}${id}.pdf`, {
      method: 'GET', signal: AbortSignal.timeout(30000),
    })
    z.pdfStatus = a.status
    z.pdfTyp = a.headers.get('content-type')
    if (a.ok) {
      const b = await a.arrayBuffer()
      z.pdfBytes = b.byteLength
      // [read] Die ersten Bytes sagen, ob es wirklich ein PDF ist --
      // ein 200 mit HTML waere die Falle aus G-495.
      z.pdfKopf = new TextDecoder().decode(b.slice(0, 5))
    }
  } catch (e) { z.pdfStatus = 'FEHLER'; z.grund = String(e).slice(0, 40) }
  z.pdfMs = Date.now() - t0

  // C: das Vorschaubild unter derselben Grundadresse.
  {
    const tt = Date.now()
    try {
      const a = await fetch(`${THUMB}${id}.jpg`, {
        signal: AbortSignal.timeout(20000),
      })
      z.thumbStatus = a.status
      z.thumbTyp = a.headers.get('content-type')
      if (a.ok) {
        const tb = await a.arrayBuffer()
        z.thumbBytes = tb.byteLength
        // [read] Die ersten Bytes belegen ein JPEG (FF D8 FF) --
        // ein 200 mit XML waere die Falle aus G-495.
        const u = new Uint8Array(tb.slice(0, 3))
        z.thumbEcht = u[0] === 0xFF && u[1] === 0xD8 && u[2] === 0xFF
      }
    } catch { z.thumbStatus = 'FEHLER' }
    z.thumbMs = Date.now() - tt
  }
  zeilen.push(z)
}

const echt = zeilen.filter(z => z.pdfKopf === '%PDF-')
const bytes = echt.map(z => z.pdfBytes).sort((a, b) => a - b)
const ms = zeilen.map(z => z.pdfMs).sort((a, b) => a - b)
const thumbOk = zeilen.filter(z => z.thumbEcht === true)
const tBytes = thumbOk.map(z => z.thumbBytes).sort((a, b) => a - b)
const tMs = zeilen.map(z => z.thumbMs ?? 0).sort((a, b) => a - b)

console.log('ID        PDF          Bytes      ms   Thumb')
for (const z of zeilen) {
  console.log(
    `${String(z.id).padEnd(9)} ${String(z.pdfStatus).padEnd(6)}${(z.pdfKopf === '%PDF-' ? 'PDF' : '   ')}  `
    + `${String(z.pdfBytes ?? '—').padStart(9)} ${String(z.pdfMs).padStart(5)}   `
    + `${z.thumbStatus ?? '—'} ${z.thumbTyp ?? ''}`)
}
console.log('\n── A: haelt das Muster ─────────────────────────')
console.log(`  echte PDFs           ${echt.length}/${zeilen.length}`)
console.log(`  Status 200           ${zeilen.filter(z => z.pdfStatus === 200).length}/${zeilen.length}`)
console.log(`  laut API MIT pdf     ${zeilen.filter(z => z.pdfName).length}/${zeilen.length}`)
console.log('\n── B: wie gross ────────────────────────────────')
if (bytes.length > 0) {
  const kb = (b) => `${Math.round(b / 1024)} KB`
  console.log(`  kleinste  ${kb(bytes[0])}`)
  console.log(`  Median    ${kb(bytes[Math.floor(bytes.length / 2)])}`)
  console.log(`  groesste  ${kb(bytes[bytes.length - 1])}`)
}
console.log(`  Median Dauer  ${ms[Math.floor(ms.length / 2)]} ms`)
console.log('\n── C: thumbnail unter derselben Grundadresse ───')
console.log(`  echte JPEGs          ${thumbOk.length}/${zeilen.length}`)
console.log(`  laut API MIT name    ${zeilen.filter(z => z.thumbnailName).length}/${zeilen.length}`)
if (tBytes.length > 0) {
  const kb = (b) => `${Math.round(b / 1024)} KB`
  console.log(`  kleinstes ${kb(tBytes[0])}  Median ${kb(tBytes[Math.floor(tBytes.length / 2)])}  groesstes ${kb(tBytes[tBytes.length - 1])}`)
  console.log(`  Median Dauer  ${tMs[Math.floor(tMs.length / 2)]} ms`)
}
