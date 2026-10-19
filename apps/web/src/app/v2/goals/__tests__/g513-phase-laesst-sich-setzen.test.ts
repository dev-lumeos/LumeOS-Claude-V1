/**
 * G-513 — die Phase laesst sich setzen
 *
 * `[cmd]` **Fuenf Funktionen in der Datenbank, null Aufrufer** —
 * `goal_phase_start`, `goal_phase_end`,
 * `phase_transition_recommendation`, `phase_transition_respond`,
 * `phase_am`. **Dieselbe Klasse wie C-511 in G-468: ein Schreibweg
 * ohne Knopf.**
 *
 * `[read]` **Diese Datei misst die WIRKUNG, nicht das Wort:** ruft
 * die Oberflaeche die Funktionen, sperrt sie den Start hinter einer
 * laufenden Phase, und behauptet sie nach einer Zustimmung NICHT,
 * gewechselt zu haben?
 *
 * `[cmd]` **Der Schreibweg selbst ist gegen die Datenbank belegt**
 * (2026-09-26, `test-user@lumeos.local`): Start, Doppelstart
 * abgewiesen, leerer Grund abgewiesen, Enddatum vor Beginn
 * abgewiesen, Antwort geschrieben, Ende, danach Start wieder
 * moeglich. **Testzeilen geloescht, 5 Seedzeilen unveraendert.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..')
const LIB = join(HIER, '..', '..', '..', '..', 'lib', 'goals')

const lies = (p: string) => readFileSync(p, 'utf8')

/** Quelltext ohne Kommentare — sonst liest der Waechter seine
 *  eigene Begruendung (die Lehre aus G-512). */
function ohneKommentare(q: string): string {
  return q
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
}

// G-656: phase-setzen.tsx ist geloescht; Beenden und Vorschlag stehen im Planer (G-649).
const SETZEN = () => ohneKommentare(lies(join(GOALS, 'plan-seite.tsx')))
const AKTIONEN = () => ohneKommentare(lies(join(GOALS, 'phase-aktionen.ts')))
const WRITE = () => ohneKommentare(lies(join(LIB, 'phase-write.ts')))
const ANSICHT = () => ohneKommentare(lies(join(GOALS, 'ansicht.tsx')))

