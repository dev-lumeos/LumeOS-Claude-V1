#!/usr/bin/env node
// Abnahme der Lebensmittelsuche — breit statt tief (Block 28).
//
// ANLASS: Toms Ansage lautete "ich will nicht nur haehnchen geloest
// haben". Diese Pruefung ist der Ort, an dem sich das entscheidet:
// 45 Begriffe aus 11 Warengruppen, je mit einer Erwartung, WELCHES
// Lebensmittel auf Platz eins gehoert.
//
// DREI SORTEN, bewusst gemischt:
//   soll     — muss treffen. Das ist die neue Faehigkeit.
//   schutz   — funktionierte VORHER schon. Faellt hier etwas aus, hat
//              die Aenderung etwas kaputt gemacht; das faellt hier auf
//              und nicht beim Nutzer.
//   bekannt  — schlaegt fehl und WEISS das. `[cmd]` Dialekt und
//              Schreibvarianten loest dieser Block nicht. Sie stehen
//              hier, damit die Pruefung nicht besser aussieht als die
//              Lage — ein Testlauf, der die Luecke verschweigt, ist
//              schlimmer als keiner.
//
// WO SIE LEBT: hier, NICHT im `pnpm gate` — sie braucht eine laufende
// Datenbank. Dieselbe Begruendung wie bei zugriffsrechte-pruefen.mjs.
//
// AUFRUF:  node supabase/_pipeline/_validierung/suche-wortschatz-pruefen.mjs
//          PGDATABASE=suchprobe node …   (gegen die Wegwerf-DB)
import { execFileSync } from 'node:child_process'

const DB = process.env.PGDATABASE || 'postgres'
const CONTAINER = process.env.LUMEOS_DB_CONTAINER || 'supabase_db_LumeOS-Claude-V1'

