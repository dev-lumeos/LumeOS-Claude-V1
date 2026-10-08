/**
 * G-541 — das Vorschaupanel liest den Katalog
 *
 * `[cmd]` **In G-534 meldete ich zehn Elemente ohne Quelle.** `[cmd]`
 * **Seit G-538 hat jedes eine Spalte in `goals.goal_strategies`,
 * 17 Zeilen.**
 *
 * ── Was diese Pruefungen messen ─────────────────────────────────────
 *
 * `[read]` **Die Deckung je Element, gegen die laufende Datenbank
 * gemessen (2026-09-29):**
 *
 *     editor_modes  17     guards         7     purpose    1
 *     protein       16     sub_phases     1     exits      1
 *     max_duration   9     best_for       1     success    1
 *                                              annual     1
 *
 * `[read]` **Eine Spalte zu haben heisst nicht, einen Wert zu
 * haben** — deshalb prueft A2 nicht „das Feld ist gefuellt", sondern
 * „das leere Feld traegt einen Grund".
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { existsSync } from 'node:fs'
import { tdeeProzent } from '../strategie-regeln'
import type { Strategie } from '../strategie-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

/** Eine Zeile, wie sie aus dem Katalog kommt. */
function strat(p: Partial<Strategie> = {}): Strategie {
  return {
    code: 'moderate_cut', label: 'Moderate Cut', description: 'Beschreibung',
    icon: 'flame', category: 'fat_loss', tier: 'advanced',
    auswahl_gruppe: 'abnehmen', min_erfahrung: 'advanced', standard: false,
    tdee_modifier: -0.2, weight_change_target_percent: -0.75,
    max_duration_weeks: 12, protein_per_kg: 2.2, fat_percent: 0.25,
    macro_cycling: false, refeed_schedule: false, auto_adjust: false,
    peak_week: false, badge: null, warnings: [], requirements: {},
    guards: [], next_codes: [], exits: [], success: [], best_for: [],
    purpose: [], editor_modes: [], sub_phases: [], annual: [],
    refeeds: null, peak_week_details: null,
    ...p,
  }
}

// ══ G-615: die Strategie-Reiter sind weg ═══════════════════════════
//
// `[cmd]` **Hier standen A3 (fuenf Reiter, Hybrid = hybrid+recovery,
// `einfacheStrategien`) und A4 (`istWaehlbar` nach `requirements`).** Tom,
// G-615: der Reiter Phase engine wird der Planer; Einzelstrategien gibt es
// nur noch im Anlegemodal (G-610). **Die Zusage dreht sich um:** die Reiter
// kommen nicht zurueck, und die Sperre hat EINE Quelle (`zielwahl.ts`).
describe('G-615 — keine Strategie-Reiter, eine Sperrregel', () => {
  it('die fest codierten Reiter sind weg', () => {
    const q = lies(join(HIER, '..', 'strategie-regeln.ts'))
    assert.ok(!/export const REITER|strategienFuerReiter|istWaehlbar/.test(q),
      'die Strategie-Reiter aus G-541 sind zurueck')
    assert.ok(!existsSync(join(GOALS, 'strategie-wahl.tsx')), 'strategie-wahl.tsx ist zurueck')
  })

  it('der Planer sperrt mit derselben Regel wie das Anlegemodal', () => {
    const q = lies(join(GOALS, 'planer.tsx'))
    // G-628: der Import traegt jetzt auch `naechsteNamen`.
    assert.match(q, /import \{[^}]*\bgesperrt\b[^}]*\} from '\.\.\/\.\.\/\.\.\/lib\/goals\/zielwahl'/)
    assert.ok(!/min_erfahrung\s*[<>]|EXPERIENCE_LEVELS/.test(q), 'der Planer vergleicht Grade selbst')
  })
})