describe('G-513 — die Phase laesst sich setzen', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(SETZEN().length > 1000, 'plan-seite.tsx nicht gefunden')
    assert.ok(WRITE().length > 1000, 'phase-write.ts nicht gefunden')
  })

  // ── 1 · Die Funktionen werden gerufen ────────────────────────────
  // G-656: `phase_transition_respond` faellt heraus — Annehmen/Ablehnen hat der
  // Entwurf nicht (G-649, gemeldet), der Schreibweg ist geloescht.
  for (const fn of ['goal_phase_start', 'goal_phase_end']) {
    it(`${fn} hat einen Aufrufer`, () => {
      assert.match(WRITE(), new RegExp(`rpc\\(\\s*'${fn}'`),
        `${fn} wird nicht gerufen — der Schreibweg ist wieder tot`)
    })
  }

  it('die Oberflaeche haengt an den Serveraktionen', () => {
    const s = SETZEN()
    // G-615: Beginnen ist aus phase-setzen.tsx in den Planer gewandert
    // (und ins Anlegemodal, G-610) — beide ueber phasenzielAnlegenAktion.
    assert.match(lies(join(GOALS, 'planer.tsx')), /phasenzielAnlegenAktion\(/,
      'der Planer legt nicht an')
    for (const a of ['phaseBeendenAktion']) {
      assert.match(s, new RegExp(`\\b${a}\\b`), `${a} wird nicht benutzt`)
    }
  })

  it('die Kacheln haengen im Reiter', () => {
    const a = ANSICHT()
    // G-615: PhaseBeginnen ist weg, der Planer ist der Einstieg.
    assert.ok(!/<PhaseBeginnen[\s/>]/.test(a), 'die Phasenarten-Auswahl ist zurueck')
    assert.match(a, /<Planer[\s/>]/, 'Planer wird nicht gerendert — gebaut und unerreichbar')
    // G-649 (Tom 16.10.): die Kacheln fallen weg — Beenden steht im Bearbeiten
    // unter der laufenden Phase, der Vorschlag unter „Als nächstes".
    const p = ohneKommentare(lies(join(GOALS, 'plan-seite.tsx')))
    assert.match(p, /<PhaseBeendenFormular phaseId=\{p\.goal_phase_id\}/, 'Phase beenden ist im Planer unerreichbar')
    assert.match(p, /await phaseBeendenAktion\(phaseId, grund\.trim\(\), ende\)/)
    assert.match(p, /data-phase-beenden disabled=\{laeuft \|\| !grund\.trim\(\)\}/, 'ohne Grund laesst sich beenden')
    // G-669 (Nachtrag 18.10.): der Vorschlag kommt aus `goal_als_naechstes`, nicht mehr aus `laufend.empfohlen`
    assert.match(p, /alsNaechstes \? <span data-plan-empfohlen>Empfohlen ab \{dstr\(alsNaechstes\.startdatum\)\}/, 'der Wechselvorschlag fehlt unter „Als nächstes"')
  })

  // ── 2 · Nur die Serveraktion ueberquert die Grenze ───────────────
  it('die Client-Datei importiert den Schreibweg NICHT als Wert', () => {
    for (const roh of [lies(join(GOALS, 'plan-seite.tsx')), lies(join(GOALS, 'planer.tsx'))]) assert.doesNotMatch(roh, /^import\s+\{[^}]*\}\s+from\s+'[^']*goals\/phase-write'/m,
      'Wertimport aus phase-write — das zieht next/headers ins '
      + 'Browserbuendel (A-30 / G-412)')
  })

  it('die Serveraktion traegt die Marke', () => {
    assert.match(lies(join(GOALS, 'phase-aktionen.ts')), /^'use server'/,
      "phase-aktionen.ts ohne 'use server'")
  })

  // ── 3 · Die Sperre der Datenbank wird VORHER gezeigt ─────────────
  it('es gibt kein Raster zum Beginnen mehr (G-615)', () => {
    // Hier stand: „eine laufende Phase sperrt das Raster" (23505). Das
    // Raster ist weg — begonnen wird mit Ziel (Anlegemodal, Planer).
    const s = SETZEN()
    assert.ok(s.length > 1000 && !/function (PhaseBeginnen|PhaseWechseln)/.test(s + ANSICHT()),
      'das Raster aus G-513/G-534 ist zurueck')
  })

  it('23505 wird uebersetzt, nicht durchgereicht', () => {
    assert.match(WRITE(), /PHASE_LAEUFT/,
      'der Doppelstart hat keinen eigenen Code')
    assert.match(WRITE(), /23505/,
      'der Code aus dem Funktionsrumpf wird nicht erkannt')
  })

  // ── 4 · Der Grund ist Pflicht, sichtbar vor dem Abschicken ───────
  it('ohne Grund ist der Beenden-Knopf tot', () => {
    assert.match(SETZEN(), /data-phase-beenden[\s\S]{0,160}?!grund\.trim\(\)/,
      'der Knopf laesst sich ohne Grund druecken — goal_phase_end '
      + 'weist ihn dann mit 22023 ab')
  })

  // ── 5 · Neun Phasenarten, nicht sieben ───────────────────────────
  it('alle neun Arten aus dem CHECK stehen zur Wahl', () => {
    const r = lies(join(LIB, 'phase-regeln.ts'))
    const arten = ['fat_loss', 'lean_bulk', 'maintenance', 'recomp',
      'contest_prep', 'reverse_diet', 'expert_bb_annual',
      'mini_cut', 'peak_week']
    for (const a of arten) {
      assert.match(r, new RegExp(`'${a}'`),
        `${a} fehlt — der CHECK erlaubt sie, die Oberflaeche nicht`)
    }
  })

  // ── 6 · (G-656) „nach dem Annehmen kein ‚gewechselt'" ist entfallen:
  //        es gibt kein Annehmen mehr; der Vorschlag ist eine Anzeige unter
  //        „Als nächstes", Uebernehmen heisst Phase im Plan ergaenzen.
  it('der Vorschlag behauptet keinen Wechsel', () => {
    assert.match(SETZEN(), /Übernehmen = Phase im Plan ergänzen/)
    assert.doesNotMatch(SETZEN(), /gewechselt/)
  })

  // ── 7 · Die Leseseite schreibt nicht ─────────────────────────────
  it('phase_transition_recommendation wird NICHT beim Anzeigen gerufen', () => {
    // `[cmd]` **Die Funktion macht ein `UPDATE`** (`422_…sql:50`) —
    // **eine Leseseite darf nicht schreiben.**
    for (const [name, q] of [['ansicht', ANSICHT()], ['plan-seite', SETZEN()], ['plan-read', lies(join(LIB, 'plan-read.ts'))],
      ['write', WRITE()], ['aktionen', AKTIONEN()]] as const) {
      assert.doesNotMatch(q, /rpc\(\s*'phase_transition_recommendation'/,
        `${name} ruft die Empfehlungsfunktion — sie SCHREIBT`)
    }
  })

  // ── 8 · Kein Leerfeld ohne Erklaerung ────────────────────────────
  it('ohne Vorschlag steht ein Satz, kein leeres Feld (G-656, Text G-677)', () => {
    // G-656 verlangte hier einen Satz statt eines leeren Felds. G-677 (Tom 19.10.) gibt ihn vor: ohne Leser und
    // ohne Folgephase „Nach Planende ohne Folgephase: Erhaltung. Phase ergänzen (✎)".
    assert.match(SETZEN(), /: <span data-plan-ohne-folge>Nach Planende ohne Folgephase: Erhaltung\. Phase ergänzen \(<button/)
    assert.match(SETZEN(), /\{alsNaechstes && <div[^\n]*<span className="ge-eb">Als nächstes<\/span>/)
  })

  // ── 9 · parameters bleibt leer, und das steht da ─────────────────
  it('kein erfundener parameters-Schluessel', () => {
    const w = WRITE()
    assert.doesNotMatch(w, /calorie_surplus_kcal|calorie_deficit_kcal|calorie_target/,
      'die Oberflaeche erfindet einen parameters-Schluessel — '
      + 'welcher gilt, entscheidet G-511 bei Codex')
    // `[cmd]` **G-628 Teil 2:** der Schluessel ist entschieden — G-626
    // liest `g626_confirmed_warnings`. Der Schreibweg reicht NUR durch,
    // was der Aufrufer uebergibt; er erfindet keinen eigenen Schluessel.
    assert.match(w, /p_parameters: e\.parameters \?\? \{\},/,
      'parameters wird anders als durchgereicht geschrieben')
    assert.doesNotMatch(w, /p_parameters: \{\s*[a-z_]+:/,
      'der Schreibweg setzt selbst einen parameters-Schluessel')
  })
})
