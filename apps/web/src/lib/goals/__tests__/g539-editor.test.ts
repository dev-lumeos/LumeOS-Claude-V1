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

import {
  zyklusmittel, pruefeJahresplan, nurAbweichung, geltenderWert,
  abweichungszahl, schwelleAusText, JAHRESMONATE,
} from '../editor-rechnungen'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))
// G-656: phasen-editor-echt.tsx (der Override-Editor) ist geloescht — der Entwurf hat ihn
// nicht; Programmwahl und eigene Werte stehen im Plan-Bearbeiten (G-649). Weggefallen sind
// die Pruefungen seines Quelltexts (Reiter aus editor_modes, Platzhalter, Grundsatz, Anwenden,
// FreieForm, Ankerreiter) und `monateAusSpanne`. Die Rechnungen und der Schreibweg bleiben.
const E = () => lies(join(GOALS, 'plan-seite.tsx'))

// ════════════════════════════════════════════════════════════════
// Die drei Rechnungen — je eine Zahl aus dem Entwurf
// ════════════════════════════════════════════════════════════════

describe('G-539 — cycling: das Wochenmittel', () => {
  /**
   * **Der Entwurf rechnet** (`module-goals-editor.jsx:164`):
   *
   *     (5 × 200) + (2 × -300)  =  1000 - 600  =  400
   *     400 / 7                 =  57,142…     -> 57
   *
   * **und zeigt `+57 kcal/day`.**
   */
  it('die Zahl des Entwurfs kommt heraus', () => {
    const r = zyklusmittel(
      { training: 200, ruhe: -300, trainingstage: 5 }, null)
    assert.equal(r.grund, null, 'die Rechnung verweigert das Ergebnis')
    assert.equal(r.ruhetage, 2, 'die Ruhetage sind nicht 7 minus 5')
    assert.equal(r.wochenmittel, 57,
      'der Entwurf zeigt +57 kcal/day — das hier ist eine andere Zahl')
  })

  it('der effektive Wert ist TDEE plus Mittel', () => {
    // `[cmd]` **Der Entwurf:** `TDEE_STATE.current + Math.round(…)`
    // (`:165`).
    const r = zyklusmittel(
      { training: 200, ruhe: -300, trainingstage: 5 }, 2800)
    assert.equal(r.effektiv, 2857, '2800 + 57 ist nicht 2857')
  })

  it('ohne TDEE bleibt der effektive Wert leer', () => {
    // `[read]` **Eine Zahl ohne Bezugsgroesse waere eine
    // Behauptung** (E-72).
    const r = zyklusmittel(
      { training: 200, ruhe: -300, trainingstage: 5 }, null)
    assert.equal(r.effektiv, null, 'ohne TDEE wird ein Wert behauptet')
  })

  it('die Ruhetage sind KEINE eigene Eingabe', () => {
    // `[read]` **Sonst koennten beide auseinandergehen** — sechs
    // Trainingstage und drei Ruhetage waeren neun.
    for (const [tage, ruhe] of [[0, 7], [3, 4], [7, 0]]) {
      assert.equal(
        zyklusmittel({ training: 100, ruhe: -100, trainingstage: tage }, null)
          .ruhetage, ruhe)
    }
  })

  it('nur alles an Trainingstagen: das Mittel ist das Delta', () => {
    // `[read]` **Die Gegenprobe zur Division** — sieben gleiche Tage
    // ergeben genau den Tageswert.
    const r = zyklusmittel(
      { training: 210, ruhe: 210, trainingstage: 7 }, null)
    assert.equal(r.wochenmittel, 210)
  })

  it('unmoegliche Tageszahlen ergeben kein Ergebnis', () => {
    for (const t of [-1, 8, 3.5]) {
      const r = zyklusmittel({ training: 200, ruhe: -300, trainingstage: t }, null)
      assert.equal(r.effektiv, null, `${t} Trainingstage werden gerechnet`)
      assert.match(r.grund ?? '', /0 und 7/,
        'die Verweigerung nennt ihren Grund nicht')
    }
  })
})

