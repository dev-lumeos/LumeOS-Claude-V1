/**
 * G-573 — `rateAusKcal` gab es zweimal, mit verschiedener Rundung
 *
 * `[cmd]` **Zwei exportierte Funktionen, derselbe Name, dieselbe
 * Aufgabe, andere Rundung:**
 *
 *     anpassung.ts:144          Math.round((kcal / (11 * kg)) * 1000) / 1000
 *     zielrate-einheit.ts:113   rundeWieDb(kcal / (11 * kg), 3)
 *
 * `[cmd]` **`wochenAnpassung` rief die mit `Math.round`**
 * (`anpassung.ts:207`), der Einheitenschalter aus G-565 die andere.
 *
 * `[read]` **Das ist die Fehlerklasse aus G-565, unter demselben
 * Namen wieder eingebaut** — Postgres rundet die Haelfte von der Null
 * WEG, JavaScript nach oben. **Bei negativen Werten laufen sie
 * auseinander, und Abnehmen ist der negative Fall.**
 *
 * `[read]` **Und kein Waechter deckte es ab:** der `Math.round`-Test
 * aus G-569 liest nur `waechter-schwellen.ts`, die Zusicherung
 * *,,keine Datei rechnet selbst in Prozent um"* prueft ein anderes
 * Muster. **Die Dublette stand 70 Zeilen ueber dem Aufruf.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  rateAusKcal, kcalAusRate, rundeWieDb, E1_FAKTOR, RATE_STELLEN,
} from '../zielrate-einheit'
import { rateAusKcal as ausAnpassung } from '../anpassung'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..')

// `[read]` **Kommentare raus, bevor gesucht wird** — sonst faellt der
// Waechter ueber die Begruendung, die genau diese Form zitiert
// (dieselbe Falle wie in G-569).
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

/**
 * `[cmd]` **Die alte Fassung, wortgleich aus `anpassung.ts:144`** —
 * damit A1 messbar bleibt, nachdem sie geloescht ist.
 */
const alteFassung = (
  kcal: number, gewichtKg: number | null | undefined,
): number | null => {
  if (gewichtKg === null || gewichtKg === undefined || gewichtKg <= 0) return null
  return Math.round((kcal / (11 * gewichtKg)) * 1000) / 1000
}

// ════════════════════════════════════════════════════════════════
// A1 — wie weit lagen die zwei auseinander?
// ════════════════════════════════════════════════════════════════