describe('G-541/A2 — was NULL ist, bleibt ein Strich MIT Grund', () => {
  const V = () => lies(join(GOALS, 'strategie-vorschau.tsx'))

  it('es gibt genau einen Grundsatz, nicht je Feld einen anderen', () => {
    const q = V()
    assert.match(q, /const LEER = '[^']+'/,
      'der Grund steht nicht an einer Stelle — dann driftet er')
  })

  it('der Strich traegt den Grund, nicht nur einen Gedankenstrich', () => {
    const q = V()
    const i = q.indexOf('function Strich')
    const rumpf = q.slice(i, i + 420)
    // `[read]` **Dieser Waechter war zuerst blind.** Er suchte im
    // Rumpf nach dem Wort `grund` — und das steht auch in der
    // Signatur (`{ grund = LEER }`). **Die Sabotage „Strich ohne
    // Grund" blieb gruen**, obwohl am Schirm nur noch ein
    // Gedankenstrich stand. `[read]` **Gesucht wird jetzt die
    // AUSGABE des Grundes, nicht sein Vorkommen.**
    // `[read]` **Gemessen wird die AUSGABEZEILE** — die hinter dem
    // Gedankenstrich, nicht die Signatur darueber.
    const ausgabe = rumpf.split('\n').find(z => z.includes('—'))
    assert.ok(ausgabe !== undefined && /grund/.test(ausgabe),
      'der Strich GIBT den Grund nicht aus — dann steht am Schirm ein '
      + 'nackter Gedankenstrich und zwingt den naechsten Auftrag, von '
      + 'vorn zu messen (E-68)')
    assert.match(rumpf, /data-feld-leer/,
      'der Leerstand traegt keine Marke — dann ist er nicht zaehlbar')
  })

  it('alle zehn gemeldeten Elemente stehen im Panel', () => {
    // `[cmd]` **Die zehn aus G-534/A5**, je mit ihrer Spalte.
    //
    // `[read]` **Die sechs Listenfelder laufen ueber `LISTEN` und
    // `s[f]`** — ein Suchmuster auf `s.guards` faende sie nicht mehr,
    // obwohl sie gelesen werden. **Gesucht wird der Feldname dort,
    // wo er die Anzeige steuert.**
    const q = V()
    for (const feld of ['best_for', 'purpose', 'guards', 'exits',
      'success', 'warnings']) {
      assert.ok(q.includes(`'${feld}'`),
        `„${feld}" steht nicht in LISTEN — dann erscheint es weder `
        + 'gefuellt noch unter „Ohne Eintrag"')
    }
    // Die vier uebrigen stehen einzeln, mit eigener Bauform.
    for (const feld of ['sub_phases', 'annual', 'editor_modes',
      'next_codes']) {
      assert.ok(q.includes(`s.${feld}`),
        `„${feld}" wird nicht gelesen — es war in G-534 als fehlend `
        + 'gemeldet und hat jetzt eine Spalte')
    }
    for (const feld of ['sub_phases', 'annual', 'editor_modes']) {
      assert.ok(q.includes(`data-vorschau-block="${feld}"`),
        `„${feld}" traegt keine Marke — dann ist der Block nicht `
        + 'zaehlbar')
    }
    assert.ok(q.includes('s.max_duration_weeks'), 'max_duration_weeks fehlt')
    assert.ok(q.includes('s.protein_per_kg'), 'protein_per_kg fehlt')
  })

  it('das Panel liest die Zeile, nicht eine erfundene Zahl', () => {
    const q = V()
    // `[read]` **Der Fehler, den A2 verbietet:** ein Vorgabewert,
    // der wie ein Messwert aussieht.
    assert.ok(!/protein_per_kg \?\? \d/.test(q),
      'ein Vorgabewert deckt das fehlende Protein zu')
    assert.ok(!/max_duration_weeks \?\? \d/.test(q),
      'ein Vorgabewert deckt die fehlende Hoechstdauer zu')
  })

  it('die Hoechstdauer traegt einen EIGENEN Grund', () => {
    // `[read]` **8 von 17 Zeilen fuehren keine Hoechstdauer** — das
    // heisst „unbegrenzt", nicht „nicht hinterlegt".
    assert.match(V(), /unbegrenzt/,
      'eine fehlende Hoechstdauer liest sich wie eine Luecke')
  })

  // ── Was das BILD zeigte und der Zaehler nicht ───────────────────
  //
  // `[cmd]` **Zwei Befunde am Schirm, 2026-09-29** — beide bei
  // gruener Messung: kein Element lief ueber den Panelrand hinaus,
  // und die Blockzahl stimmte.
  //
  //   1  Der lange Leergrund stand in der rechtsbuendigen
  //      Zahlenspalte bis an die Kante.
  //   2  Bei `reverse_diet` standen VIER Listenueberschriften mit
  //      viermal demselben Satz darunter — mehr Platz fuer den
  //      Leerstand als fuer den Inhalt.
  it('die Zahlenzeile traegt den KURZEN Grund', () => {
    const q = V()
    // `[read]` **Ein Treffer auf `LEER_KURZ` genuegt nicht** — die
    // Konstante bleibt stehen, auch wenn die Ausgabe wieder den
    // langen Satz nimmt. **Gemessen wird die BENUTZUNG in der
    // Ausgabezeile.**
    const i = q.indexOf('function Strich')
    const ausgabe = q.slice(i, i + 420).split('\n').find(z => z.includes('—'))
    assert.ok(ausgabe !== undefined && ausgabe.includes('LEER_KURZ'),
      'die Zahlenspalte zeigt den langen Satz — er lief bis an die '
      + 'Kante (am Bild gefunden)')
    assert.match(q, /title=\{kurz \? grund : undefined\}/,
      'der volle Grund ist nirgends mehr abrufbar — dann ist der '
      + 'kurze Satz eine Verkuerzung ohne Rueckweg')
  })

  it('leere Listen stehen gesammelt, nicht je einzeln', () => {
    const q = V()
    assert.match(q, /data-vorschau-leerliste/,
      'jede leere Liste bekommt wieder eine eigene Ueberschrift mit '
      + 'demselben Satz')
    // `[read]` **Die Namen bleiben** — sonst waere nicht zu sehen,
    // dass es das Feld gibt.
    assert.match(q, /LISTEN\.filter\(\(\[, f\]\) => s\[f\]\.length === 0\)/,
      'die leeren Felder werden nicht mehr benannt — dann sieht die '
      + 'Strategie aus, als haette sie diese Felder nicht')
  })

  it('kein Feld faellt durch die Gruppierung heraus', () => {
    // `[read]` **Die Gegenprobe zur Aufteilung:** gefuellt UND leer
    // muessen zusammen alle sechs ergeben.
    const q = V()
    assert.match(q, /LISTEN\.filter\(\(\[, f\]\) => s\[f\]\.length > 0\)/,
      'die gefuellten Listen werden nicht aus LISTEN abgeleitet')
    const i = q.indexOf('const LISTEN')
    const block = q.slice(i, q.indexOf('satisfies', i))
    for (const f of ['best_for', 'purpose', 'guards', 'exits', 'success',
      'warnings']) {
      assert.ok(block.includes(`'${f}'`),
        `„${f}" steht nicht in LISTEN — es waere weder oben noch `
        + 'unter „Ohne Eintrag" zu sehen')
    }
  })

  it('tdeeProzent gibt null zurueck, nicht 0 %', () => {
    // `[cmd]` **1 von 17 Zeilen ohne Faktor** (`expert_bb_annual`).
    assert.equal(tdeeProzent(strat({ tdee_modifier: null })), null,
      '„0 %" waere eine Aussage, die niemand getroffen hat')
    assert.equal(tdeeProzent(strat({ tdee_modifier: -0.25 })), '-25 %')
    assert.equal(tdeeProzent(strat({ tdee_modifier: 0.1 })), '+10 %',
      'das Pluszeichen fehlt — dann liest sich ein Aufbau wie ein Halten')
  })
})

