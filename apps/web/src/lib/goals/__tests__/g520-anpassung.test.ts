/**
 * G-520 — der Anpassungsalgorithmus und die sieben Waechter
 *
 * `[cmd]` **Quelle: `docs/specs/Goals/PHASE_MODELS.md:184-229`.**
 * **Die Betraege und Bedingungen stehen dort; der Aufrufer fehlte.**
 *
 * ══ DER WIDERSPRUCH, GEGEN DEN GEBAUT WURDE ════════════════════════
 *
 * `[cmd]` **Die Spec gibt alle Betraege in KALORIEN, E1 speichert die
 * RATE.** `[read]` **Also wird jeder Betrag ueber das Gewicht
 * umgerechnet** — und der Test trifft BEIDE Raender, weil derselbe
 * kcal-Betrag bei 45 kg eine andere Rate ist als bei 120 kg.
 *
 * ══ A3: VORSCHLAGEN, NICHT HANDELN ═════════════════════════════════
 *
 * `[cmd]` **C-108/F-02, zitiert in E-56:51:** *,,nennen ja, bewerten
 * nein"*. **Keine Funktion hier schreibt** — ein eigener Test haelt
 * das fest.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  wochenAnpassung, rateAusKcal, haltInGrenzen, type Wochendaten,
} from '../anpassung'
import {
  pruefeWaechter, koerperfettSatz, BF_SCHWELLE, type Waechterlage,
} from '../uebergangswaechter'

const HIER = dirname(fileURLToPath(import.meta.url))

/** Alles vorhanden, nichts loest aus — je Test gezielt verstellt. */
const RUHE: Wochendaten = {
  weightTrend: -0.5, calorieAdherence: 90,
  // `[cmd]` **G-569: das Gewicht am Stichtag** — seit G-561 pruefen
  // die Waechter relativ. `[read]` **83,74 kg ist der Bezug, gegen
  // den Codex umgerechnet hat** (1,0 kg = 1,194 %), und -0,5 kg
  // sind dort 0,597 % — unter jeder Schwelle, also Ruhe.
  gewichtAmStichtagKg: 83.74,
  strengthTrend: 0, hrv7d: 60, hrvBaseline: 60,
}
const LAGE: Waechterlage = {
  art: 'fat_loss', wochen: 4, maxDauerWochen: null,
  koerperfettPct: 15, biologischesGeschlecht: 'male',
  hrvTageUnterGrenze: 0,
}

describe('G-520 — die Umrechnung kcal -> Rate', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.equal(BF_SCHWELLE.male, 5, 'die Spec nennt 5 % (M)')
    assert.equal(BF_SCHWELLE.female, 10, 'die Spec nennt 10 % (W)')
  })

  // `[cmd]` **Die zwei Werte aus dem Auftrag, bei 80 kg.**
  it('-100 kcal bei 80 kg sind -0,114 %/Woche', () => {
    assert.equal(rateAusKcal(-100, 80), -0.114)
  })
  it('+150 kcal bei 80 kg sind +0,170 %/Woche', () => {
    assert.equal(rateAusKcal(150, 80), 0.17)
  })

  // ── BEIDE RAENDER: derselbe Betrag, andere Rate ─────────────────
  //
  // `[read]` **Das ist der Befund, der zu E1 gefuehrt hat** — ein
  // kcal-Betrag ohne Gewicht ist keine Aussage.
  it('derselbe kcal-Betrag ergibt bei 45 und 120 kg verschiedene Raten', () => {
    const leicht = rateAusKcal(-100, 45)
    const schwer = rateAusKcal(-100, 120)
    assert.equal(leicht, -0.202, '45 kg')
    assert.equal(schwer, -0.076, '120 kg')
    assert.ok(Math.abs(leicht!) > Math.abs(schwer!) * 2,
      'die beiden Raender liegen nicht weit genug auseinander — '
      + 'dann misst der Test die Gewichtsabhaengigkeit nicht')
  })

  it('ohne Gewicht gibt es keine Rate', () => {
    assert.equal(rateAusKcal(-100, null), null,
      'eine Rate ohne Gewicht waere erfunden')
    assert.equal(rateAusKcal(-100, 0), null, 'Gewicht 0 ergibt keine Rate')
  })
})