describe('G-573/A1 — die Dublette wich ab, aber nicht an den Spec-Betraegen', () => {
  // `[cmd]` **Vier Faelle, gegen die LAUFENDE Datenbank gehalten**
  // (2026-10-01, `round(kcal/(11*kg), 3)`):
  //
  //     -220 kcal @ 64 kg    -> -0.313   (alt -0.312)
  //     -110 kcal @ 160 kg   -> -0.063   (alt -0.062)
  //     +528 kcal @ 51,2 kg  ->  0.938   (alt  0.937)
  //     +242 kcal @ 70,4 kg  ->  0.313   (alt  0.312)
  //
  // `[read]` **Die zwei positiven stehen dabei**, weil die erste
  // Annahme — ,,nur negative" — falsch war.
  it('vier Halbfaelle: die alte Fassung wich von der DB ab', () => {
    const faelle: [number, number, number, number][] = [
      [-220, 64, -0.312, -0.313],
      [-110, 160, -0.062, -0.063],
      [528, 51.2, 0.937, 0.938],
      [242, 70.4, 0.312, 0.313],
    ]
    for (const [kcal, kg, alt, db] of faelle) {
      assert.equal(alteFassung(kcal, kg), alt,
        `alte Fassung, ${kcal} kcal bei ${kg} kg`)
      assert.equal(rateAusKcal(kcal, kg), db,
        `gegen die DB gemessen, ${kcal} kcal bei ${kg} kg`)
    }
  })

  // `[cmd]` **Die Grundgesamtheit, nachgerechnet statt behauptet:**
  // 40,0-200,0 kg in 0,1er-Schritten x -1000..+1000 kcal.
  it('ueber den erreichbaren Bereich: 184 Abweichungen, je 0,001', () => {
    let faelle = 0
    const abw: { kcal: number; diff: number }[] = []
    for (let g10 = 400; g10 <= 2000; g10++) {
      const kg = g10 / 10
      for (let kcal = -1000; kcal <= 1000; kcal++) {
        faelle++
        const a = alteFassung(kcal, kg)!
        const b = rateAusKcal(kcal, kg)!
        if (a !== b) abw.push({ kcal, diff: Math.abs(b - a) })
      }
    }
    assert.equal(faelle, 3203601, 'die Grundgesamtheit hat sich verschoben')
    assert.equal(abw.length, 184, 'die Zahl aus dem Bericht stimmt nicht mehr')
    assert.ok(abw.every((x) => Math.abs(x.diff - 0.001) < 1e-9),
      'jede Abweichung ist genau eine Rateneinheit')

    // `[read]` **Nicht alle negativ** — die erste Annahme war falsch.
    // `[cmd]` **174 negativ, 10 positiv.** Oberhalb der Null trennen
    // sie sich auch, weil die Gleitkommadarstellung das Produkt
    // knapp unter die Haelfte legt. **Der negative Fall ueberwiegt,
    // er ist nicht der einzige.**
    assert.equal(abw.filter((x) => x.kcal < 0).length, 174, 'negativ')
    assert.equal(abw.filter((x) => x.kcal > 0).length, 10, 'positiv')
  })

  // `[cmd]` **DER Grund, warum es niemand gemerkt hat** — und die
  // Antwort auf A1: **im erreichbaren Bereich gibt es an den echten
  // Aufrufstellen KEINE Abweichung.**
  //
  // `[read]` **Eine Abweichung verlangt, dass `kcal/(11*kg)` exakt
  // auf der halben Stelle landet** — und das geht nur, wenn 11 den
  // kcal-Betrag teilt. `[cmd]` **Alle 99 abweichenden Betraege sind
  // durch 11 teilbar; die vier Spec-Betraege sind es nicht.**
  it('an den vier Spec-Betraegen deckten sich beide — deshalb still', () => {
    // 1-Gramm-Raster, 30-250 kg: 220.001 Gewichte je Betrag.
    for (const kcal of [-100, +150, +100]) {
      let abw = 0
      for (let g = 30000; g <= 250000; g++) {
        const kg = g / 1000
        if (alteFassung(kcal, kg) !== rateAusKcal(kcal, kg)) abw++
      }
      assert.equal(abw, 0,
        `${kcal} kcal weicht doch ab — dann war der Fehler sichtbar`)
      assert.ok(kcal % 11 !== 0, `${kcal} ist durch 11 teilbar`)
    }
  })

  it('durch 11 teilbar, und die Abweichung ist da', () => {
    // `[read]` **Die Gegenprobe zum Satz oben** — ohne sie ist
    // ,,keine Abweichung" nur eine Suche, die nichts gefunden hat.
    let abw = 0
    for (let g10 = 400; g10 <= 2000; g10++) {
      if (alteFassung(-110, g10 / 10) !== rateAusKcal(-110, g10 / 10)) abw++
    }
    assert.equal(abw, 1, '-110 kcal weicht bei genau einem Gewicht ab')
    assert.equal(alteFassung(-110, 160), -0.062)
    assert.equal(rateAusKcal(-110, 160), -0.063)
  })
})

// ════════════════════════════════════════════════════════════════
// A2 — eine Rechnung
// ════════════════════════════════════════════════════════════════