describe('G-541/A1 — der Katalog statt der Attrappe', () => {
  it('die Variantenkachel ist WEG, nicht befuellt', () => {
    // `[cmd]` **Sie zeigte „conservative · moderate · aggressive"
    // als drei Woerter.** `[read]` **Die drei sind eigene
    // Katalogzeilen** — die Kachel loest sich auf.
    // `[cmd]` **G-615: `phase-vorschau.tsx` ist ganz weg** — mit dem
    // Wechselraster, dessen Vorschau sie war.
    assert.ok(!existsSync(join(GOALS, 'phase-vorschau.tsx')),
      'phase-vorschau.tsx ist zurueck — und mit ihr die Variantenkachel')
  })

  it('die Plan-Auswahl liest die Tabelle, nicht eine Liste im Quelltext', () => {
    // G-615: die Auswahl steht im Planer (vorher `strategie-wahl.tsx`).
    const q = lies(join(GOALS, 'planer.tsx'))
    // `[read]` **Dieser Waechter nannte zuerst nur drei Codes.** Die
    // Sabotage setzte `s.code === 'lose'` ein und blieb GRUEN —
    // `lose` stand nicht auf der Liste. **Ein Waechter, der drei
    // Namen verbietet, misst nicht die Mechanik.**
    //
    // `[cmd]` **Alle 17 Codes, gemessen 2026-09-29** — keiner darf
    // als Literal im Quelltext stehen, sonst faellt eine 18.
    // Katalogzeile durch.
    const CODES = [
      'lose', 'maintain', 'gain', 'aggressive_cut', 'moderate_cut',
      'conservative_cut', 'mini_cut', 'lean_bulk', 'clean_bulk',
      'aggressive_bulk', 'body_recomp', 'reverse_diet', 'contest_prep',
      'peak_week', 'expert_bb_annual', 'maintenance_diet_break', 'custom',
    ]
    for (const code of CODES) {
      assert.ok(!q.includes(`'${code}'`),
        `„${code}" steht als Literal in der Auswahl — dann haengt sie `
        + 'an einer Zeile statt an der Tabelle')
    }
    assert.match(q, /planStrategien\(strategien\)/,
      'die Auswahl leitet sich nicht aus den uebergebenen Zeilen ab')
  })

  it('der Leseweg holt alle Spalten', () => {
    const q = lies(join(HIER, '..', 'strategie-read.ts'))
    assert.match(q, /from\('goal_strategies'\)/,
      'der Katalog wird nicht gelesen')
    assert.match(q, /\.select\('\*'\)/,
      'nicht alle Spalten — ein vergessenes Feld faellt still aus')
  })
})

