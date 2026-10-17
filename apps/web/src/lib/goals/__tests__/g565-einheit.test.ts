/**
 * G-565 — die Einheit ist eine Nutzerwahl
 *
 * **Tom, 2026-09-30, 17:45:** *„das soll doch ein user entscheiden,
 * manchmal ist es klarer mit prozenten zu arbeiten und manchmal
 * easier mit direkt kcal."* (E-83)
 *
 * `[cmd]` **Gespeichert wird die Rate** —
 * `goal_phases.zielrate_pct_kg_woche numeric(5,3)`, gemessen
 * 2026-10-01.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  kcalAusRate, rateAusKcal, rundeWieDb, E1_FAKTOR, RATE_STELLEN, KCAL_STELLEN,
} from '../zielrate-einheit'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

// ════════════════════════════════════════════════════════════════
// A2 — die Zahlen stimmen mit der Datenbank ueberein
// ════════════════════════════════════════════════════════════════

describe('G-565/A2 — dieselbe Zahl wie kcal_delta_aus_zielrate', () => {
  /**
   * **Die Funktion, aus `prosrc` gelesen (2026-10-01):**
   *
   *     SELECT round((11 * p_zielrate_pct_kg_woche
   *                      * p_body_weight_kg)::numeric, 1);
   *
   * `[cmd]` **126 Paare gegen die laufende Datenbank gehalten, 0
   * Abweichungen** — Raten von −2,5 bis +1,5, Gewichte von 40,1 bis
   * 149,9 kg. **Hier stehen die, die E-83 nennt.**
   */
  it('die Beispiele aus E-83 kommen heraus', () => {
    // `[cmd]` **E-83, woertlich:** 0,25 %/Woche bei 83,74 kg = +230,
    // bei 60,00 kg = +165.
    assert.equal(kcalAusRate(0.25, 83.74), 230.3)
    assert.equal(kcalAusRate(0.25, 60.00), 165.0)
    // `[cmd]` **Toms Daten aus E-1:** 11 × 0,271 × 83,74.
    assert.equal(kcalAusRate(0.271, 83.74), 249.6)
  })

  it('der Faktor ist 11, aus E-1', () => {
    assert.equal(E1_FAKTOR, 11)
    // `[read]` **Von Hand:** 11 × 0,5 × 100 = 550.
    assert.equal(kcalAusRate(0.5, 100), 550)
  })

  // ── Die Rundung, die zuerst abwich ──────────────────────────────
  it('die Haelfte geht von der Null WEG, wie in Postgres', () => {
    // `[cmd]` **Hier wich der alte Weg ab:** `kcalDeltaAusRate` in
    // `phase-regeln.ts` rundete mit `Math.round`, und das rundet die
    // Haelfte nach +unendlich.
    //
    //     Rate -2,5 bei 55,5 kg  ->  roh -1526,25
    //       Postgres round(…, 1)    = -1526,3
    //       Math.round(-15262,5)/10 = -1526,2
    assert.equal(kcalAusRate(-2.5, 55.5), -1526.3,
      'die negative Haelfte wird nach oben gerundet — dann weicht '
      + 'die Anzeige von der Datenbank ab')
    // `[read]` **Die Gegenrichtung:** positiv bleibt positiv.
    assert.equal(rundeWieDb(0.5, 0), 1)
    assert.equal(rundeWieDb(-0.5, 0), -1)
    assert.equal(rundeWieDb(1.5, 0), 2)
    assert.equal(rundeWieDb(-1.5, 0), -2)
  })

  it('Math.round waere hier falsch', () => {
    // `[read]` **Die Probe, die den Unterschied festhaelt** — waere
    // `rundeWieDb` wieder `Math.round`, wird sie rot.
    assert.notEqual(rundeWieDb(-0.5, 0), Math.round(-0.5))
  })

  it('auf eine Nachkommastelle, wie die Funktion', () => {
    assert.equal(KCAL_STELLEN, 1)
    assert.equal(kcalAusRate(0.001, 83.74), 0.9)
  })

  it('ohne Rate oder Gewicht keine Zahl', () => {
    // `[read]` **Kein Rueckfall auf 0** — eine Null waere eine
    // Aussage (E-72).
    assert.equal(kcalAusRate(null, 80), null)
    assert.equal(kcalAusRate(0.25, null), null)
    assert.equal(kcalAusRate(Number.NaN, 80), null)
  })
})

