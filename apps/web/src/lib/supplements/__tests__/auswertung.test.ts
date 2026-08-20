// Die Rechnungen fuer Inventory, Compliance und Cost (G-74).
//
// `[read]` Reine Rechnungen ohne Datenbank und ohne React — ein Fehler
// faellt hier auf, bevor er als falsche Zahl in einer Kachel steht.
//
// **Der Fall, um den es geht:** `[cmd]` Kreatin fuehrt **30 g** bei
// **5 g/Tag** und reicht **6 Tage**, nicht 30. Die uebrigen drei
// Positionen fuehren den Bestand in Stueck, dort ist ein Stueck eine
// Portion. Wer die Einheit ignoriert, meldet fuer Kreatin die fuenffache
// Reichweite — und die Nachfuellstufe faellt von „dringend" auf „nichts".
import test from 'node:test'
import assert from 'node:assert/strict'

import { ableiten } from '../stack-read'
import type { EinnahmeZeile, StackPosition } from '../stack-read'
import {
  complianceJePraeparat, gesamtquote, kostenJeMonat, minusTage,
  nachfuellliste, nachfuellstufe, nachkaufwert, ohnePosition, stufenZaehlung,
  tagesquoten,
} from '../auswertung'

const HEUTE = '2026-08-20'

function position(teil: Partial<StackPosition> & { id: string; name: string }): StackPosition {
  const dose = teil.dose ?? 1
  const abgeleitet = ableiten(
    dose, teil.stock_remaining ?? null, teil.low_stock_threshold ?? null,
    teil.katalog ?? null, teil.dose_unit ?? '', teil.stock_unit ?? null,
  )
  return {
    dose, dose_unit: '', timing: 'any', frequency: 'daily', sort_order: 0,
    is_active: true, stock_remaining: null, stock_unit: null,
    low_stock_threshold: null, katalog: null,
    ...abgeleitet, ...teil,
  } as StackPosition
}

function einnahme(
  teil: Partial<EinnahmeZeile> & { intake_date: string; status: EinnahmeZeile['status'] },
): EinnahmeZeile {
  return {
    id: `e-${teil.intake_date}-${teil.supplement_name_snapshot ?? 'x'}-${teil.status}`,
    stack_item_id: null, intake_time: null,
    supplement_name_snapshot: 'Kreatin', dose_snapshot: 5, dose_unit_snapshot: 'g',
    notes: null, measurement_source: null,
    ...teil,
  } as EinnahmeZeile
}

// ── Reichweite ──────────────────────────────────────────────────

test('die Reichweite folgt der Einheit — Kreatin reicht 6 Tage, nicht 30', () => {
  // `[cmd]` Der echte Bestand auf dev@lumeos.app: 30 g bei 5 g/Tag.
  const gleich = ableiten(5, 30, 30, { serving_size: 5, cost_per_serving: 0.15 }, 'g', 'g')
  assert.equal(gleich.tage_bis_leer, 6, '30 g bei 5 g/Tag sind 6 Tage.')

  // Bestand in Stueck: 1 Stueck = 1 Portion.
  const stueck = ableiten(
    5000, 4, 7, { serving_size: 5000, cost_per_serving: 0.08 }, 'IU', 'softgels')
  assert.equal(stueck.tage_bis_leer, 4, '4 softgels bei 1 Portion/Tag sind 4 Tage.')

  // Gross-/Kleinschreibung und Leerraum duerfen nicht trennen.
  const laessig = ableiten(5, 30, null, { serving_size: 5, cost_per_serving: null }, ' G ', 'g')
  assert.equal(laessig.tage_bis_leer, 6, '„ G " und „g" sind dieselbe Einheit.')
})

test('ohne Einheiten bleibt die alte Lesart — Bestand als Portionen', () => {
  // Rueckwaertsvertraeglich: die bestehenden Aufrufe ohne Einheiten
  // rechnen weiter wie vor G-74.
  const r = ableiten(5, 180, 50, { serving_size: 5, cost_per_serving: 0.15 })
  assert.equal(r.tage_bis_leer, 180)
})

