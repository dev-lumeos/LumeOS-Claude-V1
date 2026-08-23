// Die Zaehlung des Meal-Plans-Tabs (G-161).
//
// `[cmd]` **Gemessen am 2026-08-23** gegen die laufende Datenbank:
// Gesamtbestand 2 Plaene / 6 Wochen / 42 Tage / 112 Eintraege,
// **davon gehoert `dev@lumeos.app` die Haelfte** — 1 / 3 / 21 / 56.
// Der zweite Plan gehoert einem anderen Konto und faellt per RLS
// heraus. `test-user@lumeos.local` sieht 0.
//
// `[read]` **Deshalb steht in dieser Pruefung 3/21/56 und nicht
// 6/42/112.** Wer die Gesamtzahlen erwartet, misst die Datenbank,
// nicht das, was ein Konto sieht.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { planZaehlung } from '../plans-echt'
import type { PlanDaten } from '../../../../lib/nutrition/plan-lesen'

/** Ein Plan wie `ladePlan` ihn liefert — nur die gezaehlten Felder. */
function daten(wochen: number, tageJeWoche: number, eintraegeJeTag: number): PlanDaten {
  return {
    plan: {
      id: 'p1', name: 'Aufbau-Wochenplan', description: null,
      target_kcal: null, target_protein_g: null,
      target_carbs_g: null, target_fat_g: null, is_active: true,
    },
    wochen: Array.from({ length: wochen }, (_, w) => ({
      id: `w${w}`, week_start: `2026-08-0${w + 1}`, name: null, kopiert_von: null,
      tage: Array.from({ length: tageJeWoche }, (_, t) => ({
        id: `d${w}-${t}`, plan_date: `2026-08-0${t + 1}`, day_index: t,
        eintraege: Array.from({ length: eintraegeJeTag }, (_, e) => ({
          id: `e${w}-${t}-${e}`, meal_type: 'breakfast', slot_order: e,
          entry_type: 'bls', recipe_id: null, food_id: null,
          bezeichnung: 'x', amount_g: null, planned_servings: null,
          note: null, kcal: null,
        })),
      })),
    })),
    zeilen: [], zeilenGrund: '', rezepte: [],
  } as unknown as PlanDaten
}

test('die Zaehlung geht ueber alle vier Ebenen', () => {
  // 3 Wochen a 7 Tage = 21 Tage; die Eintraege sind ungleich verteilt,
  // deshalb hier glatt gerechnet und unten am echten Stand geprueft.
  const z = planZaehlung(daten(3, 7, 2))
  assert.equal(z.wochen, 3)
  assert.equal(z.tage, 21)
  assert.equal(z.eintraege, 42)
})

test('der Stand von dev: 3 Wochen, 21 Tage — nicht 6 und 42', () => {
  // `[read]` Die Gegenprobe zur haeufigsten Verwechslung: der
  // Gesamtbestand ist doppelt so gross wie das, was ein Konto sieht.
  const z = planZaehlung(daten(3, 7, 0))
  assert.equal(z.wochen, 3, 'dev sieht 3 von 6 Wochen')
  assert.equal(z.tage, 21, 'dev sieht 21 von 42 Tagen')
})

test('ohne Wochen zaehlt nichts — und wirft nicht', () => {
  const leer = { plan: null, wochen: [], zeilen: [], zeilenGrund: '', rezepte: [] }
  const z = planZaehlung(leer as unknown as PlanDaten)
  assert.deepEqual(z, { wochen: 0, tage: 0, eintraege: 0 })
})

test('ungleich gefuellte Tage werden einzeln gezaehlt', () => {
  // `[cmd]` **Der echte Plan hat 56 Eintraege auf 21 Tagen** — 2,67 je
  // Tag, also KEINE gleiche Verteilung. Eine Zaehlung, die
  // `tage * eintraegeJeTag` hochrechnet, trifft hier daneben.
  //
  // `[read]` **Die Verteilung muss ungleich sein, sonst misst der Test
  // nichts.** Erster Entwurf baute drei gleich gefuellte Tage — der
  // eingebaute Hochrechnungsfehler blieb dabei gruen (gegengeprobt am
  // 2026-08-23). Jetzt traegt der ERSTE Tag drei Eintraege und die
  // folgenden weniger: `3 * 3 = 9` gegen die richtige Summe 4.
  const d = daten(1, 3, 0)
  d.wochen[0].tage[0].eintraege = [{ id: 'a' }, { id: 'b' }, { id: 'c' }] as never
  d.wochen[0].tage[1].eintraege = [{ id: 'e' }] as never
  d.wochen[0].tage[2].eintraege = [] as never
  const z = planZaehlung(d)
  assert.equal(z.tage, 3)
  assert.equal(z.eintraege, 4,
    'Eintraege muessen je Tag gezaehlt werden — nicht aus dem ersten Tag '
    + 'hochgerechnet (3 x 3 = 9 waere falsch).')
})