describe('G-520 — die Aussengrenze und das Vorzeichen halten', () => {
  it('die Aussengrenze kappt nach unten und oben', () => {
    assert.deepEqual(haltInGrenzen('fat_loss', -3.0),
      { rate: -2.5, gekappt: 'auf -2.5 begrenzt (Aussengrenze)' })
    assert.deepEqual(haltInGrenzen('lean_bulk', 2.0),
      { rate: 1.5, gekappt: 'auf 1.5 begrenzt (Aussengrenze)' })
  })

  it('innerhalb der Grenze wird nicht gekappt', () => {
    assert.deepEqual(haltInGrenzen('fat_loss', -0.5),
      { rate: -0.5, gekappt: null })
  })

  // `[read]` **Das Vorzeichen darf nicht kippen** — sonst liefe der
  // Vorschlag gegen `goal_phases_zielrate_passt_zur_art`.
  it('ein Vorzeichenwechsel wird abgewiesen, nicht gekappt', () => {
    const r = haltInGrenzen('fat_loss', 0.2)
    assert.equal(r.rate, 0.2, 'der Wert wird veraendert statt abgewiesen')
    assert.match(r.gekappt ?? '', /Vorzeichen/,
      'ein Vorschlag, der fat_loss positiv machen wuerde, geht durch')
  })

  it('beim Halten bleibt die Rate nahe null', () => {
    assert.match(haltInGrenzen('maintenance', 0.5).gekappt ?? '',
      /zwischen -0,1 und \+0,1/)
    assert.equal(haltInGrenzen('maintenance', 0.05).gekappt, null)
  })
})