describe('G-573/A2 — es gibt nur noch eine Fassung', () => {
  it('anpassung.ts rechnet nicht mehr selbst', () => {
    const q = lies(join(GOALS, 'anpassung.ts'))
    assert.ok(!/export function rateAusKcal/.test(q),
      'anpassung.ts definiert rateAusKcal wieder selbst')
    // `[read]` **Die Bindung pruefen, nicht die Zeilenform** — die
    // Importliste wuchs beim Umbau um `rundeWieDb`, und ein Waechter
    // auf den genauen Wortlaut faellt dann ohne Sache (G-569).
    assert.match(q, /import \{[^}]*\brateAusKcal\b[^}]*\} from '\.\/zielrate-einheit'/,
      'anpassung.ts holt die Rechnung nicht aus zielrate-einheit.ts')
  })

  it('beide Einstiege sind dieselbe Funktion', () => {
    // `[read]` **Identitaet, nicht Gleichheit** — zwei Funktionen mit
    // gleichem Ergebnis waeren wieder zwei Rechnungen.
    assert.equal(ausAnpassung, rateAusKcal,
      'anpassung.ts exportiert eine ANDERE Funktion als '
      + 'zielrate-einheit.ts — die Dublette ist zurueck')
  })

  it('die schaerfere Gewichtspruefung ist mitgewandert', () => {
    // `[cmd]` **Die alte Fassung prueft `<= 0`, die kanonische prueft
    // auf `0`.** `[read]` **Ohne das Mitnehmen verliert der Umbau
    // still eine Zusicherung:** bei `-80 kg` ergab die kanonische
    // Fassung `+0,114` — ein Vorzeichenwechsel aus dem Nichts.
    assert.equal(rateAusKcal(-100, -80), null,
      'negatives Gewicht dreht das Vorzeichen, statt null zu geben')
    assert.equal(rateAusKcal(-100, 0), null, 'Gewicht 0 ergibt keine Rate')
    assert.equal(rateAusKcal(-100, null), null,
      'eine Rate ohne Gewicht waere erfunden')
  })

  // `[cmd]` **Die ZWEITE Stelle, die der Punkt nicht nannte.**
  // `anpassung.ts:235` rundete `rate_delta` ebenfalls mit
  // `Math.round(… * 1000) / 1000` — **gefunden vom Waechter aus A3**,
  // nicht vom Auftrag. `[read]` **Dieselbe Groesse (`numeric(5,3)`),
  // dieselbe Rundungsfalle, und `rate - rateJetzt` ist beim Senken
  // negativ.**
  it('rate_delta rundet nicht mehr mit Math.round', () => {
    const q = lies(join(GOALS, 'anpassung.ts'))
    assert.ok(!/rate_delta:\s*Math\.round/.test(q),
      'rate_delta rundet wieder mit Math.round (G-573, zweite Stelle)')
    assert.match(q, /rate_delta:\s*rundeWieDb\(/,
      'rate_delta rundet nicht ueber rundeWieDb')
  })

  it('die zwei Rundungen trennen sich an einer echten Differenz', () => {
    // `[read]` **Ohne einen Fall, an dem sie auseinanderlaufen, misst
    // der Test oben nur einen Dateiinhalt.**
    const diff = -0.0005
    assert.equal(Math.round(diff * 1000) / 1000, -0,
      'Math.round legt die Haelfte nach oben')
    assert.equal(rundeWieDb(diff, RATE_STELLEN), -0.001,
      'rundeWieDb legt sie von der Null weg — wie Postgres')
  })

  it('die Auftragswerte aus G-520 kommen unveraendert heraus', () => {
    // `[read]` **Der Umbau darf die geprueften Werte nicht bewegen.**
    assert.equal(rateAusKcal(-100, 80), -0.114)
    assert.equal(rateAusKcal(150, 80), 0.17)
    assert.equal(rateAusKcal(-100, 45), -0.202)
    assert.equal(rateAusKcal(-100, 120), -0.076)
  })
})

// ════════════════════════════════════════════════════════════════
// A3 — der Waechter sucht die FORM, nicht den Namen
// ════════════════════════════════════════════════════════════════

/**
 * `[cmd]` **Die Form:** eine Division durch `11 * Gewicht`.
 *
 * `[read]` **Der Name allein genuegt nicht** — eine Dublette kann
 * `rateAus`, `pctAusKcal` oder gar nichts heissen. **Gesucht wird
 * die Rechnung**, in den Schreibweisen, die hier wirklich
 * vorkommen: `11 * x`, `11 x`, `E1_FAKTOR * x` — mit oder ohne
 * Klammer.
 */
// `[cmd]` **`[\w$.!?]` — das `!` gehoert dazu.** Die Sabotageprobe
// schrieb `kcal / (11 * gewichtKg!)` und kam GRUEN durch: die
// Nicht-Null-Zusicherung stand nicht in der Zeichenklasse. `[read]`
// **Der Waechter verfehlte die naheliegendste TypeScript-Schreibweise
// genau der Rechnung, die er verbietet** — und `?.` ebenso.
const NAME = String.raw`[A-Za-z_$][\w$.!?]*`

