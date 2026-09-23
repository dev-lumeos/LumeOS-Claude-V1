// G-495/A1 -- die NIH-Schnittstelle messen, VOR dem Bauen.
//
// A  liefert sie thumbnail/pdf? Wie oft leer?
// B  wie sieht der Wert aus?
// C  wie schnell antwortet sie?
//
// [read] Die Punktdatei nennt das Doku-Beispiel mit BEIDEN Feldern
// leer. Ein Beispiel ist kein Beleg -- deshalb zwanzig echte Ids
// aus der eigenen Datenbank.
const IDS = process.argv.slice(2)
if (IDS.length === 0) { console.error('Ids fehlen'); process.exit(1) }

const BASIS = 'https://api.ods.od.nih.gov/dsld/v9/label/'
const zeilen = []

for (const id of IDS) {
  const t0 = Date.now()
  try {
    const a = await fetch(BASIS + id, { signal: AbortSignal.timeout(20000) })
    const ms = Date.now() - t0
    if (!a.ok) { zeilen.push({ id, status: a.status, ms }); continue }
    const j = await a.json()
    zeilen.push({
      id, status: a.status, ms,
      thumbnail: j.thumbnail ?? null,
      pdf: j.pdf ?? null,
      name: (j.fullName ?? '').slice(0, 40),
    })
  } catch (e) {
    zeilen.push({ id, status: 'FEHLER', ms: Date.now() - t0,
                  grund: String(e).slice(0, 60) })
  }
}

const ok = zeilen.filter(z => z.status === 200)
const mitBild = ok.filter(z => z.thumbnail && z.thumbnail.length > 0)
const mitPdf = ok.filter(z => z.pdf && z.pdf.length > 0)
const zeiten = zeilen.map(z => z.ms).sort((a, b) => a - b)

console.log('ID        ms    thumbnail')
for (const z of zeilen) {
  console.log(`${String(z.id).padEnd(9)} ${String(z.ms).padStart(5)}  ${z.thumbnail ?? z.status}`)
}
console.log('\n── A: wie oft leer ─────────────────────────────')
console.log(`  Antworten 200        ${ok.length}/${zeilen.length}`)
console.log(`  MIT thumbnail        ${mitBild.length}/${ok.length}`)
console.log(`  MIT pdf              ${mitPdf.length}/${ok.length}`)
console.log('\n── B: wie sieht der Wert aus ───────────────────')
console.log(`  Beispiel  ${JSON.stringify(mitBild[0]?.thumbnail ?? null)}`)
console.log('  -> Dateiname, KEINE volle Adresse')
console.log('\n── C: wie schnell ──────────────────────────────')
console.log(`  schnellste ${zeiten[0]} ms`)
console.log(`  Median     ${zeiten[Math.floor(zeiten.length / 2)]} ms`)
console.log(`  langsamste ${zeiten[zeiten.length - 1]} ms`)