describe('G-539 — annual: die Monatssumme', () => {
  /**
   * **`module-goals-editor.jsx:336`:** *„Total must sum to 12
   * months."* **Der Balken** (`:339-345`): 4 + 2 + 4 + 1 + 1 = 12.
   */
  it('der Jahreszyklus des Entwurfs ergibt 12', () => {
    const r = pruefeJahresplan([
      { phase: 'LEAN BULK', monate: 4 },
      { phase: 'MAINT', monate: 2 },
      { phase: 'CONTEST PREP', monate: 4 },
      { phase: 'PEAK', monate: 1 },
      { phase: 'REVERSE', monate: 1 },
    ])
    assert.equal(r.summe, 12)
    assert.equal(r.stimmt, true, '4+2+4+1+1 ist nicht 12')
    assert.equal(r.satz, null, 'ein gueltiger Plan bekommt einen Mangelsatz')
  })

  it('zu wenige Monate werden benannt', () => {
    const r = pruefeJahresplan([{ phase: 'A', monate: 10 }])
    assert.equal(r.stimmt, false)
    assert.equal(r.differenz, 2)
    assert.match(r.satz ?? '', /2 Monate/,
      'der Satz sagt nicht, wie viele fehlen')
  })

  it('zu viele Monate auch', () => {
    const r = pruefeJahresplan([{ phase: 'A', monate: 14 }])
    assert.equal(r.differenz, -2)
    assert.match(r.satz ?? '', /2 Monate zu viel/)
  })

  it('ein einzelner Monat heisst „Monat", nicht „Monate"', () => {
    assert.match(pruefeJahresplan([{ phase: 'A', monate: 11 }]).satz ?? '',
      /1 Monat zu/, 'die Einzahl fehlt')
  })

  it('zwoelf ist die Zahl aus dem Entwurf', () => {
    assert.equal(JAHRESMONATE, 12)
  })

  // ── Die Spannen aus der Spalte ──────────────────────────────────
})

// ════════════════════════════════════════════════════════════════
// Der Override — die Auslieferung bleibt
// ════════════════════════════════════════════════════════════════

describe('G-539 — der Override ist eine Differenz', () => {
  const KATALOG = {
    tdee_modifier: -0.2,
    protein_per_kg: 2.2,
    max_duration_weeks: 12,
  }

  it('was gleich ist, faellt heraus', () => {
    // `[read]` **Der Auftrag: „Wer den ganzen Satz hineinschreibt,
    // friert den Katalogstand von heute bei jedem Nutzer ein."**
    const a = nurAbweichung(KATALOG, {
      tdee_modifier: -0.2, protein_per_kg: 2.5,
    })
    assert.deepEqual(a, { protein_per_kg: 2.5 },
      'der unveraenderte Wert wird mitgeschrieben — dann erreicht '
      + 'eine Korrektur am Katalog diesen Nutzer nie')
  })

  it('ein leeres Feld ist KEINE Aenderung', () => {
    // `[read]` **Der Auftrag: „Ein Editor, der ein leeres Feld als
    // `0` anzeigt, schreibt beim Speichern eine erfundene Null."**
    assert.deepEqual(nurAbweichung(KATALOG, { protein_per_kg: null }), {})
    assert.deepEqual(nurAbweichung(KATALOG, { protein_per_kg: '' as never }), {})
  })

  it('eine Null ist eine Aenderung, wenn sie getippt wurde', () => {
    // `[read]` **Die Gegenprobe:** `0` ist ein Wert, `null` ist
    // keiner. **Wer 0 % Fett eintraegt, meint das.**
    assert.deepEqual(nurAbweichung(KATALOG, { fat_percent: 0 }),
      { fat_percent: 0 },
      'eine getippte Null faellt heraus — dann laesst sich nichts '
      + 'auf null setzen')
  })

  it('ein Feld ohne Katalogwert bleibt drin', () => {
    // `[read]` **Es ist per Definition eine Abweichung** — der
    // Katalog sagt dazu nichts.
    assert.deepEqual(nurAbweichung(KATALOG, { fat_percent: 0.3 }),
      { fat_percent: 0.3 })
  })

  it('ohne Aenderung bleibt der Override leer', () => {
    assert.deepEqual(nurAbweichung(KATALOG, { ...KATALOG }), {})
    assert.equal(abweichungszahl({}), 0)
  })

  // ── Die Rangfolge ───────────────────────────────────────────────
  it('der Override gewinnt, wo er etwas sagt', () => {
    assert.equal(geltenderWert(KATALOG, { protein_per_kg: 3 }, 'protein_per_kg'), 3)
  })

  it('sonst gilt die Auslieferung', () => {
    assert.equal(geltenderWert(KATALOG, {}, 'protein_per_kg'), 2.2)
  })

  it('kennt keiner das Feld, gibt es null', () => {
    assert.equal(geltenderWert(KATALOG, {}, 'gibt_es_nicht'), null)
  })

  it('ein Override auf null ist eine Aussage', () => {
    // `[read]` **„Ausdruecklich leer" ist etwas anderes als
    // „unveraendert"** — steht der Schluessel im Override, gilt er.
    assert.equal(geltenderWert(KATALOG, { protein_per_kg: null }, 'protein_per_kg'),
      null, 'ein ausdrueckliches null faellt auf den Katalog zurueck')
  })
})