const FORM = [
  // `/ (11 * gewichtKg)` · `/(11*kg!)` · `/ (E1_FAKTOR * gewicht)`
  new RegExp(String.raw`\/\s*\(\s*(?:11|E1_FAKTOR)\s*\*\s*${NAME}\s*\)`),
  // `/ 11 / gewichtKg` — dieselbe Rechnung, anders geklammert
  new RegExp(String.raw`\/\s*11\s*\/\s*${NAME}`),
  // `* (1 / (11 * kg))` fiele unter die erste; `kcal / 11 * kg` nicht:
  // das ist eine ANDERE Rechnung und darf nicht verboten sein.
]

describe('G-573/A3 — niemand rechnet die Rate selbst aus', () => {
  // `[cmd]` **Alle `.ts` unter `lib/goals/`, ausser der kanonischen
  // Datei selbst.** `[read]` **Der Heuhaufen ist begrenzt und wird
  // GEZAEHLT** — eine Liste, die leer laeuft, prueft nichts.
  const dateien = readdirSync(GOALS)
    .filter((f) => f.endsWith('.ts'))
    .filter((f) => f !== 'zielrate-einheit.ts')

  it('der Heuhaufen ist nicht leer', () => {
    assert.ok(dateien.length >= 8,
      `nur ${dateien.length} Dateien geprueft — der Waechter laeuft `
      + 'ins Leere, wenn das Verzeichnis anders heisst')
    assert.ok(dateien.includes('anpassung.ts'),
      'anpassung.ts ist die Datei, um die es geht')
  })

  for (const datei of ['anpassung.ts']) {
    it(`${datei} ist namentlich abgedeckt`, () => {
      assert.ok(dateien.includes(datei), `${datei} fehlt im Heuhaufen`)
    })
  }

  it('keine Datei teilt selbst durch 11 x Gewicht', () => {
    const treffer: string[] = []
    for (const datei of dateien) {
      const q = lies(join(GOALS, datei))
      for (const m of FORM) if (m.test(q)) treffer.push(`${datei} (${m.source})`)
    }
    assert.deepEqual(treffer, [],
      'diese Dateien rechnen die Rate selbst aus, statt rateAusKcal '
      + 'zu rufen — zwei Rechnungen gehen auseinander (G-573)')
  })

  it('der Waechter trifft die Form, die er sucht', () => {
    // `[read]` **Eine Suche, die nichts findet, beweist nichts** —
    // erst an einem bekannten Fall eichen. **Das ist die geloeschte
    // Zeile, wortgleich.**
    const geloescht = 'return Math.round((kcal / (11 * gewichtKg)) * 1000) / 1000'
    assert.ok(FORM.some((m) => m.test(geloescht)),
      'der Waechter findet die geloeschte Dublette nicht — dann '
      + 'findet er auch die naechste nicht')

    // `[cmd]` **Umschreibungen, die er auch treffen muss.**
    //
    // `[read]` **Die mit `!` steht hier, weil sie den Waechter einmal
    // ausgetrickst hat:** die Sabotageprobe baute
    // `kcal / (11 * gewichtKg!)` ein und blieb GRUEN. **Die
    // Zeichenklasse kannte das `!` nicht.**
    for (const q of [
      'const r = kcal / (11 * kg)',
      'return kcal / (E1_FAKTOR * gewicht)',
      'const r = kcal / 11 / gewichtKg',
      'const r = kcal / (11 * gewichtKg!)',
      'const r = kcal / (11 * d.gewichtAmStichtagKg!)',
      'const r = kcal / 11 / gewichtKg!',
      'const r=kcal/(11*kg)',
    ]) {
      assert.ok(FORM.some((m) => m.test(q)), `nicht getroffen: ${q}`)
    }

    // `[read]` **Und was er NICHT treffen darf** — sonst sperrt er
    // die Hinrichtung mit (`kcal = 11 * rate * gewicht`).
    for (const q of [
      'return rundeWieDb(E1_FAKTOR * rate * gewichtKg, KCAL_STELLEN)',
      'const kcal = 11 * rate * kg',
      'const x = summe / 11',
    ]) {
      assert.ok(!FORM.some((m) => m.test(q)), `faelschlich getroffen: ${q}`)
    }
  })

  it('niemand rundet eine RATE mit Math.round', () => {
    // `[cmd]` **G-569 prueft `Math.round` nur fuer
    // `waechter-schwellen.ts`** — genau deshalb fiel die Dublette
    // durch.
    //
    // `[read]` **Aber ein pauschales Verbot waere der falsche
    // Waechter.** `[cmd]` **Gemessen am 2026-10-01: fuenf weitere
    // Dateien in `lib/goals/` benutzen `Math.round`** —
    // `pace.ts:108` zaehlt Tage, `verhaeltnisse.ts:270` rechnet BMI,
    // `strategie-regeln.ts:204` macht Prozent aus `tdee_modifier`,
    // `koerpermass-rechnung.ts:117` rundet Zentimeter,
    // `editor-rechnungen.ts:67` ein Wochenmittel. **Keine davon ist
    // die Rate, die `goals.kcal_delta_aus_zielrate` spiegelt.**
    //
    // `[read]` **Verboten ist die Verbindung:** `Math.round` auf drei
    // Stellen (`* 1000`), die Aufloesung von `numeric(5,3)`, **in
    // einer Datei, die ueberhaupt mit Raten umgeht.**
    //
    // `[cmd]` **`verhaeltnisse.ts:73` traegt dieselbe Form fuer einen
    // Umfangsquotienten (Arm zu Bein)** — kein Rate-Wert, nie in
    // `zielrate_pct_kg_woche` geschrieben. **Deshalb grenzt der
    // Heuhaufen ein, statt eine Ausnahmeliste zu fuehren:** eine
    // Datei zaehlt, wenn sie `rate`/`zielrate` oder `kcal` fuehrt.
    const treffer: string[] = []
    for (const datei of dateien) {
      const q = lies(join(GOALS, datei))
      if (!/\b(?:zielrate|rateAusKcal|kcalAusRate|rate_delta)\b/.test(q)) continue
      if (/Math\.round\s*\([^;\n]*\*\s*1000\s*\)\s*\/\s*1000/.test(q)) {
        treffer.push(datei)
      }
    }
    assert.deepEqual(treffer, [],
      'Math.round rundet die Haelfte nach oben, Postgres von der Null '
      + 'weg — bei negativen Werten laufen sie auseinander (G-565). '
      + 'Fuer Raten rundeWieDb aus zielrate-einheit.ts benutzen')

    // `[read]` **Die Eingrenzung darf den Heuhaufen nicht leeren.**
    // `[cmd]` **`anpassung.ts` MUSS durch den Filter kommen** — das
    // ist die Datei, in der die Dublette stand. Kaeme sie nicht
    // durch, waere der Waechter gruen und blind.
    const geprueft = dateien.filter((d) =>
      /\b(?:zielrate|rateAusKcal|kcalAusRate|rate_delta)\b/.test(
        lies(join(GOALS, d))))
    assert.ok(geprueft.includes('anpassung.ts'),
      'anpassung.ts faellt aus dem Filter — der Waechter prueft die '
      + 'Datei nicht mehr, um die es geht')
    assert.ok(geprueft.length >= 3,
      `nur ${geprueft.length} Dateien nach dem Filter — zu eng`)
  })
})

