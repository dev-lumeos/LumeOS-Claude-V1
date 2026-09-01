// G-298 / G-299: Positionen bearbeiten, Laufzeit einordnen.
//
// `[read]` **Die Waechter messen die Wirkung, nicht das Wort.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  EINTRAG_TYPEN, MAHLZEIT_TYPEN, feldFuer, FELD_LABEL, FELD_EINHEIT,
  bauEintrag, verletztCheck, naechstePosition,
  laufzeitVon, laufzeitSatz, LAUFZEIT_MARKE, tageZwischen, deutsch,
  type EintragTyp,
} from '../plan-eintrag-lage'

// `[cmd]` **Der Pfad kommt aus der Lage DIESER Datei** — mit
// `process.cwd()` sind die Dateiproben aus der Wurzel gruen und
// fallen im Gate, das aus `apps/web/` laeuft (G-291).
const WURZEL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const EDITOR = 'apps/web/src/app/v2/nutrition/plan-eintrag-editor.tsx'
const PLANNER = 'apps/web/src/app/v2/nutrition/tab-planner-echt.tsx'
const SCHREIB = 'apps/web/src/lib/nutrition/plan-write.ts'
const ROUTE = 'apps/web/src/app/api/nutrition/plan/route.ts'
const KARTE = 'apps/web/src/app/v2/nutrition/plans-echt.tsx'

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [EDITOR, PLANNER, SCHREIB, ROUTE, KARTE]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ G-298: der CHECK ═════════════════════════════════════════════

test('G-298: das Mengenfeld folgt dem Typ, nicht dem Geschmack', () => {
  // `[cmd]` **`meal_plan_entries_target_check`, am 2026-08-31 aus
  // `pg_constraint` gelesen:** `recipe` verlangt `planned_servings`
  // und verbietet `amount_g`; `bls`/`custom` genau umgekehrt.
  assert.equal(feldFuer('recipe'), 'planned_servings')
  assert.equal(feldFuer('bls'), 'amount_g')
  assert.equal(feldFuer('custom'), 'amount_g')
  // Jeder Typ hat Beschriftung UND Einheit — sonst steht ein Feld
  // ohne Angabe da.
  for (const t of EINTRAG_TYPEN) {
    const f = feldFuer(t)
    assert.ok(FELD_LABEL[f], `${t}: keine Beschriftung`)
    assert.ok(FELD_EINHEIT[f], `${t}: keine Einheit`)
  }
})

test('G-298: bauEintrag setzt genau eine Quelle — die anderen auf null', () => {
  // `[read]` **Die nicht zutreffenden Kennungen werden auf `null`
  // GESETZT, nicht weggelassen.** Beim Typwechsel bliebe die alte
  // sonst stehen, und zwei Kennungen verletzen den CHECK.
  const r = bauEintrag({ typ: 'recipe', quelleId: 'r1', mahlzeit: 'lunch', menge: 2 })
  assert.equal(r.recipe_id, 'r1')
  assert.equal(r.food_id, null)
  assert.equal(r.custom_food_id, null)
  assert.equal(r.planned_servings, 2)
  assert.equal(r.amount_g, null)

  const b = bauEintrag({ typ: 'bls', quelleId: 'f1', mahlzeit: 'snack', menge: 150 })
  assert.equal(b.food_id, 'f1')
  assert.equal(b.recipe_id, null)
  assert.equal(b.amount_g, 150)
  assert.equal(b.planned_servings, null)

  // Und die Felder sind wirklich vorhanden, nicht `undefined` —
  // `undefined` wuerde beim Update nicht geschrieben.
  for (const feld of ['recipe_id', 'food_id', 'custom_food_id',
                      'planned_servings', 'amount_g'] as const) {
    assert.ok(feld in r, `${feld} fehlt im Bausatz`)
    assert.notEqual(r[feld], undefined, `${feld} ist undefined statt null`)
  }
})

