// G-239: die vier Regeln aus C-48, gegen die gemessenen Daten.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  lageVon, zeigtProzent, fehlSatz, richtungsSatz, geltungsSatz,
  faelleZusammen, gruppiere, verteilung,
  LAGE_TEXT, LAGE_FARBE, OHNE_REFERENZ_SATZ, GEDECKT_AB,
  type ZeileMitLage,
} from '../mikro-lage'

/** Eine Zeile, wie die Funktion sie liefert. */
function zeile(p: Partial<ZeileMitLage> = {}): ZeileMitLage {
  return {
    nutrient_code: 'CA', nutrient_name_de: 'Calcium', nutrient_unit: 'mg',
    actual_value: 683.4, missing_count: 0, value_complete: true,
    reference_kind: 'PRI', reference_direction: 'target',
    reference_value_min: 950, reference_value_max: null, reference_unit: 'mg',
    reference_pct: 71.9, reference_pct_min: null, reference_pct_max: null,
    reference_status: 'complete',
    profile_age_years: 31, profile_biological_sex: 'male',
    profile_is_pregnant: false, profile_is_lactating: false,
    reference_basis: null, source: 'EFSA', source_locator: null, notes: null,
    lage: 'zu_wenig', ...p,
  }
}

// ── Regel 1: Fehlzaehler bleiben sichtbar ────────────────────────

test('G-239 Regel 1: unvollstaendig ist ein Zustand, keine Null', () => {
  // `[cmd]` **Gemessen 2026-08-28 auf dev, 2026-06-01:** alle 77
  // `incomplete`-Zeilen tragen `reference_pct = null`, zusammen 407
  // fehlende Positionen. Die Funktion macht daraus keine Null.
  const l = lageVon({
    reference_status: 'incomplete', reference_kind: 'PRI',
    reference_direction: 'target', reference_pct: null,
  })
  assert.equal(l, 'unvollstaendig')
  assert.equal(zeigtProzent(l, null), false)
  assert.equal(zeigtProzent(l, 42), false,
    'Auch mit Prozentwert bleibt unvollstaendig ohne Zahl (G-239).')
})

test('G-239 Regel 1: der Fehlzaehler wird benannt, nicht verschwiegen', () => {
  assert.equal(fehlSatz(0), '')
  assert.match(fehlSatz(1), /^1 Position ohne Wert/)
  assert.match(fehlSatz(3), /^3 Positionen ohne Wert/)
})

test('G-239 Regel 1: unvollstaendig ist grau, nicht rot', () => {
  // `[read]` Es ist kein Befund, sondern das Fehlen eines Befunds.
  assert.equal(LAGE_FARBE.unvollstaendig, 'var(--fg-dim)')
  assert.notEqual(LAGE_FARBE.unvollstaendig, LAGE_FARBE.zu_wenig)
})

// ── Regel 2: die Wertart entscheidet die Leserichtung ────────────

test('G-239 Regel 2: 80 % eines PRI ist zu wenig, 80 % eines UL ist gut', () => {
  // `[read]` **Der Kern der Regel.** Derselbe Prozentwert, zwei
  // Bedeutungen — beides als „80 %" anzuzeigen waere gefaehrlich.
  const ziel = lageVon({
    reference_status: 'complete', reference_kind: 'PRI',
    reference_direction: 'target', reference_pct: 79,
  })
  const grenze = lageVon({
    reference_status: 'complete', reference_kind: 'UL',
    reference_direction: 'upper_limit', reference_pct: 79,
  })
  assert.equal(ziel, 'zu_wenig')
  assert.equal(grenze, 'gedeckt')
  assert.notEqual(ziel, grenze,
    'Dieselbe Zahl muss je nach Richtung verschieden gelesen werden (G-239).')
})

test('G-239 Regel 2: ueber der Obergrenze ist eine eigene Lage', () => {
  // `[cmd]` Auf dev am 2026-06-01 drei Faelle: Vitamin A 163,5 %,
  // Magnesium 160,2 %, Niacin 130,7 % — alle `UL`/`upper_limit`.
  const l = lageVon({
    reference_status: 'complete', reference_kind: 'UL',
    reference_direction: 'upper_limit', reference_pct: 163.5,
  })
  assert.equal(l, 'zu_viel')
  assert.equal(LAGE_FARBE.zu_viel, 'var(--neg)')
  assert.notEqual(LAGE_FARBE.zu_viel, LAGE_FARBE.zu_wenig,
    'Zu viel und zu wenig duerfen nicht gleich aussehen (G-239).')
})