describe('G-520 — die sechs Regeln, Grenze von beiden Seiten', () => {
  // ── fat_loss, Plateau (:189) ────────────────────────────────────
  it('fat_loss Plateau: > -0,1 UND > 85 % greift, knapp darunter nicht', () => {
    const greift = wochenAnpassung('fat_loss', -0.5, 80,
      { ...RUHE, weightTrend: -0.05, calorieAdherence: 90 })
    assert.equal(greift.art, 'rate_senken')
    assert.match(greift.regel, /189/)

    // Genau auf der Grenze: -0.1 ist NICHT > -0.1
    const grenze = wochenAnpassung('fat_loss', -0.5, 80,
      { ...RUHE, weightTrend: -0.1, calorieAdherence: 90 })
    assert.notEqual(grenze.art, 'rate_senken',
      'weightTrend genau -0,1 loest aus — die Spec verlangt > -0,1')

    // Adherence zu niedrig
    const ohne = wochenAnpassung('fat_loss', -0.5, 80,
      { ...RUHE, weightTrend: -0.05, calorieAdherence: 85 })
    assert.notEqual(ohne.art, 'rate_senken',
      'Adherence genau 85 loest aus — die Spec verlangt > 85')
  })

  // ── fat_loss, zu schnell (:191) ─────────────────────────────────
  // ══ G-569: die Grenze ist RELATIV geworden ═════════════
  //
  // `[cmd]` Diese Pruefung hielt fest, dass `-1,0 kg/Woche` NICHT
  // ausloest. `[cmd]` **Seit G-561 prueft der Katalog relativ:**
  // `1,194 % KG/Woche`, und das sind bei 83,74 kg genau 0,9999 kg.
  // **Also loest 1,000 kg jetzt aus** — die Grenze hat sich nicht
  // verschoben, der BEZUG hat sich geaendert.
  //
  // `[read]` **Die eigentliche Frage bleibt:** greift sie knapp
  // darueber und knapp darunter? **Jetzt mit zwei Gewichten**, denn
  // genau dort laufen absolut und relativ auseinander.
  it('fat_loss zu schnell: die Grenze liegt bei 1,194 % KG/Woche', () => {
    // Bei 83,74 kg ist 1,194 % = 0,9999 kg.
    const greift = wochenAnpassung('fat_loss', -1.5, 80,
      { ...RUHE, weightTrend: -1.000, gewichtAmStichtagKg: 83.74 })
    assert.equal(greift.art, 'rate_heben',
      '1,000 kg bei 83,74 kg sind 1,194 % — das muss greifen')
    const knapp = wochenAnpassung('fat_loss', -1.5, 80,
      { ...RUHE, weightTrend: -0.999, gewichtAmStichtagKg: 83.74 })
    assert.notEqual(knapp.art, 'rate_heben',
      '0,999 kg bei 83,74 kg sind 1,193 % — das darf nicht greifen')
  })

  it('fat_loss zu schnell: dieselbe Strenge bei 60 kg', () => {
    // `[read]` **Das ist die Stelle, an der absolut und relativ
    // auseinanderlaufen** — bei 60 kg greift die relative Grenze
    // schon bei 0,717 kg, die alte absolute erst bei 1,0.
    const greift = wochenAnpassung('fat_loss', -1.5, 80,
      { ...RUHE, weightTrend: -0.717, gewichtAmStichtagKg: 60 })
    assert.equal(greift.art, 'rate_heben',
      '0,717 kg bei 60 kg sind 1,195 % — das muss greifen')
    const knapp = wochenAnpassung('fat_loss', -1.5, 80,
      { ...RUHE, weightTrend: -0.716, gewichtAmStichtagKg: 60 })
    assert.notEqual(knapp.art, 'rate_heben',
      '0,716 kg bei 60 kg sind 1,193 % — das darf nicht greifen')
  })

  // ── fat_loss, Kraft (:193) ──────────────────────────────────────
  it('fat_loss Kraftverlust: < -10 greift und meldet den fehlenden Weg', () => {
    const greift = wochenAnpassung('fat_loss', -0.5, 80,
      { ...RUHE, weightTrend: -0.5, strengthTrend: -11 })
    assert.equal(greift.art, 'protein_heben')
    // `[read]` **Der Vorschlag steht, der Schreibweg fehlt** — und
    // das sagt er.
    assert.match(greift.hindernis ?? '', /Proteinspalte/,
      'der fehlende Schreibweg fuer Protein wird verschwiegen')
    const grenze = wochenAnpassung('fat_loss', -0.5, 80,
      { ...RUHE, strengthTrend: -10 })
    assert.notEqual(grenze.art, 'protein_heben', '-10 loest aus')
  })

  // ── lean_bulk, zwei Regeln (:198, :200) ─────────────────────────
  // ══ G-569: auch hier relativ ═══════════════════════
  //
  // `[cmd]` **0,75 kg bei 83,74 kg sind 0,8956 %** — auf drei
  // Stellen gerundet `0,896`, also **genau die Schwelle.** `[read]`
  // **Die Rundung folgt dem Katalog**, der die Zahlen mit drei
  // Stellen fuehrt (`536_..._seed.sql`).
  it('lean_bulk zu schnell: die Grenze liegt bei 0,896 % KG/Woche', () => {
    assert.equal(wochenAnpassung('lean_bulk', 0.5, 80,
      { ...RUHE, weightTrend: 0.750, gewichtAmStichtagKg: 83.74 }).art,
      'rate_senken',
      '0,750 kg bei 83,74 kg sind 0,896 % — das muss greifen')
    assert.notEqual(wochenAnpassung('lean_bulk', 0.5, 80,
      { ...RUHE, weightTrend: 0.740, gewichtAmStichtagKg: 83.74 }).art,
      'rate_senken',
      '0,740 kg bei 83,74 kg sind 0,884 % — das darf nicht greifen')
  })

  it('lean_bulk zu schnell: dieselbe Strenge bei 60 kg', () => {
    // `[read]` **Bei 60 kg greift sie schon bei 0,538 kg** — die
    // alte absolute Grenze erst bei 0,75.
    assert.equal(wochenAnpassung('lean_bulk', 0.5, 80,
      { ...RUHE, weightTrend: 0.538, gewichtAmStichtagKg: 60 }).art,
      'rate_senken',
      '0,538 kg bei 60 kg sind 0,897 % — das muss greifen')
    assert.notEqual(wochenAnpassung('lean_bulk', 0.5, 80,
      { ...RUHE, weightTrend: 0.537, gewichtAmStichtagKg: 60 }).art,
      'rate_senken',
      '0,537 kg bei 60 kg sind 0,895 % — das darf nicht greifen')
  })

  it('lean_bulk Stillstand: < 0,1 UND > 85 % greift', () => {
    assert.equal(wochenAnpassung('lean_bulk', 0.5, 80,
      { ...RUHE, weightTrend: 0.05, calorieAdherence: 90 }).art, 'rate_heben')
    assert.notEqual(wochenAnpassung('lean_bulk', 0.5, 80,
      { ...RUHE, weightTrend: 0.1, calorieAdherence: 90 }).art, 'rate_heben')
  })

  // ── alle Phasen, HRV (:204) ─────────────────────────────────────
  it('HRV unter 85 % greift — und ohne Vergleichsgroesse sagt es das', () => {
    const greift = wochenAnpassung('recomp', null, 80,
      { ...RUHE, hrv7d: 50, hrvBaseline: 60 })
    assert.equal(greift.art, 'erholung_pruefen')

    const grenze = wochenAnpassung('recomp', null, 80,
      { ...RUHE, hrv7d: 51, hrvBaseline: 60 })
    assert.notEqual(grenze.art, 'erholung_pruefen',
      '51 von 60 sind 85 % — die Spec verlangt DARUNTER')

    // `[cmd]` **`hrv_baseline` gibt es nicht als Spalte.**
    const ohne = wochenAnpassung('recomp', null, 80,
      { ...RUHE, hrv7d: 50, hrvBaseline: null })
    assert.equal(ohne.art, 'keine_aenderung')
    assert.match(ohne.grund, /Vergleichsgroesse/,
      'die fehlende Vergleichsgroesse wird verschwiegen')
  })

  it('ohne Gewicht kommt ein Hindernis, keine erfundene Rate', () => {
    const r = wochenAnpassung('fat_loss', -0.5, null,
      { ...RUHE, weightTrend: -0.05, calorieAdherence: 90 })
    assert.equal(r.rate_delta, null)
    assert.match(r.hindernis ?? '', /Koerpergewicht/)
  })
})