test('G-298: verletztCheck fangt jede der drei CHECK-Zeilen', () => {
  // Gueltig ist gueltig.
  assert.equal(verletztCheck(bauEintrag(
    { typ: 'recipe', quelleId: 'r', mahlzeit: 'lunch', menge: 1 })), null)
  assert.equal(verletztCheck(bauEintrag(
    { typ: 'bls', quelleId: 'f', mahlzeit: 'lunch', menge: 1 })), null)

  // Die Mischung, die die Datenbank am 2026-08-31 abgewiesen hat.
  assert.ok(verletztCheck({
    entry_type: 'recipe', meal_type: 'lunch',
    recipe_id: 'r', food_id: null, custom_food_id: null,
    planned_servings: 1, amount_g: 200, note: null,
  }), 'Rezept MIT amount_g kam durch')

  // Zwei Kennungen.
  assert.ok(verletztCheck({
    entry_type: 'bls', meal_type: 'lunch',
    recipe_id: 'r', food_id: 'f', custom_food_id: null,
    planned_servings: null, amount_g: 100, note: null,
  }), 'zwei Quellen kamen durch')

  // Keine Kennung.
  assert.ok(verletztCheck({
    entry_type: 'bls', meal_type: 'lunch',
    recipe_id: null, food_id: null, custom_food_id: null,
    planned_servings: null, amount_g: 100, note: null,
  }), 'gar keine Quelle kam durch')

  // Rezept ohne Portionen.
  assert.ok(verletztCheck({
    entry_type: 'recipe', meal_type: 'lunch',
    recipe_id: 'r', food_id: null, custom_food_id: null,
    planned_servings: null, amount_g: null, note: null,
  }), 'Rezept ohne Portionen kam durch')
})

test('G-298: die naechste Position ist Maximum+1, nicht Laenge+1', () => {
  // `[read]` **Nach dem Loeschen der Mitte gaebe `laenge + 1` eine
  // Position doppelt.** `[cmd]` Der CHECK verlangt `>= 0`.
  assert.equal(naechstePosition([]), 0)
  assert.equal(naechstePosition([0]), 1)
  assert.equal(naechstePosition([0, 2]), 3, 'Luecke: Laenge waere 2 gewesen')
  assert.equal(naechstePosition([5]), 6)
})

test('G-298: alle sieben Mahlzeittypen des CHECKs sind waehlbar', () => {
  // `[cmd]` **`meal_plan_entries_meal_type_check` kennt sieben.**
  // `[cmd]` In den Daten kommen vier vor — **gezeigt werden sieben**,
  // sonst liesse sich ein Pre-Workout-Slot nie anlegen.
  assert.equal(MAHLZEIT_TYPEN.length, 7)
  for (const m of ['breakfast', 'lunch', 'dinner', 'snack',
                   'pre_workout', 'post_workout', 'other']) {
    assert.ok((MAHLZEIT_TYPEN as readonly string[]).includes(m), `${m} fehlt`)
  }
})

// ══ G-298: die Laufzeit ══════════════════════════════════════════

test('G-298: ein Plan, dessen Tage vorbei sind, heisst abgelaufen', () => {
  // `[cmd]` **Gemessen am 2026-08-31:** der Plan laeuft 18.6.–15.7.,
  // **47 Tage vor heute**, und trug trotzdem nur „aktiv".
  const tage = ['2026-06-18', '2026-07-15', '2026-06-20']
  const l = laufzeitVon(tage, '2026-08-31')
  assert.equal(l.art, 'abgelaufen')
  assert.equal(l.art === 'abgelaufen' && l.bis, '2026-07-15')
  assert.equal(l.art === 'abgelaufen' && l.von, '2026-06-18')
  assert.equal(l.art === 'abgelaufen' && l.tage, 47)
  assert.match(laufzeitSatz(l), /15\.7\.2026/)
  assert.match(laufzeitSatz(l), /47 Tagen/)
  assert.equal(LAUFZEIT_MARKE.abgelaufen, 'abgelaufen')
})

test('G-298: laufend, kuenftig und ohne Tage sind eigene Zustaende', () => {
  // `[read]` **Drei Zustaende, nicht zwei.** Ein Plan ohne Tage ist
  // nicht abgelaufen — er hat nie begonnen.
  assert.equal(laufzeitVon(['2026-08-25', '2026-09-05'], '2026-08-31').art, 'laeuft')
  assert.equal(laufzeitVon(['2026-09-01'], '2026-08-31').art, 'kuenftig')
  assert.equal(laufzeitVon([], '2026-08-31').art, 'unbekannt')
  // Der laufende Plan bekommt KEINE Marke — sonst steht an jedem Plan
  // eine, und die Auffaelligkeit geht verloren.
  assert.equal(LAUFZEIT_MARKE.laeuft, null)
  assert.ok(LAUFZEIT_MARKE.kuenftig)
  assert.ok(LAUFZEIT_MARKE.unbekannt)
})

test('G-298: der Rand zaehlt — heute ist der letzte Tag, nicht darueber', () => {
  // `[read]` **`bis < heute`, nicht `<=`.** Am letzten Plantag laeuft
  // der Plan noch.
  assert.equal(laufzeitVon(['2026-08-31'], '2026-08-31').art, 'laeuft')
  assert.equal(laufzeitVon(['2026-08-30'], '2026-08-31').art, 'abgelaufen')
})

