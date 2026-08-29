// C-323: woraus ein Flag entsteht — Dauer, Leserichtung, Luecken.
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  flagVon, dauerSatz, unvollstaendigSatz, sortiere, zuWenigDatenSatz,
  FLAG_SATZ, FLAG_FARBE, GRENZE_NUR_SUPPLEMENT, MIN_TAGE, MUSTER_ANTEIL,
  type FlagTag, type Flag,
} from '../mikro-flags'

/** n Tage mit demselben Prozentwert. */
const tage = (n: number, pct: number | null, status = 'complete'): FlagTag[] =>
  Array.from({ length: n }, (_, i) => ({
    tag: `2026-06-${String(i + 1).padStart(2, '0')}`, pct, status,
  }))

// ── Vorgabe 1: Dauer statt Hoehe ─────────────────────────────────

test('C-323: ein einzelner Tag erzeugt kein Flag', () => {
  // `[read]` Ein Tag unter dem Ziel ist normal, dreissig sind ein
  // Muster. **Unter MIN_TAGE gibt es keine Aussage.**
  assert.equal(flagVon('CA', 'Calcium', 'target', tage(3, 40), 80), null)
})

test('C-323: die Hoehe allein reicht nicht', () => {
  // Ein einziger extremer Tag neben vielen guten — kein Muster.
  const gemischt = [...tage(1, 5), ...tage(29, 120)]
  assert.equal(flagVon('CA', 'Calcium', 'target', gemischt, 80), null)
})

test('C-323: Dauer erzeugt ein Flag, und der Satz nennt beide Zahlen', () => {
  // `[cmd]` **Der gemessene Fall: NACL auf dev, 78 von 90 Tagen unter
  // dem Ziel** (2026-08-29, 90 Tage).
  const f = flagVon('NACL', 'Salz', 'target',
    [...tage(78, 40), ...tage(12, 120)], 80)
  assert.ok(f, 'Bei 78 von 90 Tagen muss ein Flag entstehen.')
  assert.equal(f.tage, 78)
  assert.equal(f.bewertet, 90)
  assert.equal(dauerSatz(f), 'an 78 von 90 bewerteten Tagen unter dem Zielwert')
})

test('C-323: die Schwelle ist ein Anteil, keine Prozentzahl', () => {
  // `[read]` **Der Auftrag verbietet die reine Prozentschwelle.**
  // Knapp unter der Haelfte: kein Flag. Knapp darueber: Flag.
  assert.equal(flagVon('X', 'X', 'target', [...tage(9, 40), ...tage(11, 120)], 80), null)
  assert.ok(flagVon('X', 'X', 'target', [...tage(11, 40), ...tage(9, 120)], 80))
  assert.equal(MUSTER_ANTEIL, 0.5)
})

// ── Vorgabe 2: die Leserichtung ──────────────────────────────────

test('C-323: derselbe Prozentwert, entgegengesetzte Lesart', () => {
  // `[read]` **C-48 Regel 2 — der Kern des Auftrags.** 90 Prozent
  // eines Zielwerts sind zu wenig, 90 Prozent einer Obergrenze sind
  // unbedenklich. **Ohne Richtung warnt es falschherum.**
  const neunzig = tage(30, 90)
  const ziel = flagVon('CA', 'Calcium', 'target', neunzig, 80)
  const grenze = flagVon('CA', 'Calcium', 'upper_limit', neunzig, 80)
  assert.equal(ziel, null, '90 % eines Zielwerts sind gedeckt — kein Flag.')
  assert.equal(grenze, null, '90 % einer Obergrenze sind unbedenklich — kein Flag.')

  // Und die Gegenprobe: 130 Prozent.
  const dreissig = tage(30, 130)
  assert.equal(flagVon('CA', 'Calcium', 'target', dreissig, 80), null,
    '130 % eines Zielwerts sind uebererfuellt — kein Flag.')
  const zuViel = flagVon('CA', 'Calcium', 'upper_limit', dreissig, 80)
  assert.ok(zuViel, '130 % einer Obergrenze sind eine Ueberschreitung.')
  assert.equal(zuViel.art, 'ueber_grenze')
})

test('C-323: eine Richtung ohne Regel erzeugt kein Flag', () => {
  // `range` bleibt unbewertet, statt als Ziel gelesen zu werden.
  assert.equal(flagVon('X', 'X', 'range', tage(30, 20), 80), null)
  assert.equal(flagVon('X', 'X', null, tage(30, 20), 80), null)
})

// ── Vorgabe 3: Unvollstaendiges ist kein Mangel ──────────────────