// ════════════════════════════════════════════════════════════════
// Der Editor selbst
// ════════════════════════════════════════════════════════════════

describe('G-539 — die Reiter kommen aus der Tabelle', () => {

  it('die drei Rechnungen stehen server-frei in lib/goals', () => {
    const q = lies(join(HIER, '..', 'editor-rechnungen.ts'))
    assert.ok(!/@lumeos\/shared\/session|next\/headers/.test(q),
      'editor-rechnungen.ts zieht den Server-Baum (A-30)')
    assert.ok(!/Date\.now\(\)/.test(q),
      'die Rechnungen holen sich die Zeit selbst')
  })
})

describe('G-539/5 — die Schwellen sind ein Befund, kein Schieber', () => {
  it('die Schwelle wird aus dem Regeltext gelesen', () => {
    // `[cmd]` **Wie im Entwurf** (`:444`): die erste Zahl im Text.
    // `[cmd]` **Die Katalogtexte tragen sie**, gemessen:
    assert.equal(schwelleAusText('strength_loss > 10% → reduce deficit'), 10)
    assert.equal(schwelleAusText('weekly_loss > 1.0kg → +150 kcal'), 1)
    assert.equal(schwelleAusText('Gewichtsverlust > 2 %/Woche -> warning'), 2)
  })

  it('ein Text ohne Zahl gibt null, nicht 0', () => {
    // `[read]` **`0` waere eine Schwelle** — und `hormonal symptoms`
    // hat keine.
    assert.equal(schwelleAusText('hormonal symptoms → medical check'), null)
  })

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

describe('G-539 — der Schreibweg', () => {
  const W = () => lies(join(HIER, '..', 'phase-write.ts'))

  it('er schreibt nach goal_phases.parameters', () => {
    const q = W()
    const i = q.indexOf('export async function phasenOverrideSetzen')
    assert.ok(i > 0, 'den Schreibweg gibt es nicht')
    const rumpf = q.slice(i, i + 1100)
    assert.match(rumpf, /\.update\(\{ parameters: abweichung \}\)/,
      'der Override landet nicht in der Spalte')
    // `[read]` **G-79: zaehlen, nicht auf das Ausbleiben eines
    // Fehlers vertrauen.**
    assert.match(rumpf, /\.select\('id'\)/,
      'der Schreibweg zaehlt die Zeilen nicht — ein vom Zeilenschutz '
      + 'gefiltertes UPDATE kaeme als Erfolg zurueck (G-79)')
    assert.match(rumpf, /data\?\.length \?\? 0/,
      'die Zeilenzahl wird nicht zurueckgegeben')
  })

  it('null Zeilen ist ein Fehler, kein Erfolg', () => {
    const a = lies(join(GOALS, 'phase-aktionen.ts'))
    assert.match(a, /zeilen === 0/,
      'die Aktion meldet Erfolg, auch wenn nichts getroffen wurde')
  })

  it('er schreibt NICHT in den Katalog', () => {
    // `[cmd]` **Zeile 56: „the shipped defaults stay intact."**
    const q = W()
    const i = q.indexOf('export async function phasenOverrideSetzen')
    const rumpf = q.slice(i, i + 1100)
    assert.ok(!/goal_strategies/.test(rumpf),
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
