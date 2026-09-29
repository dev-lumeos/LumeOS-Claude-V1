/**
 * G-522/A3 — der Vertrag fuer einen Modulbeitrag
 *
 * `[cmd]` **G-522 hat zwei Bauarten ohne Vertrag gemessen:**
 * nutrition in TypeScript (`packages/scoring/src/nutrition.ts`),
 * recovery in SQL (`recovery.scores`, sieben Teilscores).
 *
 * `[read]` **Diese Datei legt die vier Gewichtungsreihen aus
 * `docs/specs/Goals/SCORING.md:51-56` DANEBEN** — ausgeschrieben,
 * nicht aus `CONTRIBUTION_WEIGHTS` abgeleitet. `[read]` **Sonst
 * prueft sich die Tabelle gegen sich selbst und kann nicht falsch
 * werden.**
 *
 * `[cmd]` **Sabotageprobe 2026-09-28:** ein verstelltes Gewicht
 * (`nutrition: 0.40` -> `0.45` bei `body_composition_loss`) macht
 * die Probe ROT, die Rueckstellung wieder GRUEN. **Beide Richtungen
 * im Bericht.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  BEITRAGSMODULE, CONTRIBUTION_WEIGHTS, ZIELTYP_RUECKFALL,
  berechneZielfortschritt, giltFuerBilanz, alsModulbeitrag,
  type Beitragsmodul,
} from '../beitrag'
import { nutritionScore } from '../nutrition'

// ── Die Spec, Wort fuer Wort ausgeschrieben ──────────────────────
// [cmd] docs/specs/Goals/SCORING.md:51-56
const AUS_DER_SPEC: Record<string, Record<Beitragsmodul, number>> = {
  body_composition_loss: {
    nutrition: 0.40, training: 0.25, recovery: 0.20, supplements: 0.10, medical: 0.05,
  },
  body_composition_gain: {
    nutrition: 0.30, training: 0.35, recovery: 0.20, supplements: 0.10, medical: 0.05,
  },
  performance_strength: {
    nutrition: 0.25, training: 0.40, recovery: 0.20, supplements: 0.10, medical: 0.05,
  },
  health: {
    nutrition: 0.25, training: 0.20, recovery: 0.20, supplements: 0.15, medical: 0.20,
  },
}

describe('G-522/A3.2 — die Gewichtungen stehen so in der Spec', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.equal(Object.keys(AUS_DER_SPEC).length, 4,
      'nicht vier Zieltypen — SCORING.md:51-56 nennt vier')
    assert.equal(BEITRAGSMODULE.length, 5,
      'nicht fuenf Module — DATABASE.md:149 nennt fuenf')
  })

  for (const [zieltyp, erwartet] of Object.entries(AUS_DER_SPEC)) {
    it(`${zieltyp} — je Modul das Gewicht aus SCORING.md`, () => {
      const gebaut = CONTRIBUTION_WEIGHTS[zieltyp]
      assert.ok(gebaut, `${zieltyp} fehlt in CONTRIBUTION_WEIGHTS`)
      for (const [modul, gewicht] of Object.entries(erwartet)) {
        assert.equal(gebaut[modul as Beitragsmodul], gewicht,
          `${zieltyp}.${modul}: gebaut ${gebaut[modul as Beitragsmodul]}, `
          + `Spec ${gewicht}`)
      }
    })

    it(`${zieltyp} — die Reihe summiert auf 1,00`, () => {
      const summe = Object.values(CONTRIBUTION_WEIGHTS[zieltyp])
        .reduce((s, g) => s + g, 0)
      // `[read]` **Gleitkomma** — 0.4+0.25+0.2+0.1+0.05 ist nicht
      // exakt 1. Deshalb auf sechs Stellen.
      assert.equal(Math.round(summe * 1e6) / 1e6, 1,
        `${zieltyp} summiert auf ${summe}, nicht auf 1,00 — `
        + 'calcGoalProgress teilt durch diese Summe')
    })
  }

  it('jede Reihe nennt GENAU die fuenf Module aus dem CHECK', () => {
    for (const [zieltyp, reihe] of Object.entries(CONTRIBUTION_WEIGHTS)) {
      assert.deepEqual(Object.keys(reihe).sort(), [...BEITRAGSMODULE].sort(),
        `${zieltyp} nennt andere Module als DATABASE.md:149`)
    }
  })
})

describe('G-522/A3.2 — berechneZielfortschritt folgt SCORING.md:58-81', () => {
  it('der Rueckfall greift bei unbekanntem Zieltyp', () => {
    // [cmd] SCORING.md:62
    const a = berechneZielfortschritt({ nutrition: 80 }, 'gibtsnicht')
    const b = berechneZielfortschritt({ nutrition: 80 }, ZIELTYP_RUECKFALL)
    assert.deepEqual(a, b,
      'ein unbekannter Zieltyp faellt nicht auf body_composition_gain')
  })

  it('alle Module auf 100 ergeben 100', () => {
    const e = berechneZielfortschritt({
      nutrition: 100, training: 100, recovery: 100,
      supplements: 100, medical: 100,
    }, 'health')
    assert.equal(e.overall_score, 100)
    assert.equal(e.status, 'excellent')
    assert.deepEqual(e.ohne_wert, [])
  })

  // ── Die Schwellen, von beiden Seiten ────────────────────────────
  //
  // `[read]` **Je Schwelle ein Wert darueber und einer darunter** —
  // eine Probe, die nur die Mitte trifft, bliebe gruen, wenn die
  // Grenze verrutscht.
  for (const [wert, status] of [
    [80, 'excellent'], [79, 'on_track'],
    [65, 'on_track'], [64, 'needs_attention'],
    [50, 'needs_attention'], [49, 'at_risk'],
  ] as Array<[number, string]>) {
    it(`Score ${wert} ist „${status}"`, () => {
      // Alle fuenf gleich, damit der gewichtete Schnitt = der Wert ist.
      const e = berechneZielfortschritt({
        nutrition: wert, training: wert, recovery: wert,
        supplements: wert, medical: wert,
      }, 'health')
      assert.equal(e.overall_score, wert)
      assert.equal(e.status, status)
    })
  }

  // ── Fehlt ist nicht null (G-524) ────────────────────────────────
  it('ein fehlendes Modul zaehlt als 0 — wird aber GENANNT', () => {
    const e = berechneZielfortschritt({ nutrition: 100 }, 'health')
    // [cmd] SCORING.md:66 — `contributions[module] ?? 0`
    assert.equal(e.overall_score, 25,
      'die Spec rechnet fehlende Module als 0 (0.25 * 100 = 25)')
    // `[read]` **Der Unterschied zur Spec: sie sagt nicht, welche
    // fehlten.** `[cmd]` **G-524 belegt, warum das zaehlt:**
    // `test-user` hat KEINE TDEE-Reihe, nicht eine mit Nullen.
    assert.deepEqual(e.ohne_wert.sort(),
      ['medical', 'recovery', 'supplements', 'training'],
      'die fehlenden Module werden nicht genannt — dann sieht ein '
      + 'fehlendes Modul aus wie ein schlechtes')
  })

  it('null und undefined gelten beide als fehlend', () => {
    const e = berechneZielfortschritt(
      { nutrition: 100, training: null }, 'health')
    assert.ok(e.ohne_wert.includes('training'),
      'ein ausdrueckliches null gilt nicht als fehlend')
  })
})

describe('G-522/A3.1 — Zukunft zaehlt nicht in die Bilanz', () => {
  // `[cmd]` **Gemessen 2026-09-28: `recovery.scores` reicht bis
  // 2026-11-06, 78 von 370 Zeilen liegen in der Zukunft.**
  it('ein Tag nach dem Stichtag gilt nicht', () => {
    assert.equal(giltFuerBilanz('2026-11-06', '2026-09-28'), false,
      'ein Zukunftstag wird eingerechnet — Seed oder Vorhersage '
      + 'gehoert nicht in eine Bilanz')
  })
  it('der Stichtag selbst gilt', () => {
    assert.equal(giltFuerBilanz('2026-09-28', '2026-09-28'), true)
  })
  it('ein vergangener Tag gilt', () => {
    assert.equal(giltFuerBilanz('2026-05-21', '2026-09-28'), true)
  })
})

describe('G-522/A3.3 — nutrition erfuellt den Vertrag', () => {
  const ZIELE = {
    kcal: 2500, protein_g: 150, carbs_g: 300, fat_g: 70, fiber_g: 30,
  }

  it('ein gerechneter Score wird durchgereicht, nicht neu gebildet', () => {
    const e = nutritionScore(
      { enercc: 2500, prot625: 150, cho: 300, fat: 70, fibt: 30 },
      ZIELE, 'pro')
    const b = alsModulbeitrag(e, '2026-09-28')
    assert.equal(b.modul, 'nutrition')
    assert.equal(b.tag, '2026-09-28')
    assert.equal(b.score, e.score,
      'der Beitrag rechnet die Zahl neu — zwei Kopien driften')
    assert.equal(b.grund, undefined, 'ein gerechneter Score hat keinen Grund')
  })

  it('der Wertebereich ist 0 bis 100', () => {
    const e = nutritionScore(
      { enercc: 2500, prot625: 150, cho: 300, fat: 70, fibt: 30 },
      ZIELE, 'pro')
    assert.ok(e.score !== null && e.score >= 0 && e.score <= 100,
      `Score ${e.score} liegt ausserhalb 0..100 — DATABASE.md:152`)
  })

  it('kein Wert heisst null MIT Grund, nicht 0', () => {
    // Ohne Stufe gibt es keinen Faktor — nichts ist rechenbar.
    const e = nutritionScore(
      { enercc: null, prot625: null, cho: null, fat: null, fibt: null },
      ZIELE, null)
    const b = alsModulbeitrag(e, '2026-09-28')
    assert.equal(b.score, null,
      'ohne rechenbaren Anteil steht 0 statt null — eine 0 ist ein '
      + 'Ergebnis, ein null ist keins (G-524)')
    assert.ok(b.grund && b.grund.length > 0,
      'kein Grund genannt — dann weiss niemand, warum nichts kam')
  })
})
