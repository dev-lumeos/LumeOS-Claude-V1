#!/usr/bin/env node
// MEALCAM-MESSUNG: Findet die Suche, was ein Kraftsportler isst?
//
// ANLASS (Tom, 2026-08-14): "denke wie ein bodybuilder und bring seine
// erwarteten nutrients, die mealcam wird dasselbe liefern — klar
// deklarierte nutrients die passen muessen."
//
// WARUM DIESE MESSUNG ANDERS IST als suche-wortschatz-pruefen.ts:
// Dort stehen 50 handverlesene Begriffe mit der Frage "wird ueberhaupt
// etwas gefunden". Hier steht die Frage, die zaehlt: **kommt das
// RICHTIGE oben an?**
//
// `[cmd]` Der Unterschied ist gross. Ein erster Lauf ohne Erwartungen
// meldete 75 % "in Ordnung" — die Pruefung fragte nur "kein Gericht".
// Tatsaechlich lieferte sie `milch` -> Magermilchpulver, `banane` ->
// Banane getrocknet, `brokkoli` -> Broccoli gebacken. Alles technisch
// Grundnahrungsmittel, alles falsch.
// **Eine Pruefung ohne Erwartung misst nichts.**
//
// DIE ERWARTUNGEN kommen aus der Praxis, nicht aus dem Bestand:
// `[read]` Recherche zu Mahlzeiten von Kraftsportlern, 2026-08-14 — die
// wiederkehrenden Bausteine sind Huehnchen/Pute/Rind/Lachs/Thunfisch,
// Reis/Hafer/Suesskartoffel/Quinoa, Brokkoli/Spinat, Avocado/Mandeln/
// Olivenoel, Magerquark/Huettenkaese/Skyr. MealCam wird genau diese
// Bestandteile von einem Teller melden.
//
// DIE REGEL DAHINTER: Wer eine ZUTAT sucht, will die ROHFORM.
// `[cmd]` Der BLS traegt sie an fester Stelle — Zubereitungscode `100`.
// Wer `banane` tippt, meint `Banane roh` (F503100), nicht `Banane
// getrocknet` (F503400). Beide haben `sort_weight` 660; die Sortierung
// wertet den Zubereitungscode nicht aus, und dann entscheidet das
// Alphabet — `getrocknet` vor `roh`.
//
// AUFRUF: pnpm exec tsx supabase/_pipeline/_validierung/mealcam-zutaten-messen.ts
import { execFileSync } from 'node:child_process'
import { buildFoodSearchGroups } from '../../../apps/web/src/lib/nutrition/food-search'

const C = 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

// [Zutat wie getippt, erwarteter BLS-Code, Begruendung]
// Der Code steht hier und nicht der Name, weil Namen sich aendern koennen
// und ein Name-Vergleich bei "Broccoli roh" gegen "Brokkoli roh"
// scheitern wuerde.
// `[cmd]` Block 32: Die 21 offenen Sollwerte sind belegt. Jeder Code
// wurde im Bestand nachgeschlagen, keiner geraten. Wo mehrere Formen in
// Frage kamen, steht die Wahl samt Grund daneben.
//
// `[cmd]` DABEI FIEL AUF, und es widerlegt die naheliegende Annahme
// "Rohform = Zubereitungscode 100": Hafer Flocken (C133000), Skyr
// (M710100), Mozzarella (M0A1000), Vollkornbrot (B101000), Olivenoel
// (Q120000) und Erdnussbutter (H880200) tragen NICHT 100. Sie haben
// keine Zubereitungsvariante — sie SIND die Form. Eine Regel, die nur
// 100 bevorzugt, wuerde genau diese sechs schlechter stellen.
const ZUTATEN: [string, string, string][] = [
  // --- Eiweiss ---
  ['haehnchenbrust', 'V416100', 'Haehnchen Brustfilet roh'],
  ['putenbrust', 'V486100', 'Pute Brust ohne Haut roh — nicht die Kochpoekelware W561000'],
  ['rinderhack', 'U010100', 'Rind Hackfleisch roh — nicht Leberhack, nicht Rind/Schwein gemischt'],
  ['rindersteak', 'U131100', 'Rind Steak (Ruecken) roh'],
  ['lachs', 'T410100', 'Lachs roh — nicht Alaska-Seelachs, nicht Lachsrogen'],
  ['thunfisch', 'T121100', 'Thunfisch roh — nicht tiefgefroren gegrillt'],
  ['garnelen', 'T753100', 'Garnele/Granat/Krabbe roh'],
  ['eiklar', 'E113100', 'Huehnerei Eiklar roh'],
  ['eigelb', 'E112100', 'Huehnerei Eigelb roh — nicht getrocknet (E112400)'],
  // --- Milch ---
  ['magerquark', 'M713100', 'Speisequark Magerstufe < 10 % Fett i. Tr.'],
  ['huettenkaese', 'M711100', 'Koerniger Frischkaese < 10 % — heute NULL Treffer'],
  ['skyr', 'M710100', 'Skyr — traegt 100, aber ohne Variante'],
  ['milch', 'M111300', 'Vollmilch frisch 3,5 % — was man trinkt, nicht Magermilchpulver'],
  ['mozzarella', 'M0A1000', 'Mozzarella — traegt 000, nicht 100'],
  // --- Kohlenhydrate ---
  ['reis', 'C352000', 'Reis poliert roh — traegt 000, nicht 100'],
  ['haferflocken', 'C133000', 'Hafer Flocken — traegt 000, keine Zubereitungsvariante'],
  ['quinoa', 'C118000', 'Quinoa weiss roh — nicht tricolore (C118100)'],
  ['suesskartoffel', 'K420100', 'Batate/Suesskartoffel roh — nicht frittiert'],
  ['kartoffeln', 'K110100', 'Kartoffel geschaelt roh — nicht Trockenprodukt'],
  ['vollkornbrot', 'B101000', 'Vollkornbrot — nicht Hafer-/Weizen-/Roggenvollkornbrot'],
  // --- Gemuese ---
  ['brokkoli', 'G312100', 'Broccoli roh — nicht gebacken'],
  ['spinat', 'G211100', 'Spinat roh — nicht Tortelloni'],
  ['tomaten', 'G561100', 'Tomate roh — nicht Heringsfilet in Tomatensauce'],
  ['gurke', 'G520100', 'Gurke roh — nicht Gemuesesaft'],
  ['champignons', 'K701100', 'Champignon roh — nicht Zungenpastete'],
  ['zucchini', 'G582100', 'Zucchini roh'],
  ['paprika', 'G543100', 'Gemuesepaprika rot roh — rot ist die uebliche Lesart von "Paprika"'],
  ['karotten', 'G620100', 'Karotte/Moehre roh — nicht Gemuesemischung'],
  // --- Fette ---
  ['avocado', 'F502100', 'Avocado roh'],
  ['walnuesse', 'H120100', 'Walnuss — heute NULL Treffer'],
  ['mandeln', 'H210100', 'Mandel suess — nicht bitter (H220100), nicht Mandeldrink'],
  ['olivenoel', 'Q120000', 'Olivenoel — traegt 000'],
  ['erdnussbutter', 'H880200', 'Erdnussbutter/Erdnusscreme — traegt 200, nicht 100'],
  // --- Obst ---
  ['banane', 'F503100', 'Banane roh — nicht getrocknet'],
  ['apfel', 'F110100', 'Apfel roh — nicht geduenstet'],
  ['erdbeeren', 'F301100', 'Erdbeere roh — nicht Buttermilchgelee'],
  ['blaubeeren', 'F304100', 'Heidelbeere roh — heute NULL Treffer'],
]

