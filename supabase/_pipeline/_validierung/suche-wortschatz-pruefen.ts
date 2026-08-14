#!/usr/bin/env node
// Abnahme der Lebensmittelsuche — breit statt tief (Block 28, erweitert
// in Block 31).
//
// ANLASS: Toms Ansage lautete "ich will nicht nur haehnchen geloest
// haben". Diese Pruefung ist der Ort, an dem sich das entscheidet:
// 47 Begriffe aus 11 Warengruppen, je mit einer Erwartung, WELCHES
// Lebensmittel auf Platz eins gehoert.
//
// DREI SORTEN, bewusst gemischt:
//   soll     — muss treffen. Das ist die neue Faehigkeit.
//   schutz   — funktionierte VORHER schon. Faellt hier etwas aus, hat
//              die Aenderung etwas kaputt gemacht; das faellt hier auf
//              und nicht beim Nutzer.
//   bekannt  — schlaegt fehl und WEISS das. Sie stehen hier, damit die
//              Pruefung nicht besser aussieht als die Lage — ein
//              Testlauf, der die Luecke verschweigt, ist schlimmer als
//              keiner.
//
// BLOCK 31: Sieben Faelle sind von 'bekannt' auf 'soll' gewandert, weil
// Zerlegung (such-zerlegung.ts) und Synonyme (Kettenschritt 024) sie
// jetzt tragen. Was WEITERHIN offen ist, bleibt als 'bekannt' stehen
// und wird unten ausdruecklich aufgezaehlt.
//
// DIE TOKENS KOMMEN AUS DER APP, NICHT AUS DIESER DATEI.
// Frueher baute dieses Skript seine Tokens selbst — eine zweite Kopie
// der Regel, also genau der Fehler aus Block 29 (zwei Fassungen der
// Normalisierung, die stumm auseinanderlaufen). Jetzt wird
// buildFoodSearchGroups importiert. Faellt die App um, faellt dieser
// Test mit, statt gruen zu bleiben.
//
// WO SIE LEBT: hier, NICHT im `pnpm gate` — sie braucht eine laufende
// Datenbank. Dieselbe Begruendung wie bei zugriffsrechte-pruefen.mjs.
//
// AUFRUF:  pnpm exec tsx supabase/_pipeline/_validierung/suche-wortschatz-pruefen.mjs
//          PGDATABASE=wegwerf_b31 pnpm exec tsx …   (gegen die Wegwerf-DB)
import { execFileSync } from 'node:child_process'
import {
  buildFoodSearchGroups,
  buildFoodSearchTokens,
  normalizeFoodSearchText,
} from '../../../apps/web/src/lib/nutrition/food-search.ts'

const DB = process.env.PGDATABASE || 'postgres'
const CONTAINER = process.env.LUMEOS_DB_CONTAINER || 'supabase_db_LumeOS-Claude-V1'

