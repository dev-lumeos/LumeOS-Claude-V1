/**
 * G-554 — Phasenziele anlegen, Goals-Reiter nach Vorgabe
 *
 * **Tom, 2026-09-29:** *„konzentriere dich nun zuerst auf die subnav
 * Goals dass das nach vorgabe ist und ich auch die einzelnen
 * phasenziele manuell anlegen kann, das kann ich naemlich heute
 * nicht."*
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  ZIELKNOEPFE, zielknopf, traegtStrategie, ZIEL_ARTEN,
} from '../ziel-arten'
import {
  berechnePace, restTage, tageZwischen, PACE_TOLERANZ,
} from '../pace'
import { phasenartFuerStrategie, PHASENARTEN_CHECK } from '../strategie-regeln'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

// ════════════════════════════════════════════════════════════════
// A3 — sechs Knoepfe, vier CHECK-Werte
// ════════════════════════════════════════════════════════════════

describe('G-554/A3 — die sechs Typen des Entwurfs', () => {
  it('es sind genau die sechs aus module-goals.jsx:696-703', () => {
    assert.deepEqual(ZIELKNOEPFE.map(k => k.id),
      ['body_comp', 'weight', 'strength', 'performance', 'habit', 'custom'],
      'die Knopfliste weicht vom Entwurf ab')
  })

  it('jeder Knopf bildet auf einen gueltigen goal_type ab', () => {
    // `[cmd]` **`user_goals_goal_type_check` kennt vier Werte.**
    // `[read]` **Ein Knopf, der einen fuenften erzeugt, wuerde beim
    // Anlegen abgewiesen** — genau das war der Fehler, den G-354
    // beseitigt hat.
    for (const k of ZIELKNOEPFE) {
      assert.ok((ZIEL_ARTEN as readonly string[]).includes(k.art),
        `„${k.id}" bildet auf „${k.art}" ab — das ist kein `
        + 'CHECK-Wert, das Anlegen fiele durch')
    }
  })

  it('die unsicheren Zuordnungen sind als solche gekennzeichnet', () => {
    // `[read]` **Der Auftrag: melden, nicht still waehlen.**
    // `[cmd]` **`weight` und `custom` sind die zwei** — bei den
    // anderen vier fuehrt der Seed den Untertyp schon.
    const unsicher = ZIELKNOEPFE.filter(k => k.unsicher).map(k => k.id)
    assert.deepEqual(unsicher.sort(), ['custom', 'weight'],
      'die offenen Faelle sind nicht die gemeldeten — eine Zuordnung, '
      + 'die als entschieden dasteht, ist eine Falschaussage')
  })

  it('die sicheren Zuordnungen decken sich mit dem Seed', () => {
    // `[cmd]` **Gemessen in `goals.user_goals`, 2026-09-30:**
    // `strength` und `training_capacity` unter `performance`,
    // `cardio_frequency` unter `lifestyle`.
    const erwartet: Record<string, [string, string | null]> = {
      body_comp: ['body_composition', null],
      strength: ['performance', 'strength'],
      performance: ['performance', 'training_capacity'],
      habit: ['lifestyle', 'cardio_frequency'],
    }
    for (const [id, [art, unterart]] of Object.entries(erwartet)) {
      const k = zielknopf(id)
      assert.equal(k?.art, art, `„${id}" zeigt auf die falsche Art`)
      assert.equal(k?.unterart, unterart, `„${id}" hat die falsche Unterart`)
    }
  })

  // ── A1 haengt daran: wann erscheint die Strategie? ──────────────
  it('nur body_composition traegt eine Strategie', () => {
    assert.equal(traegtStrategie(zielknopf('body_comp')), true)
    assert.equal(traegtStrategie(zielknopf('weight')), true,
      '„weight" ist body_composition — die Wahl gehoert dazu')
    // `[read]` **Die Gegenrichtung.** Ein Bankdrueck-Ziel hat keine
    // Ernaehrungsstrategie.
    for (const id of ['strength', 'performance', 'habit', 'custom']) {
      assert.equal(traegtStrategie(zielknopf(id)), false,
        `„${id}" zeigt eine Strategiewahl — es ist kein `
        + 'body_composition-Ziel')
    }
  })
})

// ════════════════════════════════════════════════════════════════
// A2 — von der Strategie zur Phasenart
// ════════════════════════════════════════════════════════════════

describe('G-554/A2 — die Phasenart kommt aus der Katalogzeile', () => {
  it('die Kategorie bildet auf eine erlaubte Phasenart ab', () => {
    // `[cmd]` **Alle sechs gemessenen Kategorien**, 2026-09-30.
    const paare: Array<[string, string, string]> = [
      ['moderate_cut', 'fat_loss', 'fat_loss'],
      ['clean_bulk', 'muscle_gain', 'lean_bulk'],
      ['body_recomp', 'hybrid', 'maintenance'],
      ['contest_prep', 'contest_prep', 'contest_prep'],
      ['reverse_diet', 'recovery', 'reverse_diet'],
      ['expert_bb_annual', 'expert', 'expert_bb_annual'],
    ]
    for (const [code, kat, erwartet] of paare) {
      assert.equal(phasenartFuerStrategie(code, kat), erwartet,
        `„${code}" (${kat}) bildet auf die falsche Phasenart ab`)
    }
  })

  it('ein Code, der selbst eine Phasenart ist, gewinnt', () => {
    // `[cmd]` **`mini_cut` liegt unter `fat_loss`, ist aber selbst
    // eine Phasenart.** `[read]` **Ohne diese Regel liefe ein Mini
    // Cut als gewoehnlicher Fat Loss** — und die Hoechstdauer des
    // Katalogs traefe die falsche Phase.
    assert.equal(phasenartFuerStrategie('mini_cut', 'fat_loss'), 'mini_cut')
    assert.equal(phasenartFuerStrategie('peak_week', 'contest_prep'), 'peak_week')
  })

  it('jede Zuordnung ist ein CHECK-Wert', () => {
    for (const kat of ['fat_loss', 'muscle_gain', 'hybrid', 'contest_prep',
      'recovery', 'expert']) {
      const a = phasenartFuerStrategie('irgendwas', kat)
      assert.ok(a !== null && (PHASENARTEN_CHECK as readonly string[]).includes(a),
        `„${kat}" ergibt „${a}" — das steht nicht im CHECK von `
        + 'goal_phases.phase_type')
    }
  })

  it('eine unbekannte Kategorie ergibt nichts, nicht irgendwas', () => {
    // `[read]` **Kein Rueckfall auf `maintenance`** — eine erfundene
    // Phase waere schlimmer als keine.
    assert.equal(phasenartFuerStrategie('x', 'gibt_es_nicht'), null)
  })

  // ── Der Schreibweg ──────────────────────────────────────────────
  const W = () => lies(join(HIER, '..', 'phasenziel-write.ts'))

  it('beides oder keines — das Ziel wird zurueckgenommen', () => {
    // `[read]` **Dieser Waechter war zuerst blind.** Er suchte die
    // WOERTER `zielZuruecknehmen`, `.delete()` und `.select('id')`
    // irgendwo in der Datei — **die Sabotage ersetzte den AUFRUF
    // durch `false` und blieb gruen**, weil die Funktion weiter
    // dastand, nur ungenutzt.
    //
    // `[read]` **Gemessen wird jetzt die Stelle, an der es
    // ankommt:** dass im `catch` zurueckgenommen wird, und dass das
    // Ergebnis den Satz an den Nutzer bestimmt.
    const q = W()
    const i = q.indexOf('} catch (e) {')
    assert.ok(i > 0, 'es gibt keinen Fehlerzweig um die Phase')
    const fang = q.slice(i, i + 900)
    assert.match(fang, /await zielZuruecknehmen\(z\.id\)/,
      'faellt die Phase, wird das Ziel nicht zurueckgenommen — dann '
      + 'bleibt es ohne sie stehen (A2: beides oder keines)')
    assert.match(fang, /zurueck\s*\n?\s*\?/,
      'das Ergebnis der Ruecknahme wird nicht ausgewertet — ein '
      + 'fehlgeschlagenes Zuruecknehmen bliebe unbemerkt')
  })

  it('die Ruecknahme zaehlt ihre Zeilen — G-79', () => {
    // `[read]` **Auch dieser Waechter suchte nur die Zeichenkette.**
    // **Gemessen wird der Rumpf der Funktion**, und dass ihr
    // Rueckgabewert an der Zeilenzahl haengt.
    const q = W()
    const i = q.indexOf('async function zielZuruecknehmen')
    assert.ok(i > 0, 'die Ruecknahme gibt es nicht mehr')
    const rumpf = q.slice(i, q.indexOf('\n}', i))
    assert.match(rumpf, /\.delete\(\)/, 'die Ruecknahme loescht nicht')
    assert.match(rumpf, /\.select\('id'\)/,
      'die Ruecknahme zaehlt die Zeilen nicht — ein vom Zeilenschutz '
      + 'gefiltertes DELETE kaeme als Erfolg zurueck (G-79)')
    assert.match(rumpf, /data\?\.length/,
      'der Rueckgabewert haengt nicht an der Zeilenzahl — dann '
      + 'meldet er Erfolg, obwohl nichts geloescht wurde')
  })

  it('der Fehler wird nach G-553 eingeordnet', () => {
    const q = W()
    assert.match(q, /fehlerart\(/,
      'der Schreibweg unterscheidet Sitzungs- und Datenfehler nicht — '
      + 'dann aendert der Nutzer seine Eingaben, und das Problem ist '
      + 'die Anmeldung (G-553)')
    assert.ok(!/function fehlerart/.test(q),
      'der Schreibweg baut die Unterscheidung selbst — zwei Kopien '
      + 'driften')
  })

  it('die offene Strategie wird gemeldet, nicht verschwiegen', () => {
    // `[cmd]` **`goal_phase_start` nimmt `strategie_code` nicht** —
    // gemessen 2026-09-30.
    assert.match(W(), /strategieOffen/,
      'es wird nicht gemeldet, dass der Strategiecode nicht ankommt')
  })
})

// ════════════════════════════════════════════════════════════════
// A4 — der Pace, von Hand nachrechenbar
// ════════════════════════════════════════════════════════════════

describe('G-554/A4 — der Pace ist eine Rechnung', () => {
  /**
   * **Der Fall aus dem Dateikopf, Zahl fuer Zahl:**
   *
   *     Abnehmen 80 -> 76 kg, 01.01. bis 01.03.2026
   *     heute 31.01., Ist 79 kg
   *
   *     dauer       = 59 Tage
   *     verstrichen = 30 Tage
   *     zeitanteil  = 30/59             = 0,50847
   *     soll        = 80 + (76-80)*0,50847 = 77,966 kg
   *     ist_anteil  = (79-80)/(76-80)   = 0,25
   *     abweichung  = 0,25 - 0,50847    = -0,25847
   *
   * **-0,258 < -0,05 -> `behind`.**
   */
  const FALL = {
    start_value: 80, current_value: 79, target_value: 76,
    start: '2026-01-01', deadline: '2026-03-01', heute: '2026-01-31',
  }

  it('die Tage stimmen', () => {
    assert.equal(tageZwischen('2026-01-01', '2026-03-01'), 59)
    assert.equal(tageZwischen('2026-01-01', '2026-01-31'), 30)
  })

  it('jede Zwischenzahl des Beispiels stimmt', () => {
    const r = berechnePace(FALL)
    assert.equal(r.grund, null, 'die Rechnung verweigert das Urteil')
    assert.equal(r.zeitanteil?.toFixed(5), '0.50847', 'der Zeitanteil')
    assert.equal(r.sollwert?.toFixed(3), '77.966', 'der Sollwert')
    assert.equal(r.streckenanteil?.toFixed(2), '0.25', 'der Streckenanteil')
    assert.equal(r.abweichung?.toFixed(5), '-0.25847', 'die Abweichung')
    assert.equal(r.pace, 'behind',
      'nach der Haelfte der Zeit ist ein Viertel geschafft — das ist '
      + 'nicht im Plan')
  })

  it('dieselbe Rechnung beim ZUNEHMEN, ohne Fallunterscheidung', () => {
    // `[read]` **Der Bruch normiert die Richtung mit:** beide
    // Differenzen werden negativ bzw. positiv, der Quotient bleibt
    // gleich. **Deshalb braucht es keinen Sonderweg.**
    const r = berechnePace({
      ...FALL, start_value: 76, current_value: 77, target_value: 80,
    })
    assert.equal(r.streckenanteil?.toFixed(2), '0.25')
    assert.equal(r.pace, 'behind', 'Zunehmen wird anders beurteilt')
  })

  it('wer voraus ist, ist ahead', () => {
    // 80 -> 76, heute schon 77,5: ist_anteil = 2,5/4 = 0,625
    // gegen zeitanteil 0,508 -> +0,117 > 0,05
    const r = berechnePace({ ...FALL, current_value: 77.5 })
    assert.equal(r.pace, 'ahead', `abweichung ${r.abweichung}`)
  })

  it('in der Toleranz ist on-track', () => {
    // ist_anteil soll ungefaehr dem zeitanteil entsprechen:
    // 0,50847 * -4 + 80 = 77,966
    const r = berechnePace({ ...FALL, current_value: 77.966 })
    assert.equal(r.pace, 'on-track', `abweichung ${r.abweichung}`)
    assert.ok(Math.abs(r.abweichung ?? 1) <= PACE_TOLERANZ)
  })

  it('die Toleranz wirkt in beide Richtungen', () => {
    // `[read]` **Die Gegenprobe zur Schwelle** — knapp darueber muss
    // kippen, sonst misst die Toleranz nichts.
    //
    // `[cmd]` **Von Hand:** bei 78,1 kg ist der Streckenanteil
    // `(78,1-80)/(76-80)` = 0,475, die Abweichung -0,0335 — **in der
    // Toleranz.** Bei 78,5 kg sind es 0,375 und -0,1335 — **darueber
    // hinaus, und zwar nach HINTEN:** der Wert hat sich weniger weit
    // bewegt, nicht weiter.
    const knappDrin = berechnePace({ ...FALL, current_value: 78.1 })
    const knappDraussen = berechnePace({ ...FALL, current_value: 78.5 })
    assert.equal(knappDrin.abweichung?.toFixed(4), '-0.0335')
    assert.equal(knappDrin.pace, 'on-track', `${knappDrin.abweichung}`)
    assert.equal(knappDraussen.abweichung?.toFixed(4), '-0.1335')
    assert.equal(knappDraussen.pace, 'behind', `${knappDraussen.abweichung}`)
  })

  // ── Wo kein Urteil moeglich ist ────────────────────────────────
  it('ohne Deadline kein Pace, aber ein Grund', () => {
    const r = berechnePace({ ...FALL, deadline: null })
    assert.equal(r.pace, 'unbekannt')
    assert.match(r.grund ?? '', /Deadline/,
      'die Verweigerung nennt ihren Grund nicht (E-72)')
  })

  it('ohne Ist-Wert kein Pace', () => {
    const r = berechnePace({ ...FALL, current_value: null })
    assert.equal(r.pace, 'unbekannt')
    assert.match(r.grund ?? '', /Ist-Wert/)
  })

  it('Start gleich Ziel ergibt kein Urteil', () => {
    // `[read]` **Sonst teilte die Rechnung durch null** — und das
    // Ergebnis saehe aus wie eine Messung.
    const r = berechnePace({ ...FALL, target_value: 80 })
    assert.equal(r.pace, 'unbekannt')
    assert.match(r.grund ?? '', /gleich/)
  })

  it('Deadline vor dem Start ergibt kein Urteil', () => {
    const r = berechnePace({ ...FALL, deadline: '2025-12-01' })
    assert.equal(r.pace, 'unbekannt')
  })

  it('nach der Deadline bleibt der Zeitanteil bei 1', () => {
    const r = berechnePace({ ...FALL, heute: '2026-06-01' })
    assert.equal(r.zeitanteil, 1,
      'der Zeitanteil laeuft ueber 1 — dann waere jedes ueberfaellige '
      + 'Ziel beliebig weit hinten')
  })

  it('Resttage werden negativ, wenn die Frist vorbei ist', () => {
    // `[read]` **Negativ ist eine Aussage, keine Fehlbedienung.**
    // `[cmd]` **29 Tage vom 31.01. zum 01.03.**, nicht 30 — der
    // Januar hat 31 Tage, und es wird ab dem 31. gezaehlt.
    assert.equal(restTage('2026-03-01', '2026-01-31'), 29)
    assert.equal(restTage('2026-01-01', '2026-01-31'), -30)
    assert.equal(restTage(null, '2026-01-31'), null)
  })

  // ── Die Karte ───────────────────────────────────────────────────
  it('die Karte rechnet den Pace, sie behauptet ihn nicht', () => {
    const q = lies(join(GOALS, 'ziel-karten.tsx'))
    assert.match(q, /berechnePace\(/,
      'die Karte zeigt einen Pace ohne Rechnung — das waere das '
      + 'Urteil aus der Attrappe')
    assert.match(q, /heute: stichtag/,
      'die Karte rechnet gegen ein anderes Heute als den Stichtag')
    assert.ok(!/Date\.now\(\)|new Date\(\)/.test(q),
      'die Karte holt sich die Zeit selbst — der Stichtag kommt von aussen')
  })

  it('ohne Grundlage steht der Grund, kein Urteil', () => {
    const q = lies(join(GOALS, 'ziel-karten.tsx'))
    assert.match(q, /p\.grund === null \?/,
      'die Karte zeigt den Pace auch ohne Grundlage — dann saehe '
      + '„on-track" wie eine Messung aus')
  })

  it('history wird nicht erfunden', () => {
    // `[cmd]` **Der Entwurf hat dafuer einen Satz:** *„No data
    // points logged yet."* `[read]` **Kein Platzhalterverlauf.**
    const q = lies(join(GOALS, 'ziel-karten.tsx'))
    assert.ok(!/history\s*[:=]\s*\[/.test(q),
      'ein Verlauf wird erfunden — die Module liefern noch keine Werte')
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — die Strategiewahl im Modal
// ════════════════════════════════════════════════════════════════

describe('G-554/A1 — die Strategie im Anlegen-Dialog', () => {
  const M = () => lies(join(GOALS, 'modale.tsx'))

  it('die sechs Knoepfe stehen im Dialog', () => {
    assert.match(M(), /ZIELKNOEPFE\.map/,
      'der Dialog baut die Typen nicht aus ZIELKNOEPFE — dann ist es '
      + 'wieder eine eigene Liste (G-354)')
    assert.match(M(), /data-zieltyp=\{t\.id\}/,
      'die Typknoepfe tragen keine Marke')
  })

  it('die Wahl erscheint nur bei body_composition', () => {
    const q = M()
    assert.match(q, /traegtStrategie\(/,
      'der Dialog entscheidet nicht ueber traegtStrategie')
    assert.match(q, /\{zeigtStrategie && \(/,
      'die Strategiewahl haengt nicht am Typ — sie erschiene auch '
      + 'bei einem Kraftziel')
  })

  it('sie ist freiwillig — es gibt ein „ohne"', () => {
    // `[read]` **Ein body_composition-Ziel ohne Strategie bleibt
    // gueltig:** es sagt wohin, nicht wie.
    assert.match(M(), /data-zielstrategie=""/,
      'es gibt keine Wahl „ohne Strategie" — dann waere sie Pflicht')
    assert.match(M(), /React\.useState<string \| null>\(null\)/,
      'die Vorbelegung ist nicht „keine Strategie"')
  })

  it('ohne Strategie wird keine Phase angelegt', () => {
    const q = M()
    assert.match(q, /phase: gewaehlteStrategie/,
      'die Phase haengt nicht an der Strategiewahl — dann entstuende '
      + 'zu jedem Ziel eine Phase')
  })

  it('der Dialog ruft den gemeinsamen Weg, nicht zwei', () => {
    const q = M()
    assert.match(q, /phasenzielAnlegenAktion\(/,
      'der Dialog legt Ziel und Phase getrennt an — dann kann er '
      + 'zwischen den Schritten abbrechen')
    // `[read]` **Mit Wortgrenze** — `phasenzielAnlegenAktion`
    // enthaelt `zielAnlegenAktion` als Teilkette und waere sonst
    // ein Falschtreffer.
    assert.ok(!/(?<![a-zA-Z])zielAnlegenAktion\(/.test(q),
      'der alte Einzelweg wird noch gerufen — zwei Wege driften')
  })

  it('der Sitzungsfehler wird getrennt gezeigt', () => {
    const q = M()
    assert.match(q, /data-ziel-sitzungsfehler/,
      'ein Tokenfehler sieht aus wie ein Eingabefehler (G-553)')
    assert.match(q, /r\.art === 'sitzung'/,
      'die Fehlerart wird nicht ausgewertet')
  })

  it('die offene Strategie steht am Feld UND im Ergebnis', () => {
    const q = M()
    assert.match(q, /data-zielstrategie-marke/,
      'am Feld fehlt die Marke — dann sieht die Wahl aus, als kaeme '
      + 'sie an')
    assert.match(q, /data-ziel-strategie-offen/,
      'im Ergebnis steht nicht, dass der Code nicht gespeichert wurde')
    assert.match(q, /G-543/,
      'die Marke nennt den Punkt nicht, auf den sie wartet')
  })
})
