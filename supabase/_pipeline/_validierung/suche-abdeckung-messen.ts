#!/usr/bin/env node
// ABDECKUNGSMESSUNG MIT SOLLWERTEN (C-23, zweite Fassung)
//
// ANLASS: Toms Frage nach Block 31 — "wurde nun nur der Einzelfall
// geloest? Wie loest ihr das fuer alle restlichen Foods?" Der
// MealCam-Massstab steht bei 34 von 37, aber das sind 37 handverlesene
// Zutaten. Diese Messung ist die Gegenprobe ueber 152 Lebensmittel,
// systematisch aus dem Bestand gezogen.
//
// WAS SICH GEGENUEBER DER ERSTEN FASSUNG AENDERT
// `[read]` Die erste Fassung mass OHNE Sollwert: sie fragte, ob das
// gezogene Lebensmittel in der Trefferliste auftaucht. Das ist zu
// schwach — dieselbe Bauart meldete einmal 75 % "in Ordnung", weil sie
// nur "kein Gericht" fragte, und liess dabei `milch` -> Magermilchpulver
// und `banane` -> getrocknet durchgehen. **Eine Pruefung ohne Erwartung
// misst nichts.**
//
// DER BEFUND, DER DIE BAUART BESTIMMT
// `[cmd]` 113 der 152 gezogenen Lebensmittel (74 %) sind ZUBEREITETE
// Varianten — "Zucchini gebraten ohne Fett (Pfanne)", "Weizen ganzes
// Korn, gekocht, gebacken". Die daraus erzeugte Anfrage lautet
// "zucchini" bzw. "weizen ganzes". Wer das tippt, meint die GRUNDFORM,
// nicht die Pfannenvariante.
//
// **Das gezogene Lebensmittel ist also in 74 % der Faelle NICHT der
// richtige Sollwert.** Die erste Fassung hat deshalb etwas anderes
// gemessen als "findet der Mensch, was er sucht" — sie hat gemessen,
// ob ein Name zu sich selbst zurueckfindet.
//
// DIE SOLLWERTREGEL, ausgeschrieben und nachpruefbar
// Zu jeder Anfrage ist der Sollwert die GRUNDFORM derselben Art:
// Zubereitungscode 100 oder 000, deren Name alle Anfragewoerter traegt,
// bei mehreren die mit dem hoechsten sort_weight und kuerzestem Namen.
// Gibt es keine solche Grundform, ist der Sollwert das gezogene
// Lebensmittel selbst — dann ist es die einzige Form (Quittensaft,
// Brownies, Schokosahnetorte).
//
// Die Regel steht in SOLLWERTE als feste Liste, nicht als Rechnung zur
// Laufzeit. `[read]` Eine Pruefung, die ihre Sollwerte aus dem Prueflig
// ableitet, bestaetigt jeden Zustand — dieser Fehler ist im Repo schon
// passiert. Die Liste wurde EINMAL erzeugt, jede Zeile gegen den
// Bestand geprueft, und steht seitdem fest.
//
// AUFRUF: pnpm exec tsx supabase/_pipeline/_validierung/suche-abdeckung-messen.ts
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { buildFoodSearchGroups } from '../../../apps/web/src/lib/nutrition/food-search'

const C = 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SEP = ''
const ZWISCHEN = 'supabase/_pipeline/daten/_abdeckung-zwischenstand.json'

function sql(q: string, ms = 30_000): string[][] {
  const aus = execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', SEP, '-c', q],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: ms })
  return aus.split('\n').map(z => z.trim()).filter(Boolean).map(z => z.split(SEP))
}

// --- Schutz vor dem Prueflig in Bewegung ---
// `[read]` Claude Code baut parallel die Kette neu auf (C-41). Waehrend
// des Aufbaus ist die Datenbank zeitweise leer. Gegen einen Prueflig in
// Bewegung wird nicht gemessen.
const n = Number(sql(`select count(*)::text from nutrition.foods;`)[0][0])
if (n !== 7140) {
  console.error(`ABBRUCH: nutrition.foods hat ${n} Zeilen, erwartet 7140.`)
  console.error('Die Kette wird vermutlich gerade neu aufgebaut. Spaeter erneut messen.')
  process.exit(2)
}

// =============================================================
// Die Sollwerte
// =============================================================
// [Anfrage, erwarteter BLS-Code, gezogenes Lebensmittel, Begruendung]
// Ein leerer Sollwert heisst: nicht entscheidbar. Diese Faelle werden
// GETRENNT gezaehlt, nicht stillschweigend als Fehler verbucht.
// `[read]` Ein offener Sollwert ist ehrlich, ein geratener schlimmer
// als keiner.
const SOLLWERTE: Array<[string, string, string, string]> = JSON.parse(
  fs.readFileSync('supabase/_pipeline/daten/abdeckung-sollwerte.json', 'utf8')).faelle

