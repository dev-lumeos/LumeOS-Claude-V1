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

const SETZEN = () => ohneKommentare(lies(join(GOALS, 'phase-setzen.tsx')))
const AKTIONEN = () => ohneKommentare(lies(join(GOALS, 'phase-aktionen.ts')))
const WRITE = () => ohneKommentare(lies(join(LIB, 'phase-write.ts')))
const ANSICHT = () => ohneKommentare(lies(join(GOALS, 'ansicht.tsx')))

describe('G-513 — die Phase laesst sich setzen', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(SETZEN().length > 1000, 'phase-setzen.tsx nicht gefunden')
    assert.ok(WRITE().length > 1000, 'phase-write.ts nicht gefunden')
  })

  // ── 1 · Die Funktionen werden gerufen ────────────────────────────
  for (const fn of ['goal_phase_start', 'goal_phase_end', 'phase_transition_respond']) {
    it(`${fn} hat einen Aufrufer`, () => {
      assert.match(WRITE(), new RegExp(`rpc\\(\\s*'${fn}'`),
        `${fn} wird nicht gerufen — der Schreibweg ist wieder tot`)
    })
  }

  it('die Oberflaeche haengt an den Serveraktionen', () => {
    const s = SETZEN()
    for (const a of ['phaseStartenAktion', 'phaseBeendenAktion',
      'vorschlagBeantwortenAktion']) {
      assert.match(s, new RegExp(`\\b${a}\\b`), `${a} wird nicht benutzt`)
    }
  })

  it('die Kacheln haengen im Reiter', () => {
    const a = ANSICHT()
    for (const k of ['PhaseBeginnen', 'PhaseBeenden', 'PhaseVorschlag']) {
      assert.match(a, new RegExp(`<${k}[\\s/>]`),
        `${k} wird nicht gerendert — gebaut und unerreichbar`)
    }
  })

  // ── 2 · Nur die Serveraktion ueberquert die Grenze ───────────────
  it('die Client-Datei importiert den Schreibweg NICHT als Wert', () => {
    const roh = lies(join(GOALS, 'phase-setzen.tsx'))
    assert.doesNotMatch(roh, /^import\s+\{[^}]*\}\s+from\s+'[^']*goals\/phase-write'/m,
      'Wertimport aus phase-write — das zieht next/headers ins '
      + 'Browserbuendel (A-30 / G-412)')
  })

  it('die Serveraktion traegt die Marke', () => {
    assert.match(lies(join(GOALS, 'phase-aktionen.ts')), /^'use server'/,
      "phase-aktionen.ts ohne 'use server'")
  })

  // ── 3 · Die Sperre der Datenbank wird VORHER gezeigt ─────────────
  it('ein laufende Phase sperrt das Raster', () => {
    const s = SETZEN()
    assert.match(s, /pointerEvents:\s*aktiv\s*\?\s*'none'/,
      'das Raster bleibt bedienbar, obwohl eine Phase laeuft — '
      + 'der Nutzer laeuft in Fehler 23505')
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

  // ── 6 · Die Antwort behauptet keinen Wechsel ─────────────────────
  it('nach dem Annehmen steht NICHT, dass gewechselt wurde', () => {
    const s = SETZEN()
    // `[cmd]` **`phase_transition_respond` schreibt nur die Antwort**
    // (`422_…sql:53-60`). `[read]` **Ein „gewechselt" waere eine
    // Falschaussage.**
    assert.doesNotMatch(s, /gewechselt['"\s]*\}/,
      'die Kachel behauptet einen Wechsel, den die Funktion nicht tut')
    assert.match(s, /Gewechselt ist damit/,
      'der Satz fehlt, der sagt, dass noch nichts gewechselt ist')
  })

  // ── 7 · Die Leseseite schreibt nicht ─────────────────────────────
  it('phase_transition_recommendation wird NICHT beim Anzeigen gerufen', () => {
    // `[cmd]` **Die Funktion macht ein `UPDATE`** (`422_…sql:50`) —
    // **eine Leseseite darf nicht schreiben.**
    for (const [name, q] of [['ansicht', ANSICHT()], ['setzen', SETZEN()],
      ['write', WRITE()], ['aktionen', AKTIONEN()]] as const) {
      assert.doesNotMatch(q, /rpc\(\s*'phase_transition_recommendation'/,
        `${name} ruft die Empfehlungsfunktion — sie SCHREIBT`)
    }
  })

  // ── 8 · Kein Leerfeld ohne Erklaerung ────────────────────────────
  it('ohne Vorschlag steht eine Erklaerung, kein leeres Feld', () => {
    const s = SETZEN()
    assert.match(s, /geplante Ende/,
      'der Leersatz nennt die erste Bedingung nicht')
    assert.match(s, /zwei Körpermessungen|zwei Koerpermessungen/,
      'der Leersatz nennt die zweite Bedingung nicht')
  })

  // ── 9 · parameters bleibt leer, und das steht da ─────────────────
  it('kein erfundener parameters-Schluessel', () => {
    const w = WRITE()
    assert.doesNotMatch(w, /calorie_surplus_kcal|calorie_deficit_kcal|calorie_target/,
      'die Oberflaeche erfindet einen parameters-Schluessel — '
      + 'welcher gilt, entscheidet G-511 bei Codex')
    assert.doesNotMatch(w, /p_parameters:/,
      'parameters wird geschrieben, obwohl der Schluessel offen ist')
  })
})
