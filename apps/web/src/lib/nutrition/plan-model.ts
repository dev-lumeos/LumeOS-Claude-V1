// Die Begriffe des Wochenplans — ohne Serverbezug (G-97).
//
// **WARUM EINE EIGENE DATEI:** `[cmd]` `plan-lesen.ts` importiert
// `createSessionClient` und damit `next/headers`. Ein WERT-Import aus
// einer `'use client'`-Datei zieht das ins Browserbuendel; die Folge
// ist **HTTP 500 auf der ganzen Seite, bei gruenem Typecheck.**
//
// `[cmd]` Genau das ist beim Bau von G-97 passiert und gemessen worden
// — dieselbe Ursache wie in G-74 (Supplements) und G-79 (Goals). Die
// Trennung ist deshalb keine Kosmetik: **Typen duerfen aus
// `plan-lesen.ts` kommen, Werte nicht.**

/** Die vier Mahlzeitenreihen des Rasters, in der Reihenfolge der Vorlage. */
export const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const
export type Slot = typeof SLOTS[number]

// ══ G-335: die eigenen Namenslisten sind weg ═════════════════════════
//
// `[cmd]` **Hier standen ZWEI Tabellen** — `SLOT_LABEL` mit vier
// englischen Namen (`Breakfast`, `Snacks`) und `MAHLZEIT_LABEL` mit
// sieben (`Pre-Workout`). `[cmd]` **Insgesamt wurde `meal_type` an
// zehn Stellen uebersetzt, ueber fuenf Tabellen, mit vier
// Schreibweisen fuer
// `pre_workout`.**
//
// `[read]` **`meal_type` ist eine Kategorie, keine Beschriftung**
// (E-58). **`KATEGORIE_TEXT` ist der Rueckfall**, wenn weder ein Plan
// (E-59) noch die Slotliste des Nutzers einen Namen liefert.
//
// `[cmd]` **Der Wert-Import ist unbedenklich:** `slots-lage.ts` ist
// reine Rechnung ohne `next/headers` — der Grund fuer diese Datei
// (siehe Kopf) trifft nicht zu.
export { KATEGORIE_TEXT as MAHLZEIT_LABEL } from './slots-lage'
export { KATEGORIE_TEXT as SLOT_LABEL } from './slots-lage'

/**
 * Welche Mahlzeitenreihen das Raster zeigt.
 *
 * `[cmd]` **Hier wirken zwei der acht G-72-Spalten.** `meals_per_day`
 * (bei `dev` 4) und `snacks_per_day` (1) standen seit G-72 gespeichert
 * und ohne Wirkung.
 *
 * `[cmd]` **DIE BEIDEN ZAEHLEN GETRENNT, NICHT INEINANDER.** Die
 * Vorgaben in `050_preferences_foundation.sql` sind
 * `meals_per_day DEFAULT 3` UND `snacks_per_day DEFAULT 1` — drei
 * Hauptmahlzeiten sind Fruehstueck/Mittag/Abend, der Snack kommt
 * DANEBEN. Waeren Snacks eingerechnet, hiesse die Vorgabe zwei
 * Hauptmahlzeiten, und das ist nicht gemeint.
 *
 * `[read]` **Erst falsch gebaut und beim Messen aufgefallen:** die
 * erste Fassung zog die Snacks ab und schrieb dann „4 Mahlzeiten je
 * Tag, davon 1 Snack" ueber ein Raster mit vier Reihen — ein Satz, der
 * sich selbst widerspricht.
 *
 * `[cmd]` Das Raster zeigt hoechstens drei Hauptreihen, weil es nur
 * drei gibt (`breakfast`, `lunch`, `dinner`). **Wer 5 oder 6
 * Mahlzeiten fuehrt, sieht trotzdem drei** — und der Satz sagt das,
 * statt eine Reihe zu erfinden, fuer die es keinen `meal_type` gibt.
 *
 * **Ohne Angabe bleibt es bei den vier Reihen des Entwurfs** — eine
 * geratene Zeilenzahl waere schlimmer als die Vorlage.
 */
export function rasterZeilen(
  mealsPerDay: number | null,
  snacksPerDay: number | null,
): { zeilen: Slot[]; grund: string } {
  if (mealsPerDay === null || mealsPerDay < 1) {
    return {
      zeilen: [...SLOTS],
      grund: 'Vier Reihen wie im Entwurf — `meals_per_day` ist nicht gesetzt.',
    }
  }
  const snacks = snacksPerDay !== null && snacksPerDay > 0
  const haupt = Math.max(1, Math.min(3, mealsPerDay))
  const zeilen: Slot[] = (['breakfast', 'lunch', 'dinner'] as Slot[]).slice(0, haupt)
  if (snacks) zeilen.push('snack')

  const rest = mealsPerDay > 3
    ? ` Fuer ${mealsPerDay} Hauptmahlzeiten fuehrt das Schema nur drei `
      + 'Reihen — die uebrigen haetten keinen `meal_type`.'
    : ''
  return {
    zeilen,
    grund: `${zeilen.length} Reihen aus deinen Vorlieben — `
      + `${mealsPerDay} Hauptmahlzeit${mealsPerDay === 1 ? '' : 'en'}`
      + (snacks ? ` und ${snacksPerDay} Snack${snacksPerDay === 1 ? '' : 's'}` : ' ohne Snacks')
      + '.' + rest,
  }
}
