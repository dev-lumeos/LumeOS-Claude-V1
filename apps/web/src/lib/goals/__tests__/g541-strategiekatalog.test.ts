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

import {
  REITER, ERREICHBARE_KATEGORIEN, strategienFuerReiter,
  einfacheStrategien, istWaehlbar, merkmale, tdeeProzent,
} from '../strategie-regeln'
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
    tdee_modifier: -0.2, weight_change_target_percent: -0.75,
    max_duration_weeks: 12, protein_per_kg: 2.2, fat_percent: 0.25,
    macro_cycling: false, refeed_schedule: false, auto_adjust: false,
    peak_week: false, badge: null, warnings: [], requirements: {},
    guards: [], next_codes: [], exits: [], success: [], best_for: [],
    purpose: [], editor_modes: [], sub_phases: [], annual: [],
    ...p,
  }
}

describe('G-541/A3 — die Auswahl zeigt tier und category', () => {
  it('fuenf Reiter, wie im Altrepo', () => {
    // [cmd] GoalSelector.tsx:19-23
    assert.deepEqual(REITER.map(r => r.id),
      ['fat_loss', 'muscle_gain', 'hybrid', 'contest', 'expert'],
      'die Reiter weichen von der Vorlage ab')
  })

  it('der Reiter „contest" liest die Kategorie „contest_prep"', () => {
    // `[read]` **Die Falle:** Reiterwert und Kategoriewert sind
    // NICHT dasselbe (`GoalSelector.tsx:38`). Wer sie gleichsetzt,
    // zeigt einen leeren Reiter — und der Leersatz sagt dann
    // „keine Strategie", obwohl zwei dastehen.
    const c = REITER.find(r => r.id === 'contest')
    assert.deepEqual(c?.kategorien, ['contest_prep'],
      'der Contest-Reiter liest die falsche Kategorie')
  })

  it('der Reiter „hybrid" sammelt ZWEI Kategorien', () => {
    // [cmd] GoalSelector.tsx:37 — hybrid + recovery
    const h = REITER.find(r => r.id === 'hybrid')
    assert.deepEqual(h?.kategorien, ['hybrid', 'recovery'],
      'ohne „recovery" waere reverse_diet ueber keinen Reiter '
      + 'erreichbar')
  })

  it('alle sechs gemessenen Kategorien sind erreichbar', () => {
    // `[cmd]` **Gemessen 2026-09-29:** contest_prep, expert,
    // fat_loss, hybrid, muscle_gain, recovery.
    for (const k of ['contest_prep', 'expert', 'fat_loss', 'hybrid',
      'muscle_gain', 'recovery']) {
      assert.ok(ERREICHBARE_KATEGORIEN.includes(k),
        `die Kategorie „${k}" liegt unter keinem Reiter — ihre `
        + 'Zeilen waeren unerreichbar')
    }
  })

  it('ein Reiter zeigt nur advanced', () => {
    // [cmd] GoalSelector.tsx:35-39 — jeder Zweig filtert auf advanced.
    const alle = [
      strat({ code: 'lose', tier: 'simple', category: 'fat_loss' }),
      strat({ code: 'moderate_cut', tier: 'advanced', category: 'fat_loss' }),
    ]
    const r = strategienFuerReiter(alle, 'fat_loss')
    assert.deepEqual(r.map(s => s.code), ['moderate_cut'],
      'eine simple Strategie steht doppelt — oben und im Reiter')
  })

  it('die simplen stehen getrennt', () => {
    const alle = [
      strat({ code: 'lose', tier: 'simple' }),
      strat({ code: 'moderate_cut', tier: 'advanced' }),
    ]
    assert.deepEqual(einfacheStrategien(alle).map(s => s.code), ['lose'])
  })
})

