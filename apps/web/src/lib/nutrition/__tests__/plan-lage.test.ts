// G-267 / G-268 / G-269 / G-270: Herkunft, Zyklus, Recht, Ausfuehrung.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  herkunftVon, HERKUNFT_TEXT, HERKUNFT_UNBEKANNT_SATZ,
  zyklusVon, ZYKLUS_TEXT, statusText,
  bearbeitbarkeit, einhaltungVon, quoteVon,
  KEIN_LOG_SATZ, KEINE_EINKAUFSLISTE_SATZ,
  type LogZeile,
} from '../plan-lage'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const tage = (n: number, status: LogZeile['status']): LogZeile[] =>
  Array.from({ length: n }, (_, i) => ({
    execution_date: `2026-08-${String(i + 1).padStart(2, '0')}`,
    status, confirmation_mode: null, deviation_kcal: null,
  }))

// ── G-268: die Herkunft, und NULL als eigener Zustand ────────────

test('G-268: NULL ist ein eigener Zustand, nicht self_created', () => {
  // `[cmd]` **Gemessen am 2026-08-30: die zwei Bestandsplaene tragen
  // `plan_origin = NULL`**, weil die Herkunft nicht belegbar war.
  // `[read]` **Sie als „selbst erstellt" zu zeigen waere eine
  // Behauptung.**
  assert.equal(herkunftVon(null), 'unbekannt')
  assert.equal(herkunftVon('self_created'), 'self_created')
  assert.equal(herkunftVon('coach_created'), 'coach_created')
  assert.equal(herkunftVon('marketplace'), 'marketplace')
  // Und ein unbekannter Wert wird nicht durchgereicht.
  assert.equal(herkunftVon('irgendwas'), 'unbekannt')
})

test('G-268: der Satz erklaert die Leerstelle, statt sie zu fuellen', () => {
  assert.match(HERKUNFT_UNBEKANNT_SATZ, /keine Herkunft hinterlegt/)
  assert.match(HERKUNFT_UNBEKANNT_SATZ, /keine Aussage darüber/)
  assert.equal(HERKUNFT_TEXT.unbekannt, 'Herkunft nicht hinterlegt')
})

// ── G-269: das Bearbeitungsrecht ─────────────────────────────────

test('G-269: eigene Plaene braucht keine Coach-Freigabe', () => {
  // `[read]` **Sonst bestimmte eine Coach-Regel ueber eigene Plaene.**
  assert.deepEqual(bearbeitbarkeit('self_created', false), { erlaubt: true })
  assert.deepEqual(bearbeitbarkeit('unbekannt', false), { erlaubt: true })
})

test('G-269: ein Coach-Plan ist ohne Freigabe gesperrt — mit Grund', () => {
  // `[cmd]` **Gemessen am 2026-08-30: `dev` steht auf Stufe 3 und
  // bekommt `false` aus `coach.darf_nutrition_plan_aendern`.**
  // `[read]` **Der Reiter muss sagen WARUM, nicht nur ausgrauen.**
  const b = bearbeitbarkeit('coach_created', false)
  assert.equal(b.erlaubt, false)
  if (b.erlaubt) return
  assert.equal(b.grund, 'coach_sperrt')
  assert.match(b.satz, /Coach/)
  assert.match(b.satz, /Autonomiestufe 5/)
})

test('G-269: mit Freigabe darf auch ein Coach-Plan geaendert werden', () => {
  assert.deepEqual(bearbeitbarkeit('coach_created', true), { erlaubt: true })
})

test('G-269: ein Marktplatzplan nennt einen anderen Grund', () => {
  // `[read]` **Zwei Sperren, zwei Wege heraus** — beim Coach reden,
  // beim Marktplatz kopieren.
  const b = bearbeitbarkeit('marketplace', false)
  assert.equal(b.erlaubt, false)
  if (b.erlaubt) return
  assert.equal(b.grund, 'fremde_quelle')
  assert.match(b.satz, /Kopie/)
  assert.doesNotMatch(b.satz, /Coach/)
})

// ── G-270: Zyklus und Ausfuehrung ────────────────────────────────

test('G-270: der Zyklus kennt NULL als eigenen Fall', () => {
  assert.equal(zyklusVon(null), 'unbekannt')
  assert.equal(zyklusVon('rollover'), 'rollover')
  assert.equal(ZYKLUS_TEXT.unbekannt, 'kein Lebenszyklus hinterlegt')
})

test('G-270: ohne entschiedene Zeilen gibt es keine Quote', () => {
  // `[read]` **`null` heisst „noch keine Aussage", nicht „0 Prozent"**
  // — dieselbe Regel wie in C-323. `[cmd]` **Und das ist heute der
  // Normalfall: `meal_plan_logs` hat 0 Zeilen.**
  assert.equal(quoteVon(einhaltungVon([])), null)
  assert.equal(quoteVon(einhaltungVon(tage(5, 'pending'))), null,
    'Offene Zeilen sind keine Entscheidung.')
})

test('G-270: die Quote rechnet nur ueber entschiedene Zeilen', () => {
  const gemischt: LogZeile[] = [
    ...tage(6, 'confirmed'), ...tage(2, 'skipped'), ...tage(4, 'pending'),
  ]
  const e = einhaltungVon(gemischt)
  assert.equal(e.bestaetigt, 6)
  assert.equal(e.ausgelassen, 2)
  assert.equal(e.offen, 4)
  assert.equal(e.entschieden, 8, 'Offene Zeilen zaehlen nicht in den Nenner.')
  assert.equal(quoteVon(e), 75)
})

