// G-440/A1 - der Muskelzustand wird GERECHNET.
//
// **Tom, 2026-09-13:** *„das ist alles dreck was hier geliefert wird
// und verarschend gegenueber mich. ich rackere mich hier ab und mir
// wird irgendwas serviert aus den haenden gezogen und als echte
// daten verkauft."*
//
// `[cmd]` **`MUSCLE_STATE` waren 18 feste Zeilen aus dem Mockup** —
// `Push B · Wed` ist kein Datum aus einer Datenbank.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  muskelzustaende, deckungsbericht,
  type RohSatz, type RohUebung, type RohSitzung, type RohZuordnung,
} from '../muskelzustand'

/**
 * Ein kleines Trainingstagebuch — in der Form, die die Datenbank
 * WIRKLICH hat (gemessen `tools/_g440-quellen.mjs`).
 */
function tagebuch() {
  const saetze: RohSatz[] = [
    // Sitzung A, Bankdruecken: drei Saetze
    { workout_exercise_id: 'we1' },
    { workout_exercise_id: 'we1' },
    { workout_exercise_id: 'we1' },
    // Sitzung B (spaeter), Bankdruecken: zwei Saetze
    { workout_exercise_id: 'we2' },
    { workout_exercise_id: 'we2' },
    // Sitzung B, Klimmzug: vier Saetze
    { workout_exercise_id: 'we3' },
    { workout_exercise_id: 'we3' },
    { workout_exercise_id: 'we3' },
    { workout_exercise_id: 'we3' },
  ]
  const uebungen: RohUebung[] = [
    { id: 'we1', exercise_id: 'bank', workout_session_id: 'sA' },
    { id: 'we2', exercise_id: 'bank', workout_session_id: 'sB' },
    { id: 'we3', exercise_id: 'klimm', workout_session_id: 'sB' },
  ]
  const sitzungen: RohSitzung[] = [
    { id: 'sA', session_date: '2026-09-01', name: 'Push 1' },
    { id: 'sB', session_date: '2026-09-10', name: 'Pull 2' },
  ]
  const zuordnungen: RohZuordnung[] = [
    { exercise_id: 'bank', muscle_group_id: 'brust', role: 'primary' },
    { exercise_id: 'bank', muscle_group_id: 'trizeps', role: 'secondary' },
    { exercise_id: 'klimm', muscle_group_id: 'ruecken', role: 'primary' },
    { exercise_id: 'klimm', muscle_group_id: 'bizeps', role: 'secondary' },
  ]
  return { saetze, uebungen, sitzungen, zuordnungen }
}

const JETZT = new Date('2026-09-12T00:00:00Z')

function gerechnet() {
  const t = tagebuch()
  return muskelzustaende(t.saetze, t.uebungen, t.sitzungen, t.zuordnungen, JETZT)
}

test('G-440/A1: die Stunden kommen aus der JUENGSTEN Sitzung', () => {
  const z = gerechnet()
  // `brust` wurde in Sitzung A (01.09.) UND B (10.09.) getroffen —
  // die juengste zaehlt.
  assert.equal(z.brust.datum, '2026-09-10')
  assert.equal(z.brust.hours, 48, '12.09. minus 10.09. sind 48 Stunden.')
  assert.equal(z.brust.lastSession, 'Pull 2',
    'Der Name kommt aus `workout_sessions.name` — nicht aus einer '
    + 'festen Zeichenkette wie „Push B · Wed".')
})

test('G-440/A1: die Saetze zaehlen NUR die juengste Sitzung', () => {
  const z = gerechnet()
  // `brust`: drei Saetze in A, ZWEI in B. Die Erholung fragt, was
  // zuletzt anlag — nicht die Summe ueber alle Zeiten.
  assert.equal(z.brust.sets, 2,
    'Fuenf waere die Summe ueber beide Sitzungen — die Erholung '
    + 'rechnet aber mit dem letzten Reiz.')
  // `ruecken` kam nur in B vor: vier Saetze.
  assert.equal(z.ruecken.sets, 4)
})

test('G-440/A1: ein Satz zaehlt fuer JEDEN zugeordneten Muskel', () => {
  // `[read]` **Bis C-487 die Rolle gewichtet** — und die Kachel
  // sagt es.
  const z = gerechnet()
  assert.equal(z.brust.sets, 2, 'primary')
  assert.equal(z.trizeps.sets, 2, 'secondary — gleiches Gewicht')
  // `[read]` **`rollen` zaehlt ueber ALLE Sitzungen**, `sets` nur
  // die juengste — zwei verschiedene Fragen. Die erste Fassung
  // dieser Probe verwechselte sie.
  assert.equal(z.trizeps.rollen.secondary, 5)
  assert.equal(z.trizeps.rollen.primary, 0)
  assert.equal(z.brust.rollen.primary, 5,
    'Ueber ALLE Sitzungen gezaehlt — das ist der Ausweis fuer '
    + 'C-487, nicht die Satzzahl.')
})

test('G-440: wo kein Satz zeigt, gibt es KEINEN Eintrag', () => {
  // ══ Der Kern: keine erfundene Zahl ════════════════════════════
  //
  // **Auftrag:** *„KEINE Zahl erfinden — wo kein Satz auf einen
  // Muskel zeigt, hat er keinen Wert."*
  const z = gerechnet()
  assert.equal(z.waden, undefined,
    '`waden` kommt in keinem Satz vor — dann steht dort NICHTS. '
    + 'Ein `0` saehe aus wie „gemessen, aber null Saetze".')
  assert.deepEqual(Object.keys(z).sort(),
    ['bizeps', 'brust', 'ruecken', 'trizeps'])
})