// ════════════════════════════════════════════════════════════════
// A4 — gegen die Datenbank, in beide Richtungen
// ════════════════════════════════════════════════════════════════

/**
 * `[cmd]` **Die Gegenseite ist `goals.kcal_delta_aus_zielrate`**
 * (`20260927034024_g511_phase_calories.sql:122`):
 *
 *     round(11 * p_zielrate * p_gewicht_kg, 1)
 *
 * `[cmd]` **Postgres `round(numeric, int)` rundet die Haelfte von der
 * Null WEG** — `rundeWieDb` bildet genau das nach.
 *
 * `[read]` **Die 126 gemessenen Faelle aus G-565 sind die Vorlage.**
 * Hier laeuft dasselbe Raster, jetzt ueber BEIDE Richtungen.
 *
 * ══ GEGEN DIE LAUFENDE FUNKTION GEHALTEN ═════════════════════════
 *
 * `[cmd]` **2026-10-01 ausgefuehrt:** dieselben 126 Paare als
 * `select goals.kcal_delta_aus_zielrate(r, g)` gegen die Datenbank,
 * das Ergebnis gegen `kcalAusRate` und zurueck durch `rateAusKcal`.
 * **126 Faelle, 0 Abweichungen auf dem Hinweg, 0 auf dem Rueckweg.**
 *
 * `[read]` **Dieser Test rechnet die Formel nach, er ruft die
 * Datenbank nicht** — eine Zusicherung mit DB-Verbindung liefe im
 * Gate nicht. **Der Lauf gegen die echte Funktion steht im Bericht
 * zu G-573**, die Zahlen unten sind seine Festschreibung.
 */
