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
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  kcalAusRate, rateAusKcal, rundeWieDb, kcalRueckweg, maxAbweichungKcal,
  inEinheit, ausEinheit, E1_FAKTOR, RATE_STELLEN, KCAL_STELLEN, EINHEITEN,
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
    const w = kcalRueckweg(230, 83.74)
    assert.equal(w.rate, 0.25)
    assert.equal(w.zurueck, 230.3)
    assert.equal(w.abweichung, 0.3)
  })

  it('die Abweichung bleibt unter der halben Rateneinheit', () => {
    // `[cmd]` **`numeric(5,3)`** — ein Schritt ist 0,001, und
    // `11 × 0,0005 × Gewicht` ist die groesste moegliche Abweichung.
    for (const [kcal, g] of [
      [230, 83.74], [-400, 81.4], [250, 80], [1, 80],
      [-1526.3, 55.5], [500, 100], [-900, 120], [0, 80],
    ] as Array<[number, number]>) {
      const w = kcalRueckweg(kcal, g)
      const grenze = maxAbweichungKcal(g)
      assert.ok(w.abweichung !== null && Math.abs(w.abweichung) <= grenze + 1e-9,
        `${kcal} kcal bei ${g} kg weicht um ${w.abweichung} ab, `
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

describe('G-565/A1 — eine Groesse, zwei Einheiten', () => {
  it('es gibt genau zwei Einheiten', () => {
    assert.deepEqual([...EINHEITEN], ['prozent', 'kcal'])
  })

  it('hin und zurueck ist dieselbe Groesse', () => {
    assert.equal(inEinheit(0.25, 83.74, 'prozent'), 0.25)
    assert.equal(inEinheit(0.25, 83.74, 'kcal'), 230.3)
    assert.equal(ausEinheit(0.25, 83.74, 'prozent'), 0.25)
    assert.equal(ausEinheit(230.3, 83.74, 'kcal'), 0.25)
  })

  it('in Prozent braucht es kein Gewicht', () => {
    // `[read]` **Die Rate gilt ohne Gewicht** — das ist der Grund,
    // warum sie die gespeicherte Groesse ist (E-83).
    assert.equal(inEinheit(0.25, null, 'prozent'), 0.25)
    assert.equal(ausEinheit(0.25, null, 'prozent'), 0.25)
    // `[read]` **In Kilokalorien schon.**
    assert.equal(inEinheit(0.25, null, 'kcal'), null)
  })

  it('der Schalter ist EIN Knopfpaar, kein zweites Feld', () => {
    // `[read]` **E-83: „Zwei Eingabefelder fuer dieselbe Groesse
    // waere die Fehlerklasse aus G-529."**
    const q = lies(join(GOALS, 'einheiten-schalter.tsx'))
    assert.match(q, /data-einheit=\{e\}/, 'die Knoepfe tragen keine Marke')
    assert.ok(!/<input/.test(q),
      'der Schalter bringt ein eigenes Eingabefeld mit — zwei Felder '
      + 'fuer eine Groesse laufen auseinander (G-529)')
  })

  it('ohne Gewicht ist der kcal-Knopf gesperrt, mit Grund', () => {
    const q = lies(join(GOALS, 'einheiten-schalter.tsx'))
    assert.match(q, /const gesperrt = e === 'kcal' && ohneGewicht/,
      'ohne Gewicht laesst sich auf kcal schalten — dann stuende '
      + 'dort eine erfundene Zahl')
    assert.match(q, /Ohne Koerpergewicht/,
      'die Sperre nennt keinen Grund')
  })

  // ── Je Stelle: EIN Zustand, die Rate ────────────────────────────
  it('das Eingabefeld rechnet auf die Rate zurueck', () => {
    for (const datei of ['phase-setzen.tsx', 'phasen-editor-echt.tsx']) {
      const q = lies(join(GOALS, datei))
      assert.match(q, /ausEinheit\(/,
        `${datei}: die Eingabe wird nicht auf die Rate zurueckgerechnet`)
      assert.match(q, /<EinheitenSchalter/,
        `${datei}: es gibt keinen Umschalter`)
    }
  })

  it('die Anzeige rechnet in die gewaehlte Einheit', () => {
    const q = lies(join(GOALS, 'phase-echt.tsx'))
    assert.match(q, /inEinheit\(phase\.zielrate_pct_kg_woche, gewichtKg, gewaehlt\)/,
      'die Phasenkachel zeigt immer Prozent')
  })

  it('keine Stelle rechnet selbst mit 11', () => {
    // `[read]` **A2: „Die Umrechnung liegt server-frei in
    // `lib/goals/` und wird nicht in der Komponente wiederholt."**
    for (const datei of ['phase-setzen.tsx', 'phasen-editor-echt.tsx',
      'phase-echt.tsx', 'einheiten-schalter.tsx']) {
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

// ════════════════════════════════════════════════════════════════
// A4 — die Wahl gehoert dem Nutzer
// ════════════════════════════════════════════════════════════════

describe('G-565/A4 — eine Einstellung, keine Spalte', () => {
  const E = () => lies(join(HIER, '..', 'einheit-speichern.ts'))

  it('sie liegt in user_display_preferences', () => {
    // `[cmd]` **Den Ort gibt es seit C-161** — eine Zeile je Nutzer
    // und Schluessel, `value jsonb`, vier RLS-Regeln (gemessen).
    const q = E()
    assert.match(q, /from\('user_display_preferences'\)/,
      'die Einstellung liegt woanders')
    assert.match(q, /onConflict: 'user_id,preference_key'/,
      'es entsteht eine zweite Zeile je Nutzer statt eines Upserts')
  })

  it('der Schluessel traegt sein Modul', () => {
    // `[read]` **Wie `nutrition.nutrient_tree`** — die zwei Zeilen,
    // die heute live stehen.
    assert.match(E(), /EINHEIT_SCHLUESSEL = 'goals\.zielrate_einheit'/,
      'der Schluessel ist nicht abgegrenzt — dann kollidiert er')
  })

  it('sie steht NICHT an der Phase', () => {
    // `[read]` **E-83: „eine Einstellung, keine Spalte in
    // `goal_phases`."**
    const q = E()
    assert.ok(!/goal_phases/.test(q),
      'die Einheit wird an die Phase geschrieben — sie gehoert dem '
      + 'Nutzer, nicht der Phase')
  })

  it('der Schreibweg zaehlt seine Zeilen', () => {
    // `[read]` **G-79** — ein vom Zeilenschutz gefiltertes Upsert
    // kaeme sonst als Erfolg zurueck.
    const q = E()
    const i = q.indexOf('export async function speichereEinheit')
    const rumpf = q.slice(i, i + 900)
    assert.match(rumpf, /\.select\('preference_key'\)/,
      'das Upsert zaehlt die Zeilen nicht (G-79)')
    assert.match(rumpf, /data\.length === 0/,
      'die Zeilenzahl wird nicht geprueft')
  })

  it('ein Lesefehler faellt auf die Vorgabe, nicht auf einen Fehler', () => {
    // `[read]` **Die Einheit ist eine Darstellung, kein Datum** —
    // sie darf die Seite nicht verhindern.
    const q = E()
    const i = q.indexOf('export async function ladeEinheit')
    const rumpf = q.slice(i, i + 900)
    assert.match(rumpf, /if \(error \|\| !data\) return EINHEIT_VORGABE/,
      'ein Lesefehler wird geworfen — dann faellt die ganze Seite '
      + 'wegen einer Anzeigeeinstellung')
  })

  it('die Vorgabe ist Prozent', () => {
    // `[read]` **Die gespeicherte Groesse gilt ohne Gewicht** —
    // kcal braucht eines, und das fehlt bei einem neuen Nutzer.
    assert.match(E(), /EINHEIT_VORGABE: Rateneinheit = 'prozent'/,
      'die Vorgabe braucht ein Gewicht, das es noch nicht gibt')
  })
})

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
    for (const datei of ['strategie-vorschau.tsx', 'strategie-wahl.tsx']) {
      const q = lies(join(GOALS, datei))
      assert.ok(!/<EinheitenSchalter/.test(q),
        `${datei} zeigt einen Einheitenschalter — der Katalog gilt `
        + 'fuer alle Nutzer, eine Kilokalorienzahl fuer einen (E-83)')
    }
  })
})
