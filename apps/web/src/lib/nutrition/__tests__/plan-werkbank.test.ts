// C-372 / G-306 / C-375 / C-377 / C-373: Werkbank, Sperre, Ablauf.
//
// **Grundlage: E-40, E-41, E-42** (E-42 loest
// `ADR_IMPROVEMENTS_PACKAGE` #17 ab), **SPEC_01 Abschnitt 8/9,
// SPEC_03 Flow 3 und 11-13.**
//
// `[read]` **Die Waechter messen die Wirkung, nicht das Wort.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  PLAN_STATUS, LOG_STATUS, positionEingefroren, GELOGGT_SATZ, GELOGGT_MARKE,
  darfWeiterverkaufen, KEIN_WEITERVERKAUF_SATZ, KEIN_WEITERVERKAUF_MARKE,
  ABLAUF_WEGE, WEG_TEXT, WEG_ERKLAERUNG, vorschlagFuer, vorschlagSatz,
  wochenAnker, wochenDaten, tageDerWoche, verschiebung, tageVerschieben,
  WOCHEN_MIN, WOCHEN_MAX, NICHT_GEBAUT,
} from '../plan-werkbank'
import { pruefeProtokoll } from '../plan-write'

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

// ══ G-306/E-42: die Sperre haengt am PROTOKOLL ═══════════════════

test('G-306/E-42: nur eine geloggte Position ist eingefroren', () => {
  // **Tom, 2026-08-31:** *,,wenn wir den einschraenken dass er nicht
  // editieren kann dann bescheisst er sich ja selber."*
  //
  // `[read]` **In C-372 sperrte JEDER aktive Plan.** `[cmd]` **E-42:
  // 409 nur, wenn DIESE Position ein Log mit `status <> 'pending'`
  // traegt.**
  assert.equal(positionEingefroren(null), false, 'kein Log heisst frei')
  assert.equal(positionEingefroren(undefined), false)
  // `[cmd]` **Der `resolution_check`: ein `pending`-Log hat kein
  // `actual_meal_id` und kein `confirmed_at`** — es gibt nichts zu
  // verfaelschen.
  assert.equal(positionEingefroren('pending'), false,
    'ein pending-Log sperrt — dann ist auch der Zukunftstag gesperrt')
  assert.equal(positionEingefroren('confirmed'), true)
  assert.equal(positionEingefroren('deviated'), true)
  assert.equal(positionEingefroren('skipped'), true)
  // Alle vier Zustaende des CHECKs sind bekannt.
  assert.equal(LOG_STATUS.length, 4)
  assert.equal(PLAN_STATUS.length, 5)
})

test('G-306/E-42: der Satz nennt keinen Ausweg — es gibt keinen noetig', () => {
  // `[read]` **Vergangenes bleibt.** Anders als bei der alten Sperre
  // gibt es keinen Zustand, den man aufheben koennte — **und ein
  // Ausweg, der nichts oeffnet, waere eine Luege.**
  assert.match(GELOGGT_SATZ, /protokolliert/)
  assert.doesNotMatch(GELOGGT_SATZ, /Kopie bearbeiten/,
    'der Satz nennt einen Ausweg, den es nicht mehr gibt')
  // Er sagt stattdessen, was WEITER geht.
  assert.match(GELOGGT_SATZ, /heute und morgen|frei planen/)
  assert.equal(GELOGGT_MARKE, 'protokolliert')
})