describe('G-520 — die sieben Waechter', () => {
  it('es sind genau sieben, auch wenn keiner greift', () => {
    const b = pruefeWaechter(LAGE, RUHE)
    assert.equal(b.length, 7, 'nicht sieben Waechter')
    // `[read]` **Auch die nicht greifenden kommen zurueck** — sonst
    // liesse sich „geprueft" nicht von „nicht geprueft"
    // unterscheiden.
    assert.equal(b.filter(x => x.greift).length, 0,
      'in der Ruhelage greift einer')
  })

  it('jeder Waechter nennt seine Spec-Zeile', () => {
    for (const b of pruefeWaechter(LAGE, RUHE)) {
      assert.match(b.regel, /PHASE_MODELS\.md:\d+/,
        `${b.kennung} nennt keine Spec-Zeile`)
    }
  })

  // ── Nicht pruefbar ist nicht dasselbe wie greift nicht ──────────
  it('die Phasendauer ist NICHT pruefbar und sagt es', () => {
    const b = pruefeWaechter(LAGE, RUHE).find(x => x.kennung === 'phasendauer')!
    assert.equal(b.greift, false)
    assert.match(b.hindernis ?? '', /G-529/,
      'der Waechter wird mit einer geratenen Dauer gebaut, statt die '
      + 'Luecke zu melden')
  })

  it('mit Hoechstdauer greift er von beiden Seiten', () => {
    const drueber = pruefeWaechter({ ...LAGE, wochen: 20, maxDauerWochen: 20 }, RUHE)
      .find(x => x.kennung === 'phasendauer')!
    assert.equal(drueber.greift, true)
    assert.equal(drueber.hindernis, undefined)
    const drunter = pruefeWaechter({ ...LAGE, wochen: 19, maxDauerWochen: 20 }, RUHE)
      .find(x => x.kennung === 'phasendauer')!
    assert.equal(drunter.greift, false)
  })

  it('Uebertraining verlangt FUENF Tage, nicht einen', () => {
    const einTag = pruefeWaechter({ ...LAGE, hrvTageUnterGrenze: 4 },
      { ...RUHE, hrv7d: 50, hrvBaseline: 60 })
      .find(x => x.kennung === 'uebertraining')!
    assert.equal(einTag.greift, false, 'vier Tage loesen aus — die Spec verlangt 5+')
    const fuenf = pruefeWaechter({ ...LAGE, hrvTageUnterGrenze: 5 },
      { ...RUHE, hrv7d: 50, hrvBaseline: 60 })
      .find(x => x.kennung === 'uebertraining')!
    assert.equal(fuenf.greift, true)
  })

  it('Koerperfett: je Geschlecht die Schwelle aus der Spec', () => {
    const m = pruefeWaechter({ ...LAGE, koerperfettPct: 4.9 }, RUHE)
      .find(x => x.kennung === 'koerperfett_niedrig')!
    assert.equal(m.greift, true, '4,9 % bei maennlich muss greifen')
    const mGrenze = pruefeWaechter({ ...LAGE, koerperfettPct: 5 }, RUHE)
      .find(x => x.kennung === 'koerperfett_niedrig')!
    assert.equal(mGrenze.greift, false, '5,0 greift — die Spec verlangt < 5')

    const w = pruefeWaechter(
      { ...LAGE, koerperfettPct: 9.9, biologischesGeschlecht: 'female' }, RUHE)
      .find(x => x.kennung === 'koerperfett_niedrig')!
    assert.equal(w.greift, true, '9,9 % bei weiblich muss greifen')
    const wGrenze = pruefeWaechter(
      { ...LAGE, koerperfettPct: 9.9 }, RUHE)
      .find(x => x.kennung === 'koerperfett_niedrig')!
    assert.equal(wGrenze.greift, false,
      '9,9 greift auch bei maennlich — die Schwelle wird nicht je '
      + 'Geschlecht unterschieden')
  })

  it('ohne Geschlecht wird nicht geraten', () => {
    const b = pruefeWaechter(
      { ...LAGE, koerperfettPct: 4, biologischesGeschlecht: null }, RUHE)
      .find(x => x.kennung === 'koerperfett_niedrig')!
    assert.equal(b.greift, false)
    assert.match(b.hindernis ?? '', /Geschlecht/,
      'ohne Geschlecht wird eine Schwelle angenommen')
  })
})

