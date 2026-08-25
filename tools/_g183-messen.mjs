// G-183: die gebaute Regel gegen den echten Bestand halten.
//
// `[read]` **Dieselbe Zerlegung wie die Anzeige** — hier nachgebaut,
// weil ein `.tsx` sich nicht ohne Weiteres importieren laesst. Der
// Test in `abschnitte.test.tsx` prueft die echte Funktion; dieses
// Werkzeug misst nur, wie oft sie im Bestand greift.
//
// **Wer die Regel in `inAussagen()` aendert, aendert sie hier mit.**
import { readFileSync } from 'node:fs'

const ABK = /(?:\b[a-zA-ZäöüÄÖÜ]\.|\bca\.|\bvgl\.|\bNr\.|\bSt\.|\bbzw\.|\bevtl\.|\binkl\.|\bmax\.|\bmin\.|\bggf\.|\bsog\.)$/

function inAussagen(text) {
  const roh = (text ?? '').trim()
  if (!roh) return []
  const teile = []
  let anfang = 0
  const suche = /[.;!?]\s+(?=[A-ZÄÖÜ])/g
  let m
  while ((m = suche.exec(roh)) !== null) {
    const bisHier = roh.slice(anfang, m.index + 1)
    if (ABK.test(bisHier)) continue
    teile.push(bisHier.trim())
    anfang = m.index + m[0].length
  }
  const schluss = roh.slice(anfang).trim()
  if (schluss) teile.push(schluss)
  return teile.length > 1 ? teile : [roh]
}

// Die Werte kommen aus einer Datei, die `tools/lauf.py` gefuellt hat —
// so bleibt der Weg ohne Konsolenfenster.
const datei = process.argv[2] ?? 'backup/g183-werte.json'
const daten = JSON.parse(readFileSync(datei, 'utf8'))

console.log('Feld                         gefuellt  mehrteilig  Anteil  max')
for (const [feld, werte] of Object.entries(daten)) {
  const teile = werte.map(w => inAussagen(w).length)
  const mehr = teile.filter(n => n > 1).length
  const anteil = Math.round(100 * mehr / Math.max(1, werte.length))
  const max = Math.max(0, ...teile)
  console.log(`${feld.padEnd(28)} ${String(werte.length).padStart(8)} `
    + `${String(mehr).padStart(11)}  ${String(anteil).padStart(5)}% ${String(max).padStart(4)}`)
}