test('G-306/E-42: der Schreibweg WEIST AB — gemessen, nicht gelesen', async () => {
  // `[cmd]` **In der Sabotageprobe kamen S6 und S8 durch:** der
  // Schreibweg konnte aufhoeren zu pruefen, und jeder Textwaechter
  // blieb gruen.
  //
  // `[read]` **Genau die Klasse, die G-216/G-247/G-246 beschreiben** —
  // das Wort steht da, die Wirkung fehlt. **Also wird hier die Wirkung
  // gemessen: kommt ein Fehler, und welcher?**
  //
  // Die Attrappe merkt sich, wonach gefragt wurde.
  const gefragt: Record<string, unknown> = {}
  const db = (zeilen: Array<{ status: string }>) => ({
    from(tabelle: string) {
      gefragt.tabelle = tabelle
      const kette = {
        select(s: string) { gefragt.select = s; return kette },
        eq(f: string, w: unknown) { gefragt.eqFeld = f; gefragt.eqWert = w; return kette },
        neq(f: string, w: unknown) { gefragt.neqFeld = f; gefragt.neqWert = w; return kette },
        limit() { return Promise.resolve({ data: zeilen, error: null }) },
      }
      return kette
    },
  })

  // 1. Eine Position OHNE Log geht durch.
  await pruefeProtokoll(db([]) as never, 'e-frei')

  // 2. Eine geloggte Position wird abgewiesen — mit 409 und dem Satz.
  for (const status of ['confirmed', 'deviated', 'skipped']) {
    const fehler = await pruefeProtokoll(db([{ status }]) as never, 'e-log')
      .then(() => null, (e: unknown) => e as { code?: string; message?: string })
    assert.ok(fehler, `${status} wird nicht abgewiesen`)
    assert.equal(fehler?.code, 'POSITION_GELOGGT',
      `${status} wirft ${fehler?.code} statt POSITION_GELOGGT`)
    assert.equal(fehler?.message, GELOGGT_SATZ)
  }

  // 3. `[cmd]` **Die Abfrage schliesst `pending` aus, nichts anderes.**
  // `[read]` **S8 tauschte 'pending' gegen 'confirmed'** — dann laege
  // ein confirmed-Log nicht mehr in der Antwort, und der Zukunftstag
  // waere gesperrt statt der Vergangenheit.
  assert.equal(gefragt.tabelle, 'meal_plan_logs')
  assert.equal(gefragt.eqFeld, 'plan_entry_id')
  assert.equal(gefragt.eqWert, 'e-log')
  assert.equal(gefragt.neqFeld, 'status')
  assert.equal(gefragt.neqWert, 'pending',
    `die Abfrage schliesst „${gefragt.neqWert}" aus statt „pending"`)
})

