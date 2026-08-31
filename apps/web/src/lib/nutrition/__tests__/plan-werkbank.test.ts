// C-372 / G-306 / C-375: die Werkbank und die zwei Sperren.
//
// **Grundlage: E-40, E-41, ADR_IMPROVEMENTS_PACKAGE #17,
// SPEC_01 Abschnitt 8/9, SPEC_03 Flow 3.**
//
// `[read]` **Die Waechter messen die Wirkung, nicht das Wort.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  PLAN_STATUS, positionenGesperrt, AKTIV_GESPERRT_SATZ, AKTIV_AUSWEG_SATZ,
  darfBearbeiten, FREMD_GESPERRT_SATZ,
  sperreVon, SPERRE_MARKE, kopieHilft,
  wochenAnker, wochenDaten, tageDerWoche, verschiebung, tageVerschieben,
  WOCHEN_MIN, WOCHEN_MAX, NICHT_GEBAUT,
} from '../plan-werkbank'

// `[cmd]` **Pfad aus der Lage DIESER Datei** — mit `process.cwd()`
// gruen aus der Wurzel und rot im Gate (G-291).
const WURZEL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const SCHREIB = 'apps/web/src/lib/nutrition/plan-write.ts'
const UI = 'apps/web/src/app/v2/nutrition/plan-werkbank-ui.tsx'
const ROUTE = 'apps/web/src/app/api/nutrition/plan/route.ts'
const MODELL = 'apps/web/src/lib/nutrition/diary-model.ts'
const ANSICHT = 'apps/web/src/app/v2/nutrition/ansicht.tsx'

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [SCHREIB, UI, ROUTE, MODELL, ANSICHT]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ G-306 / ADR #17: die Aktivsperre ═════════════════════════════

test('G-306: nur ein AKTIVER Plan sperrt seine Positionen', () => {
  // `[cmd]` **ADR #17: `MealPlan.status = 'active'` -> READ-ONLY.**
  // `[read]` **Nur `active`** — der ADR nennt keinen anderen Status,
  // und ein Entwurf muss bearbeitbar sein, sonst gibt es keine
  // Werkbank.
  assert.equal(positionenGesperrt('active'), true)
  assert.equal(positionenGesperrt('assigned'), false)
  assert.equal(positionenGesperrt('paused'), false)
  // `[read]` **`completed`/`archived` sperren NICHT** — offene Frage,
  // im Bericht benannt, hier nicht heimlich entschieden.
  assert.equal(positionenGesperrt('completed'), false)
  assert.equal(positionenGesperrt('archived'), false)
  // Und alle fuenf CHECK-Werte sind bekannt.
  assert.equal(PLAN_STATUS.length, 5)
})

test('G-306: der Sperrsatz nennt den Grund UND den Ausweg', () => {
  // **Der Auftrag: *,,gesperrt zu sein, ohne einen Weg zu haben, ist
  // schlimmer als gar keine Sperre."***
  //
  // `[cmd]` **Der ADR nennt den Ausweg woertlich:** *,,pausieren, eine
  // Kopie erstellen, bearbeiten und neu aktivieren."*
  assert.match(AKTIV_GESPERRT_SATZ, /Protokoll/,
    'der Grund aus dem ADR fehlt')
  assert.match(AKTIV_AUSWEG_SATZ, /Kopie bearbeiten/,
    'der Ausweg nennt den Knopf nicht')
  assert.match(AKTIV_AUSWEG_SATZ, /unberührt|unberuehrt/,
    'dass das Original bleibt, steht nicht da')
})

// ══ C-375: die zweite Sperre ═════════════════════════════════════

test('C-375: fehlt das Flag, ist die Antwort true — gemessen, nicht geraten', () => {
  // `[cmd]` **Am 2026-08-31 gemessen: es gibt KEINE Spalte
  // `darf_bearbeiten`, `editable`, `readonly` oder `locked` in
  // `nutrition` oder `coach`.** `[read]` **`undefined` heisst: noch
  // nicht hinterlegt** — und ein eigener Plan war nie gesperrt.
  assert.equal(darfBearbeiten(undefined), true)
  assert.equal(darfBearbeiten(null), true)
  assert.equal(darfBearbeiten(true), true)
  // Nur ein ausdrueckliches `false` sperrt.
  assert.equal(darfBearbeiten(false), false)
})