// =============================================================
// Messung
// =============================================================
let platz1 = 0, top3 = 0, top10 = 0, nichtDrin = 0, keinTreffer = 0, offen = 0
const arbeitsliste: string[] = []
const ohneSoll: string[] = []
const zwischen: Array<Record<string, unknown>> = []

for (const [q, soll, gezogen, grund] of SOLLWERTE) {
  if (!soll) { offen++; ohneSoll.push(`${q.padEnd(34)} ${grund}`); continue }

  let r: string[][]
  try {
    const g = JSON.stringify(buildFoodSearchGroups(q)).replace(/'/g, "''")
    const qq = q.replace(/'/g, "''")
    r = sql(`select coalesce(x->>'bls_code',''), left(coalesce(x->>'name_de',''),52) from (
        select (nutrition.food_search('${qq}','${qq}',ARRAY[]::text[],NULL,NULL,NULL,NULL,NULL,10,0,NULL,NULL,NULL,'${g}'::jsonb))::jsonb j
      ) t, lateral jsonb_array_elements(j->'foods') with ordinality e(x,o);`)
  } catch (e) {
    // Zeitueberschreitung oder Fehler: als eigener Fall zaehlen, nicht
    // als Treffer und nicht als Fehlschlag. `[read]` Der Lauf ist
    // gestern in ein Timeout gelaufen; ein Abbruch darf nicht alles
    // kosten.
    arbeitsliste.push(`ZEIT    ${q.padEnd(30)} (Abfrage abgebrochen)`)
    zwischen.push({ q, soll, ergebnis: 'timeout' })
    fs.writeFileSync(ZWISCHEN, JSON.stringify(zwischen, null, 1))
    continue
  }

  const p = r.findIndex(([c]) => c === soll)
  if (r.length === 0) {
    keinTreffer++
    arbeitsliste.push(`LEER    ${q.padEnd(30)} kein Treffer   soll: ${grund}`)
  } else if (p === 0) {
    platz1++; top3++; top10++
  } else if (p >= 0 && p < 3) {
    top3++; top10++
    arbeitsliste.push(`PLATZ${p + 1}  ${q.padEnd(30)} statt: ${r[0][1]}`)
  } else if (p >= 0) {
    top10++
    arbeitsliste.push(`PLATZ${p + 1}  ${q.padEnd(30)} statt: ${r[0][1]}`)
  } else {
    nichtDrin++
    arbeitsliste.push(`FEHL    ${q.padEnd(30)} statt: ${r[0][1]}   soll: ${grund}`)
  }
  zwischen.push({ q, soll, platz: p, gewinner: r[0]?.[0] ?? null })
  fs.writeFileSync(ZWISCHEN, JSON.stringify(zwischen, null, 1))
}

const mitSoll = SOLLWERTE.length - offen
const pz = (x: number) => `${x} (${(100 * x / mitSoll).toFixed(1)} %)`

console.log('=============================================================')
console.log('C-23 — Abdeckungsmessung mit Sollwerten')
console.log('=============================================================')
console.log('')
console.log(`  Begriffe gesamt        : ${SOLLWERTE.length}`)
console.log(`  davon mit Sollwert     : ${mitSoll}`)
console.log(`  ohne Sollwert (offen)  : ${offen}`)
console.log('')
console.log(`  Sollwert auf Platz 1   : ${pz(platz1)}`)
console.log(`  in den ersten drei     : ${pz(top3)}`)
console.log(`  in den ersten zehn     : ${pz(top10)}`)
console.log(`  Treffer, aber nicht dabei: ${nichtDrin}`)
console.log(`  gar kein Treffer       : ${keinTreffer}`)
console.log('')
console.log('  --- Vergleich ---')
console.log('  `[cmd]` alte Fassung 2026-08-14, OHNE Sollwerte, dieselben 152:')
console.log('          48,0 % Platz 1 · 90,8 % in den ersten zehn · 0 % gar nichts')
console.log('  Die alte Zahl fragte, ob das GEZOGENE Lebensmittel auftaucht.')
console.log('  Diese Zahl fragt, ob das RICHTIGE oben steht. Nicht dasselbe.')
console.log('')

if (arbeitsliste.length) {
  console.log('=== Arbeitsliste: Sollwert nicht auf Platz 1 ===')
  arbeitsliste.forEach(z => console.log('  ' + z))
  console.log('')
}
if (ohneSoll.length) {
  console.log('=== Ohne Sollwert — bewusst offen gelassen ===')
  ohneSoll.forEach(z => console.log('  ' + z))
}