test('G-298: tageZwischen rechnet ganze Tage, auch ueber Monatsgrenzen', () => {
  assert.equal(tageZwischen('2026-07-15', '2026-08-31'), 47)
  assert.equal(tageZwischen('2026-08-31', '2026-08-31'), 0)
  assert.equal(tageZwischen('2026-02-28', '2026-03-01'), 1)
  assert.equal(deutsch('2026-07-15'), '15.7.2026')
})

// ══ Die Verdrahtung ══════════════════════════════════════════════

test('G-298: die drei Vorgaenge sind in der Route erreichbar', () => {
  // `[cmd]` **A-59/G-192: ein Schreibweg ohne Aufrufer ist tot.**
  const r = ohneKommentare(ROUTE)
  for (const art of ['eintrag', 'eintrag_aendern', 'eintrag_loeschen']) {
    assert.match(r, new RegExp(`art === '${art}'`), `${art} fehlt in der Route`)
  }
  // Und die Fehlermeldung nennt sie, sonst sucht man sie im Quelltext.
  assert.match(r, /eintrag, eintrag_aendern, eintrag_loeschen/)
})

test('G-298: der Schreibweg prueft die Sperren — bei allen dreien', () => {
  // `[read]` **Ohne diese Pruefung liesse sich ein gesperrter
  // Coach-Plan ueber seine Positionen umbauen** — G-269 waere dann
  // eine Bitte. `[read]` **Gezaehlt, nicht gesucht:** ein Vorgang
  // ohne Pruefung faellt bei `assert.match` nicht auf.
  //
  // `[cmd]` **BERICHTIGT ZWEIMAL.** Zuerst in G-306 von
  // `pruefeFreigabe` auf `pruefePositionsRecht` — `ADR #17` verlangte,
  // dass ein AKTIVER Plan seine Positionen einfriert.
  //
  // `[cmd]` **Dann durch E-42, 2026-09-01: `ADR #17` ist abgeloest.**
  // **Tom:** *,,wenn wir den einschraenken dass er nicht editieren
  // kann dann bescheisst er sich ja selber."* **Der Planstatus sperrt
  // nichts mehr — nur ein Protokoll an DIESER Position tut es.**
  //
  // `[read]` **Was hier weiter gilt, ist G-269: die HERKUNFT.** Ein
  // Coach-Plan bleibt gesperrt, egal ob geloggt oder nicht — deshalb
  // steht die Herkunftspruefung an allen drei Vorgaengen, die
  // Protokollpruefung nur an zweien (eine Position, die es noch nicht
  // gibt, kann nicht geloggt sein).
  const s = ohneKommentare(SCHREIB)
  const rufe = (s.match(/await pruefeHerkunft\(/g) ?? []).length
  assert.equal(rufe, 4,
    `${rufe} von 4 Herkunftspruefungen (3 Positionen + Ablauf)`)
  const protokoll = (s.match(/await pruefeProtokoll\(/g) ?? []).length
  assert.equal(protokoll, 2,
    `${protokoll} von 2 Vorgaengen pruefen das Protokoll (aendern, loeschen)`)
  // `[cmd]` **A-59: die Plansperre aus C-372 ist entfernt.**
  assert.doesNotMatch(s, /(?<![a-zA-Z0-9_])pruefePositionsRecht(?![a-zA-Z0-9_])/,
    'die Sperre ueber den Planstatus lebt weiter — E-42 hebt sie auf')
  assert.match(s, /darfAendern\(herkunft\)/,
    'die Sperre fragt nicht die Herkunft')
  // Und die alte, schwaechere Pruefung ist wirklich weg.
  assert.doesNotMatch(s, /(?<![a-zA-Z0-9_])pruefeFreigabe(?![a-zA-Z0-9_])/,
    'die Pruefung ohne Statussperre lebt weiter')
})

test('G-298: der Schreibweg prueft den CHECK vor dem Senden', () => {
  // `[read]` **Zweimal, nicht einmal:** Anlegen und Aendern koennen
  // beide eine Mischung erzeugen.
  const s = ohneKommentare(SCHREIB)
  const proben = (s.match(/verletztCheck\(felder\)/g) ?? []).length
  assert.equal(proben, 2, `${proben} von 2 Vorgaengen pruefen den CHECK`)
})

test('G-298: die drei Knoepfe haengen im Raster, nicht in einer neuen Ansicht', () => {
  // **Der Auftrag: *,,Keine dritte Ansicht."***
  const p = ohneKommentare(PLANNER)
  assert.match(p, /<EintragForm/, 'das Formular wird nicht gerendert')
  assert.match(p, /<EintragLoeschen/, 'der Entfernen-Knopf fehlt')
  assert.match(p, /aria-label=\{`Eintrag hinzufügen/,
    'der Hinzufuegen-Knopf fehlt')
  // ZWEI Formularstellen: eine fuer neu, eine fuer vorhanden.
  const formulare = (p.match(/<EintragForm/g) ?? []).length
  assert.equal(formulare, 2,
    `${formulare} Formularstellen — erwartet 2 (neu und vorhanden)`)

  // `[read]` **Die BEDINGUNG wird geprueft, nicht nur das Vorkommen.**
  // Die Sabotageprobe hat `{offen === e.id && (` durch `{false && (`
  // ersetzt — beide `<EintragForm` blieben stehen, und ein Zaehler
  // sah nichts. **Also: beide Formulare haengen an `offen`.**
  assert.match(p, /\{offen === e\.id && \(\s*<EintragForm/,
    'das Formular fuer vorhandene Eintraege haengt nicht am Zustand')
  assert.match(p, /\{bearbeitbar && offen === 'neu' && \(\s*<EintragForm/,
    'das Formular fuer neue Eintraege haengt nicht am Zustand')
  // Und keine der beiden Stellen ist abgeklemmt.
  assert.doesNotMatch(p, /\{false && \(\s*<EintragForm/,
    'ein Formular ist fest abgeschaltet')
  // Und es gibt keine eigene Route dafuer.
  assert.ok(!fs.existsSync(path.join(WURZEL,
    'apps/web/src/app/v2/nutrition/eintrag')),
    'eine dritte Ansicht ist entstanden')
})

test('G-298: der Editor haelt sich an den CHECK, statt beide Felder zu zeigen', () => {
  // `[read]` **Ein Formular mit beiden Mengenfeldern wird von der
  // Datenbank abgelehnt** — und der Fehler erschiene erst beim
  // Speichern.
  const e = ohneKommentare(EDITOR)
  assert.match(e, /feldFuer\(typ\)/, 'das Feld haengt nicht am Typ')

  // `[read]` **Der BLOCK wird geprueft, nicht das Vorkommen.** Die
  // Sabotageprobe hat ein `return null;` VOR den Aufruf gesetzt — der
  // Text blieb stehen, die Wirkung war weg. **G-216 zum wiederholten
  // Mal.** Also: zwischen `entwurfFehler` und dem Aufruf darf kein
  // `return` stehen, das ihn ueberspringt.
  const a = e.indexOf('const entwurfFehler')
  assert.notEqual(a, -1, 'entwurfFehler fehlt')
  const b = e.indexOf('verletztCheck(bauEintrag(', a)
  assert.notEqual(b, -1, 'der Editor prueft den Bausatz nicht vor dem Senden')
  const dazwischen = e.slice(a, b)
  assert.doesNotMatch(dazwischen, /return null\s*;/,
    'ein return ueberspringt die Pruefung, bevor sie laeuft')
  // Und der Aufruf ist das ERGEBNIS, kein toter Ausdruck.
  assert.match(e.slice(b - 12, b), /return\s+$/,
    'das Ergebnis von verletztCheck wird nicht zurueckgegeben')

  // Genau EIN Mengenfeld im Formular.
  const zahlfelder = (e.match(/type="number"/g) ?? []).length
  assert.equal(zahlfelder, 1, `${zahlfelder} Mengenfelder — erwartet 1`)
})

test('G-298: die Karte sagt, dass der Plan abgelaufen ist', () => {
  // **Tom sah *,,aktiv"* an einem Plan, der 47 Tage vorbei war.**
  const k = ohneKommentare(KARTE)
  assert.match(k, /laufzeitVon\(/, 'die Karte rechnet die Laufzeit nicht')
  assert.match(k, /\{laufzeitSatz\(laufzeit\)\}/, 'der Satz fehlt an der Karte')
  assert.match(k, /marke && <Pill>\{marke\}<\/Pill>/, 'die Marke fehlt')
  // `[read]` **Und der Zustand bleibt stehen** — er wird eingeordnet,
  // nicht ersetzt.
  assert.match(k, /aktiv<\/Pill>/, 'der Zustand wurde ersetzt statt eingeordnet')
})

test('G-299: der Planner sagt, wenn er nicht die laufende Woche zeigt', () => {
  // `[cmd]` **Er oeffnete auf dem 18.6., heute ist der 31.8.** —
  // nicht wegen der Navigation, sondern weil keine der drei Wochen
  // heute enthaelt. `[read]` **Der Rueckfall war stumm.**
  const p = ohneKommentare(PLANNER)
  assert.match(p, /heuteWoche/, 'die laufende Woche wird nicht gesucht')
  assert.match(p, /keine Planwoche für heute/,
    'der stumme Rueckfall ist wieder stumm')
  assert.match(p, /Zur laufenden Woche/, 'der Sprungknopf fehlt')
})