test('G-239 Regel 2: der Satz nennt, worauf sich die Zahl bezieht', () => {
  assert.equal(richtungsSatz('upper_limit'), 'der Obergrenze')
  assert.equal(richtungsSatz('target'), 'des Zielwerts')
  assert.equal(richtungsSatz('range'), 'des Richtbereichs')
})

test('G-239 Regel 2: ein Naehrstoff mit ZWEI Referenzen wird zusammengefasst', () => {
  // `[cmd]` **12 Naehrstoffe auf dev tragen zwei Zeilen** — Zielwert
  // und Obergrenze. Calcium: 71,9 % des PRI (zu wenig) UND 27,3 %
  // des UL (unbedenklich). Je Zeile eine Kachel zeigte Calcium
  // zweimal mit widerspruechlichem Anschein.
  const stoffe = faelleZusammen([
    zeile({ reference_kind: 'PRI', reference_direction: 'target',
      reference_pct: 71.9, lage: 'zu_wenig' }),
    zeile({ reference_kind: 'UL', reference_direction: 'upper_limit',
      reference_pct: 27.3, lage: 'gedeckt' }),
  ])
  assert.equal(stoffe.length, 1, 'Calcium ist EIN Naehrstoff (G-239).')
  assert.equal(stoffe[0].ziel.reference_kind, 'PRI')
  assert.equal(stoffe[0].grenze?.reference_kind, 'UL')
  assert.equal(stoffe[0].lage, 'zu_wenig')
})

test('G-239 Regel 2: die Ueberschreitung schlaegt den gedeckten Zielwert', () => {
  // `[read]` Vitamin A ist auf dev genau dieser Fall: der Zielwert
  // ist uebererfuellt UND die Obergrenze ueberschritten. Die
  // ernstere Aussage traegt die Kachel.
  const stoffe = faelleZusammen([
    zeile({ nutrient_code: 'VITA', reference_kind: 'PRI',
      reference_direction: 'target', reference_pct: 700, lage: 'gedeckt' }),
    zeile({ nutrient_code: 'VITA', reference_kind: 'UL',
      reference_direction: 'upper_limit', reference_pct: 163.5, lage: 'zu_viel' }),
  ])
  assert.equal(stoffe[0].lage, 'zu_viel',
    'Eine Ueberschreitung darf nicht von einem gedeckten Ziel verdeckt werden (G-239).')
})

// ── Regel 3: ohne Referenz ist keine Null ────────────────────────

test('G-239 Regel 3: NO_REFERENCE ist kein 0 % gedeckt', () => {
  // `[cmd]` Auf dev: `NO_STANDALONE_REFERENCE` 57 Zeilen,
  // `NO_REFERENCE` 21. `[read]` Dieselbe Klasse wie
  // `begruendet_leer` gegen `nicht_bearbeitet` (G-208).
  for (const art of ['NO_REFERENCE', 'NO_STANDALONE_REFERENCE']) {
    const l = lageVon({
      reference_status: 'not_applicable', reference_kind: art,
      reference_direction: 'not_applicable', reference_pct: null,
    })
    assert.equal(l, 'ohne_referenz', art)
    assert.equal(zeigtProzent(l, 0), false,
      `${art} darf keinen Prozentwert zeigen (G-239).`)
  }
})

test('G-239 Regel 3: der Satz sagt, dass es keine Aussage ueber die Zufuhr ist', () => {
  assert.match(OHNE_REFERENZ_SATZ, /keine Aussage/i)
  assert.notEqual(LAGE_TEXT.ohne_referenz, LAGE_TEXT.zu_wenig)
})

// ── Regel 4: gesunde Erwachsene ──────────────────────────────────

test('G-239 Regel 4: der Geltungsbereich nennt das Profil', () => {
  // `[cmd]` Auf dev: 31, male, nicht schwanger, nicht stillend.
  const s = geltungsSatz({
    profile_age_years: 31, profile_biological_sex: 'male',
    profile_is_pregnant: false, profile_is_lactating: false,
  })
  assert.match(s, /gesunde Erwachsene/)
  assert.match(s, /31 Jahre/)
  assert.match(s, /männlich/)
})

