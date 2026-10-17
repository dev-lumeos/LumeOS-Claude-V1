/**
 * G-539 — der Phasen-Editor, persoenlicher Override
 *
 * **Tom, 2026-09-29:** *„subnav phase engine: user kann seine goals
 * planen, terminieren, **editieren**."*
 *
 * `[cmd]` **`module-goals-editor.jsx:56`:** *„Personal override — the
 * shipped defaults stay intact."*
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))
// G-656: phasen-editor-echt.tsx (der Override-Editor) ist geloescht — der Entwurf hat ihn
// nicht; Programmwahl und eigene Werte stehen im Plan-Bearbeiten (G-649).
//
// G-659: mit ihm sind `editor-rechnungen.ts` und der Schreibweg `phasenOverrideSetzen`/
// `phasenOverrideAktion` ohne Aufrufer. Weggefallen sind deshalb, mit Grund:
//   - cycling-Wochenmittel (`zyklusmittel`, 6 Tests) und annual-Monatssumme
//     (`pruefeJahresplan`, 5 Tests): der Planer hat keine cycling- und keine
//     annual-Eingabe, die Regel hat keinen Ort mehr.
//   - Override als Differenz (`nurAbweichung`/`geltenderWert`/`abweichungszahl`, 9 Tests)
//     und der Schreibweg nach goal_phases.parameters (3 Tests): eigene Werte schreibt
//     jetzt `goal_plan_position_recalculate` an die Planposition, nicht die App per UPDATE.
//   - `schwelleAusText` (2 Tests): kein Aufrufer; der Planer zeigt keine Schwelle an.
//   - „server-frei“ fuer editor-rechnungen.ts (1 Test): die Datei hat keinen Aufrufer mehr.
// Umgezogen: „schreibt NICHT in den Katalog“ gilt weiter — jetzt fuer plan-write.ts.
const E = () => lies(join(GOALS, 'plan-seite.tsx'))

describe('G-539/5 — die Schwellen sind ein Befund, kein Schieber', () => {
  it('der Editor zeigt KEINEN Schieber, sondern den Grund', () => {
    // `[read]` **Der Auftrag, Punkt 5: „Wenn dort kein Schwellwert
    // konfigurierbar ist, ist das ein Befund und kein Grund fuer
    // einen Schieber ohne Wirkung."**
    //
    // `[cmd]` **`pruefeWaechter` (G-520) nimmt keine Schwelle
    // entgegen** — seine Grenzen stehen als Konstanten aus der Spec.
    const q = E()
    assert.ok(!/type="range"/.test(q),
      'der Editor zeigt einen Schwellwert-Schieber — er haette keine '
      + 'Wirkung, die Waechter rechnen mit festen Grenzen')
    // G-656: der Befundsatz stand im geloeschten Editor; der Planer bietet keine Schwelle an.
    assert.ok(q.length > 1000, 'plan-seite.tsx nicht gefunden')
  })

  it('die Waechter nehmen wirklich keine Schwelle entgegen', () => {
    // `[read]` **Die Gegenprobe zum Befund** — waere sie
    // konfigurierbar, waere der Satz im Editor falsch.
    //
    // `[read]` **Gesucht wird ein FELD, das eine Schwelle traegt** —
    // nicht das Wort. `hrvTageUnterGrenze` zaehlt Tage unter einer
    // FESTEN Grenze; das ist ein Messwert, keine Einstellung. **Mein
    // erster Versuch suchte `/grenze/i` im ganzen Typ und traf den
    // Kommentar.**
    const w = lies(join(HIER, '..', 'uebergangswaechter.ts'))
    const i = w.indexOf('export type Waechterlage')
    const typ = w.slice(i, w.indexOf('\n}', i))
    const felder = (typ.match(/^ {2}(\w+)[?:]/gm) ?? [])
      .map(z => z.trim().replace(/[?:]$/, ''))
    assert.ok(felder.length > 0, 'die Waechterlage hat keine Felder mehr')
    for (const f of felder) {
      assert.ok(!/^(schwelle|grenze|threshold|limit)/i.test(f),
        `die Waechterlage traegt „${f}" — dann WAERE die Schwelle `
        + 'einstellbar, und der Befund im Editor ist falsch')
    }
    // `[cmd]` **Die Schwellen stehen als Konstanten** — `BF_SCHWELLE`
    // aus der Spec, der Rest fest im Rumpf.
    assert.match(w, /export const BF_SCHWELLE/,
      'die Schwellen stehen nicht mehr als Konstante — dann hat sich '
      + 'die Lage geaendert und der Befund gehoert neu gemessen')
  })
})

describe('G-539 — eigene Werte schreiben nicht in den Katalog', () => {
  it('plan-write.ts fasst goal_strategies nicht an', () => {
    // `[cmd]` **`module-goals-editor.jsx:56`: „the shipped defaults stay intact.“** Seit
    // G-649 gehen eigene Werte ueber plan-write.ts an die Planposition.
    const q = lies(join(HIER, '..', 'plan-write.ts'))
    assert.match(q, /p_eigene_werte/, 'plan-write.ts schreibt keine eigenen Werte mehr — Pruefung neu ansetzen')
    assert.ok(!/goal_strategies/.test(q),
      'der Schreibweg fasst den Katalog an — er gehoert allen')
  })
})

describe('G-539 — die Form von G-545 faellt nicht still durch', () => {
  it('die Teilphase traegt ihre ganze Zeile mit', () => {
    // `[cmd]` **Am BILD gefunden** (2026-09-30): der subphases-Reiter
    // zeigte vier Gedankenstriche je Stufe. `[cmd]` **G-545 hat die
    // Form geaendert** — `weeks` und `deficit` gibt es in KEINER
    // Zeile mehr, dafuer `tdee_multiplier`, `protein_g_per_kg`,
    // `fat_g_per_kg`, `fat_minimum_g_per_kg`, und `cardio` ist ein
    // Objekt.
    const q = lies(join(HIER, '..', 'strategie-read.ts'))
    assert.match(q, /roh: Record<string, unknown>/,
      'die Teilphase traegt ihre Rohform nicht — dann fallen die '
      + 'Felder von G-545 still weg')
    assert.match(q, /roh: o,/, 'die Rohform wird nicht befuellt')
  })
})