// erwartung: Zeichenfolge, die im Namen des ersten Treffers vorkommen muss
// (gefaltet verglichen). null = nur "irgendein Treffer".
const FAELLE = [
  // --- Toms fuenf Formen (Anlass des Blocks) ---
  { q: 'huehnchenbrust',  gruppe: 'Fleisch',   art: 'bekannt', erwartung: 'haehnchen brust', grund: 'huehnchen ist Umgangssprache, kein Bestandswort' },
  { q: 'huehnerbrust',    gruppe: 'Fleisch',   art: 'bekannt', erwartung: 'haehnchen brust', grund: 'wie oben' },
  { q: 'huehner brust',   gruppe: 'Fleisch',   art: 'bekannt', erwartung: 'haehnchen brust', grund: 'wie oben' },
  { q: 'chicken brust',   gruppe: 'Fleisch',   art: 'schutz',  erwartung: 'haehnchen brust', grund: 'englischer Alias traegt die Mischform' },
  { q: 'pouletbrust',     gruppe: 'Fleisch',   art: 'bekannt', erwartung: 'haehnchen brust', grund: 'Schweizerdeutsch, kein Bestandswort' },
  { q: 'haehnchenbrust',  gruppe: 'Fleisch',   art: 'soll',    erwartung: 'haehnchen brust', grund: 'Zusammenschreibung, neu abgeleitet' },
  { q: 'haehnchenbrustfilet', gruppe: 'Fleisch', art: 'soll',  erwartung: 'haehnchen brustfilet', grund: 'Zusammenschreibung' },

  // --- Zusammenschreibungen aus ANDEREN Warengruppen ---
  { q: 'rinderhack',      gruppe: 'Fleisch',   art: 'bekannt', erwartung: 'rind hackfleisch', grund: 'rinder- ist Fugenform, Bestand schreibt "Rind Hackfleisch"' },
  { q: 'rindhackfleisch', gruppe: 'Fleisch',   art: 'soll',    erwartung: 'rind hackfleisch', grund: 'Zusammenschreibung des Bestandskopfs' },
  { q: 'schweineschnitzel', gruppe: 'Fleisch', art: 'bekannt', erwartung: 'schwein schnitzel', grund: 'Fugenform' },
  { q: 'schweinschnitzel', gruppe: 'Fleisch',  art: 'soll',    erwartung: 'schwein schnitzel', grund: 'Zusammenschreibung' },
  { q: 'kalbfleisch',     gruppe: 'Fleisch',   art: 'soll',    erwartung: 'kalb fleisch',      grund: 'Zusammenschreibung' },
  // Erwartung geweitet: [cmd] der Bestand fuehrt sowohl 'Pute Brust, …'
  // als auch 'Putenbrust, Kochpoekelware' — beide sind richtige Treffer.
  { q: 'putenbrust',      gruppe: 'Fleisch',   art: 'soll',    erwartung: 'brust',             grund: 'Zusammenschreibung' },
  { q: 'lammkotelett',    gruppe: 'Fleisch',   art: 'soll',    erwartung: 'lamm kotelett',     grund: 'Zusammenschreibung' },

  // --- Milch ---
  { q: 'magerquark',      gruppe: 'Milch',     art: 'soll',    erwartung: 'quark',        grund: 'Zusammenschreibung' },
  { q: 'vollmilch',       gruppe: 'Milch',     art: 'schutz',  erwartung: 'vollmilch',    grund: 'steht so im Bestand' },
  // 'huettenkaese' und 'basmatireis' standen hier als 'soll'. `[cmd]` Beide
  // Produkte gibt es im BLS NICHT (0 Zeilen) — der Test verlangte etwas,
  // das der Bestand gar nicht kennt. Ersetzt durch Zusammenschreibungen,
  // die im Bestand vorkommen. *Ein Test, der Unmoegliches fordert, misst
  // nicht die Suche, sondern den Testautor.*
  { q: 'speisequark',     gruppe: 'Milch',     art: 'soll',    erwartung: 'quark',        grund: 'Zusammenschreibung' },
  { q: 'joghurt',         gruppe: 'Milch',     art: 'schutz',  erwartung: 'joghurt',      grund: 'Bestandswort' },
  { q: 'yoghurt',         gruppe: 'Milch',     art: 'bekannt', erwartung: 'joghurt',      grund: 'Schreibvariante, nicht abgeleitet' },

  // --- Getreide, Brot ---
  { q: 'haferflocken',    gruppe: 'Getreide',  art: 'soll',    erwartung: 'hafer flocken', grund: 'Zusammenschreibung' },
  { q: 'vollkornbrot',    gruppe: 'Brot',      art: 'schutz',  erwartung: 'vollkornbrot',  grund: 'steht so im Bestand' },
  { q: 'roggenbrot',      gruppe: 'Brot',      art: 'schutz',  erwartung: 'roggen',        grund: 'Teilstring greift' },
  { q: 'weizenmehl',      gruppe: 'Getreide',  art: 'soll',    erwartung: 'weizen',        grund: 'Zusammenschreibung' },
  { q: 'reismehl',        gruppe: 'Getreide',  art: 'soll',    erwartung: 'reis mehl',     grund: 'Zusammenschreibung des Bestandskopfs' },

  // --- Gemuese ---
  { q: 'suesskartoffel',  gruppe: 'Gemuese',   art: 'soll',    erwartung: 'kartoffel',     grund: 'Zusammenschreibung' },
  { q: 'blumenkohl',      gruppe: 'Gemuese',   art: 'schutz',  erwartung: 'blumenkohl',    grund: 'Bestandswort' },
  { q: 'karfiol',         gruppe: 'Gemuese',   art: 'bekannt', erwartung: 'blumenkohl',    grund: 'oesterreichisch' },
  { q: 'kohlruebe',       gruppe: 'Gemuese',   art: 'soll',    erwartung: 'kohlruebe',     grund: 'Schraegstrich-Haelfte aus "Kohlruebe/Steckruebe"' },
  { q: 'steckruebe',      gruppe: 'Gemuese',   art: 'soll',    erwartung: 'steckruebe',    grund: 'die andere Haelfte' },
  { q: 'tomate',          gruppe: 'Gemuese',   art: 'schutz',  erwartung: 'tomate',        grund: 'Bestandswort' },
  { q: 'paradeiser',      gruppe: 'Gemuese',   art: 'bekannt', erwartung: 'tomate',        grund: 'oesterreichisch' },

  // --- Obst ---
  { q: 'apfel',           gruppe: 'Obst',      art: 'schutz',  erwartung: 'apfel',         grund: 'Bestandswort' },
  { q: 'aprikose',        gruppe: 'Obst',      art: 'schutz',  erwartung: 'aprikose',      grund: 'Bestandswort' },
  { q: 'marille',         gruppe: 'Obst',      art: 'bekannt', erwartung: 'aprikose',      grund: 'oesterreichisch' },
  { q: 'blaubeere',       gruppe: 'Obst',      art: 'bekannt', erwartung: 'heidelbeere',   grund: 'regional' },

  // --- Fisch ---
  { q: 'lachsfilet',      gruppe: 'Fisch',     art: 'soll',    erwartung: 'lachs',         grund: 'Zusammenschreibung' },
  { q: 'kabeljau',        gruppe: 'Fisch',     art: 'soll',    erwartung: 'kabeljau',      grund: 'Schraegstrich-Haelfte aus "Dorsch/Kabeljau"' },
  { q: 'seelachs',        gruppe: 'Fisch',     art: 'soll',    erwartung: 'seelachs',      grund: 'Schraegstrich-Haelfte' },
  { q: 'thunfisch',       gruppe: 'Fisch',     art: 'schutz',  erwartung: 'thunfisch',     grund: 'Bestandswort' },

  // --- Oele und Fette ---
  { q: 'olivenoel',       gruppe: 'Oele',      art: 'schutz',  erwartung: 'olivenoel',     grund: 'Bestandswort' },
  { q: 'rapsoel',         gruppe: 'Oele',      art: 'schutz',  erwartung: 'rapsoel',       grund: 'Bestandswort' },
  { q: 'butterschmalz',   gruppe: 'Oele',      art: 'soll',    erwartung: 'butter',        grund: 'Zusammenschreibung' },

  // --- Getraenke ---
  { q: 'orangensaft',     gruppe: 'Getraenke', art: 'schutz',  erwartung: 'orangensaft',   grund: 'Bestandswort' },
  { q: 'apfelsaft',       gruppe: 'Getraenke', art: 'schutz',  erwartung: 'apfelsaft',     grund: 'Bestandswort' },

  // --- Fertiggerichte / Suesses ---
  { q: 'vollmilchschokolade', gruppe: 'Suesses', art: 'schutz', erwartung: 'vollmilchschokolade', grund: 'Bestandswort' },
  { q: 'schoggi',         gruppe: 'Suesses',   art: 'bekannt', erwartung: 'schokolade',    grund: 'Schweizerdeutsch' },
  { q: 'gemuesemischung', gruppe: 'Fertig',    art: 'schutz',  erwartung: 'gemuesemischung', grund: 'Bestandswort' },
]