const GEWICHTE = [45, 55.5, 60, 72.3, 80, 83.74, 95, 110, 120]
const RATEN = [-2.5, -1.0, -0.75, -0.5, -0.25, -0.114, 0, 0.17, 0.25, 0.5, 0.75, 1.0, 2.0, 2.5]

describe('G-573/A4 — beide Wege liefern dieselbe Zahl wie die DB', () => {
  it('das Raster hat die Groesse der G-565-Vorlage', () => {
    assert.equal(GEWICHTE.length * RATEN.length, 126,
      'G-565 hat 126 Faelle gemessen — eine andere Zahl ist eine '
      + 'andere Messung')
  })

  it('Hinrichtung: 126 Faelle gegen round(11 x rate x kg, 1)', () => {
    let n = 0
    for (const kg of GEWICHTE) {
      for (const rate of RATEN) {
        n++
        // `[cmd]` **Die DB-Formel, nachgebildet** — `round(…, 1)` mit
        // der Haelfte von der Null weg.
        const db = rundeWieDb(11 * rate * kg, 1)
        assert.equal(kcalAusRate(rate, kg), db,
          `Hinweg weicht ab: ${rate} %/Woche bei ${kg} kg`)
      }
    }
    assert.equal(n, 126, '126 Faelle, 0 Abweichungen')
  })

  it('Rueckrichtung: 126 Faelle, und der zweite Durchgang bewegt nichts', () => {
    let n = 0
    for (const kg of GEWICHTE) {
      for (const rate of RATEN) {
        n++
        const kcal = kcalAusRate(rate, kg)!
        const zurueck = rateAusKcal(kcal, kg)!
        // `[read]` **Nicht `=== rate`** — `numeric(5,3)` ist die
        // Grenze, und der Hinweg rundet auf 0,1 kcal. **Die Zusage
        // ist: hoechstens eine halbe Rateneinheit, und der ZWEITE
        // Durchgang aendert nichts mehr.**
        assert.ok(Math.abs(zurueck - rate) <= 0.5 * 10 ** -RATE_STELLEN + 1e-9,
          `Rueckweg driftet: ${rate} bei ${kg} kg -> ${zurueck}`)
        assert.equal(rateAusKcal(kcalAusRate(zurueck, kg), kg), zurueck,
          `der zweite Durchgang bewegt die Rate noch: ${rate} bei ${kg} kg`)
      }
    }
    assert.equal(n, 126, '126 Faelle, 0 Abweichungen')
  })

  it('der Weg ueber anpassung.ts liefert dieselbe Zahl', () => {
    // `[read]` **Dieselbe Frage am anderen Einstieg** — A2 prueft die
    // Identitaet, das hier prueft die Zahl.
    let n = 0
    for (const kg of GEWICHTE) {
      for (const rate of RATEN) {
        n++
        const kcal = kcalAusRate(rate, kg)!
        assert.equal(ausAnpassung(kcal, kg), rateAusKcal(kcal, kg),
          `die zwei Einstiege weichen ab: ${rate} bei ${kg} kg`)
      }
    }
    assert.equal(n, 126)
  })

  it('der Faktor ist 11 — E-1, nicht geraten', () => {
    assert.equal(E1_FAKTOR, 11, 'E-1: kcal/Tag = 11 x Rate x Gewicht')
    assert.equal(RATE_STELLEN, 3, 'numeric(5,3) ist die Grenze')
  })
})