test('C-323: unvollstaendige Tage zaehlen nicht als Mangel', () => {
  // `[cmd]` **Auf dev tragen alle `incomplete`-Zeilen `pct = null`.**
  // `[read]` **Ein Flag, das sie mitzaehlte, erfaende einen Mangel.**
  const f = flagVon('VITC', 'Vitamin C', 'target',
    [...tage(60, null, 'incomplete'), ...tage(30, 120)], 80)
  assert.equal(f, null,
    '60 unvollstaendige Tage duerfen keinen Mangel erzeugen.')
})

test('C-323: unvollstaendige Tage stehen im eigenen Zaehler', () => {
  // `[cmd]` **Der gemessene Fall: NA auf dev, 61 von 71 bewertet,
  // 19 Tage unvollstaendig** (90-Tage-Fenster, 2026-08-29).
  const f = flagVon('NA', 'Natrium', 'target',
    [...tage(61, 40), ...tage(10, 120), ...tage(19, null, 'incomplete')], 80)
  assert.ok(f)
  assert.equal(f.bewertet, 71, 'Der Nenner sind die BEWERTETEN Tage.')
  assert.equal(f.unvollstaendig, 19)
  assert.match(unvollstaendigSatz(f), /19 Tage blieben unbewertet/)
})

test('C-323: der Status entscheidet, nicht nur ein fehlender Wert', () => {
  // `[read]` **Diese Probe kam aus einer ueberlebenden Sabotage.**
  // Die uebrigen Tests geben unvollstaendigen Tagen `pct: null` — dann
  // greift schon die Nullpruefung, und die Statuspruefung wird nie
  // ausgefuehrt. **Ein `incomplete`-Tag MIT Prozentwert lief durch.**
  //
  // `[cmd]` Auf dev tragen zwar alle `incomplete`-Zeilen `null`,
  // **aber die Regel darf sich nicht darauf verlassen** — sie prueft
  // den Status, nicht dessen Nebenwirkung.
  const mitWert: FlagTag[] = [
    ...tage(60, 30, 'incomplete'),
    ...tage(30, 120),
  ]
  const f = flagVon('VITC', 'Vitamin C', 'target', mitWert, 80)
  assert.equal(f, null,
    '60 unvollstaendige Tage mit Prozentwert duerfen keinen Mangel erzeugen.')
})

test('C-323: unbekannte Status zaehlen nicht mit', () => {
  // `not_applicable`, `energy_share`, `nutrient_density` — G-249
  // fuehrt sie als eigene Zustaende. Keiner davon ist eine Bewertung.
  assert.equal(
    flagVon('X', 'X', 'target', tage(30, 10, 'not_applicable'), 80), null)
})

test('C-323: ohne Luecken kein Luecken-Satz', () => {
  const f = flagVon('X', 'X', 'target', tage(30, 40), 80)
  assert.ok(f)
  assert.equal(unvollstaendigSatz(f), '')
})

// ── Der Befund: drei Obergrenzen gelten nicht fuer Nahrung ───────

test('C-323: die Magnesium-Grenze warnt nicht wie eine echte', () => {
  // `[cmd]` **Der Befund, gemessen am 2026-08-29:** MG steht auf dev
  // an **87 von 90 Tagen** ueber der Obergrenze — und die Quelle
  // sagt: *„Applies to pharmacological/supplemental magnesium only,
  // not magnesium naturally present in foods."*
  //
  // `[read]` **Ein Flag ohne diese Ausnahme wuerde 87-mal falsch
  // warnen.**
  const f = flagVon('MG', 'Magnesium', 'upper_limit', tage(90, 160), 80)
  assert.ok(f)
  assert.equal(f.art, 'grenze_nur_supplement',
    'MG darf nicht als echte Ueberschreitung gelten.')
  assert.equal(FLAG_FARBE[f.art], 'var(--fg-dim)',
    'Die Ausnahme ist grau, nicht rot — sie ist keine Warnung.')
  assert.match(FLAG_SATZ[f.art], /nicht für Lebensmittel/)
})

test('C-323: die drei Ausnahmen stehen mit Begruendung da', () => {
  // `[cmd]` **Drei von 19 Obergrenzen**, aus `notes` gelesen.
  assert.deepEqual(Object.keys(GRENZE_NUR_SUPPLEMENT).sort(),
    ['FOLAC', 'MG', 'NIA'])
  for (const [code, satz] of Object.entries(GRENZE_NUR_SUPPLEMENT)) {
    assert.match(satz, /Präparat/,
      `${code} nennt nicht, worauf die Grenze sich bezieht.`)
  }
})