test('G-440: ein Satz ohne Kette faellt weg, statt zu raten', () => {
  // `[read]` **Die Gegenrichtung** — ein verwaister Satz darf
  // keinen Muskel erfinden.
  const t = tagebuch()
  t.saetze.push({ workout_exercise_id: 'gibtesnicht' })
  t.saetze.push({ workout_exercise_id: null })
  const z = muskelzustaende(t.saetze, t.uebungen, t.sitzungen, t.zuordnungen, JETZT)
  assert.equal(Object.keys(z).length, 4, 'Weiter genau vier Muskeln.')
  assert.equal(z.brust.sets, 2, 'Und die Satzzahl bleibt unveraendert.')
})

test('G-440: eine Sitzung OHNE Datum zaehlt nicht', () => {
  // `[read]` **Ohne Datum gibt es keine „Stunden seit"** — und ein
  // geratenes Datum waere genau die Sorte Zahl, die Tom
  // beanstandet hat.
  const t = tagebuch()
  t.sitzungen = t.sitzungen.map(s =>
    (s.id === 'sB' ? { ...s, session_date: null } : s))
  const z = muskelzustaende(t.saetze, t.uebungen, t.sitzungen, t.zuordnungen, JETZT)
  assert.equal(z.brust.datum, '2026-09-01',
    'Dann gilt die aeltere Sitzung mit Datum.')
  assert.equal(z.brust.sets, 3, 'Und deren Saetze.')
  assert.equal(z.ruecken, undefined,
    '`ruecken` kam NUR in der datumslosen Sitzung vor — also kein '
    + 'Eintrag, keine erfundene Stunde.')
})

test('G-440/A4: der Deckungsbericht nennt, was fehlt', () => {
  // **Tom:** *„was noch geschaetzt ist, steht dran."*
  const d = deckungsbericht(gerechnet(), 105)
  assert.equal(d.gemessen, 4)
  assert.equal(d.gesamt, 105)
  assert.equal(d.ohneDaten, 101,
    'Die Luecke wird GENANNT, nicht verschwiegen — C-466 macht es '
    + 'mit `unmapped_taken_log_count` vor.')
  assert.equal(d.rollenUngewichtet, true,
    'Bis C-487 zaehlt ein Satz fuer jeden Muskel gleich. Kippt das '
    + 'auf `false`, ohne dass die Rolle wirklich gewichtet wird, '
    + 'behauptet die Kachel eine Genauigkeit, die es nicht gibt.')
})

test('G-440: `jetzt` wird hereingereicht, nicht genommen', () => {
  // `[read]` **Sonst waere die Funktion nicht pruefbar** — und die
  // Stundenzahl haenge davon ab, wann die Probe laeuft.
  const t = tagebuch()
  const frueh = muskelzustaende(t.saetze, t.uebungen, t.sitzungen, t.zuordnungen,
    new Date('2026-09-10T00:00:00Z'))
  const spaet = muskelzustaende(t.saetze, t.uebungen, t.sitzungen, t.zuordnungen,
    new Date('2026-09-20T00:00:00Z'))
  assert.equal(frueh.brust.hours, 0)
  assert.equal(spaet.brust.hours, 240)
})

test('G-440: ein Muskel NUR in datumslosen Sitzungen faellt ganz weg', () => {
  // ══ Der blinde Fleck, den die Gegenprobe fand ═════════════════
  //
  // `[cmd]` **Die Sabotage „ein Muskel OHNE Satz bekommt eine 0"
  // blieb GRUEN** — in den Proben oben hatte JEDE Sitzung ein
  // Datum, also wurde der Zweig nie erreicht.
  //
  // `[read]` **Hier hat KEINE Sitzung ein Datum** — dann muss die
  // Rechnung leer ausgehen, statt Nullen zu erfinden. **Eine `0`
  // saehe aus wie „gemessen: vor null Stunden, null Saetze".**
  const t = tagebuch()
  const ohneDatum = t.sitzungen.map(x => ({ ...x, session_date: null }))
  const z = muskelzustaende(t.saetze, t.uebungen, ohneDatum, t.zuordnungen, JETZT)
  assert.deepEqual(z, {},
    'Ohne ein einziges Datum gibt es KEINEN Eintrag — auch keinen '
    + 'mit hours: 0.')
})

test('G-440: eine Sitzung ohne Datum zaehlt auch ihre SAETZE nicht', () => {
  // `[cmd]` **Die Sabotage „eine Sitzung ohne Datum bekommt ein
  // erfundenes" blieb GRUEN** — die Proben massen nur, WELCHE
  // Sitzung gewinnt, nicht ob ihre Saetze mitzaehlen.
  //
  // `[read]` **Sitzung B (spaeter, ohne Datum) traegt zwei
  // Brust-Saetze.** **Faellt der Datumsfilter weg, landen sie in
  // der Zaehlung der Sitzung A** — und die Zahl waere falsch,
  // ohne dass es auffiele.
  const t = tagebuch()
  const sitzungen = t.sitzungen.map(x =>
    (x.id === 'sB' ? { ...x, session_date: null } : x))
  const z = muskelzustaende(t.saetze, t.uebungen, sitzungen, t.zuordnungen, JETZT)
  assert.equal(z.brust.sets, 3,
    'NUR die drei Saetze aus Sitzung A. Die zwei aus der '
    + 'datumslosen Sitzung B duerfen nicht mitzaehlen.')
  assert.equal(z.brust.lastSession, 'Push 1')
  // Und die Rollen ebenfalls nicht.
  assert.equal(z.brust.rollen.primary, 3,
    'Auch der Rollenzaehler darf die datumslose Sitzung nicht '
    + 'mitnehmen — sonst stimmt der Ausweis fuer C-487 nicht.')
})
