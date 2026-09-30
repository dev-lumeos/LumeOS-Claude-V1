/**
 * G-553 — ein Tokenfehler sieht aus wie ein Datenfehler,
 *         und das Mockup fehlt
 *
 * **Tom, 2026-09-29, 16:56, auf dem Phase-Reiter:**
 *
 *     Goals konnten nicht geladen werden
 *     body_composition_navy: JWT issued at future
 *
 * `[cmd]` **Zwei getrennte Fehler, keiner davon ein Datenfehler.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { fehlerart, fehlertexte } from '../../../../lib/goals/ladefehler'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))
const A = () => lies(join(GOALS, 'ansicht.tsx'))

// ════════════════════════════════════════════════════════════════
// A2 — der Mockup-Teil haengt nicht am Ladefehler
// ════════════════════════════════════════════════════════════════
//
// `[read]` **Punkt 2 des Auftrags ist der eigentliche Befund:** eine
// Seite, die bei einem Ladefehler nichts mehr zeigt, verliert auch
// das, was ohne Daten funktioniert.

/**
 * Die zehn Reiter und ihr Mockup-Bauteil.
 *
 * `[cmd]` **Gemessen an `tabs()` in `ansicht.tsx`**, 2026-09-29 —
 * nicht aus dem Gedaechtnis. **Sieben lagen im Fehlerzweig**
 * (`goals`, `metrics`, `measure`, `comp`, `tdee`, `phase`,
 * `physique`), **drei nicht** (`cross`, `timeline`, `poses`) — und
 * genau die drei haben ihren Entwurf behalten.
 */
const REITER: Array<[string, string]> = [
  ['goals', 'GoalsGoalsReferenz'],
  ['phase', 'GoalsPhaseView'],
  ['tdee', 'GoalsTdeeReferenz'],
  ['cross', 'GoalsCrossReferenz'],
  ['timeline', 'TimelineTab'],
  ['metrics', 'GoalsMetricsReferenz'],
  ['measure', 'GoalsMeasureReferenz'],
  ['comp', 'GoalsCompReferenz'],
  ['physique', 'GoalsPhysiqueView'],
  ['poses', 'GoalsPosesView'],
]