test('die drei Nachfuellstufen greifen an ihren Grenzen', () => {
  // `[read]` Toms Entscheidung: 1 Woche dringend, 2 Wochen Warnung,
  // 1 Monat Hinweis.
  assert.equal(nachfuellstufe(4, null), 'dringend')
  assert.equal(nachfuellstufe(7, null), 'dringend', '7 Tage sind noch dringend.')
  assert.equal(nachfuellstufe(8, null), 'warnung')
  assert.equal(nachfuellstufe(14, null), 'warnung', '14 Tage sind noch Warnung.')
  assert.equal(nachfuellstufe(15, null), 'hinweis')
  assert.equal(nachfuellstufe(30, null), 'hinweis', '30 Tage sind noch Hinweis.')
  assert.equal(nachfuellstufe(31, null), null)

  // `[cmd]` Der Rueckfall: ohne Reichweite entscheidet die gepflegte
  // Schwelle. Sie kennt keine Abstufung — die mittlere ist richtiger
  // als die schwaechste, wenn man nicht weiss, wie knapp es ist.
  assert.equal(nachfuellstufe(null, true), 'warnung')
  assert.equal(nachfuellstufe(null, false), null)
  assert.equal(nachfuellstufe(null, null), null)
})

test('die Nachfuellliste sortiert knappste zuerst, Unbekanntes ans Ende', () => {
  const zeilen = nachfuellliste([
    position({ id: 'a', name: 'Omega-3', dose: 2, dose_unit: 'g',
      stock_remaining: 14, stock_unit: 'softgels',
      katalog: { serving_size: 2, cost_per_serving: 0.3 } as never }),
    position({ id: 'b', name: 'Vitamin D3', dose: 5000, dose_unit: 'IU',
      stock_remaining: 4, stock_unit: 'softgels',
      katalog: { serving_size: 5000, cost_per_serving: 0.08 } as never }),
    // Ohne Bestand: keine Reichweite.
    position({ id: 'c', name: 'Ohne', dose: 1, dose_unit: 'g' }),
  ])
  assert.deepEqual(zeilen.map(z => z.position.name), ['Vitamin D3', 'Omega-3', 'Ohne'])
  assert.equal(zeilen[0].stufe, 'dringend')
  assert.equal(zeilen[1].stufe, 'warnung')
  assert.equal(zeilen[2].tage, null, 'Ohne Bestand keine erfundene Reichweite.')

  const z = stufenZaehlung(zeilen)
  assert.equal(z.dringend, 1)
  assert.equal(z.warnung, 1)
})

test('der Nachkaufwert bleibt null, wenn ein Preis fehlt', () => {
  // Eine zu niedrige Summe waere schlimmer als keine.
  const ohnePreis = nachfuellliste([
    position({ id: 'a', name: 'X', dose: 1, dose_unit: 'g',
      stock_remaining: 3, stock_unit: 'g' }),
  ])
  assert.equal(nachkaufwert(ohnePreis), null)

  const mitPreis = nachfuellliste([
    position({ id: 'b', name: 'Y', dose: 5000, dose_unit: 'IU',
      stock_remaining: 4, stock_unit: 'softgels',
      katalog: { serving_size: 5000, cost_per_serving: 0.08 } as never }),
  ])
  assert.equal(nachkaufwert(mitPreis, 90), 0.08 * 90)

  // Nichts knapp → nichts zu kaufen, nicht `null`.
  assert.equal(nachkaufwert([]), 0)
})

// ── Compliance ──────────────────────────────────────────────────

test('minusTage rechnet ueber Monatsgrenzen', () => {
  assert.equal(minusTage('2026-08-20', 1), '2026-08-19')
  assert.equal(minusTage('2026-08-01', 1), '2026-07-31')
  assert.equal(minusTage('2026-03-01', 1), '2026-02-28')
  assert.equal(minusTage('2026-08-20', 0), '2026-08-20')
})

test('die Gesamtquote zaehlt genommen gegen erfasst', () => {
  const e = [
    einnahme({ intake_date: '2026-08-20', status: 'taken' }),
    einnahme({ intake_date: '2026-08-19', status: 'taken' }),
    einnahme({ intake_date: '2026-08-18', status: 'skipped' }),
    // Ausserhalb des Fensters — zaehlt nicht mit.
    einnahme({ intake_date: '2026-06-01', status: 'skipped' }),
  ]
  const q = gesamtquote(e, HEUTE, 30)
  assert.equal(q.geplant, 3, 'Nur die drei im Fenster.')
  assert.equal(q.genommen, 2)
  assert.equal(q.ausgelassen, 1)
  assert.equal(q.quote, 66.7)
})

test('ein leeres Fenster ergibt keine Quote von 0 %', () => {
  // `[read]` „nichts erfasst" ist etwas anderes als „nichts genommen".
  const q = gesamtquote([], HEUTE, 30)
  assert.equal(q.quote, null)
})

