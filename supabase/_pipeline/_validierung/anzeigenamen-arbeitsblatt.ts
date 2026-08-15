#!/usr/bin/env node
// ARBEITSBLATT: Die 100 wichtigsten Lebensmittel eines Kraftsportlers
//
// ZWECK: Tom soll entscheiden koennen, nicht diskutieren muessen.
// Diese Datei erzeugt eine Tabelle mit einer Zeile je Lebensmittel:
// was getippt wird, was die Suche HEUTE liefert, und was im Bestand
// tatsaechlich dazu existiert. Ergebnis geht nach
// docs/ssot/daten/anzeigenamen-arbeitsblatt.md — dort wird eingetragen,
// wie der Anzeigename lauten soll und welche Aliase noetig sind.
//
// AUFRUF: pnpm exec tsx supabase/_pipeline/_validierung/anzeigenamen-arbeitsblatt.ts
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { buildFoodSearchGroups } from '../../../apps/web/src/lib/nutrition/food-search'

const C = 'supabase_db_LumeOS-Claude-V1'

// Was ein Kraftsportler taeglich isst und tippt. `[read]` Grundlage:
// Recherche 2026-08-14 zu Meal-Prep-Praxis, ergaenzt um die Sorten, die
// im Handel stehen (Basmati, Jasmin) und im BLS fehlen.
const GRUPPEN: Record<string, string[]> = {
  'Eiweiss — Fleisch': [
    'haehnchenbrust', 'haehnchenschenkel', 'putenbrust', 'rinderhack', 'rindersteak',
    'rinderfilet', 'schweinefilet', 'schweineschnitzel', 'lammfilet', 'entenbrust',
  ],
  'Eiweiss — Fisch': [
    'lachs', 'raeucherlachs', 'thunfisch', 'thunfisch dose', 'forelle', 'kabeljau',
    'seelachs', 'hering', 'makrele', 'garnelen',
  ],
  'Eiweiss — Ei und Milch': [
    'eier', 'eiklar', 'eigelb', 'magerquark', 'huettenkaese', 'skyr',
    'griechischer joghurt', 'naturjoghurt', 'harzer kaese', 'mozzarella',
    'feta', 'parmesan', 'gouda', 'frischkaese', 'milch', 'buttermilch',
  ],
  'Eiweiss — pflanzlich': [
    'tofu', 'tempeh', 'seitan', 'linsen', 'kichererbsen', 'kidneybohnen',
    'schwarze bohnen', 'erbsen', 'sojabohnen', 'edamame',
  ],
  'Kohlenhydrate — Reis und Getreide': [
    'reis', 'basmatireis', 'jasminreis', 'naturreis', 'vollkornreis', 'sushireis',
    'klebreis', 'parboiled reis', 'wildreis', 'milchreis',
    'haferflocken', 'quinoa', 'couscous', 'bulgur', 'hirse', 'buchweizen', 'polenta',
  ],
  'Kohlenhydrate — Beilagen und Brot': [
    'kartoffeln', 'suesskartoffel', 'nudeln', 'vollkornnudeln', 'spaghetti',
    'vollkornbrot', 'dinkelbrot', 'roggenbrot', 'knaeckebrot', 'reiswaffeln', 'mais',
  ],
  'Gemuese': [
    'brokkoli', 'spinat', 'zucchini', 'paprika', 'tomaten', 'gurke', 'karotten',
    'champignons', 'gruene bohnen', 'rosenkohl', 'blumenkohl', 'weisskohl',
    'zwiebel', 'knoblauch', 'aubergine', 'kuerbis', 'spargel', 'rucola',
  ],
  'Obst': [
    'banane', 'apfel', 'blaubeeren', 'erdbeeren', 'himbeeren', 'orange',
    'ananas', 'mango', 'kiwi', 'wassermelone', 'trauben', 'birne', 'datteln', 'rosinen',
  ],
  'Fette, Nuesse, Samen': [
    'avocado', 'mandeln', 'walnuesse', 'cashews', 'haselnuesse', 'erdnuesse',
    'erdnussbutter', 'olivenoel', 'rapsoel', 'kokosoel', 'leinsamen', 'chiasamen',
    'sonnenblumenkerne', 'kuerbiskerne',
  ],
  'Sonstiges': ['honig', 'zartbitterschokolade', 'kakao', 'kaffee'],
}

