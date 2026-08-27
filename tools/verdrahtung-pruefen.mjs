// Findet Verdrahtung, die in keinem Test vorkommt.
//
// ══ WARUM ES DIESE PRUEFUNG GIBT ═══════════════════════════════════
//
// `[cmd]` **Sechsmal in fuenf Tagen ist dieselbe Sorte Fehler
// durchgekommen** — G-184, G-186, G-187, G-191, G-196, G-199. Jedes
// Mal war die FUNKTION geprueft und die VERDRAHTUNG nicht:
//
//     G-184  `wadaNote={undefined}`        kam durch, weil der Name
//                                          in der Typdeklaration
//                                          weiterlebte
//     G-186  `wofuer_de`                   stand im Kommentar, nicht
//                                          im `.select()`
//     G-187  `daten?.wechselwirkungenX`    ein Regex auf den Namen
//                                          traf auch den Tippfehler
//     G-191  `dosisFelderX(d)`             Funktion ohne Aufrufer
//     G-196  `data-ton` von Hand           zweites Vokabular daneben
//     G-199  `.from('community_anzeigeX')` Tabelle, die es nicht gibt
//
// `[read]` **Und einmal ist es teuer geworden:** genau so ist G-192
// haengen geblieben. Der Lesepfad gab still `null` zurueck, und
// niemand merkte es, bis Tom fragte, wo das Community-Zeug bleibt.
//
// ══ DIE GEMEINSAME FORM ════════════════════════════════════════════
//
// **Auftrag G-197: *„Miss, ob es eine gemeinsame Form gibt: ein
// Tabellenname, ein Feldname, ein Komponentenname, der in einem
// Lesepfad steht und in keinem Test."***
//
// `[cmd]` **Es gibt sie.** Alle sechs Faelle sind dieselbe Gestalt:
// **ein Name, der die Anwendung mit ihren Daten verbindet und in
// keiner Pruefung vorkommt.** Wer ihn aendert, aendert die Anzeige —
// und nichts wird rot.
//
// `[read]` **Deshalb kein siebter Einzelwaechter.** Diese Pruefung
// zaehlt die Namen und faellt, wenn ein UNBEWACHTER dazukommt.
//
// ══ WARUM EINE BESTANDSLISTE UND KEIN VERBOT ═══════════════════════
//
// `[cmd]` **Gemessen 2026-08-26: 36 von 65 Tabellen und 11 von 44
// Komponenten stehen in keinem Test.** Das ist zu viel, um es in
// einem Auftrag zu beheben — und ein Waechter, der ab Tag eins rot
// ist, wird abgeschaltet statt befolgt (die Lehre aus
// `ladekette-pruefen.mjs`).
//
// **Deshalb: der Bestand ist geduldet, ein Zuwachs nicht.** Wer eine
// neue Tabelle anbindet, nennt sie in einem Test — oder traegt sie
// hier ein und begruendet es.
//
// Aufruf: node tools/verdrahtung-pruefen.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename, relative } from 'node:path'

const WURZEL = process.cwd()
const QUELLE = join(WURZEL, 'apps/web/src')

/** Alle Dateien unter einem Pfad, die auf `endung` enden. */
function dateien(pfad, endungen, aus = []) {
  for (const e of readdirSync(pfad)) {
    if (e === 'node_modules' || e === '.next' || e === '.next-gate') continue
    const p = join(pfad, e)
    if (statSync(p).isDirectory()) dateien(p, endungen, aus)
    else if (endungen.some(x => e.endsWith(x))) aus.push(p)
  }
  return aus
}

/** Kommentare raus — ein Name im Fliesstext ist keine Verdrahtung. */
function entkleiden(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
}

const alle = dateien(QUELLE, ['.ts', '.tsx'])
const istTest = p => p.includes('__tests__')

// ── Was die Tests kennen ──────────────────────────────────────────
let tests = ''
for (const p of alle.filter(istTest)) tests += readFileSync(p, 'utf8')