describe('G-520/A4 — die Gesundheitswarnung folgt E-74', () => {
  const satz = koerperfettSatz(4.2, 5, 'male')

  it('sie nennt den Wert und die Quelle', () => {
    assert.match(satz, /4\.2 %/, 'der gemessene Wert fehlt')
    assert.match(satz, /PHASE_MODELS\.md/, 'die Quelle fehlt — dann ist '
      + 'es eine eigene Aussage statt eines Zitats (E-74)')
  })

  it('sie bewertet nicht und empfiehlt keine Therapie', () => {
    // `[cmd]` **E-74:54-56 verbietet dreierlei.**
    for (const wort of ['gefaehrlich', 'ungesund', 'krankhaft', 'zu niedrig',
      'du solltest', 'nimm ', 'behandl']) {
      assert.ok(!satz.toLowerCase().includes(wort),
        `der Satz enthaelt „${wort}" — E-74 verbietet Bewertung und `
        + 'Therapieempfehlung')
    }
  })

  it('sie verweist auf aerztliche Einordnung', () => {
    assert.match(satz, /aerztliche/,
      'der Satz ordnet selbst ein, statt es abzugeben')
  })
})

describe('G-520/A3 — keine Funktion schreibt', () => {
  // `[cmd]` **C-108/F-02: nennen ja, bewerten nein.** `[read]` **Ein
  // Waechter, der selbst schreibt, trifft eine Entscheidung ueber
  // den Nutzer** — und liefe ueber den zweigeteilten Schreibweg aus
  // G-519, dessen Sperrpruefung kein gleichwertiger Ersatz ist.
  for (const datei of ['anpassung.ts', 'uebergangswaechter.ts']) {
    it(`${datei} hat kein Server-I/O`, () => {
      const q = readFileSync(join(HIER, '..', datei), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^[ \t]*\/\/.*$/gm, '')
      for (const verboten of ['createSessionClient', '.rpc(', '.insert(',
        '.update(', '.upsert(', 'fetch(']) {
        assert.ok(!q.includes(verboten),
          `${datei} benutzt ${verboten} — die Waechter sollen '
          + 'vorschlagen, nicht handeln`)
      }
    })
  }
})