// erwartung: Zeichenfolge, die im Namen des ersten Treffers vorkommen muss
// (gefaltet verglichen). null = nur "irgendein Treffer".
const FAELLE = [
  // --- Toms fuenf Formen (Anlass von Block 28, geloest in Block 31) ---
  // `[cmd]` Alle fuenf lieferten vor Block 31 NULL Treffer. Sie tragen
  // jetzt 'soll', weil Zerlegung + Synonym sie loesen — nicht, weil die
  // Erwartung gesenkt wurde.
  { q: 'huehnchenbrust',  gruppe: 'Fleisch',   art: 'soll',    erwartung: 'haehnchen brust', grund: 'zerlegt zu huehnchen+brust, Synonym huehnchen->haehnchen' },
  { q: 'huehnerbrust',    gruppe: 'Fleisch',   art: 'soll',    erwartung: 'haehnchen brust', grund: 'Toms Ausgangsfall: huehner+brust, Synonym huehner->haehnchen' },
  { q: 'huehner brust',   gruppe: 'Fleisch',   art: 'soll',    erwartung: 'haehnchen brust', grund: 'getrennt geschrieben, Synonym greift ohne Zerlegung' },
  { q: 'chicken brust',   gruppe: 'Fleisch',   art: 'schutz',  erwartung: 'haehnchen brust', grund: 'englischer Alias traegt die Mischform' },
  { q: 'pouletbrust',     gruppe: 'Fleisch',   art: 'soll',    erwartung: 'haehnchen brust', grund: 'Schweiz; poulet steht ueber die Handliste im Wortschatz' },
  { q: 'haehnchenbrust',  gruppe: 'Fleisch',   art: 'soll',    erwartung: 'haehnchen brust', grund: 'Zusammenschreibung, in Block 28 abgeleitet' },
  { q: 'haehnchenbrustfilet', gruppe: 'Fleisch', art: 'soll',  erwartung: 'haehnchen brustfilet', grund: 'Zusammenschreibung' },

  // --- Zusammenschreibungen aus ANDEREN Warengruppen ---
  // Stand Block 31: 51 Treffer, aber auf Platz eins standen
  // "Blätterteigtaschen gefüllt mit Rinderhack". Die Zerlegung hatte
  // geliefert, die Reihenfolge nicht — deshalb lief der Fall als
  // 'bekannt'.
  // `[cmd]` Block 32 loest ihn: die Zubereitungsstufe (C-25) holt
  // "Rind Hackfleisch, roh" (U010100) auf Platz eins, der Burrito
  // faellt auf Platz sechs. Damit wird der Fall zu 'soll'.
  { q: 'rinderhack',      gruppe: 'Fleisch',   art: 'soll',    erwartung: 'hackfleisch', grund: 'C-25 holt die Rohform vor die Fertiggerichte' },
  { q: 'rindhackfleisch', gruppe: 'Fleisch',   art: 'soll',    erwartung: 'rind hackfleisch', grund: 'Zusammenschreibung des Bestandskopfs' },
  { q: 'schweineschnitzel', gruppe: 'Fleisch', art: 'soll',    erwartung: 'schwein',       grund: 'Fuge "e": schweine->schwein' },
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
  { q: 'yoghurt',         gruppe: 'Milch',     art: 'bekannt', erwartung: 'joghurt',      grund: 'Schreibvariante; weder Thesaurus noch Woerterbuch kennen sie' },

  // --- Getreide, Brot ---
  { q: 'haferflocken',    gruppe: 'Getreide',  art: 'soll',    erwartung: 'hafer flocken', grund: 'Zusammenschreibung' },
  { q: 'vollkornbrot',    gruppe: 'Brot',      art: 'schutz',  erwartung: 'vollkornbrot',  grund: 'steht so im Bestand' },
  { q: 'roggenbrot',      gruppe: 'Brot',      art: 'schutz',  erwartung: 'roggen',        grund: 'Teilstring greift' },
  { q: 'weizenmehl',      gruppe: 'Getreide',  art: 'soll',    erwartung: 'weizen',        grund: 'Zusammenschreibung' },
  { q: 'reismehl',        gruppe: 'Getreide',  art: 'soll',    erwartung: 'reis mehl',     grund: 'Zusammenschreibung des Bestandskopfs' },

  // --- Gemuese ---
  { q: 'suesskartoffel',  gruppe: 'Gemuese',   art: 'soll',    erwartung: 'kartoffel',     grund: 'Zusammenschreibung' },
  { q: 'blumenkohl',      gruppe: 'Gemuese',   art: 'schutz',  erwartung: 'blumenkohl',    grund: 'Bestandswort' },
  { q: 'karfiol',         gruppe: 'Gemuese',   art: 'soll',    erwartung: 'blumenkohl',    grund: 'oesterreichisch; Thesaurus liefert karfiol->blumenkohl' },
  { q: 'kohlruebe',       gruppe: 'Gemuese',   art: 'soll',    erwartung: 'kohlruebe',     grund: 'Schraegstrich-Haelfte aus "Kohlruebe/Steckruebe"' },
  { q: 'steckruebe',      gruppe: 'Gemuese',   art: 'soll',    erwartung: 'steckruebe',    grund: 'die andere Haelfte' },
  { q: 'tomate',          gruppe: 'Gemuese',   art: 'schutz',  erwartung: 'tomate',        grund: 'Bestandswort' },
  { q: 'paradeiser',      gruppe: 'Gemuese',   art: 'soll',    erwartung: 'tomate',        grund: 'oesterreichisch; Thesaurus liefert paradeiser->tomate' },
  { q: 'kohlsprossen',    gruppe: 'Gemuese',   art: 'soll',    erwartung: 'rosenkohl',     grund: 'oesterreichisch; Thesaurus' },
  { q: 'erdaepfel',       gruppe: 'Gemuese',   art: 'bekannt', erwartung: 'kartoffel',     grund: 'Thesaurus kennt nur den Singular "erdapfel"' },

  // --- Obst ---
  { q: 'apfel',           gruppe: 'Obst',      art: 'schutz',  erwartung: 'apfel',         grund: 'Bestandswort' },
  { q: 'aprikose',        gruppe: 'Obst',      art: 'schutz',  erwartung: 'aprikose',      grund: 'Bestandswort' },
  { q: 'marille',         gruppe: 'Obst',      art: 'soll',    erwartung: 'aprikose',      grund: 'oesterreichisch; Thesaurus liefert marille->aprikose' },
  { q: 'blaubeere',       gruppe: 'Obst',      art: 'soll',    erwartung: 'heidelbeere',   grund: 'regional; Thesaurus liefert blaubeere->heidelbeere' },
  { q: 'ribisel',         gruppe: 'Obst',      art: 'soll',    erwartung: 'johannisbeere', grund: 'oesterreichisch; Thesaurus' },

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
  { q: 'schoggi',         gruppe: 'Suesses',   art: 'bekannt', erwartung: 'schokolade',    grund: 'Schweizerdeutsch; `[cmd]` steht in KEINER der beiden Quellen' },
  { q: 'gemuesemischung', gruppe: 'Fertig',    art: 'schutz',  erwartung: 'gemuesemischung', grund: 'Bestandswort' },
]