describe('G-541/A4 — requirements sperrt, statt zu erklaeren', () => {
  it('coach_approval ohne Coach sperrt', () => {
    // [cmd] definitions.ts:292-294
    const v = istWaehlbar({ coach_approval: true }, { hasCoach: false })
    assert.equal(v.frei, false, 'peak_week waere ohne Coach waehlbar')
    assert.ok(!v.frei && v.grund.includes('Coach'),
      'der Grund nennt den Coach nicht')
  })

  it('coach_approval MIT Coach ist frei', () => {
    // `[read]` **Die Gegenrichtung** — sonst sperrte die Regel immer
    // und niemand saehe es.
    assert.equal(istWaehlbar({ coach_approval: true }, { hasCoach: true }).frei,
      true, 'mit Coach bleibt gesperrt')
  })

  it('min_experience sperrt NUR den Anfaenger', () => {
    // [cmd] definitions.ts:289 — `=== 'beginner'`, nicht `!== advanced`.
    const anf = { min_experience: 'advanced' }
    assert.equal(istWaehlbar(anf, { experience: 'beginner' }).frei, false,
      'ein Anfaenger kommt an aggressive_cut')
    for (const e of ['advanced', 'pro', 'elite']) {
      assert.equal(istWaehlbar(anf, { experience: e }).frei, true,
        `„${e}" wird gesperrt — der CHECK kennt vier Stufen`)
    }
    // `[read]` **Ohne Angabe wird nicht gesperrt** — das ist die
    // Regel des Altrepos und die vorsichtigere.
    assert.equal(istWaehlbar(anf, {}).frei, true,
      'wer nichts hinterlegt hat, wird ausgesperrt')
  })

  it('die Erfahrung wird ZUERST genannt', () => {
    // `[read]` **contest_prep verlangt beides.** Wer als Anfaenger
    // ohne Coach davorsteht, liest EINEN Satz — und zwar den, der
    // im Altrepo zuerst steht (`:289` vor `:292`).
    const v = istWaehlbar(
      { min_experience: 'advanced', coach_approval: true },
      { experience: 'beginner', hasCoach: false })
    assert.ok(!v.frei && v.grund.includes('Trainingserfahrung'),
      'die Reihenfolge weicht von der Vorlage ab')
  })

  it('ohne requirements ist alles frei', () => {
    assert.equal(istWaehlbar({}, {}).frei, true,
      '13 der 17 Zeilen waeren gesperrt')
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
    const q = lies(join(GOALS, 'phase-vorschau.tsx'))
    assert.ok(!/conservative · moderate · aggressive/.test(q),
      'die Variantenkachel steht noch — sie ist jetzt drei Zeilen '
      + 'im Katalog')
    assert.ok(!/Baender je Variante/.test(q),
      'die Attrappenmarke der Variantenkachel steht noch')
  })

  it('die Auswahl liest die Tabelle, nicht eine Liste im Quelltext', () => {
    const q = lies(join(GOALS, 'strategie-wahl.tsx'))
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
    assert.match(q, /strategien\.filter|strategienFuerReiter/,
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
  const alleDateien = () => [
    lies(join(GOALS, 'strategie-wahl.tsx')),
    lies(join(GOALS, 'strategie-vorschau.tsx')),
  ].join('\n')

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

describe('G-541 — die Karte zeigt, was die Zeile traegt', () => {
  it('die vier Merkmale kommen aus den vier Schaltern', () => {
    // [cmd] GoalSelector.tsx:181-186
    assert.deepEqual(merkmale(strat({
      macro_cycling: true, refeed_schedule: true,
      auto_adjust: true, peak_week: true,
    })), ['Cycling', 'Refeed', 'Auto', 'Peak'])
    assert.deepEqual(merkmale(strat()), [],
      'eine Zeile ohne Schalter zeigt Merkmale')
  })

  it('nur der gesetzte Schalter erscheint', () => {
    assert.deepEqual(merkmale(strat({ refeed_schedule: true })), ['Refeed'],
      'die Merkmale haengen nicht am einzelnen Schalter')
  })
})