function fold(s) {
  return s.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
}

function suche(q) {
  const norm = fold(q).trim().replace(/\s+/g, ' ')
  const tokens = norm.split(' ').filter(Boolean)
  const arr = '{' + tokens.map(t => '"' + t.replace(/"/g, '\\"') + '"').join(',') + '}'
  const sql =
    `SELECT (r->>'total')::int || E'\\t' || COALESCE(r->'foods'->0->>'name_de','') FROM (` +
    `SELECT nutrition.food_search($q$${q}$q$, $q$${norm}$q$, $q$${arr}$q$::text[], ` +
    `NULL,NULL,NULL,NULL,'relevance',3,0) AS r) t;`
  const out = execFileSync('docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-q', '-t', '-A', '-c', sql],
    { encoding: 'utf8' }).trim()
  const [total, name] = out.split('\t')
  return { total: Number(total || 0), name: name || '' }
}

console.log('Abnahme Lebensmittelsuche — Datenbank:', DB)
console.log('')

let sollOk = 0, sollFehl = 0, schutzOk = 0, schutzFehl = 0, bekanntOffen = 0, bekanntGeloest = 0
const fehler = []

const spalten = (a, b, c, d) =>
  a.padEnd(22) + b.padEnd(11) + c.padEnd(7) + d

console.log(spalten('Anfrage', 'Gruppe', 'Art', 'Ergebnis'))
console.log('-'.repeat(96))

for (const f of FAELLE) {
  const r = suche(f.q)
  const trifft = r.total > 0 &&
    (f.erwartung === null || fold(r.name).includes(fold(f.erwartung)))

  let urteil
  if (f.art === 'soll') {
    if (trifft) { sollOk++; urteil = 'OK' }
    else { sollFehl++; urteil = 'FEHL'; fehler.push(f.q + ' — erwartet "' + f.erwartung + '", bekam "' + (r.name || '(nichts)') + '"') }
  } else if (f.art === 'schutz') {
    if (trifft) { schutzOk++; urteil = 'OK' }
    else { schutzFehl++; urteil = 'RUECKFALL'; fehler.push('RUECKFALL ' + f.q + ' — erwartet "' + f.erwartung + '", bekam "' + (r.name || '(nichts)') + '"') }
  } else {
    if (trifft) { bekanntGeloest++; urteil = 'unerwartet OK' }
    else { bekanntOffen++; urteil = 'bekannt offen' }
  }

  console.log(spalten(f.q, f.gruppe, f.art,
    urteil.padEnd(15) + String(r.total).padStart(5) + '  ' + r.name.slice(0, 42)))
}

console.log('')
console.log('soll   : ' + sollOk + ' von ' + (sollOk + sollFehl) + ' getroffen')
console.log('schutz : ' + schutzOk + ' von ' + (schutzOk + schutzFehl) + ' gehalten')
console.log('bekannt: ' + bekanntOffen + ' weiterhin offen, ' + bekanntGeloest + ' unerwartet geloest')
console.log('Gruppen: ' + new Set(FAELLE.map(f => f.gruppe)).size + ', Begriffe: ' + FAELLE.length)

if (fehler.length) {
  console.log('')
  for (const z of fehler) console.log('  ' + z)
}

console.log('')
const rot = sollFehl + schutzFehl
console.log(rot === 0 ? 'ABNAHME BESTANDEN' : rot + ' FEHLER')
process.exit(rot === 0 ? 0 : 1)