describe('G-553/A2 — jeder Reiter zeigt seinen Mockup-Teil', () => {
  it('die zehn Reiter aus tabs() sind vollstaendig erfasst', () => {
    // `[read]` **Die Wurzelmarke:** waechst die Reiterliste, ohne
    // dass diese Pruefung nachzieht, misst sie den neuen nicht.
    const q = A()
    const i = q.indexOf('function tabs(')
    // `[read]` **Bis zum Ende des ARRAYS, nicht bis zur ersten `}`**
    // — die schliesst das erste Reiterobjekt, und die Pruefung sah
    // genau einen Reiter.
    const block = q.slice(i, q.indexOf(']', q.indexOf('return [', i)))
    // `[read]` **`match` statt `matchAll`** — ein Spread ueber
    // `matchAll` faellt im Gate mit TS2802 (dieselbe Stelle wie in
    // G-422).
    const ids = (block.match(/id: '[a-z]+'/g) ?? [])
      .map(t => t.slice(5, -1))
    assert.deepEqual(ids.sort(), REITER.map(([r]) => r).sort(),
      'die Reiterliste weicht von dieser Pruefung ab')
  })

  it('je Reiter steht ein Mockup-Bauteil im Quelltext', () => {
    const q = A()
    for (const [reiter, bauteil] of REITER) {
      assert.ok(q.includes(`<${bauteil}`),
        `Reiter „${reiter}": „${bauteil}" steht nicht in der Ansicht `
        + '— dann hat der Reiter keinen Entwurf (E-68/G-365)')
    }
  })

  it('je Reiter steht ein Trennstrich', () => {
    // `[cmd]` **Vier Reiter tragen ihn direkt** (`phase`, `physique`,
    // `timeline`), **die uebrigen in ihrem `…Referenz`-Bauteil** —
    // deshalb wird BEIDES gezaehlt.
    const q = A()
    const m = lies(join(GOALS, 'mockup-referenz.tsx'))
    const direkt = (q.match(/<ReferenzTrenner/g) ?? []).length
    const inReferenz = (m.match(/<ReferenzTrenner/g) ?? []).length
    assert.ok(direkt >= 3,
      `nur ${direkt} Trennstriche direkt in der Ansicht — `
      + 'phase, physique und timeline brauchen je einen')
    assert.ok(inReferenz >= 6,
      `nur ${inReferenz} Trennstriche in den Referenz-Bauteilen — `
      + 'jedes traegt seinen eigenen')
  })

  // ── Der eigentliche Befund ──────────────────────────────────────
  it('der Ladefehler ersetzt NICHT mehr den ganzen Reiter', () => {
    const q = A()
    // `[cmd]` **Hier stand ein Ternaer:** `ladefehler && [...]
    // .includes(tab) ? <Card…> : <>…alle Reiter…</>`. **Der
    // `else`-Zweig trug den kompletten Inhalt** — Trennstrich und
    // Mockup inbegriffen.
    assert.ok(!/\.includes\(tab\)\s*\?/.test(q),
      'der Ladefehler steht wieder in einem Ternaer ueber den '
      + 'Reitern — dann verschwindet mit den Daten auch das Mockup')
  })

  it('nur der ECHTE Teil haengt am Ladefehler', () => {
    const q = A()
    assert.match(q, /const echtAus = echt\.ladefehler !== null/,
      'es gibt keinen getrennten Schalter fuer den echten Teil')
    // `[read]` **Die datengetragenen Bauteile sind gesperrt** — die
    // Mockup-Bauteile nicht.
    for (const bauteil of ['ZielKarten', 'GoalsTDEEView', 'KoerperMetriken',
      'KoerperUmfaenge', 'CompositionTab', 'StrategieWahl']) {
      const i = q.indexOf(`<${bauteil}`)
      assert.ok(i > 0, `„${bauteil}" steht nicht mehr in der Ansicht`)
      const davor = q.slice(Math.max(0, i - 260), i)
      assert.ok(davor.includes('echtAus'),
        `„${bauteil}" haengt nicht am Ladefehler — es bekaeme leere `
        + 'Daten und zeigte eine Null wie ein Ergebnis')
    }
  })

  it('kein Mockup-Bauteil haengt am Ladefehler', () => {
    const q = A()
    // `[read]` **Die Gegenrichtung** — sonst waere „nur der echte
    // Teil" erfuellt, indem man alles sperrt.
    for (const [, bauteil] of REITER) {
      const i = q.indexOf(`<${bauteil}`)
      if (i < 0) continue
      const davor = q.slice(Math.max(0, i - 120), i)
      assert.ok(!/echtAus &&\s*$/.test(davor),
        `„${bauteil}" haengt am Ladefehler — der Entwurf braucht `
        + 'keine Daten (G-553/A2)')
    }
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — Sitzungsfehler von Datenfehler trennen
// ════════════════════════════════════════════════════════════════

describe('G-553/A1 — der Tokenfehler wird als solcher benannt', () => {
  it('der beobachtete Fall ist ein Sitzungsfehler', () => {
    // `[cmd]` **Toms Meldung, wortwoertlich.**
    assert.equal(
      fehlerart('body_composition_navy: JWT issued at future'), 'sitzung',
      'der beobachtete Fehler gilt als Datenfehler — dann prueft der '
      + 'Nutzer seine Ziele und das Problem ist die Anmeldung')
  })

  it('die uebrigen Tokenfehler auch', () => {
    for (const t of [
      'JWT expired',
      'PGRST301: JWT expired',
      'token is expired by 3m0s',
      'invalid claim: missing sub claim',
      'bad_jwt',
    ]) {
      assert.equal(fehlerart(t), 'sitzung',
        `„${t}" gilt als Datenfehler`)
    }
  })

  it('ein echter Datenfehler bleibt ein Datenfehler', () => {
    // `[read]` **Die Gegenrichtung** — sonst waere jeder Fehler ein
    // Sitzungsfehler, und der Nutzer meldet sich neu an, ohne dass
    // sich etwas aendert.
    for (const t of [
      'user_goals: relation does not exist',
      'body_composition_navy: function does not exist',
      'new row violates row-level security policy',
      'column ziele.foo does not exist',
    ]) {
      assert.equal(fehlerart(t), 'daten', `„${t}" gilt als Sitzungsfehler`)
    }
  })

  it('NO_SESSION ist ohne Textpruefung eindeutig', () => {
    assert.equal(fehlerart('Keine angemeldete Session.', 'NO_SESSION'),
      'sitzung', 'der eindeutige Code wird nicht genutzt')
  })

  it('ohne Text wird nichts behauptet', () => {
    assert.equal(fehlerart(null), 'daten',
      'ohne Text wird ein Sitzungsfehler behauptet')
  })

  it('der Sitzungssatz sagt, was zu tun ist', () => {
    const t = fehlertexte('sitzung')
    assert.match(t.satz, /neu an/,
      'der Satz nennt die Handlung nicht')
    // `[read]` **Er darf nicht nach Datenverlust klingen.**
    assert.match(t.satz, /unveraendert/,
      'der Satz beruhigt nicht ueber die Daten — „Sitzung abgelaufen" '
      + 'liest sich sonst wie „Daten weg"')
  })

  it('die beiden Arten sagen NICHT dasselbe', () => {
    assert.notEqual(fehlertexte('sitzung').titel, fehlertexte('daten').titel,
      'beide Arten zeigen denselben Titel — dann trennt nichts')
  })

  // ── Die Kachel ──────────────────────────────────────────────────
  it('der technische Text bleibt sichtbar', () => {
    // `[cmd]` **Auftrag A1:** *„Der technische Text bleibt sichtbar,
    // er hat den Befund moeglich gemacht."*
    const q = A()
    const i = q.indexOf('function LadefehlerKachel')
    const rumpf = q.slice(i, q.indexOf('export function GoalsAnsicht'))
    assert.match(rumpf, /data-ladefehler-text/,
      'der technische Text traegt keine Marke')
    assert.match(rumpf, /\{text\}/,
      'der technische Text wird nicht ausgegeben — ein Fehler ohne '
      + 'Text waere schlechter als der falsche')
  })

  it('der Sitzungsfall traegt den WEG zur Anmeldung', () => {
    const q = A()
    const i = q.indexOf('function LadefehlerKachel')
    const rumpf = q.slice(i, q.indexOf('export function GoalsAnsicht'))
    assert.match(rumpf, /data-ladefehler-anmelden/,
      'es gibt keinen Knopf zur Anmeldung')
    assert.match(rumpf, /href="\/login"/,
      'der Knopf zeigt nicht auf die Anmeldung')
    // `[read]` **Der Knopf braucht einen TEXT.** Ohne ihn steht ein
    // leerer Kasten da — die Sabotage „Anmeldeknopf ohne Text" blieb
    // gruen, weil niemand danach fragte.
    const knopf = rumpf.slice(rumpf.indexOf('data-ladefehler-anmelden'))
    const beschriftung = knopf.slice(knopf.indexOf('>') + 1,
      knopf.indexOf('</a>')).trim()
    assert.ok(beschriftung.length > 3,
      `der Anmeldeknopf traegt keine Beschriftung („${beschriftung}") `
      + '— ein leerer Kasten ist kein Weg')
    assert.match(rumpf, /art === 'sitzung' &&[\s\S]{0,400}data-ladefehler-anmelden/,
      'der Anmeldeknopf steht auch bei einem Datenfehler — dort '
      + 'aendert eine Neuanmeldung nichts')
  })

  it('die Marke steht nicht an der Card', () => {
    // `[read]` **`Card` nimmt nur benannte Requisiten** und liesse
    // `data-…` fallen (`primitives.tsx:61-63`) — die Marke waere im
    // DOM nicht zu finden.
    const q = A()
    assert.ok(!/<Card[^>]*data-ladefehler/.test(q),
      'die Marke haengt an der Card — sie kommt nicht im DOM an')
    assert.match(q, /<span data-ladefehler=\{art\}/,
      'die Marke steht an keinem durchreichenden Element')
  })
})
