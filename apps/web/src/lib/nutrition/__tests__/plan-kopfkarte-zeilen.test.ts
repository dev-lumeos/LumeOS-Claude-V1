// G-317 / G-316 / G-302: die Kopfkarte, die Farben, die Kurve.
//
// `[cmd]` **Vorlage: `theme-v1/module-nutrition-spec.jsx`,
// `MealPlansView` Zeile 334-521.**
//
// ══ WARUM ES DIESE DATEI GIBT ═══════════════════════════════════════
//
// `[cmd]` **In G-315 habe ich drei Zeilen als umgesetzt gemeldet, die
// am Schirm nicht ankamen** — Ring, Statuspille, kcal. **Die Wächter
// waren grün.**
//
// `[read]` **Sie prüften den Quelltext der Anzeige** — und übersahen,
// dass die FARBTABELLE zwei Zustände auf dasselbe Grau legte und der
// LESEWEG `kcal: null` lieferte. **Das Wort stand da, der Wert nicht.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { STATUS_FARBE, STATUS_TEXT, type LogStatus } from '../plan-bestaetigung'
// G-317: die Zeile aus Z. 371 wird AUFGERUFEN, nicht gesucht.
import { kopfzeile } from '../../../app/v2/nutrition/plans-echt'

const WURZEL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const VORLAGE = 'docs/spezifikation/10-plattform/design-system/'
  + 'theme-v1/module-nutrition-spec.jsx'
const ECHT = 'apps/web/src/app/v2/nutrition/plans-echt.tsx'
const EINTR = 'apps/web/src/app/v2/nutrition/plan-eintraege.tsx'
const LESEN = 'apps/web/src/lib/nutrition/plan-lesen.ts'
const UI = 'packages/ui/src/primitives.tsx'

// ══ Z. 341-346: JEDER ZUSTAND HAT SEINE FARBE ═══════════════════════

test('G-317/Z. 341-346: vier Zustaende, vier verschiedene Farben', () => {
  // `[cmd]` **Am 2026-09-02 am Schirm gemessen:** `ausgelassen` und
  // `offen` trugen dieselbe Farbe — **zwei von drei sichtbaren
  // Zuständen waren nicht zu unterscheiden.**
  //
  // `[read]` **Die Pille ist die einzige Stelle, an der sich die
  // Zustände unterscheiden** — und sie trägt die Compliance-Rechnung
  // darüber.
  //
  // `[read]` **Gezählt, nicht gesucht:** dass jede Farbe gesetzt ist,
  // sagt nichts. **Sie müssen VERSCHIEDEN sein.**
  const farben = Object.values(STATUS_FARBE)
  assert.equal(new Set(farben).size, 4,
    `nur ${new Set(farben).size} verschiedene Farben fuer 4 Zustaende — `
    + `${JSON.stringify(STATUS_FARBE)}`)

  // Und zwar die der Vorlage.
  assert.equal(STATUS_FARBE.confirmed, 'var(--pos)', 'Z. 342')
  assert.equal(STATUS_FARBE.deviated, 'var(--warn)', 'Z. 343')
  assert.equal(STATUS_FARBE.skipped, 'var(--neg)', 'Z. 344')
  assert.equal(STATUS_FARBE.pending, 'var(--fg-dim)', 'Z. 345')

  // `[read]` **Die Vorlage trägt sie wörtlich** — wer sie ändert, muss
  // dort nachsehen.
  const v = lies(VORLAGE)
  for (const [status, farbe] of [
    ['confirmed', 'var(--pos)'], ['deviated', 'var(--warn)'],
    ['skipped', 'var(--neg)'], ['pending', 'var(--fg-dim)'],
  ] as const) {
    assert.ok(v.includes(`${status}:`) && v.includes(farbe),
      `die Vorlage nennt ${status} / ${farbe} nicht mehr`)
  }

  // Jeder Zustand hat auch einen Text.
  for (const s of ['pending', 'confirmed', 'deviated', 'skipped'] as LogStatus[]) {
    assert.ok(STATUS_TEXT[s]?.length > 3, `${s} ohne Text`)
  }
})

// ══ Z. 394: DIE KCAL STEHEN DA ══════════════════════════════════════