test('G-310/SPEC_09: abgewichen zaehlt als ERFOLG, nicht nur als Entscheidung', () => {
  // `[cmd]` **BERICHTIGT in G-310.** Hier stand *,,nicht als Erfolg"*
  // und `quoteVon(e) === 50`.
  //
  // `[cmd]` **`SPEC_09` Abschnitt 2, Regeln:** *,,`deviated` zaehlt
  // als Erfolg fuer Compliance (User hat sich aktiv entschieden)."*
  //
  // **Tom, 2026-09-01:** *,,Compliance misst, ob jemand seinen Plan
  // verfolgt — nicht, ob er gehorcht."*
  const e = einhaltungVon([...tage(1, 'confirmed'), ...tage(1, 'deviated')])
  assert.equal(e.entschieden, 2)
  assert.equal(quoteVon(e), 100,
    'abgewichen senkt die Quote — SPEC_09 zaehlt es als Erfolg')

  // `[read]` **Ausgelassen bleibt ein Misserfolg** — wer nichts isst,
  // hat den Plan nicht umgesetzt. **Das trennt die beiden Faelle.**
  const s = einhaltungVon([...tage(1, 'confirmed'), ...tage(1, 'skipped')])
  assert.equal(quoteVon(s), 50, 'ausgelassen zaehlt faelschlich als Erfolg')

  // Und der Nenner bleibt: offen zaehlt nicht mit.
  const o = einhaltungVon([
    ...tage(1, 'confirmed'), ...tage(1, 'deviated'), ...tage(8, 'pending'),
  ])
  assert.equal(o.entschieden, 2, 'offene Zeilen im Nenner')
  assert.equal(quoteVon(o), 100)
})

test('G-270: die Leerzustaende sagen, was fehlt', () => {
  assert.match(KEIN_LOG_SATZ, /noch nichts protokolliert/)

  // `[cmd]` **`nutrition.shopping_lists` EXISTIERT** — der Satz darf
  // keine fehlende Tabelle behaupten. **Diese Probe bleibt.**
  assert.doesNotMatch(KEINE_EINKAUFSLISTE_SATZ, /gibt es (noch )?keine Tabelle/)

  // `[cmd]` **BERICHTIGT in G-288, 2026-08-31.** Hier stand
  // `/Tabelle steht bereit/`, und der Satz sagte dazu, die Liste
  // entstehe *„aus einer Planwoche"*.
  //
  // `[cmd]` **`SPEC_03` Flow 8, Schritt 1: *„Rezept oeffnen ->
  // Einkaufsliste erstellen"*.** `[read]` **Die zweite Fassung war
  // also genauso falsch wie die erste** — nur unauffaelliger: sie
  // behauptete nicht mehr eine fehlende Tabelle, sondern den falschen
  // Ursprung.
  //
  // `[read]` **Geprueft wird jetzt die Quelle, nicht die
  // Verfuegbarkeit** — das ist die Aussage, die falsch werden kann.
  assert.match(KEINE_EINKAUFSLISTE_SATZ, /aus einem Rezept/,
    'der Satz nennt nicht die Quelle aus Flow 8')
  assert.doesNotMatch(KEINE_EINKAUFSLISTE_SATZ, /aus einer Planwoche/,
    'die widerlegte Behauptung ist zurueck')
})

test('G-267: der Planzustand wird uebersetzt, nicht durchgereicht', () => {
  assert.equal(statusText('assigned'), 'zugewiesen')
  assert.equal(statusText('active'), 'aktiv')
  // Unbekanntes bleibt sichtbar, statt zu verschwinden.
  assert.equal(statusText('sonstwas'), 'sonstwas')
})

// ── Die Anzeige und der Schreibweg halten sich daran ─────────────

test('G-267: New plan oeffnet das Modal', () => {
  // `[read]` **Wirkung, nicht Wort** — geprueft wird die
  // Klickzuweisung, nicht der Name.
  const s = ohneKommentare('src/app/v2/nutrition/tab-plans.tsx')
  assert.match(s, /onClick=\{\(\) => setAnlegen\(true\)\}/,
    'New plan oeffnet nichts (G-267).')
  assert.doesNotMatch(s, /onClick=\{\(\) => (undefined|false|null)\s*&&/,
    'Der Klickgriff ist stillgelegt (G-267).')
})

test('G-269: die Herkunft kommt nicht aus dem Browser', () => {
  // `[read]` **Sonst koennte ein Browser einen Plan als
  // `coach_created` ausgeben und die Sperre umgehen.**
  const s = ohneKommentare('src/lib/nutrition/plan-write.ts')
  const schema = /planAnlegenSchema = z\.object\(\{[\s\S]*?\n\}\)/.exec(s)
  assert.ok(schema, 'Das Anlege-Schema wurde nicht gefunden.')
  assert.doesNotMatch(schema[0], /plan_origin/,
    'plan_origin steht im Eingabeschema — die Herkunft waere faelschbar (G-269).')
  assert.match(s, /plan_origin: 'self_created'/,
    'Die Herkunft wird nicht serverseitig gesetzt (G-269).')
})

test('G-269: die Sperre sitzt im Schreibweg, nicht nur in der Anzeige', () => {
  // `[read]` **Ein ausgegrauter Knopf ist eine Bitte; die Pruefung im
  // Schreibweg ist die Regel.**
  const s = ohneKommentare('src/lib/nutrition/plan-write.ts')
  assert.match(s, /darf_nutrition_plan_aendern/,
    'E-29: die Freigabe kommt nicht aus der Funktion (G-269).')
  assert.doesNotMatch(s, /from\('client_autonomy'\)/,
    'E-29 verlangt den Weg ueber die Funktion, nicht ueber die Tabelle (G-269).')
  assert.match(s, /if \(!\(await darfAendern\(herkunft\)\)\)/,
    'Der Schreibweg prueft die Freigabe nicht (G-269).')
})