test('G-239 Regel 4: Schwangerschaft und Stillzeit kommen mit', () => {
  const s = geltungsSatz({
    profile_age_years: 29, profile_biological_sex: 'female',
    profile_is_pregnant: true, profile_is_lactating: false,
  })
  assert.match(s, /schwanger/)
})

test('G-239 Regel 4: ohne Profil wird das gesagt, nicht geraten', () => {
  const s = geltungsSatz(null)
  assert.match(s, /kein vollständiges Profil/)
})

// ── Gruppierung und Verteilung ───────────────────────────────────

test('G-239: was in keine Gruppe faellt, verschwindet nicht', () => {
  // `[read]` **Eine stumm weggelassene Zeile waere derselbe Fehler
  // wie eine Null statt eines Fehlzaehlers.** `[cmd]` Auf dev fallen
  // 100 von 154 Zeilen in keine der fuenf Mockup-Gruppen — vor allem
  // Einzelfettsaeuren und Zucker.
  const g = gruppiere([
    { code: 'CA', name: 'Calcium', einheit: 'mg',
      ziel: zeile(), grenze: null, lage: 'zu_wenig' },
    { code: 'XYZ_UNBEKANNT', name: 'Etwas', einheit: 'g',
      ziel: zeile(), grenze: null, lage: 'gedeckt' },
  ])
  const weitere = g.find(x => x.key === 'weitere')
  assert.ok(weitere, 'Unbekannte Codes brauchen eine Gruppe (G-239).')
  assert.equal(weitere.stoffe.length, 1)
})

test('G-239: leere Gruppen erscheinen nicht', () => {
  const g = gruppiere([{ code: 'CA', name: 'Calcium', einheit: 'mg',
    ziel: zeile(), grenze: null, lage: 'zu_wenig' }])
  assert.deepEqual(g.map(x => x.key), ['mineral'])
})

test('G-239: die Verteilung zaehlt jede Zeile genau einmal', () => {
  const stoffe = [
    { lage: 'zu_viel' as const }, { lage: 'zu_wenig' as const },
    { lage: 'gedeckt' as const }, { lage: 'gedeckt' as const },
    { lage: 'unvollstaendig' as const },
  ]
  const v = verteilung(stoffe)
  assert.equal(v.reduce((n, x) => n + x.anzahl, 0), stoffe.length,
    'Die Summe der Zustaende muss die Zeilenzahl sein (G-239).')
  assert.equal(v[0].lage, 'zu_viel', 'Das Ernsteste steht vorn (G-239).')
})

// ── Die Anzeige haelt sich daran ─────────────────────────────────

const ohneKommentare = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-239: die Lage-Datei rechnet nicht selbst', () => {
  // `[read]` `reference_pct` entsteht in der Datenbank. Eine zweite
  // Rechnung waere eine zweite Wahrheit — und genau die Stelle, an
  // der aus einem Fehlzaehler eine Null wird (C-48).
  const s = ohneKommentare('src/lib/nutrition/mikro-lage.ts')
  assert.doesNotMatch(s, /actual_value\s*\/\s*reference_value/,
    'Die Lage-Datei rechnet den Prozentwert nach (G-239).')
  assert.doesNotMatch(s, /\*\s*100/,
    'Die Lage-Datei bildet selbst Prozentwerte (G-239).')
})

test('G-239: nutrient_display_tier ist keine Gliederung', () => {
  // `[cmd]` Laut G-140 ein Abo-Tier, keine Baumebene; G-235 haelt
  // die Frage offen.
  const s = ohneKommentare('src/lib/nutrition/mikro-lage.ts')
  assert.doesNotMatch(s, /GRUPPEN[\s\S]{0,400}display_tier/,
    'display_tier wird als Gliederung benutzt (G-140, G-239).')
})

test('G-239: die Schwelle ist die des Mockups, keine neue', () => {
  // `[read]` Der Auftrag verbietet neue Schwellen. 80 stammt aus
  // `MicroDashboard.js` (`pct>=80`) und damit aus dem Vorgaengerrepo.
  assert.equal(GEDECKT_AB, 80)
})