test('G-317/Z. 394: der Leseweg fuellt die kcal', () => {
  // `[cmd]` **Am 2026-09-02 gemessen: 0 kcal-Spannen am Schirm.**
  //
  // `[cmd]` **Ursache: `kcal: null` im Leseweg**, mit der Begründung
  // *„die kcal stehen erst nach dem Bestätigen fest"*.
  //
  // `[read]` **Das verwechselt zwei Zahlen.** Was nach dem Bestätigen
  // feststeht, ist die GEGESSENE Menge. **Die Vorlage zeigt die
  // GEPLANTE**, und die steht im Eintrag.
  const l = ohneKommentare(LESEN)
  const von = l.indexOf('export async function ladeTagesEintraege')
  assert.notEqual(von, -1, 'ladeTagesEintraege fehlt')
  const bis = l.indexOf('\nexport ', von + 10)
  const block = l.slice(von, bis === -1 ? undefined : bis)

  // `[read]` **Die Wirkung, nicht das Wort:** `kcal: null` darf nicht
  // mehr dastehen, und die Rechnung muss laufen.
  assert.ok(!/kcal: null,/.test(block),
    'die kcal sind wieder fest auf null — die Zeile bleibt leer')
  assert.match(block, /kcal: kcalJeEintrag\.get\(id\) \?\? null/,
    'die kcal kommen nicht aus der Rechnung')
  // `[cmd]` **Derselbe Rechenweg wie im Planner** — kein zweiter.
  assert.match(block, /kcalAusLebensmittel\(db, text\(r\.food_id\), zahl\(r\.amount_g\)\)/,
    'die BLS-kcal werden nicht ueber den vorhandenen Weg gerechnet')
  assert.match(block, /db\.rpc\('recipe_nutrition'/,
    'die Rezept-kcal werden nicht gerechnet')
  // `[read]` **Gleichzeitig, nicht je Zeile** (G-252).
  assert.match(block, /await Promise\.all\(rohE\.map\(async r =>/,
    'die kcal werden nacheinander geholt')
})

// ══ Z. 362-377: DIE KOPFKARTE HAT VIER ZEILEN ═══════════════════════

test('G-317/Z. 362-377: die Kopfkarte wiederholt nicht, was rechts steht', () => {
  // **Tom, 2026-09-02:** *„Aufbau-Wochenplan zeigt genau die gleichen
  // daten wie nebendran Plan settings."*
  //
  // `[cmd]` **Die Vorlage hat vier Zeilen neben dem Ring:** Name,
  // Pillen, EINE muted-Zeile (Z. 371), die Rechnung (Z. 373).
  const e = ohneKommentare(ECHT)
  const von = e.indexOf('export function PlanKopfEcht')
  assert.notEqual(von, -1, 'die Kopfkarte fehlt')
  const bis = e.indexOf('\nexport ', von + 10)
  const block = e.slice(von, bis === -1 ? undefined : bis)

  // Die vier Bestandteile.
  assert.match(block, /<Ring value=\{quote\}/, 'der Ring fehlt')
  assert.match(block, /\{p\.name\}/, 'der Name fehlt')
  assert.match(block, /kopfzeile\(d, p, laufzeit/, 'die Zeile aus Z. 371 fehlt')
  // `[read]` **Ohne `s`-Flag** — es braucht ES2018, das Ziel steht
  // darunter. `[\s\S]` tut dasselbe.
  assert.match(block, /e\.bestaetigt[\s\S]*e\.abgewichen/, 'die Rechnung fehlt')

  // `[cmd]` **Und NICHTS, was rechts in `Plan settings` steht.**
  // `[read]` **Eine Zahl an zwei Stellen ist keine Bestätigung,
  // sondern eine Frage.**
  for (const doppelt of ['label="Wochen"', 'label="Tage"',
    'label="Einträge"', 'label="Zeilen je Tag"', 'label="Zustand"']) {
    assert.ok(!block.includes(doppelt),
      `„${doppelt}" steht wieder links — es steht schon rechts`)
  }
  // `[cmd]` **Die Vorlage zeigt im aktiven Bereich KEINE Zielwerte**
  // — über Z. 334-521 gemessen: `target_kcal` kommt dort nicht vor.
  // `[read]` **Damit löst sich G-302 mit auf:** die Zeile, die bei
  // 1440 px umbrach, stand an der falschen Stelle.
  for (const ziel of ['label="kcal Ziel"', 'label="Kohlenhydrate"',
    'label="Protein"', 'label="Fett"']) {
    assert.ok(!block.includes(ziel),
      `die Zielzeile „${ziel}" ist zurueck — sie bricht bei 1440 px um (G-302)`)
  }
  // Und der Fliesstext, der zum dritten Mal dieselben Zahlen nannte.
  assert.ok(!block.includes('aus nutrition.meal_plans ·'),
    'der Fliesstext ist zurueck — dritte Wiederholung')
})

test('G-317/Z. 371: die eine Zeile fasst Dauer, Start und Herkunft', () => {
  // `[cmd]` **Die Vorlage:** *„Day 3 of 7 · started May 14 · source:
  // coach (Jana Bauer)"* — **durch `·` getrennt.**
  const e = ohneKommentare(ECHT)
  const von = e.indexOf('export function kopfzeile')
  assert.notEqual(von, -1, 'die Zeile aus Z. 371 fehlt')
  const bis = e.indexOf('\nexport ', von + 10)
  const block = e.slice(von, bis === -1 ? undefined : bis)

  // ══ DIE WIRKUNG, NICHT DAS WORT ═══════════════════════════════════
  //
  // `[cmd]` **In der Sabotageprobe kam S9 durch:** ein `return` vor
  // der Logik ließ `teile.join(' · ')` im Text stehen. **Der Wächter
  // suchte das Wort** — genau der Fehler aus G-216.
  //
  // `[read]` **Also wird die Funktion AUFGERUFEN.**
  const daten = (tage: string[], start: string | null, origin: string | null) => ({
    d: { wochen: [{ tage: tage.map(t => ({ plan_date: t })) }] } as never,
    p: { start_date: start, plan_origin: origin } as never,
  })
  const heute = new Date()
  const iso = (v: Date) => v.toISOString().slice(0, 10)
  const heuteIso = iso(heute)
  const morgen = new Date(heute); morgen.setDate(morgen.getDate() + 1)

  // Alle drei Teile da → alle drei in der Zeile, durch · getrennt.
  const voll = daten([heuteIso, iso(morgen)], '2026-09-01', 'coach_created')
  const z1 = kopfzeile(voll.d, voll.p, { art: 'laeuft' } as never, 'coach_created')
  assert.match(z1, /Tag 1 von 2/, 'die Dauer fehlt')
  assert.match(z1, /Start 1\.9\.2026/, 'der Start fehlt')
  assert.match(z1, /vom Coach/, 'die Herkunft fehlt')
  assert.equal(z1.split(' · ').length, 3,
    `die Teile werden nicht mit · verbunden: „${z1}"`)

  // `[read]` **Ohne Herkunft fällt der Teil weg** — kein `· — ·`.
  //
  // `[cmd]` **Das Startdatum fällt NICHT weg**, wenn es Tageszeilen
  // gibt: `start_date` ist beim Bestandsplan `NULL`, und die Laufzeit
  // steht nur in den Tagen (G-298). **Der erste Plantag ist dann der
  // Start** — gemessen, nicht behauptet.
  const ohne = daten([heuteIso], null, null)
  const z2 = kopfzeile(ohne.d, ohne.p, { art: 'laeuft' } as never, 'unbekannt')
  assert.ok(!z2.includes('—'), `eine Leerstelle wird behauptet: „${z2}"`)
  assert.ok(!z2.includes('vom Coach') && !z2.includes('Herkunft'),
    `eine unbekannte Herkunft wird gezeigt: „${z2}"`)
  assert.equal(z2.split(' · ').length, 2,
    `ohne Herkunft bleiben zwei Teile, nicht ${z2.split(' · ').length}: „${z2}"`)

  // `[read]` **Und ohne JEDEN Tag bleibt die Zeile leer**, statt
  // einen Plan zu beschreiben, der nichts enthält.
  const leer = kopfzeile(
    { wochen: [] } as never, { start_date: null } as never,
    { art: 'unbekannt' } as never, 'unbekannt')
  assert.equal(leer, '', `eine leere Zeile behauptet etwas: „${leer}"`)

  // Und der Quelltext trägt die Bestandteile.
  assert.match(block, /Tag \$\{index \+ 1\} von \$\{tage\}/, 'die Dauer fehlt')
  assert.match(block, /Start \$\{deutschesDatum\(start\)\}/, 'der Start fehlt')
  assert.match(block, /HERKUNFT_TEXT\[h\]/, 'die Herkunft fehlt')

  // `[read]` **Jeder Teil fällt weg, wenn er nicht belegbar ist** —
  // ein `· — ·` behauptet eine Leerstelle, wo es keine gibt.
  assert.match(block, /if \(h !== 'unbekannt'\)/,
    'eine unbekannte Herkunft wird trotzdem angezeigt (G-287)')
  assert.match(block, /if \(start\)/, 'ein fehlendes Startdatum wird behauptet')
})

// ══ Z. 436: DIE KURVE ZEIGT NUR, WAS GEMESSEN IST ═══════════════════

test('G-317/Z. 436: die Sparkline erfindet keine Punkte', () => {
  // `[cmd]` **Hier stand `reihe.map(x => x.quote ?? 0)`** — ein Tag
  // ohne Entscheidung wurde als 0 % gezeichnet.
  //
  // `[read]` **Dieselbe Erfindung, die `quoteVon` vermeidet:** `null`
  // heißt *„noch keine Aussage"*, nicht *„null Prozent"* (C-323).
  const e = ohneKommentare(ECHT)
  const von = e.indexOf('export function EinhaltungEcht')
  assert.notEqual(von, -1)
  const bis = e.indexOf('\nexport ', von + 10)
  const block = e.slice(von, bis === -1 ? undefined : bis)

  assert.ok(!/x\.quote \?\? 0/.test(block),
    'ein Tag ohne Entscheidung wird als 0 % gezeichnet')
  assert.match(block, /\.filter\(\(v\): v is number => v !== null\)/,
    'die Kurve filtert die leeren Tage nicht heraus')
  assert.match(block, /data=\{gemessen\}/, 'die Kurve nimmt nicht die gemessenen Werte')

  // `[cmd]` **Feste Skala 0-100** — ohne Vorgabe normalisiert die
  // Sparkline auf min/max, und 75/80/100 sähe aus wie ein Absturz.
  assert.match(block, /min=\{0\} max=\{100\}/,
    'die Skala ist nicht auf 0-100 festgelegt')

  // `[read]` **Und sie sagt, über wie viele Tage sie geht** — sonst
  // liest man sieben, wo sechs stehen.
  assert.match(block, /\{gemessen\.length\} von \{reihe\.length\} Tagen protokolliert/,
    'die Kurve nennt ihre Grundlage nicht')

  // Die Sparkline nimmt die Skala auch an.
  const u = ohneKommentare(UI)
  assert.match(u, /const min = minVorgabe \?\? Math\.min\(\.\.\.data\)/,
    'die Sparkline ignoriert eine vorgegebene Skala')
})

// ══ G-316: LOG DEVIATION ════════════════════════════════════════════

test('G-316/Z. 402: `Log deviation` hat Mengenfelder', () => {
  // `[cmd]` **Der Schreibweg konnte es seit G-309** (`bestaetigen`
  // nimmt `mengen`). `[cmd]` **Es fehlte der Leseweg** — ohne Posten
  // keine Felder.
  //
  // `[cmd]` **Am 2026-09-02 belegt: 200 g auf 600 g, `deviated` mit
  // `deviation_kcal` 1372 und `deviation_pct` 200,0.**
  const l = ohneKommentare(LESEN)
  const von = l.indexOf('export async function ladeTagesEintraege')
  const bis = l.indexOf('\nexport ', von + 10)
  const block = l.slice(von, bis === -1 ? undefined : bis)

  assert.match(block, /posten: postenVon\(roh\)/, 'die Posten fehlen im Ergebnis')
  assert.match(block, /const postenVon = \(r: Record<string, unknown>\)/,
    'die Posten werden nicht aufgeloest')
  // `[read]` **Ein Rezept wird aufgelöst, ein Lebensmittel ist sein
  // eigener Posten.**
  assert.match(block, /zutatenJeRezept\.get\(rezeptId\)/,
    'ein Rezept wird nicht in Zutaten aufgeloest')
  // `[read]` **`planned_servings / servings` skaliert** — dieselbe
  // Rechnung wie beim Bestätigen (G-309).
  assert.match(block, /proRezept > 0 \? portionen \/ proRezept : 1/,
    'die Mengen skalieren nicht mit der Portionszahl')
  // `[cmd]` **EINE Abfrage für alle Rezepte** (G-252).
  assert.match(block, /\.in\('recipe_id', rezeptIds\)/,
    'die Zutaten werden je Eintrag geholt')

  // Und die Anzeige.
  const e = ohneKommentare(EINTR)
  assert.match(e, />\s*Log deviation\s*<\/button>/, 'der Knopf fehlt')
  assert.match(e, /aria-label=\{`Menge \$\{p\.name\}`\}/, 'die Mengenfelder fehlen')
  // `[read]` **Nur wenn es Posten gibt** — ein Knopf, der ein leeres
  // Formular öffnet, wäre eine Sackgasse (G-311).
  assert.match(e, /\{e\.posten && e\.posten\.length > 0 && \(/,
    'der Knopf steht auch ohne Posten da')
  // `[read]` **Leer heißt „stimmt so"** — Flow 4, Case 2, Schritt 4a.
  assert.match(e, /mengen: anders \? aus : undefined/,
    'unveraenderte Mengen werden trotzdem gesendet')
})