test('G-306: die Sperre steht im SCHREIBWEG, nicht nur in der Anzeige', () => {
  // `[read]` **Ein ausgegrauter Knopf ist eine Bitte.** `[cmd]`
  // **Und die Datenbank sperrt nicht:** am 2026-08-31 gemessen ging
  // ein `UPDATE` auf eine Position eines aktiven Plans durch.
  const s = ohneKommentare(SCHREIB)
  assert.match(s, /positionEingefroren\(treffer\.status\)/,
    'das Protokoll wird im Schreibweg nicht geprueft')
  assert.match(s, /POSITION_GELOGGT/, 'der 409-Code fehlt')

  // `[read]` **Gezaehlt, nicht gesucht.** `[cmd]` **Aendern und
  // Loeschen pruefen das Protokoll — das ANLEGEN nicht**, denn eine
  // Position, die es noch nicht gibt, kann nicht geloggt sein.
  const protokoll = (s.match(/await pruefeProtokoll\(/g) ?? []).length
  assert.equal(protokoll, 2,
    `${protokoll} von 2 Vorgaengen pruefen das Protokoll (aendern, loeschen)`)
  // Die Herkunft wird bei allen dreien geprueft — G-269 gilt weiter.
  const herkunft = (s.match(/await pruefeHerkunft\(/g) ?? []).length
  assert.equal(herkunft, 4,
    `${herkunft} Herkunftspruefungen — erwartet 4 (3 Positionen + Ablauf)`)

  // `[cmd]` **A-59: die Sperre aus C-372 ist entfernt, nicht
  // auskommentiert.**
  assert.doesNotMatch(s, /(?<![a-zA-Z0-9_])positionenGesperrt(?![a-zA-Z0-9_])/,
    'die alte Plansperre lebt weiter')
  assert.doesNotMatch(s, /(?<![a-zA-Z0-9_])planKopieren(?![a-zA-Z0-9_])/,
    '„Kopie bearbeiten" lebt weiter — der Ausweg ohne Sperre')
})

test('G-306/E-42: der Fehler ist 409 und heisst nach der Position', () => {
  const m = ohneKommentare(MODELL)
  assert.match(m, /\| 'POSITION_GELOGGT'/, 'der Code fehlt im Typ')
  assert.doesNotMatch(m, /\| 'PLAN_AKTIV'/, 'der alte Code lebt weiter')
  const start = m.indexOf('httpStatusForDiaryError')
  const block = m.slice(start, start + 800)
  assert.match(block, /case 'POSITION_GELOGGT':\s*\n\s*return 409/,
    'POSITION_GELOGGT bildet nicht auf 409 ab')
})

// ══ C-375/E-42: das Flag heisst Weiterverkauf ════════════════════

test('C-375/E-42: das Flag sperrt nichts — es sagt etwas', () => {
  // **Tom:** *,,wenn ich einen plan kaufe dann ist das mein plan."*
  // `[read]` **`darf_bearbeiten` war das falsche Flag.**
  assert.equal(darfWeiterverkaufen(undefined), true)
  assert.equal(darfWeiterverkaufen(null), true)
  assert.equal(darfWeiterverkaufen(true), true)
  assert.equal(darfWeiterverkaufen(false), false)
  // Der Satz sagt ausdruecklich, dass Aendern erlaubt bleibt.
  assert.match(KEIN_WEITERVERKAUF_SATZ, /weiterverkauft/)
  assert.match(KEIN_WEITERVERKAUF_SATZ, /Ändern|ändern/,
    'der Satz sagt nicht, dass Aendern erlaubt bleibt')
  assert.equal(KEIN_WEITERVERKAUF_MARKE, 'nicht weiterverkäuflich')
})

test('C-375: die Oberflaeche sperrt keinen Plan mehr', () => {
  // `[cmd]` **E-42: JEDER Plan ist bearbeitbar** — auch ein aktiver,
  // auch ein gekaufter.
  const u = ohneKommentare(UI)
  assert.doesNotMatch(u, /(?<![a-zA-Z0-9_])kopieHilft(?![a-zA-Z0-9_])/,
    'der Kopierknopf lebt weiter')
  assert.doesNotMatch(u, /(?<![a-zA-Z0-9_])sperreVon(?![a-zA-Z0-9_])/,
    'die alte Sperrlogik lebt weiter')
  // Der Bearbeiten-Knopf haengt an KEINER Bedingung mehr.
  assert.match(u, /\{offen \? 'In der Werkbank' : 'Bearbeiten'\}/,
    'der Bearbeiten-Knopf fehlt')
})

// ══ C-377/C-373: die Frage beim Ablauf ═══════════════════════════

test('C-377: drei Wege, und jeder erklaert sich', () => {
  // **Tom:** *,,renew/anderen wochenplan/manuelle erfassung."*
  assert.equal(ABLAUF_WEGE.length, 3)
  for (const w of ABLAUF_WEGE) {
    assert.ok(WEG_TEXT[w], `${w} ohne Text`)
    assert.ok(WEG_ERKLAERUNG[w].length > 30, `${w} ohne Erklaerung`)
  }
  assert.match(WEG_TEXT.neu_starten, /neu starten/)
  assert.match(WEG_TEXT.anderer_plan, /anderen Plan/)
  assert.match(WEG_TEXT.ohne_plan, /Ohne Plan/)
})

test('C-373: der Lebenszyklus bestimmt den VORSCHLAG, nicht die Handlung', () => {
  // `[cmd]` **In G-304 gemessen: es gibt keine Funktion, die einen
  // Lebenszyklus ausfuehrt, und kein `pg_cron`.** `[read]` **Die
  // Meldung IST die Ausfuehrung** — dieselbe Antwort wie bei C-358.
  assert.equal(vorschlagFuer('rollover'), 'neu_starten')
  assert.equal(vorschlagFuer('sequence'), 'anderer_plan')
  assert.equal(vorschlagFuer('once'), 'anderer_plan')
  // `[read]` **`NULL` heisst: nicht festgelegt** — dann gibt es
  // keinen Vorschlag, und alle drei stehen gleichwertig da.
  assert.equal(vorschlagFuer(null), null)
  assert.equal(vorschlagFuer(undefined), null)
  // Und der Grund wird genannt, damit der Vorschlag nachvollziehbar ist.
  assert.match(String(vorschlagSatz('rollover')), /von vorn/)
  assert.match(String(vorschlagSatz('sequence')), /Folgeplan/)
  assert.match(String(vorschlagSatz(null)), /kein Lebenszyklus/)
})

test('C-377: der Schreibweg kennt die drei Wege', () => {
  const s = ohneKommentare(SCHREIB)
  assert.match(s, /export async function ablaufKlaeren/, 'der Weg fehlt')
  // `neu_starten` haelt den Plan aktiv und zaehlt hoch.
  const von = s.indexOf('export async function ablaufKlaeren')
  const bis = s.indexOf('\nexport ', von + 10)
  const block = s.slice(von, bis === -1 ? undefined : bis)
  // `[cmd]` **S15 kam durch:** `rollover_count: neuZaehler` steht
  // ZWEIMAL im Block — im `update` und im Rueckgabewert. **Das
  // Entfernen des ersten liess den zweiten stehen.**
  //
  // `[read]` **Also gezaehlt, nicht gesucht** (A-59/G-216).
  const zaehler = (block.match(/rollover_count: neuZaehler/g) ?? []).length
  assert.equal(zaehler, 2,
    `${zaehler} von 2 Stellen setzen den Zaehler (update + Rueckgabe)`)
  assert.match(block, /const neuZaehler = \(v\.rollover_count \?\? 0\) \+ 1/,
    'der Zaehler wird nicht aus dem alten Stand erhoeht')
  assert.match(block, /wochenAufStartdatumSchieben\(db, eingabe\.id/,
    'beim Neustart wandern die Wochen nicht mit')
  // Die anderen beiden schliessen ab — `completed`, nicht `archived`.
  assert.match(block, /status: 'completed'/,
    'der Plan wird nicht abgeschlossen')
  assert.doesNotMatch(block, /status: 'archived'/,
    'der Plan wird weggeraeumt statt abgeschlossen')
  // Und die Route kennt ihn.
  const r = ohneKommentare(ROUTE)
  assert.match(r, /art === 'ablauf_klaeren'/, 'die Route fehlt')
})

test('C-377: die Frage steht nur an einem Plan, der noch laeuft', () => {
  // `[cmd]` **Am 2026-09-01 im Browser gemessen:** nach dem Weg
  // *,,anderen Plan aktivieren"* stand der Plan auf `completed`, **und
  // die Frage blieb trotzdem stehen.**
  //
  // `[read]` **Ein Plan, der die Frage beantwortet hat, darf sie nicht
  // erneut stellen** — sonst ignoriert die Anzeige die Entscheidung
  // des Nutzers.
  const u = ohneKommentare(UI)
  assert.match(u, /const laeuftNoch = p\.status === 'active' \|\| p\.status === 'assigned'/,
    'die Frage haengt nicht am Planzustand')
  assert.match(u, /laufzeit\.art === 'abgelaufen' && laeuftNoch/,
    'die Frage erscheint auch an einem abgeschlossenen Plan')
  assert.match(u, /<AblaufFrage/, 'die Frage wird nicht gerendert')
})

test('C-372/E-40: das Formular fragt Wochen — und NICHT Startdatum', () => {
  // **E-40:** *,,Lebenszyklus und Startdatum gehoeren nicht dorthin."*
  //
  // `[read]` **Nach dem FELD suchen, nicht nach dem Wort** — der
  // Erklaersatz des Formulars enthaelt beide Woerter, und der erste
  // Browserlauf hat daran „Startdatum: true" gemeldet (G-216).
  const u = ohneKommentare(UI)
  const start = u.indexOf('export function NeuerPlanForm')
  // `[cmd]` **`KopieKnopf` ist in G-306 entfernt** — `indexOf`
  // liefert dann -1, und der Block umfasste die ganze Datei.
  // **Dann traf die Datumsprobe das Feld der AblaufFrage**, das
  // dort richtig ist (C-377, Schritt 5 von Flow 3).
  const naechste = u.indexOf('\nexport function', start + 10)
  const block = u.slice(start, naechste === -1 ? undefined : naechste)
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

test('G-306/E-42: „Kopie bearbeiten" ist entfernt, nicht abgeschaltet', () => {
  // `[cmd]` **E-42 hebt die Sperre auf, zu der dieser Knopf der
  // Ausweg war.** `[read]` **Ein Ausweg ohne Sperre ist keiner** —
  // und ein Knopf ohne Grund ist genau das, was A-59 verbietet.
  //
  // `[read]` **Der Auftrag liess die Wahl:** *,,Falls du ihn behalten
  // willst: sag warum, aber nicht als Ausweg aus einer Sperre."*
  // **Einen Plan zu duplizieren mag fuer sich sinnvoll sein** — dann
  // als Bibliotheksfunktion mit eigener Begruendung, beantragt statt
  // uebriggelassen.
  const s = ohneKommentare(SCHREIB)
  const u = ohneKommentare(UI)
  const r = ohneKommentare(ROUTE)
  for (const [name, quelle] of [['Schreibweg', s], ['Oberflaeche', u],
                                ['Route', r]] as const) {
    assert.doesNotMatch(quelle,
      /(?<![a-zA-Z0-9_])(planKopieren|KopieKnopf|plan_kopieren)(?![a-zA-Z0-9_])/,
      `„Kopie bearbeiten" lebt weiter im ${name}`)
  }
})

test('C-372: was NICHT gebaut wird, steht als Liste da', () => {
  // **Auftrag: *,,Keinen Lebenszyklus ausfuehren (C-373). Kein
  // Teilen, kein Kaufen."***
  const texte = NICHT_GEBAUT.join(' ')
  assert.match(texte, /C-373/)
  assert.match(texte, /Teilen/)
  assert.match(texte, /Kaufen|Marktplatz/)
  // `[cmd]` **BERICHTIGT durch C-373:** hier stand, ein Rollover
  // duerfe nicht ausgefuehrt werden. **E-42/C-373: die Meldung beim
  // Ablauf IST die Ausfuehrung** — der Nutzer waehlt, und dann zaehlt
  // `rollover_count` hoch.
  //
  // `[read]` **Was weiterhin NICHT gebaut ist: ein Zeitplaner.**
  // `[cmd]` **In G-304 gemessen: kein `pg_cron`, keine Funktion.**
  // **Die Wirkung: nichts laeuft ohne Klick.**
  const s = ohneKommentare(SCHREIB)
  const von = s.indexOf('export async function ablaufKlaeren')
  assert.notEqual(von, -1, 'der Weg beim Ablauf fehlt')
  const bis = s.indexOf('\nexport ', von + 10)
  const block = s.slice(von, bis === -1 ? undefined : bis)
  // Der Zaehler steigt NUR in diesem Block — nirgends automatisch.
  const ausserhalb = s.slice(0, von) + (bis === -1 ? '' : s.slice(bis))
  assert.doesNotMatch(ausserhalb, /rollover_count:/,
    'ein Rollover wird ausserhalb der Nutzerentscheidung ausgefuehrt')
  assert.match(block, /rollover_count: neuZaehler/,
    'der Durchgang wird nicht gezaehlt')
})
