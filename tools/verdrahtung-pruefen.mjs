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
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename, relative } from 'node:path'

const WURZEL = process.cwd()

// ══ A-103: jede App und jedes Paket, nicht nur apps/web ════════════
//
// `[cmd]` **Bis A-103 las diese Pruefung nur `apps/web/src`.** Gemessen
// 2026-10-06: `apps/coach` verdrahtet 21 Namen, `apps/admin` einen,
// `packages/*` keinen. Die Coach-Namen standen alle schon in Tests —
// aber die Pruefung sah weder die Namen noch die Tests, ein neuer
// Name dort waere gruen geblieben. **Ein Waechter, der seinen
// Gegenstand nicht findet, ist schlimmer als keiner.**
//
// `[read]` **Deshalb jede `src` unter `apps/*` und `packages/*`, nicht
// eine Liste von Hand** — eine neue App ist ab dem ersten Tag bewacht,
// statt zu warten, bis jemand sie hier eintraegt. Tests zaehlen ueber
// alle Bereiche: ein Name, den ein Coach-Test nennt, ist bewacht, auch
// wenn ihn apps/web verdrahtet.
const QUELLEN = ['apps', 'packages'].flatMap(oben =>
  readdirSync(join(WURZEL, oben))
    .map(e => join(WURZEL, oben, e, 'src'))
    .filter(p => existsSync(p) && statSync(p).isDirectory()))

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

const alle = QUELLEN.flatMap(q => dateien(q, ['.ts', '.tsx']))
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