test('C-323: die Schwelle trennt an den gemessenen Faellen', () => {
  // `[cmd]` **Gegenprobe gegen die echten Daten, dev, 90 Tage bis
  // 2026-08-29** — die Anteile der Ueberschreitungen:
  //
  //     MG    87 von 88   98,9 %   -> Flag (als Ausnahme)
  //     NIA   51 von 73   69,9 %   -> Flag (als Ausnahme)
  //     VITA  42 von 90   46,7 %   -> KEIN Flag
  //     MN     5 von 90    5,6 %   -> KEIN Flag
  //
  // `[read]` **VITA liegt knapp darunter, und das ist der Beleg,
  // dass die Schwelle unterscheidet** statt alles durchzulassen.
  const bau = (ueber: number, gesamt: number) =>
    [...tage(ueber, 160), ...tage(gesamt - ueber, 50)]
  assert.ok(flagVon('MG', 'Magnesium', 'upper_limit', bau(87, 88), 80))
  assert.ok(flagVon('NIA', 'Niacin', 'upper_limit', bau(51, 73), 80))
  assert.equal(flagVon('VITA', 'Vitamin A', 'upper_limit', bau(42, 90), 80), null,
    'VITA liegt bei 46,7 % — unter der Haelfte, also kein Muster.')
  assert.equal(flagVon('MN', 'Mangan', 'upper_limit', bau(5, 90), 80), null)
})

test('C-323: eine Obergrenze ohne Ausnahme warnt normal', () => {
  // `[cmd]` VITA steht auf dev an 42 von 90 Tagen darueber — und
  // seine Grenze gilt fuer die Gesamtzufuhr.
  const f = flagVon('VITA', 'Vitamin A', 'upper_limit', tage(90, 160), 80)
  assert.ok(f)
  assert.equal(f.art, 'ueber_grenze')
  assert.equal(FLAG_FARBE[f.art], 'var(--neg)')
})

// ── Reihenfolge und zu wenig Daten ───────────────────────────────

test('C-323: sortiert nach Dauer, nicht nach Hoehe', () => {
  const mach = (code: string, t: number, b: number, art: Flag['art']): Flag =>
    ({ code, name: code, art, tage: t, bewertet: b, unvollstaendig: 0 })
  const sortiert = sortiere([
    mach('MG', 87, 90, 'grenze_nur_supplement'),
    mach('NACL', 78, 90, 'unter_ziel'),
    mach('VITA', 42, 90, 'ueber_grenze'),
  ])
  assert.deepEqual(sortiert.map(f => f.code), ['VITA', 'NACL', 'MG'],
    'Die echte Ueberschreitung steht oben, die Ausnahme unten.')

  // `[read]` **Und innerhalb DERSELBEN Art entscheidet die Dauer.**
  // Ohne diese Probe ueberlebte eine Sabotage, die den Dauer-Vergleich
  // durch `|| 0` ersetzte: die Art allein legte die Reihenfolge schon
  // fest, der Vergleich wurde nie erreicht.
  const gleich = sortiere([
    mach('CA', 56, 90, 'unter_ziel'),
    mach('WATER', 88, 88, 'unter_ziel'),
    mach('NACL', 78, 90, 'unter_ziel'),
  ])
  assert.deepEqual(gleich.map(f => f.code), ['WATER', 'NACL', 'CA'],
    'Bei gleicher Art gewinnt der hoehere Anteil — 88/88 vor 78/90 vor 56/90.')

  // Und der Anteil schlaegt die absolute Zahl: 8 von 8 ist ein
  // durchgehendes Muster, 40 von 90 ist keines.
  const anteil = sortiere([
    mach('VIEL', 40, 90, 'unter_ziel'),
    mach('WENIG', 8, 8, 'unter_ziel'),
  ])
  assert.deepEqual(anteil.map(f => f.code), ['WENIG', 'VIEL'],
    'Der Anteil entscheidet, nicht die absolute Tageszahl.')
})

test('C-323: zu wenig Daten ist eine Aussage, kein leeres Ergebnis', () => {
  // `[cmd]` **`test-user@lumeos.local` faellt im 7-Tage-Fenster aus** —
  // 12 Tage Daten insgesamt. `[read]` **G-208: „nichts gefunden" und
  // „zu wenig gemessen" sind zwei verschiedene Aussagen.**
  assert.match(zuWenigDatenSatz(0), /keine bewerteten Tage/)
  assert.match(zuWenigDatenSatz(2), /zu wenig für eine Aussage/)
  assert.equal(zuWenigDatenSatz(MIN_TAGE), '')
})

test('C-323: jeder Satz kommt ohne Zahl aus', () => {
  // Die Nachweiszeile: „je Flag ein Satz, ohne Zahl". Die Zahlen
  // stehen in `dauerSatz`, nicht im Satz selbst.
  for (const [art, satz] of Object.entries(FLAG_SATZ)) {
    assert.doesNotMatch(satz, /\d/, `${art} traegt eine Zahl im Satz.`)
  }
})