function suche(q: string, n = 3) {
  const g = JSON.stringify(buildFoodSearchGroups(q)).replace(/'/g, "''")
  const aus = execFileSync('docker', ['exec', C, 'psql', '-U', 'postgres', '-d', 'postgres',
    '-t', '-A', '-F', '\u0001', '-c',
    `select coalesce(x->>'bls_code',''), left(coalesce(x->>'name_display_de',''),46)
     from (select (nutrition.food_search('${q}','${q}',ARRAY[]::text[],NULL,NULL,NULL,NULL,NULL,${n},0,NULL,NULL,NULL,'${g}'::jsonb))::jsonb j) t,
     lateral jsonb_array_elements(j->'foods') with ordinality e(x,o);`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return aus.split('\n').map(s => s.trim()).filter(Boolean).map(s => s.split('\u0001'))
}

// Was traegt der Bestand ueberhaupt zu diesem Stichwort? Ueber name_de,
// damit auch sichtbar wird, was die Suche NICHT findet.
function bestand(stich: string) {
  const s = stich.replace(/'/g, "''")
  const aus = execFileSync('docker', ['exec', C, 'psql', '-U', 'postgres', '-d', 'postgres',
    '-t', '-A', '-F', '\u0001', '-c',
    `select bls_code, sort_weight, substring(bls_code,5,3), left(name_de,50)
     from nutrition.foods where nutrition.search_fold(name_de) like '%${s}%'
     order by sort_weight desc, length(name_de) limit 6;`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return aus.split('\n').map(s2 => s2.trim()).filter(Boolean).map(s2 => s2.split('\u0001'))
}

const zeilen: string[] = []
let gesamt = 0, leer = 0

for (const [gruppe, begriffe] of Object.entries(GRUPPEN)) {
  zeilen.push(`\n## ${gruppe}\n`)
  for (const q of begriffe) {
    gesamt++
    const t = suche(q)
    const stamm = q.replace(/(reis|brot|nudeln|oel|kaese|joghurt)$/, '')
    const b = bestand(stamm.length >= 4 ? stamm : q)
    zeilen.push(`### \`${q}\``)
    if (!t.length) { leer++; zeilen.push(`**Suche: KEIN TREFFER**`) }
    else {
      zeilen.push(`Suche liefert:`)
      t.forEach(([c, n], i) => zeilen.push(`${i + 1}. \`${c}\` ${n}`))
    }
    if (b.length) {
      zeilen.push(`\nIm Bestand (nach Gewicht):`)
      zeilen.push('| Code | Gew | Zub | name_de |')
      zeilen.push('|---|---|---|---|')
      b.forEach(([c, w, z, n]) => zeilen.push(`| \`${c}\` | ${w} | ${z} | ${n} |`))
    } else {
      zeilen.push(`\n*Im Bestand nichts unter diesem Stichwort gefunden.*`)
    }
    zeilen.push(`\n**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_\n`)
  }
}

const kopf = [
  '# Arbeitsblatt Anzeigenamen — die 100 wichtigsten Lebensmittel',
  '',
  `\`[cmd]\` Erzeugt ${new Date().toISOString().slice(0, 10)} von`,
  '`supabase/_pipeline/_validierung/anzeigenamen-arbeitsblatt.ts`.',
  '',
  `**${gesamt} Begriffe geprüft, davon ${leer} ohne jeden Treffer.**`,
  '',
  'Je Begriff steht hier: was die Suche **heute** liefert, und was der',
  'Bestand unter diesem Stichwort **überhaupt hat**. Die drei Felder am',
  'Ende jeder Zeile sind zum Ausfüllen — Anzeigename, Aliase, Notiz.',
  '',
  '`[cmd]` **Warum das nötig ist:** `name_display_de` ist bei allen 7.140',
  'Lebensmitteln gefüllt, aber **identisch mit `name_de`** — Kettenschritt',
  '020 setzt ihn per `COALESCE` auf den BLS-Namen. Der Mechanismus steht,',
  'er ist nur leer. `food_search` liest bereits',
  '`COALESCE(NULLIF(name_display_de,\'\'), name_de, …)`; ein gefülltes Feld',
  'wirkt **sofort**, ohne Codeänderung.',
  '',
  '`[Sicher]` **Der Grund, warum das kein Schönheitsthema ist:** `[cmd]`',
  '`Reis poliert, roh` hat 351 kcal, `Reis poliert, gekocht` hat 117 —',
  '**Faktor 3**. Wer 200 g gekochten Reis wiegt und den rohen Eintrag',
  'wählt, verbucht 702 statt 234 kcal. Der Name muss die Unterscheidung',
  'tragen, nicht nur erwähnen.',
  '',
  '---',
].join('\n')

fs.mkdirSync('docs/ssot/daten', { recursive: true })
fs.writeFileSync('docs/ssot/daten/anzeigenamen-arbeitsblatt.md', kopf + zeilen.join('\n') + '\n', 'utf8')
console.log(`${gesamt} Begriffe, ${leer} ohne Treffer`)
console.log('docs/ssot/daten/anzeigenamen-arbeitsblatt.md geschrieben')
