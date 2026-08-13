#!/usr/bin/env node
// Systematische Messung: Findet ein Mensch die Lebensmittel?
//
// ANLASS: Toms Frage nach Block 31 — "wurde nun nur der Einzelfall
// geloest? Wie loest ihr das fuer alle restlichen Foods?"
//
// Die 50 Begriffe im Abnahmeskript sind HANDVERLESEN. Sie belegen, dass
// die gebauten Wege funktionieren, aber nicht, fuer wie viele der 7.140
// Lebensmittel. Diese Messung nimmt jedes Lebensmittel und fragt: wenn
// ein Mensch den Namenskopf so tippt, wie er ihn schreiben wuerde —
// zusammengeschrieben, ohne Umlaute, ohne Komma — wird es gefunden?
//
// KEIN TEST, eine MESSUNG. Sie hat kein Soll und faellt nicht rot aus.
// Sie liefert eine Zahl, an der sich der naechste Schritt bemisst.
import { execFileSync } from 'node:child_process'
import { buildFoodSearchGroups } from '../../../apps/web/src/lib/nutrition/food-search'

const C = 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

function sql(q: string): string[][] {
  const aus = execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', '\u0001', '-c', q],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  return aus.split('\n').map(z => z.trim()).filter(Boolean).map(z => z.split('\u0001'))
}

// Alle Lebensmittel mit ihrem Namenskopf (vor dem ersten Komma).
const foods = sql(`select bls_code, name_de, split_part(name_de, ',', 1) from nutrition.foods order by bls_code;`)
console.log(`Lebensmittel: ${foods.length}`)

// Die "menschliche" Anfrage. ACHTUNG, hier steckt der Messfehler, den
// diese Datei beim ersten Lauf hatte: Nimmt man den ganzen Kopf vor dem
// Komma, entstehen Ungetueme wie `auberginegebratenohnefettpfanne` oder
// `zwetschgenstreuselkuchenhefeteig`. Das tippt niemand — die Messung
// misst dann die eigene Eingabe, nicht die Suche.
// `[cmd]` Erster Lauf mit ganzem Kopf: 46,7 % Platz 1, 19,1 % gar nichts.
// Die Fehlschlaege waren fast alle solche Ungetueme.
//
// Ein Mensch tippt ein bis zwei Woerter: `aubergine`, `rind hackfleisch`,
// `lachs`. Genau das wird hier gebildet — Klammerzusaetze und
// Zubereitungsangaben fallen weg.
const ZUBEREITUNG = /^(roh|frisch|gekocht|gebacken|gebraten|gegrillt|ged[üu]nstet|geschmort|ger[äa]uchert|getrocknet|frittiert|paniert|pochiert|gegart|gesalzen|ges[üu][ßs]t|gezuckert|abgetropft|tiefgefroren|mager|fettarm|ohne|mit|und|im|in|aus|wie)$/i

function menschlich(kopf: string): string {
  const ohneKlammern = kopf.replace(/\(.*?\)/g, ' ')
  const woerter = ohneKlammern.split(/[\s\/]+/)
    .map(w => w.replace(/[^A-Za-zÄÖÜäöüß0-9]/g, ''))
    .filter(w => w.length >= 3 && !ZUBEREITUNG.test(w))
    .slice(0, 2)
  return woerter.join(' ').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
}

const stichprobe = Number(process.env.STICHPROBE ?? '400')
const schritt = Math.max(1, Math.floor(foods.length / stichprobe))
const gewaehlt = foods.filter((_, i) => i % schritt === 0)
console.log(`Stichprobe: jedes ${schritt}. — ${gewaehlt.length} Lebensmittel\n`)

let platz1 = 0, top10 = 0, gefunden = 0, nichts = 0
const fehler: string[] = []

for (const [code, name, kopf] of gewaehlt) {
  const q = menschlich(kopf)
  if (q.length < 3) continue
  const g = JSON.stringify(buildFoodSearchGroups(q)).replace(/'/g, "''")
  const r = sql(`select coalesce(x->>'bls_code',''), o from (
      select (nutrition.food_search('${q}','${q}',ARRAY[]::text[],NULL,NULL,NULL,NULL,NULL,10,0,NULL,NULL,NULL,'${g}'::jsonb))::jsonb j
    ) t, lateral jsonb_array_elements(j->'foods') with ordinality e(x,o);`)
  const treffer = r.findIndex(([c]) => c === code)
  if (r.length === 0) { nichts++; if (fehler.length < 25) fehler.push(`${q}  (${name})`) }
  else if (treffer === 0) { platz1++; top10++; gefunden++ }
  else if (treffer >= 0) { top10++; gefunden++ }
  else { gefunden++; if (fehler.length < 25) fehler.push(`${q}  -> ${r.length} Treffer, aber nicht dabei  (${name})`) }
}

const n = gewaehlt.length
console.log('=== Ergebnis ===')
console.log(`  Platz 1          : ${platz1}  (${(100 * platz1 / n).toFixed(1)} %)`)
console.log(`  in den ersten 10 : ${top10}  (${(100 * top10 / n).toFixed(1)} %)`)
console.log(`  ueberhaupt Treffer, aber nicht dabei: ${gefunden - top10}`)
console.log(`  gar nichts       : ${nichts}  (${(100 * nichts / n).toFixed(1)} %)`)
console.log('\n=== Fehlschlaege (Stichprobe) ===')
fehler.forEach(f => console.log('  ' + f))