function suche(q: string) {
  const g = JSON.stringify(buildFoodSearchGroups(q)).replace(/'/g, "''")
  const aus = execFileSync('docker', ['exec', C, 'psql', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-F', '\u0001', '-c',
    `select o, coalesce(x->>'bls_code',''), coalesce((x->>'sort_weight')::int,0),
            left(coalesce(x->>'name_display',''),46)
     from (select (nutrition.food_search('${q}','${q}',ARRAY[]::text[],NULL,NULL,NULL,NULL,NULL,10,0,NULL,NULL,NULL,'${g}'::jsonb))::jsonb j) t,
     lateral jsonb_array_elements(j->'foods') with ordinality e(x,o);`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return aus.split('\n').map(s => s.trim()).filter(Boolean).map(s => s.split('\u0001'))
}

let platz1 = 0, top3 = 0, drin = 0, leer = 0, offen = 0
const zeilen: string[] = []

for (const [q, soll, grund] of ZUTATEN) {
  const r = suche(q)
  if (!r.length) { leer++; zeilen.push(`LEER    ${q.padEnd(18)} —  ${grund}`); continue }
  if (!soll) { offen++; zeilen.push(`?       ${q.padEnd(18)} ${r[0][3]}`); continue }
  const p = r.findIndex(([, c]) => c === soll)
  if (p === 0) { platz1++; top3++; drin++; zeilen.push(`OK      ${q.padEnd(18)} ${r[0][3]}`) }
  else if (p >= 0 && p < 3) { top3++; drin++; zeilen.push(`PLATZ${p + 1}  ${q.padEnd(18)} statt: ${r[0][3]}`) }
  else if (p >= 0) { drin++; zeilen.push(`PLATZ${p + 1}  ${q.padEnd(18)} statt: ${r[0][3]}`) }
  else { zeilen.push(`FEHL    ${q.padEnd(18)} ${r[0][3]}   soll: ${grund}`) }
}

const mitSoll = ZUTATEN.filter(([, s]) => s).length
console.log(`Zutaten: ${ZUTATEN.length}, davon mit festem Sollwert: ${mitSoll}\n`)
console.log(`  Sollwert auf Platz 1     : ${platz1} von ${mitSoll}  (${(100 * platz1 / mitSoll).toFixed(0)} %)`)
console.log(`  in den ersten drei       : ${top3}`)
console.log(`  ueberhaupt in den Top 10 : ${drin}`)
console.log(`  gar keine Treffer        : ${leer}`)
console.log(`  ohne Sollwert (offen)    : ${offen}\n`)
zeilen.forEach(z => console.log('  ' + z))