describe('G-541/A5 — die Grenze zu G-538 und G-539', () => {
  // G-615: `strategie-wahl.tsx` ist weg; die Vorschau bleibt (Details im Planer).
  const alleDateien = () => lies(join(GOALS, 'strategie-vorschau.tsx'))

  it('kein Schreibweg auf goal_phases', () => {
    // `[cmd]` **`goal_phase_start` nimmt keinen `strategie_code`** —
    // gemessen an `pg_get_function_arguments`, 2026-09-29.
    const q = alleDateien()
    assert.ok(!/goal_phase_start|strategie_code.*=|phaseStartenAktion/.test(q),
      'die Anzeige schreibt — das ist G-538 und liegt bei Codex')
  })

  it('kein Knopf in den Editor', () => {
    // `[read]` **Ein Knopf ohne Ziel ist eine Zusage** (A5).
    const q = alleDateien()
    assert.ok(!/PhaseEditorModal|Editor oeffnen|editorOeffnen/.test(q),
      'ein Knopf zeigt auf den Editor — den gibt es erst mit G-539')
  })

  it('die Grenze steht als Satz da', () => {
    assert.match(lies(join(GOALS, 'strategie-vorschau.tsx')),
      /data-vorschau-grenze/,
      'die Anzeige sagt nicht, dass die Wahl nicht gespeichert wird '
      + '— dann sieht sie aus wie eine Einstellung')
  })
})