// ── Die Bestandsliste — EINGEFROREN seit A-102, A-103 (2026-10-06) ─
//
// `[cmd]` **Bis A-102 war dieses Werkzeug rot, und niemand sah es** —
// es stand nicht im Gate. Gemessen 2026-10-05: 26 Namen verdrahtet und
// in keinem Test, 29 der 53 Listeneintraege veraltet (der Name stand
// inzwischen in einem Test). **Ein roter Waechter ausserhalb des Gates
// misst nichts.**
//
// `[read]` **Jetzt im Gate, mit einem Sollstand aus NAMEN, nicht aus
// einer Zahl.** Eine Zahl laesst einen Tausch durch: ein Name abgebaut,
// ein neuer dazu — gleiche Summe, gruen. **Die Liste haelt jeden Namen
// einzeln fest:**
//
//     neuer Name ohne Test          -> ROT  (Test schreiben)
//     Eintrag hier, Name im Test    -> ROT  (Eintrag streichen —
//     Eintrag hier, nicht verdrahtet          das Soll sinkt)
//
// `[read]` **Wer hier eine Zeile streicht, hat einen Test geschrieben
// oder einen toten Weg entfernt — wer eine hinzufuegt, tut das Falsche.**
const GEDULDET = new Set([
  // Der alte Bestand, Stand 2026-08-26 (nach A-103 noch 21).
  //
  // `[cmd]` **A-103 strich drei:** `autonomy_change_log`,
  // `client_permissions` und `permission_change_log` stehen in
  // `apps/coach/src/lib/__tests__/mockup-referenz.test.ts` — der Test
  // war schon da, nur lag er ausserhalb des Lesebereichs.
  'tabelle:biomarker_aliases',
  'tabelle:biomarker_catalog', 'tabelle:biomarker_reference_ranges',
  // `[cmd]` **G-618 strich `body_circumferences`:** die Quelle der
  // Umfangsziele steht in `apps/web/src/lib/goals/__tests__/g618-reiter.test.ts`.
  'tabelle:equipment', 'tabelle:food_groups', 'tabelle:foods_portions',
  'tabelle:goal_milestones', 'tabelle:nutrient_details',
  'tabelle:nutrient_reference_values', 'tabelle:nutrient_search_aliases',
  'tabelle:preparation_kinds',
  'tabelle:supplement_categories', 'tabelle:supplement_dosing',
  'tabelle:supplement_evidence', 'tabelle:water_logs',
  'rpc:food_categories_tree', 'rpc:micronutrient_below_threshold',
  'rpc:preference_search_preview', 'rpc:rule_assessment',
  'rpc:schema_debug',
  // Der Restbestand aus A-102, 2026-10-05: verdrahtet, lebendig (je
  // Funktion mit Aufrufer, je Name in der Datenbank), aber in keinem
  // Test. **Eingefroren, nicht nachgeschrieben** — Auftrag A-102.
  'tabelle:activity_stream', 'tabelle:appointments',
  'tabelle:health_events', 'tabelle:health_timeline',
  'tabelle:injection_tissue_condition_guidance',
  'rpc:nutrient_intake_detail_for_day',
  'rpc:nutrient_upper_limit_assessment_with_supplements',
  'tabelle:product_suppliers', 'rpc:publish_stack_template',
  'rpc:shopping_list_from_meal_plan_week', 'rpc:shopping_list_read',
  'rpc:supplement_brand_options', 'tabelle:supplement_nutrients',
  'tabelle:supplement_pharmacology', 'rpc:supplement_preferences_read',
  'tabelle:supplement_protocol_items',
  'tabelle:supplement_protocol_template_items',
  'tabelle:supplement_protocol_templates', 'tabelle:supplement_protocols',
  'rpc:supplier_product_allergy_matches',
  'tabelle:supplier_product_nutrient_serving_options',
  'rpc:supplier_product_search_meta', 'rpc:user_allergy_catalog_matches',
  'tabelle:user_supplement_cycles', 'rpc:withdraw_stack_template',
  // Der Restbestand aus A-103, 2026-10-06: erst sichtbar, seit die
  // Pruefung alle Apps liest. Lebendig — gerufen in
  // `apps/admin/src/lib/nutrition/curation.ts` (`getNutritionCurationData`),
  // das `app/curation/page.tsx` und `app/api/curation/route.ts` laden;
  // die Funktion steht im Schema (backup/g605-nachher.sql). `curation.test.ts`
  // prueft die Argumente, nennt den Namen aber nicht. **Eingefroren,
  // nicht nachgeschrieben** — Auftrag A-103.
  'rpc:curation_overview',
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

// ══ A-102: ein veralteter Eintrag ist ein Fehler ═══════════════════
//
// `[cmd]` **29 von 53 Eintraegen waren veraltet**, als A-102 maß — der
// Name stand laengst in einem Test, die Duldung galt fuer nichts mehr.
// **Eine Liste, die nur waechst, ist keine Bestandsliste, sondern ein
// Freibrief.** Ohne diese Pruefung koennte ein Name den Test verlieren
// und still wieder unter die Duldung fallen.
const veraltet = []
for (const k of GEDULDET) {
  const [art, name] = k.split(':')
  const e = gefunden.get(k)
  if (!e) veraltet.push({ k, grund: 'nicht mehr verdrahtet' })
  else if (alsGanzes(name)) veraltet.push({ k, grund: 'steht inzwischen in einem Test' })
  else if (e.art !== art) veraltet.push({ k, grund: 'falsche Art' })
}

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

console.log(`  Soll: ${GEDULDET.size} geduldete Namen (eingefroren, A-102/A-103)`)
console.log()

if (veraltet.length > 0) {
  console.log(`[verdrahtung] ${veraltet.length} Eintrag/Eintraege in GEDULDET veraltet:`)
  for (const v of veraltet) console.log(`  ${v.k.padEnd(48)} ${v.grund}`)
  console.log('\n  Gute Nachricht mit einer Pflicht: den Eintrag in')
  console.log('  tools/verdrahtung-pruefen.mjs streichen — das Soll sinkt.')
  console.log('  Sonst faellt der naechste Rueckschritt nicht auf.')
}

if (unbewacht.length === 0 && veraltet.length === 0) {
  console.log('[verdrahtung] gruen: kein unbewachter Zuwachs, kein veralteter Eintrag.')
  process.exit(0)
}
if (unbewacht.length === 0) process.exit(1)

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