// ════════════════════════════════════════════════════════════════
// A3 — die Rueckrichtung driftet nicht
// ════════════════════════════════════════════════════════════════

describe('G-565/A3 — kcal rein, Rate raus, kcal wieder raus', () => {
  /**
   * **Von Hand, bei 83,74 kg:**
   *
   *     230 kcal / (11 × 83,74)  =  0,24973…  ->  0,250  (numeric(5,3))
   *     11 × 0,250 × 83,74       =  230,285   ->  230,3
   *     Abweichung                             =  +0,3 kcal
   *
   * **Die Grenze:** eine halbe Rateneinheit sind
   * `11 × 0,0005 × 83,74` = 0,4606 kcal. **0,3 liegt darunter.**
   */
  it('das Beispiel von Hand', () => {
    assert.equal(rateAusKcal(230, 83.74), 0.25)
    assert.equal(kcalAusRate(0.25, 83.74), 230.3)
  })

  it('die Abweichung bleibt unter der halben Rateneinheit', () => {
    // `[cmd]` **`numeric(5,3)`** — ein Schritt ist 0,001, und
    // `11 × 0,0005 × Gewicht` ist die groesste moegliche Abweichung.
    for (const [kcal, g] of [
      [230, 83.74], [-400, 81.4], [250, 80], [1, 80],
      [-1526.3, 55.5], [500, 100], [-900, 120], [0, 80],
    ] as Array<[number, number]>) {
      // G-659: `kcalRueckweg`/`maxAbweichungKcal` sind mit der Einheitenwahl weg; die Regel gilt
      // weiter fuer `rateAusKcal` -> `kcalAusRate` (Anpassung), also hier direkt gerechnet.
      const zurueck = kcalAusRate(rateAusKcal(kcal, g), g)
      const abweichung = zurueck === null ? null : zurueck - kcal
      const grenze = E1_FAKTOR * 0.5 * 10 ** -RATE_STELLEN * g
      assert.ok(abweichung !== null && Math.abs(abweichung) <= grenze + 1e-9,
        `${kcal} kcal bei ${g} kg weicht um ${abweichung} ab, `
        + `erlaubt sind ${grenze}`)
    }
  })

  it('der ZWEITE Durchgang aendert nichts mehr', () => {
    // `[read]` **Das ist die eigentliche Zusage aus A3:** kein
    // Rundungsverlust, der sich aufschaukelt.
    for (const [kcal, g] of [
      [230, 83.74], [-400, 81.4], [250, 80], [777, 95.5],
    ] as Array<[number, number]>) {
      const r1 = rateAusKcal(kcal, g)
      const z1 = kcalAusRate(r1, g)
      const r2 = rateAusKcal(z1, g)
      const z2 = kcalAusRate(r2, g)
      assert.equal(r2, r1, `${kcal} bei ${g}: die Rate wandert`)
      assert.equal(z2, z1, `${kcal} bei ${g}: die Kilokalorien wandern`)
    }
  })

  it('die Rate wird auf drei Stellen gerundet', () => {
    // `[cmd]` **`numeric(5,3)`** — mehr nimmt die Spalte nicht an.
    // `[read]` **Lieber hier sichtbar runden als dort unsichtbar.**
    assert.equal(RATE_STELLEN, 3)
    const r = rateAusKcal(230, 83.74)
    assert.ok(r !== null && String(r).split('.')[1]?.length <= 3,
      `${r} hat mehr als drei Nachkommastellen — die Spalte kuerzt still`)
  })

  it('ohne Gewicht keine Rate', () => {
    assert.equal(rateAusKcal(230, null), null)
    assert.equal(rateAusKcal(230, 0), null,
      'bei Gewicht 0 wird durch null geteilt')
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — ein Umschalter, kein zweites Feld
// ════════════════════════════════════════════════════════════════

describe('G-565/A1 — die Rate, eine Rechnung', () => {
  // G-659 (Tom, 17.10., Variante b): die %/kcal-Wahl aus E-83 ist weg, die Zielrate bleibt in
  // Prozent. Weggefallen mit Grund: „genau zwei Einheiten“, „hin und zurueck“, „in Prozent
  // braucht es kein Gewicht“ (`inEinheit`/`ausEinheit`) und die zwei Schalterpruefungen
  // (`einheiten-schalter.tsx`) — 5 Tests, ihre Regel hat keinen Gegenstand mehr.
  // ── Je Stelle: EIN Zustand, die Rate ────────────────────────────
  // G-656: „das Eingabefeld rechnet auf die Rate zurueck" (phasen-editor-echt.tsx) und
  // „die Anzeige rechnet in die gewaehlte Einheit" (phase-echt.tsx) sind mit ihren
  // Dateien weggefallen — die Einheitenwahl hat im Entwurf keinen Ort (gemeldet).
  it('keine Stelle rechnet selbst mit 11', () => {
    // `[read]` **A2: „Die Umrechnung liegt server-frei in
    // `lib/goals/` und wird nicht in der Komponente wiederholt."**
    for (const datei of ['plan-seite.tsx', 'reiter-goals.tsx']) {
      const q = lies(join(GOALS, datei))
      assert.ok(!/11 \* |\* 11\b/.test(q),
        `${datei} rechnet selbst mit dem Faktor 11 — zwei Rechnungen `
        + 'fuer dasselbe gehen auseinander')
    }
  })

  it('die Rechnung ist server-frei', () => {
    const q = lies(join(HIER, '..', 'zielrate-einheit.ts'))
    assert.ok(!/@lumeos\/shared\/session|next\/headers/.test(q),
      'zielrate-einheit.ts zieht den Server-Baum (A-30)')
  })
})

// G-659: „G-565/A4 — eine Einstellung, keine Spalte“ (6 Tests auf `einheit-speichern.ts`) faellt
// weg — die Einstellung gibt es nicht mehr; die Zeilen in `user_display_preferences` bleiben
// ungelesen stehen (Tom, 17.10.).

// ════════════════════════════════════════════════════════════════
// Was NICHT umgestellt wurde, und warum
// ════════════════════════════════════════════════════════════════

describe('G-565 — der Katalog bleibt in Prozent', () => {
  it('die Katalogkarten zeigen weiter die Rate', () => {
    // `[cmd]` **E-83: „Aus demselben Grund kann der KATALOG keine
    // kcal tragen: `goal_strategies` gilt fuer alle Nutzer, die
    // Kilokalorienzahl gilt fuer einen."**
    //
    // `[cmd]` **Gemessen:** weder `strategie-vorschau.tsx` noch
    // `strategie-wahl.tsx` kennt ein Koerpergewicht.
    // G-615: strategie-wahl.tsx ist weg; der Planer zeigt Katalogzeilen.
    for (const datei of ['strategie-vorschau.tsx', 'planer.tsx']) {
      const q = lies(join(GOALS, datei))
      // G-659: der Schalter ist weg; gefragt wird nach der Sache — eine Kilokalorienzahl.
      assert.ok(!/kcalAusRate|<EinheitenSchalter/.test(q),
        `${datei} rechnet die Rate in kcal um — der Katalog gilt `
        + 'fuer alle Nutzer, eine Kilokalorienzahl fuer einen (E-83)')
    }
  })
})

describe('G-659 — die Zielrate-Einheit wird nicht mehr gewaehlt und nicht mehr gelesen', () => {
  // Tom, 17.10. (Variante b): Prozent wie im Entwurf. Die Zeilen unter `goals.zielrate_einheit`
  // bleiben ungelesen stehen. `einheiten-schalter.tsx` und `einheit-speichern.ts` hat Tom am 17.10.
  // geloescht; gezaehlt wird jede Spur der Wahl in src/ (ohne Tests).
  const SRC = join(HIER, '..', '..', '..')
  const dateien = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? (e.name === '__tests__' || e.name === 'node_modules' ? [] : dateien(join(d, e.name)))
      : /\.tsx?$/.test(e.name) ? [join(d, e.name)] : [])
  it('kein Import, kein Schluessel', () => {
    const alle = dateien(SRC)
    assert.ok(alle.length > 300, `nur ${alle.length} Dateien gefunden — falscher Wurzelpfad?`)
    const treffer = alle.filter(f => /einheit-speichern|einheiten-schalter|zielrate_einheit|ladeEinheit|EinheitenSchalter|Rateneinheit|EINHEIT_ZEICHEN/.test(lies(f)))
    assert.deepEqual(treffer, [], 'die Einheitenwahl wird noch benutzt')
  })
})
