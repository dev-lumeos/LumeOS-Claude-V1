/**
 * G-564 — `ladePhase` nahm die erste fuer die einzige
 *
 * `[cmd]` **Codex bei der Abgrenzung von G-559, woertlich:**
 * `phase_am(user, stichtag)` liefert kuenftig **alle** am Tag
 * gueltigen Zielphasen. **`ladePhase` darf `data[0]` daher nicht mehr
 * als die Nutzerphase behandeln.**
 *
 * `[cmd]` **Gemessen 2026-09-30: live steht noch `LIMIT 1`**
 * (Position 463 in `prosrc`), `phase_eines_ziels_am` gibt es dort
 * noch nicht. `[read]` **Heute ist `data[0]` zufaellig richtig, mit
 * dem Einspielen wird es falsch** — ohne Fehlermeldung und ohne rote
 * Probe. **Deshalb diese Pruefungen VOR dem Einspielen.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const PIPELINE = join(HIER, '..', '..', '..', '..', '..', '..',
  'supabase', '_pipeline', '11_goals')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))
const L = () => lies(join(HIER, '..', 'lesen.ts'))
const A = () => lies(join(GOALS, 'ansicht.tsx'))

// ════════════════════════════════════════════════════════════════
// A3 — der Rueckfall ist verboten, an der WIRKUNG gemessen
// ════════════════════════════════════════════════════════════════

describe('G-564/A3 — kein data[0] auf phase_am', () => {
  /**
   * `[read]` **Diese Pruefung sucht kein WORT.** Sie schneidet den
   * Rumpf der Funktion heraus, die `phase_am` ruft, und prueft, was
   * mit dem Ergebnis geschieht.
   *
   * `[read]` **Zwei meiner Waechter waren heute zuerst blind**, weil
   * sie Woerter suchten (G-554, G-557) — **dieselbe Falle liegt
   * hier.**
   */
  const rumpfVon = (name: string): string => {
    const q = L()
    const i = q.indexOf(`export async function ${name}`)
    assert.ok(i > 0, `${name} gibt es nicht`)
    // Bis zur naechsten Deklaration auf Spaltenebene.
    const j = q.indexOf('\nexport ', i + 10)
    return q.slice(i, j > 0 ? j : i + 2200)
  }

  it('der Aufrufer von phase_am nimmt kein data[0]', () => {
    const r = rumpfVon('ladePhasen')
    assert.match(r, /\.rpc\('phase_am'/,
      'ladePhasen ruft phase_am nicht mehr')
    assert.ok(!/data\[0\]/.test(r),
      'phase_am wird wieder mit data[0] gelesen — dann zeigt der '
      + 'Reiter EINE Phase, wo zwei gelten, und welche entscheidet '
      + 'die Sortierung')
  })

  it('er gibt eine Liste zurueck, keine einzelne Phase', () => {
    const q = L()
    assert.match(q, /export async function ladePhasen\(\s*userId: string, stichtag: string,\s*\): Promise<Phase\[\]>/,
      'ladePhasen gibt keine reine Liste zurueck — auch '
      + 'Promise<Phase[] | null> ist falsch: dann muesste jeder '
      + 'Konsument wieder auf null pruefen, und die Form "eine oder '
      + 'keine" waere zurueck')
    assert.ok(!/export async function ladePhase\(/.test(q),
      'die alte Einzahlform gibt es wieder — zwei Wege driften')
  })

  it('die Zeilen werden ALLE abgebildet, nicht die erste', () => {
    const r = rumpfVon('ladePhasen')
    assert.match(r, /for \(const r of zeilen\)/,
      'es wird nicht ueber die Zeilen gelaufen')
    assert.match(r, /raus\.push\(p\)/,
      'die Phasen werden nicht gesammelt')
  })

  // ── Wo data[0] BLEIBEN darf, und warum ──────────────────────────
  it('phase_eines_ziels_am darf data[0] nehmen', () => {
    // `[cmd]` **Die Funktion traegt ihr `LIMIT 1` mit Absicht** —
    // ihr eigener Kommentar: *„loest nur ueberlappende Historie
    // auf"*. `[read]` **Je Ziel EINE Zeile, und das steht im Namen.**
    const r = rumpfVon('ladeZielphase')
    assert.match(r, /\.rpc\('phase_eines_ziels_am'/,
      'die Zielfunktion wird nicht gerufen')
    assert.match(r, /data\[0\]/,
      'hier waere data[0] richtig — die Funktion liefert eine Zeile')
  })

  it('die vier anderen data[0] sind nicht betroffen', () => {
    // `[cmd]` **Gezaehlt 2026-09-30: fuenf Stellen lesen `data[0]`**,
    // vier davon auf Funktionen, die eine Zeile liefern:
    //
    //     body_composition_navy   LIMIT im Rumpf
    //     adaptive_tdee           je Nutzer eine Zeile (gemessen: 1)
    //     goal_progress_at        LIMIT im Rumpf
    //     goal_milestone_status   nimmt EINE Kennung
    //
    // `[read]` **Die Zahl steht hier, damit eine sechste auffaellt.**
    const q = L()
    const treffer = (q.match(/data\[0\]/g) ?? []).length
    assert.equal(treffer, 5,
      `${treffer} Stellen lesen data[0], erwartet 5 — eine neue `
      + 'gehoert geprueft: liefert ihre Funktion wirklich eine Zeile?')
  })
})

// ════════════════════════════════════════════════════════════════
// A2 — je Stelle die richtige Bedeutung
// ════════════════════════════════════════════════════════════════

describe('G-564/A2 — die Anzeige sagt, wie viele', () => {
  it('der Phasenkopf zeigt JEDE Phase', () => {
    // `[cmd]` **Hier stand `echt.phase`** — die erste aus `phase_am`.
    const q = A()
    assert.match(q, /echt\.phasen\.map\(p => \(/,
      'der Phasenkopf zeigt nicht je Phase eine Kachel')
    assert.match(q, /<PhaseEcht key=\{p\.phase_id\}/,
      'die Kacheln haben keinen stabilen Schluessel')
  })

  it('„Phase beginnen" haengt an der ZAHL, nicht an einer Auswahl', () => {
    // `[read]` **Bei zwei laufenden Phasen ist `laufendePhase` null**
    // (die Wahl waere willkuerlich). `[read]` **Mit `!laufendePhase`
    // stuende dort „Phase beginnen", obwohl zwei laufen.**
    const q = A()
    assert.match(q, /laufendePhasen\.length === 0 && \(/,
      'der Startknopf haengt an einer Einzelphase — dann erscheint '
      + 'er, obwohl mehrere laufen')
    assert.ok(!/!echtAus && !laufendePhase && \(/.test(q),
      'die alte Bedingung steht wieder da')
  })

  it('bei mehreren sagt die Ansicht die Zahl', () => {
    const q = A()
    assert.match(q, /laufendePhasen\.length > 1 && \(/,
      'der Fall „mehrere laufen" wird nicht behandelt')
    assert.match(q, /data-mehrere-phasen=\{laufendePhasen\.length\}/,
      'die Zahl ist nicht am Schirm nachzaehlbar')
  })

  it('Beenden und Wechseln nur bei GENAU einer', () => {
    // `[read]` **Sonst waere jede Wahl eine stille Entscheidung** —
    // genau der Fehler, den G-559 in der Datenbank beseitigt hat.
    const q = A()
    assert.match(q, /laufendePhasen\.length === 1\s*\?/,
      'bei mehreren Phasen wird eine beliebige zum Bedienen gewaehlt')
    // `[cmd]` **Am BILD gefunden:** der Kopf sagte „2 Phasen laufen",
    // darunter standen „Beenden" und „Wechseln" fuer EINE.
    // `[read]` **Zwei Quellen, zwei Zahlen** — `echt.phasen` kommt
    // aus `phase_am` (live noch `LIMIT 1`), `echt.offenePhasen` liest
    // die Tabelle. **Die Tabelle entscheidet, wie viele laufen.**
    assert.match(q, /const laufendePhasen = echt\.offenePhasen/,
      'die Zahl kommt aus der gedeckelten Quelle — dann widerspricht '
      + 'der Kopf den Bedienkacheln, solange phase_am LIMIT 1 traegt')
  })

  it('die Zeitachse zaehlt, was sie bekommt', () => {
    // `[cmd]` **`tab-timeline.tsx` druckt „N Phasen"** — mit
    // `phase ? [phase] : []` stand dort immer 1.
    const q = lies(join(GOALS, 'tab-timeline.tsx'))
    assert.match(q, /phasen: Phase\[\]/,
      'die Zeitachse nimmt weiter eine einzelne Phase')
    assert.ok(!/const phasen = phase \? \[phase\] : \[\]/.test(q),
      'die Liste wird wieder aus einer Einzelphase gebaut — dann '
      + 'steht dort „1 Phasen", auch wenn zwei gelten')
  })
})

// ════════════════════════════════════════════════════════════════
// Gegen die Funktion, die kommt
// ════════════════════════════════════════════════════════════════

describe('G-564 — gegen G-559 gehalten', () => {
  const SQL = () => readFileSync(join(PIPELINE, '559_phase_at_scope.sql'), 'utf8')

  it('phase_am verliert das LIMIT', () => {
    // `[read]` **Die Voraussetzung dieses Punktes.** Bliebe das
    // `LIMIT` stehen, waere der Umbau unnoetig — und diese Pruefung
    // sagt es.
    const q = SQL()
    const i = q.indexOf('FUNCTION goals.phase_am')
    const rumpf = q.slice(i, q.indexOf('COMMENT ON FUNCTION goals.phase_am', i))
    assert.ok(!/LIMIT/.test(rumpf),
      'phase_am traegt wieder ein LIMIT — dann ist die Mehrzahl hier '
      + 'falsch')
  })

  it('phase_eines_ziels_am behaelt es', () => {
    const q = SQL()
    const i = q.indexOf('FUNCTION goals.phase_eines_ziels_am')
    const rumpf = q.slice(i, q.indexOf('COMMENT ON FUNCTION goals.phase_eines_ziels_am', i))
    assert.match(rumpf, /LIMIT 1/,
      'die Zielfunktion verliert ihr LIMIT — dann ist data[0] dort '
      + 'nicht mehr richtig')
  })

  it('beide sortieren gleich', () => {
    // `[cmd]` **G-559/A3 hat einen Fehler gefunden, den niemand
    // gesucht hat:** vorher war nur nach `gueltig_ab DESC` sortiert,
    // **bei Gleichstand war das Ergebnis beliebig.**
    const q = SQL()
    const treffer = (q.match(/ORDER BY gp\.gueltig_ab DESC, gp\.created_at DESC, gp\.id DESC/g) ?? []).length
    assert.equal(treffer, 2,
      `${treffer} von 2 Funktionen sortieren vollstaendig — bei `
      + 'Gleichstand waere das Ergebnis sonst beliebig')
  })

  it('der Aufruf nennt die Parameter der neuen Funktion', () => {
    // `[cmd]` **`p_goal_id`, nicht `p_user_id`** — ein falscher Name
    // gaebe zur Laufzeit einen Fehler, den kein Typecheck sieht.
    assert.match(L(), /\{ p_goal_id: goalId, p_stichtag: stichtag \}/,
      'der Aufruf von phase_eines_ziels_am nennt andere Parameter '
      + 'als die Funktion')
  })
})

// ════════════════════════════════════════════════════════════════
// A4 — der Fall mit ZWEI Zeilen, an der Abbildung gemessen
// ════════════════════════════════════════════════════════════════

describe('G-564/A4 — zwei Zeilen werden zwei Phasen', () => {
  /**
   * `[read]` **Warum hier und nicht gegen die Datenbank:**
   * `phase_am` traegt live noch `LIMIT 1` (gemessen), und
   * `supabase/` gehoert Codex — **gegen die laufende Instanz wird
   * nicht geprueft** (CLAUDE.md:355). **Der Umbau steht in der
   * Kettendatei und wird von Tom eingespielt.**
   *
   * `[cmd]` **Am Schirm belegt, 2026-09-30:** `phase_am` gab **1**
   * Zeile zurueck, wo die Tabelle **2** fuehrt — und derselbe Rumpf
   * ohne `LIMIT` gibt 2. `[read]` **Genau darum geht dieser Punkt
   * vor dem Einspielen.**
   *
   * **Gemessen wird deshalb die STELLE, die aus Zeilen Phasen
   * macht** — mit zwei Zeilen als Eingabe.
   */
  it('die Abbildung laeuft ueber ALLE Zeilen', () => {
    // `[read]` **Die Sabotage, die das trifft:** `zeilen.slice(0, 1)`
    // oder `[zeilen[0]]`. **Beides laesst den Namen `ladePhasen`
    // stehen und die Liste zurueckgeben** — nur mit einem Eintrag.
    const q = L()
    const i = q.indexOf('export async function ladePhasen')
    const rumpf = q.slice(i, q.indexOf('\nexport ', i + 10))
    assert.ok(!/zeilen\.slice\(/.test(rumpf),
      'die Zeilen werden beschnitten — dann kommt bei zwei Phasen '
      + 'wieder eine an')
    assert.ok(!/zeilen\[0\]/.test(rumpf),
      'nur die erste Zeile wird abgebildet')
    assert.match(rumpf, /const zeilen = \(Array\.isArray\(data\) \? data : \[\]\)/,
      'das Ergebnis wird nicht als Liste genommen')
  })

  it('die Anzeige haengt an der LAENGE, nicht an einem Vorhandensein', () => {
    // `[cmd]` **Am Schirm gemessen, zwei offene Phasen an zwei
    // Zielen** (ueber den Dialog angelegt, `actual_end_date IS NULL`
    // in beiden Zeilen):
    //
    //     Kopfmarke            „2 Phasen laufen"
    //     Zielzeilen           2
    //     Zeitachse-Untertitel „2 Ziele · 1 Phasen"  <- phase_am
    //                          deckelt noch, das Zaehlen stimmt
    //
    // `[read]` **Die Zahl kommt aus der Liste** — sobald `phase_am`
    // beide liefert, steht dort 2, ohne dass hier etwas zu aendern
    // waere.
    const a = A()
    assert.match(a, /echt\.offenePhasen\.length === 1/,
      'die Kopfmarke unterscheidet Einzahl und Mehrzahl nicht')
    assert.match(a, /Phasen laufen/,
      'bei mehreren wird immer noch EINE genannt')
  })

  it('der Untertitel der Zeitachse zaehlt die Liste', () => {
    const q = lies(join(GOALS, 'tab-timeline.tsx'))
    assert.match(q, /\$\{phasen\.length\} Phasen/,
      'der Untertitel zaehlt nicht die uebergebene Liste')
  })
})