test('E-41: die zwei Sperren werden unterschieden — sie haben verschiedene Auswege', () => {
  // **E-41:** *,,Zwei Sperren, die nichts miteinander zu tun haben."*
  const offen = sperreVon('assigned', true)
  const aktiv = sperreVon('active', true)
  const fremd = sperreVon('assigned', false)
  const beides = sperreVon('active', false)

  assert.equal(offen.art, 'offen')
  assert.equal(aktiv.art, 'aktiv')
  assert.equal(fremd.art, 'fremd')
  assert.equal(beides.art, 'beides')

  // `[read]` **Die Kopie hilft NUR bei der Aktivsperre.** Bei fremder
  // Herkunft fuehrte sie um die Entscheidung des Erstellers herum —
  // und ein Ausweg, den es nicht gibt, waere schlimmer als keiner.
  assert.equal(kopieHilft(aktiv), true)
  assert.equal(kopieHilft(fremd), false)
  assert.equal(kopieHilft(beides), false)
  assert.equal(kopieHilft(offen), false)

  // Und die Marken sind verschieden — sonst sehen beide gleich aus.
  assert.equal(SPERRE_MARKE.offen, null)
  assert.notEqual(SPERRE_MARKE.aktiv, SPERRE_MARKE.fremd)
  assert.match(String(SPERRE_MARKE.aktiv), /eingefroren/)
})

test('E-41: bei fremder Herkunft gewinnt sie — auch wenn der Plan laeuft', () => {
  // `[read]` **Sonst bekaeme der Nutzer einen Kopier-Hinweis, der
  // ihm nicht hilft.**
  const beides = sperreVon('active', false)
  assert.match(beides.art === 'beides' ? beides.satz : '', /nicht freigegeben/)
  assert.equal(kopieHilft(beides), false)
})

// ══ C-372: die Wochen ════════════════════════════════════════════

test('C-372: der Anker ist der Montag — die Wochen liegen relativ', () => {
  // `[cmd]` **`week_start` ist NOT NULL, ein Entwurf hat aber kein
  // Startdatum** (E-40). `[read]` **Der Anker loest das, ohne ein
  // Datum zu behaupten.**
  //
  // 2026-08-31 ist ein Montag; 2026-09-06 ein Sonntag.
  assert.equal(wochenAnker('2026-08-31'), '2026-08-31')
  assert.equal(wochenAnker('2026-09-06'), '2026-08-31')
  assert.equal(wochenAnker('2026-09-02'), '2026-08-31')
  assert.equal(wochenAnker('2026-09-07'), '2026-09-07')
})

test('C-372: die Wochen liegen sieben Tage auseinander', () => {
  const w = wochenDaten('2026-08-31', 3)
  assert.deepEqual(w, ['2026-08-31', '2026-09-07', '2026-09-14'])
  // `[cmd]` **UNIQUE (plan_id, week_start)** — zwei gleiche Daten
  // waeren ein Fehlschlag beim Anlegen.
  assert.equal(new Set(w).size, w.length, 'zwei Wochen am selben Tag')
})

test('C-372: die Wochenzahl wird begrenzt, nicht durchgereicht', () => {
  assert.equal(wochenDaten('2026-08-31', 0).length, WOCHEN_MIN)
  assert.equal(wochenDaten('2026-08-31', 99).length, WOCHEN_MAX)
  assert.equal(wochenDaten('2026-08-31', -5).length, WOCHEN_MIN)
})

test('C-372: day_index laeuft 1..7 — der CHECK verlangt es', () => {
  // `[cmd]` **`meal_plan_days_day_index_check`: `>= 1 AND <= 7`.**
  // `[cmd]` **Am 2026-08-31 gegengeprueft: 0 und 8 werden abgewiesen,
  // 1 nicht.**
  const tage = tageDerWoche('2026-08-31')
  assert.equal(tage.length, 7)
  assert.deepEqual(tage.map(t => t.day_index), [1, 2, 3, 4, 5, 6, 7])
  assert.equal(tage[0].plan_date, '2026-08-31')
  assert.equal(tage[6].plan_date, '2026-09-06')
  // Kein Index ausserhalb des CHECKs.
  for (const t of tage) {
    assert.ok(t.day_index >= 1 && t.day_index <= 7, `${t.day_index} verletzt den CHECK`)
  }
})