test('die Compliance gruppiert nach Namen, nicht nach stack_item_id', () => {
  // `[cmd]` Der Fremdschluessel ist `ON DELETE SET NULL` — ein Eintrag
  // kann seine Position ueberleben. Wer nach der Id gruppiert, verliert
  // diese Zeilen stillschweigend.
  const e = [
    einnahme({ intake_date: '2026-08-20', status: 'taken',
      supplement_name_snapshot: 'Kreatin', stack_item_id: 'p1' }),
    einnahme({ intake_date: '2026-08-19', status: 'skipped',
      supplement_name_snapshot: 'Kreatin', stack_item_id: null }),
  ]
  const z = complianceJePraeparat(e, HEUTE, 30)
  assert.equal(z.length, 1, 'Beide Zeilen gehoeren zu einem Praeparat.')
  assert.equal(z[0].geplant, 2)
  assert.equal(z[0].quote, 50)
  assert.equal(z[0].letzter_auslasser, '2026-08-19')
})

test('der Streifen ist immer so lang wie das Fenster', () => {
  const z = complianceJePraeparat(
    [einnahme({ intake_date: '2026-08-20', status: 'taken' })], HEUTE, 30)
  assert.equal(z[0].streifen.length, 30)
  // Der juengste Tag steht rechts.
  assert.equal(z[0].streifen[29], 'taken')
  assert.equal(z[0].streifen[0], 'leer', 'Tage ohne Eintrag sind leer, nicht ausgelassen.')
})

test('Tage ohne Eintrag erscheinen nicht als 0 Prozent', () => {
  const q = tagesquoten(
    [einnahme({ intake_date: '2026-08-20', status: 'taken' })], HEUTE, 3)
  assert.equal(q.length, 3)
  assert.equal(q[2].quote, 100, 'Heute: eine von einer.')
  assert.equal(q[0].quote, null, 'Kein Eintrag → keine Quote.')
  assert.equal(q[0].gesamt, 0)
})

// ── Kosten ──────────────────────────────────────────────────────

test('der Kostenverlauf rechnet aus genommenen Einnahmen', () => {
  // Ein ausgelassener Tag kostet nichts.
  const e = [
    einnahme({ intake_date: '2026-06-01', status: 'taken', supplement_name_snapshot: 'K' }),
    einnahme({ intake_date: '2026-06-02', status: 'skipped', supplement_name_snapshot: 'K' }),
    einnahme({ intake_date: '2026-07-01', status: 'taken', supplement_name_snapshot: 'K' }),
  ]
  const m = kostenJeMonat(e, new Map([['K', 0.5]]))
  assert.equal(m.length, 2)
  assert.equal(m[0].monat, '2026-06')
  assert.equal(m[0].kosten, 0.5, 'Der ausgelassene Tag zaehlt nicht.')
  assert.equal(m[1].kosten, 0.5)
})

test('angeschnittene Monate sind als solche gekennzeichnet', () => {
  // `[read]` Der Bestand beginnt am 22.05. und endet am 19.08. — der
  // erste und der letzte Monat sind unvollstaendig. Wer sie als
  // Monatssumme ausgibt, behauptet einen Rueckgang, den es nicht gibt.
  const e: EinnahmeZeile[] = []
  for (const d of ['2026-05-30', '2026-06-15', '2026-07-15', '2026-08-02']) {
    e.push(einnahme({ intake_date: d, status: 'taken', supplement_name_snapshot: 'K' }))
  }
  const m = kostenJeMonat(e, new Map([['K', 1]]))
  assert.equal(m[0].vollstaendig, false, 'Der erste Monat ist angeschnitten.')
  assert.equal(m[m.length - 1].vollstaendig, false, 'Der letzte ebenso.')
})

test('ein Praeparat ohne Preis faellt aus dem Verlauf, nicht auf null', () => {
  const m = kostenJeMonat(
    [einnahme({ intake_date: '2026-06-01', status: 'taken', supplement_name_snapshot: 'Unbekannt' })],
    new Map([['K', 0.5]]))
  assert.equal(m.length, 0, 'Ohne Preis kein erfundener Punkt.')
})

test('„ohne dieses Praeparat" ist reine Subtraktion', () => {
  const p = [
    position({ id: 'a', name: 'Teuer', dose: 1, dose_unit: 'g',
      katalog: { serving_size: 1, cost_per_serving: 1 } as never }),
    position({ id: 'b', name: 'Billig', dose: 1, dose_unit: 'g',
      katalog: { serving_size: 1, cost_per_serving: 0.5 } as never }),
  ]
  const o = ohnePosition(p)
  assert.equal(o[0].name, 'Teuer', 'Die groesste Ersparnis zuerst.')
  assert.equal(o[0].ersparnis, 30)
  assert.equal(o[0].monat_ohne, 15, '45 gesamt minus 30 eigene.')
  assert.equal(o[0].anteil_pct, 66.7)
})