// ── Was die Lesepfade verdrahten ──────────────────────────────────
const gefunden = new Map()
const merke = (art, name, datei) => {
  const key = `${art}:${name}`
  if (!gefunden.has(key)) gefunden.set(key, { art, name, dateien: new Set() })
  gefunden.get(key).dateien.add(relative(WURZEL, datei).replace(/\\/g, '/'))
}

for (const p of alle) {
  if (istTest(p)) continue
  const s = entkleiden(readFileSync(p, 'utf8'))
  // Tabellen und Sichten.
  //
  // `[cmd]` **Das Muster war zuerst `\.from\('name'\)` mit
  // schliessender Klammer** — und fand `community_anzeige` NICHT, weil
  // der Aufruf dort ueber mehrere Zeilen laeuft und die Klammer erst
  // spaeter kommt. **Der Waechter meldete gruen, obwohl der Name gar
  // nicht in seiner Liste stand.**
  //
  // `[read]` **Ein Waechter, der seinen Gegenstand nicht findet, ist
  // schlimmer als keiner** — er sagt „alles in Ordnung" ueber etwas,
  // das er nie angesehen hat. Deshalb ohne schliessende Klammer.
  // ══ G-200: warum das Muster GROSSBUCHSTABEN kennt ═══════════════
  //
  // `[cmd]` **Zwei der sechs bekannten Faelle blieben gruen**, und der
  // Grund lag hier: das Muster hiess `[a-z_][a-z0-9_]*`, also **nur
  // Kleinbuchstaben.** Ein Name wie `community_anzeigeX` passte
  // deshalb **gar nicht** — er wurde nicht als unbekannt gemeldet,
  // sondern **ueberhaupt nicht gesehen.**
  //
  // `[cmd]` **Gemessen 2026-08-26, vier Proben:** `exercises_neu` und
  // `community_anzeige_neu` wurden gefunden, `exercisesX` und
  // `community_anzeigeX` nicht — **unabhaengig von der Datei.** Es ist
  // die Namensform, nicht der Ort.
  //
  // `[read]` **Ein Waechter, der seinen Gegenstand nicht sieht, meldet
  // „alles in Ordnung" ueber etwas, das er nie angesehen hat.** Das
  // ist schlimmer als kein Waechter. Deshalb nimmt das Muster jeden
  // Bezeichner und urteilt danach.
  for (const m of s.matchAll(/\.from\(\s*'([A-Za-z_][A-Za-z0-9_]*)'/g)) {
    merke('tabelle', m[1], p)
  }
  // Datenbankfunktionen.
  for (const m of s.matchAll(/\.rpc\('([A-Za-z_][A-Za-z0-9_]*)'/g)) {
    merke('rpc', m[1], p)
  }
}

// ── Die Bestandsliste ─────────────────────────────────────────────
//
// `[cmd]` Stand 2026-08-26. **Wer hier eine Zeile streicht, hat
// einen Test geschrieben — wer eine hinzufuegt, tut das Falsche.**
const GEDULDET = new Set([
  'tabelle:autonomy_change_log', 'tabelle:biomarker_aliases',
  'tabelle:biomarker_catalog', 'tabelle:biomarker_reference_ranges',
  'tabelle:body_circumferences', 'tabelle:client_autonomy',
  'tabelle:client_permissions', 'tabelle:daily_nutrient_summary_long',
  'tabelle:daily_summary', 'tabelle:equipment', 'tabelle:food_groups',
  'tabelle:foods_portions', 'tabelle:goal_milestones',
  'tabelle:hydration_summary', 'tabelle:intake_logs', 'tabelle:lab_reports',
  'tabelle:meal_items', 'tabelle:modality_log', 'tabelle:nutrient_details',
  'tabelle:nutrient_reference_values', 'tabelle:nutrient_search_aliases',
  'tabelle:pending_actions', 'tabelle:permission_change_log',
  'tabelle:preparation_kinds', 'tabelle:recipes', 'tabelle:rule_catalog',
  'tabelle:scores', 'tabelle:search_events', 'tabelle:stack_items',
  'tabelle:supplement_categories', 'tabelle:supplement_dosing',
  'tabelle:supplement_evidence', 'tabelle:tag_definitions',
  'tabelle:user_display_preferences', 'tabelle:user_stacks',
  'tabelle:water_logs',
  // Datenbankfunktionen, Stand 2026-08-26. Dieselbe Klasse: ein
  // Tippfehler im Namen faellt in keinem Test auf.
  'rpc:berechne_zielwerte', 'rpc:food_categories_tree',
  'rpc:food_nutrient_snapshot', 'rpc:goal_milestone_status',
  'rpc:goal_progress_at', 'rpc:hydration_day',
  'rpc:micronutrient_below_threshold', 'rpc:micronutrient_snapshot',
  'rpc:nutrient_summary_window', 'rpc:phase_am',
  'rpc:preference_search_preview', 'rpc:recipe_nutrition',
  'rpc:rule_assessment', 'rpc:schema_debug', 'rpc:zielwerte_am',
  // Diese drei waren durch den Teilstring-Fehler verdeckt: ihre
  // Namen kommen in Tests nur als Teil eines laengeren Namens vor
  // (). Erst die Wortgrenze hat sie sichtbar
  // gemacht.
  'rpc:adaptive_tdee', 'tabelle:muscle_groups', 'tabelle:user_goals',
])

// `[cmd]` **Der Name muss ALS GANZES in einem Test stehen.** Die
// erste Fassung nahm `tests.includes(name)` — und blieb bei der
// Sabotage `community_anzeigeX` gruen, weil `includes` auf dem
// **Teilstring** `community_anzeige` anschlug, der im Test steht.
// **Genau der Fehler aus G-187**, diesmal in meinem eigenen Waechter.
// `[cmd]` **G-200: die Zeichenklasse deckt auch Grossbuchstaben.**
// Mit `[a-z0-9_]` haette `community_anzeige` als Ganzes gegolten,
// obwohl im Test `community_anzeigeX` steht — dieselbe Luecke wie im
// Muster oben, nur an der zweiten Stelle.
const alsGanzes = (name) =>
  new RegExp(`(?<![A-Za-z0-9_])${name}(?![A-Za-z0-9_])`).test(tests)

const unbewacht = []
for (const [key, e] of gefunden) {
  if (alsGanzes(e.name)) continue
  if (GEDULDET.has(key)) continue
  unbewacht.push(e)
}

// `--warum <name>` erklaert die Entscheidung fuer einen Namen.
const warum = process.argv.indexOf('--warum')
if (warum > -1) {
  const n = process.argv[warum + 1]
  const treffer = [...gefunden.values()].filter(e => e.name === n)
  console.log(JSON.stringify({
    name: n,
    verdrahtet: treffer.length > 0,
    dateien: treffer.flatMap(e => [...e.dateien]),
    inTestsAlsGanzes: alsGanzes(n),
    aufBestandsliste: [...GEDULDET].filter(k => k.endsWith(`:${n}`)),
  }, null, 2))
  process.exit(0)
}

const bewacht = [...gefunden.values()].filter(e => alsGanzes(e.name))
console.log(`  ${gefunden.size} verdrahtete Namen (Tabellen, Sichten, RPC)`)
console.log(`  ${bewacht.length} davon in mindestens einem Test`)
console.log(`  ${GEDULDET.size} auf der Bestandsliste`)
console.log()

if (unbewacht.length === 0) {
  console.log('[verdrahtung] kein unbewachter Zuwachs.')
  process.exit(0)
}

console.log(`[verdrahtung] ${unbewacht.length} NEU verdrahtet und in keinem `
  + 'Test:')
for (const e of unbewacht.sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`  ${e.art.padEnd(8)} ${e.name.padEnd(32)} `
    + `${[...e.dateien].join(', ')}`)
}
console.log('\n  Ein Name, der die Anwendung mit ihren Daten verbindet und')
console.log('  in keiner Pruefung vorkommt, laesst sich aendern, ohne dass')
console.log('  etwas rot wird — sechsmal in fuenf Tagen passiert.')
console.log('  Nenn ihn in einem Test, oder trag ihn in GEDULDET ein und')
console.log('  begruende es.')
process.exit(1)