test('C-372: beim Aktivieren verschieben sich alle Wochen gleich', () => {
  // **Flow 3, Schritt 5: das Startdatum waehlt der Nutzer.**
  // `[read]` **Die Abstaende bleiben, das Datum wird richtig.**
  const d = verschiebung('2026-08-31', '2026-09-14')
  assert.equal(d, 14)
  assert.equal(tageVerschieben('2026-08-31', d), '2026-09-14')
  assert.equal(tageVerschieben('2026-09-07', d), '2026-09-21')
  // Rueckwaerts geht auch.
  assert.equal(verschiebung('2026-09-14', '2026-08-31'), -14)
})

// ══ Die Verdrahtung ══════════════════════════════════════════════

test('G-306: die Sperre steht im SCHREIBWEG, nicht nur in der Anzeige', () => {
  // `[read]` **Ein ausgegrauter Knopf ist eine Bitte.** `[cmd]`
  // **Und die Datenbank sperrt nicht:** am 2026-08-31 gemessen ging
  // ein `UPDATE` auf eine Position eines aktiven Plans durch.
  const s = ohneKommentare(SCHREIB)
  assert.match(s, /positionenGesperrt\(status\)/,
    'der Status wird im Schreibweg nicht geprueft')
  assert.match(s, /PLAN_AKTIV/, 'der 409-Code fehlt')

  // `[read]` **Gezaehlt, nicht gesucht:** drei Vorgaenge (anlegen,
  // aendern, loeschen) muessen ALLE pruefen.
  const rufe = (s.match(/await pruefePositionsRecht\(/g) ?? []).length
  assert.equal(rufe, 3, `${rufe} von 3 Vorgaengen pruefen die Sperre`)

  // Und die alte, schwaechere Pruefung ist weg — A-59.
  assert.doesNotMatch(s, /(?<![a-zA-Z0-9_])pruefeFreigabe(?![a-zA-Z0-9_])/,
    'die alte Pruefung (nur Herkunft) lebt weiter')
})

test('G-306/ADR #17: der Fehler ist 409, nicht 403', () => {
  // `[cmd]` **Der ADR schreibt es vor:** *,,API gibt 409 Conflict
  // zurueck."* `[read]` **Nicht 403** — dort fehlt das Recht
  // dauerhaft; hier ist der Zustand im Weg und laesst sich aendern.
  const m = ohneKommentare(MODELL)
  assert.match(m, /\| 'PLAN_AKTIV'/, 'der Code fehlt im Typ')
  const start = m.indexOf('httpStatusForDiaryError')
  const block = m.slice(start, start + 700)
  assert.match(block, /case 'PLAN_AKTIV':\s*\n\s*return 409/,
    'PLAN_AKTIV bildet nicht auf 409 ab')
})

test('C-372: die zwei Vorgaenge sind in der Route erreichbar', () => {
  // `[cmd]` **A-59/G-192: ein Schreibweg ohne Aufrufer ist tot.**
  const r = ohneKommentare(ROUTE)
  assert.match(r, /art === 'plan_werkbank'/, 'plan_werkbank fehlt')
  assert.match(r, /art === 'plan_kopieren'/, 'plan_kopieren fehlt')
  // `[read]` **Die Meldung ist ueber zwei Zeilen umbrochen** — der
  // erste Waechter suchte sie am Stueck und fiel darueber.
  const ohneUmbruch = r.replace(/'[\s]*\+[\s]*'/g, '')
  assert.match(ohneUmbruch, /plan_werkbank, plan_kopieren/,
    'die Fehlermeldung nennt sie nicht')
})

test('C-372/E-40: das Formular fragt Wochen — und NICHT Startdatum', () => {
  // **E-40:** *,,Lebenszyklus und Startdatum gehoeren nicht dorthin."*
  //
  // `[read]` **Nach dem FELD suchen, nicht nach dem Wort** — der
  // Erklaersatz des Formulars enthaelt beide Woerter, und der erste
  // Browserlauf hat daran „Startdatum: true" gemeldet (G-216).
  const u = ohneKommentare(UI)
  const start = u.indexOf('export function NeuerPlanForm')
  const block = u.slice(start, u.indexOf('export function KopieKnopf'))
  assert.match(block, /aria-label="Anzahl Wochen"/, 'das Wochenfeld fehlt')
  assert.doesNotMatch(block, /type="date"/,
    'das Formular hat ein Datumsfeld — E-40 verbietet es hier')
  assert.doesNotMatch(block, /lifecycle_type|ZYKLUS_WAEHLBAR/,
    'das Formular waehlt einen Lebenszyklus')
  // Und der Schreibweg setzt beides ausdruecklich auf null.
  const s = ohneKommentare(SCHREIB)
  // `[read]` **Den Block abschneiden, sonst trifft die Probe das
  // `start_date: null` der KOPIE** — es steht zweimal in der Datei,
  // und die Sabotageprobe hat genau daran vorbeigezeigt.
  const von = s.indexOf('export async function planMitWochenAnlegen')
  const bis = s.indexOf('\nexport ', von + 10)
  const sb = s.slice(von, bis === -1 ? undefined : bis)
  assert.match(sb, /start_date: null/, 'start_date wird nicht geleert')
  assert.match(sb, /lifecycle_type: null/, 'lifecycle_type wird nicht geleert')
  assert.doesNotMatch(sb, /start_date: eingabe\./,
    'das Anlegen schreibt doch ein Startdatum — E-40 verbietet es hier')
})

test('G-306: die Kopie ist ein ENTWURF — sonst fuehrte der Ausweg im Kreis', () => {
  const s = ohneKommentare(SCHREIB)
  const start = s.indexOf('export async function planKopieren')
  assert.notEqual(start, -1)
  // `[read]` **Bis zum naechsten `export`, nicht auf gut Glueck
  // 3000 Zeichen** — der erste Waechter schnitt bei 3000 ab und sah
  // `meal_plan_entries` (bei 3731) nicht mehr.
  const naechste = s.indexOf('\nexport ', start + 10)
  const block = s.slice(start, naechste === -1 ? undefined : naechste)
  assert.match(block, /status: 'assigned'/,
    'die Kopie ist nicht als Entwurf angelegt')
  // `[read]` **Das Log wird NICHT kopiert** — es gehoert zum
  // Original, und genau darum geht der ADR diesen Weg.
  assert.doesNotMatch(block, /meal_plan_logs/,
    'das Protokoll wird mitkopiert — das Original verlaere seine Historie')
  // `[read]` **Gezaehlt, nicht gesucht.** Die Sabotageprobe hat den
  // Positions-Insert auf `meal_plan_days` umgebogen — der Name steht
  // achtmal in der Datei, und `assert.match` fand ein anderes
  // Vorkommen. **G-216 zum wiederholten Mal.**
  for (const tab of ['meal_plan_weeks', 'meal_plan_days', 'meal_plan_entries']) {
    assert.match(block, new RegExp(`from\\('${tab}'\\)`),
      `${tab} wird nicht kopiert`)
  }
  // **Die Wirkung: der Positions-Insert haengt an `meal_plan_entries`,
  // nicht an irgendeiner Tabelle.**
  assert.match(block, /from\('meal_plan_entries'\)\.insert\(/,
    'die Positionen werden in eine andere Tabelle geschrieben')
  // Und je Ebene genau ein Insert — Woche, Tag, Position.
  const inserts = (block.match(/from\('meal_plan_days'\)\s*\n?\s*\.insert/g) ?? [])
  assert.equal(inserts.length, 1,
    `${inserts.length} Tages-Inserts im Kopierblock — erwartet 1`)
})

test('G-306: der Ausweg ist im Browser erreichbar — nicht nur im Schreibweg', () => {
  // **Der Auftrag: ein Knopf, sonst ist die Regel eine Sackgasse.**
  const u = ohneKommentare(UI)
  assert.match(u, /Kopie bearbeiten/, 'der Knopf fehlt')
  assert.match(u, /art: 'plan_kopieren'/, 'der Knopf ruft nichts auf')
  // Und er haengt an `kopieHilft`, nicht an einer eigenen Bedingung.
  // `[read]` **Gezaehlt:** `kopieHilft` steht zweimal — am Knopf und
  // am Ersatztext. **Die Sabotageprobe hat eines ersetzt, und
  // `assert.match` fand das andere.**
  const rufe = (u.match(/kopieHilft\(sperre\)/g) ?? []).length
  assert.equal(rufe, 2,
    `${rufe} Stellen fragen die Regel — erwartet 2 (Knopf und Ersatztext)`)
  // Und der Knopf haengt an der Regel, nicht an einer eigenen Bedingung.
  assert.match(u, /\{kopieHilft\(sperre\) && \(/,
    'der Kopierknopf entscheidet selbst')
  // Die Werkbank ist gerendert — A-59.
  const a = ohneKommentare(ANSICHT)
  assert.match(a, /<PlanWerkbank\s/, 'die Werkbank wird nicht gerendert')
})

test('C-372: beim Aktivieren wandern die Wochen mit — Flow 3, Schritt 5', () => {
  // `[read]` **Ohne diesen Schritt stuende ein Plan aus der Werkbank
  // an seinem ANKER statt am gewaehlten Startdatum** — der Nutzer
  // saehe seine Tage in der falschen Woche.
  //
  // `[cmd]` **An der Datenbank gegengeprueft:** zwei Wochen ab
  // 2026-08-31, verschoben auf den 2026-09-14, ergeben 2026-09-14 und
  // 2026-09-21 — **beide Wochen und alle 14 Tage um +14.**
  const s = ohneKommentare(SCHREIB)
  assert.match(s, /wochenAufStartdatumSchieben\(db, id, felder\.start_date\)/,
    'das Aktivieren verschiebt die Wochen nicht')
  const start = s.indexOf('async function wochenAufStartdatumSchieben')
  assert.notEqual(start, -1, 'die Verschiebefunktion fehlt')
  const bis = s.indexOf('\nexport ', start + 10)
  const block = s.slice(start, bis === -1 ? undefined : bis)
  // Die Wirkung: BEIDE Ebenen wandern, nicht nur die Woche.
  assert.match(block, /from\('meal_plan_weeks'\)\s*\n?\s*\.update/,
    'die Wochen werden nicht verschoben')
  // `[read]` **Das FELD pruefen, nicht die Tabelle.** Die
  // Sabotageprobe hat `plan_date` durch `notes` ersetzt — der
  // `.update` auf `meal_plan_days` blieb stehen, und der Waechter sah
  // nichts. **G-216, und ich bin schon wieder darauf
  // hereingefallen.**
  assert.match(block, /\.update\(\{ plan_date: tageVerschieben\(/,
    'die Tage bleiben stehen — dann passt der Plan nicht mehr zusammen')
  assert.match(block, /\.update\(\{ week_start: neuStart \}\)/,
    'die Wochen wandern nicht mit')
  // `[read]` **Null Tage heisst: nichts schreiben.**
  assert.match(block, /if \(tage === 0\) return/,
    'bei gleicher Lage wird trotzdem geschrieben')
})

test('C-372: was NICHT gebaut wird, steht als Liste da', () => {
  // **Auftrag: *,,Keinen Lebenszyklus ausfuehren (C-373). Kein
  // Teilen, kein Kaufen."***
  const texte = NICHT_GEBAUT.join(' ')
  assert.match(texte, /C-373/)
  assert.match(texte, /Teilen/)
  assert.match(texte, /Kaufen|Marktplatz/)
  // Und die Wirkung: kein Lebenszyklus-Vollzug im Schreibweg.
  const s = ohneKommentare(SCHREIB)
  assert.doesNotMatch(s, /rollover_count\s*[+:]/,
    'ein Rollover wird ausgefuehrt — das ist C-373')
})