function fold(s) {
  return s.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
}

const q1 = s => "'" + String(s).replace(/'/g, "''") + "'"

function suche(q) {
  // Tokens und Gruppen kommen aus der App — eine Quelle, keine Kopie.
  const norm = normalizeFoodSearchText(q)
  const tokens = buildFoodSearchTokens(q)
  const gruppen = buildFoodSearchGroups(q)
  const arr = '{' + tokens.map(t => '"' + t.replace(/"/g, '\\"') + '"').join(',') + '}'
  const gj = gruppen.length ? q1(JSON.stringify(gruppen)) + '::jsonb' : 'NULL'
  const sql =
    `SELECT (r->>'total')::int || E'\\t' || COALESCE(r->'foods'->0->>'name_de','') FROM (` +
    `SELECT nutrition.food_search(${q1(q)}, ${q1(norm)}, ${q1(arr)}::text[], ` +
    `NULL,NULL,NULL,NULL,'relevance',3,0,NULL,NULL,false,${gj}) AS r) t;`
  const out = execFileSync('docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-q', '-t', '-A', '-c', sql],
    { encoding: 'utf8' }).trim()
  const [total, name] = out.split('\t')
  return { total: Number(total || 0), name: name || '', gruppen }
}

console.log('Abnahme Lebensmittelsuche — Datenbank:', DB)
console.log('')

let sollOk = 0, sollFehl = 0, schutzOk = 0, schutzFehl = 0, bekanntOffen = 0, bekanntGeloest = 0
const fehler = []
const offen = []

const spalten = (a, b, c, d) =>
  a.padEnd(22) + b.padEnd(11) + c.padEnd(9) + d

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
    else { bekanntOffen++; urteil = 'bekannt offen'; offen.push(f.q + ' — ' + f.grund) }
  }

  console.log(spalten(f.q, f.gruppe, f.art,
    urteil.padEnd(15) + String(r.total).padStart(5) + '  ' + r.name.slice(0, 40)))
}

console.log('')
console.log('soll   : ' + sollOk + ' von ' + (sollOk + sollFehl) + ' getroffen')
console.log('schutz : ' + schutzOk + ' von ' + (schutzOk + schutzFehl) + ' gehalten')
console.log('bekannt: ' + bekanntOffen + ' weiterhin offen, ' + bekanntGeloest + ' unerwartet geloest')
console.log('Gruppen: ' + new Set(FAELLE.map(f => f.gruppe)).size + ', Begriffe: ' + FAELLE.length)

// Die offenen Faelle werden AUSGESCHRIEBEN, nicht nur gezaehlt. Eine
// Zahl ohne Namen laesst sich wegsehen; eine Liste nicht.
if (offen.length) {
  console.log('')
  console.log('WEITERHIN OFFEN — diese Suche findet nichts:')
  for (const z of offen) console.log('  · ' + z)
}

if (fehler.length) {
  console.log('')
  for (const z of fehler) console.log('  ' + z)
}

console.log('')
const rot = sollFehl + schutzFehl
console.log(rot === 0 ? 'ABNAHME BESTANDEN' : rot + ' FEHLER')
process.exit(rot === 0 ? 0 : 1)
