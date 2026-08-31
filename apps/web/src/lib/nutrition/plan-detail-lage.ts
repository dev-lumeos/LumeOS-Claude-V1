// ════════════════════════════════════════════════════════════════════
// KENNZAHLEN UND LEBENSZYKLUS EINES PLANS — G-286/G-290
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// `[read]` **Warum getrennt von der Anzeige:** die Regeln sind ohne
// Browser pruefbar, und die Kachel bleibt dann eine Kachel. Dasselbe
// Muster wie `plan-lage.ts` neben `plans-echt.tsx`.
import type { PlanDaten, PlanTag } from './plan-lesen'
import type { Zyklus } from './plan-lage'

// ── Die waehlbaren Lebenszyklen (LifecyclePicker, SPEC_10) ────────
//
// `[cmd]` **Die drei Werte stehen im Schema seit dem 30.08.**
// (`lifecycle_type`, CHECK auf `once | rollover | sequence`),
// **Vorgabe `'once'`.**
//
// `[read]` **`ZYKLUS_TEXT` und `ZYKLUS_ERKLAERUNG` stehen in
// `plan-lage.ts` und werden von dort benutzt** — eine zweite Fassung
// waere eine zweite Wahrheit. **Hier steht nur, was WAEHLBAR ist:**
// `unbekannt` ist ein Zustand der Bestandsplaene, keine Wahl.
export const ZYKLUS_WAEHLBAR = ['once', 'rollover', 'sequence'] as const
export type ZyklusWahl = (typeof ZYKLUS_WAEHLBAR)[number]

/** Ist der gespeicherte Wert einer, den man waehlen kann? */
export function istWaehlbar(z: Zyklus): z is ZyklusWahl {
  return z !== 'unbekannt'
}

/**
 * Die Kennzahlen einer Plan-Karte — SPEC_10 nennt sie:
 * *„Name, Quelle, Status, Tage, kcal/Tag"*.
 */
export type PlanKennzahlen = {
  wochen: number
  tage: number
  eintraege: number
  /**
   * Durchschnittliche kcal je Tag, oder `null`.
   *
   * `[read]` **`null` heisst „nicht ermittelbar", nicht „0 kcal".**
   * Ein Eintrag ohne Naehrwert traegt `kcal: null` (siehe
   * `plan-lesen.ts`) — **wer ihn als 0 mitzaehlt, senkt den Schnitt
   * und behauptet damit etwas ueber den Plan.**
   *
   * `[read]` **Gezaehlt werden deshalb nur Tage, deren Eintraege
   * VOLLSTAENDIG belegt sind.** Gibt es keinen solchen Tag, ist die
   * Antwort `null`.
   */
  kcalSchnitt: number | null
}

/**
 * Die kcal eines Tages, oder `null`.
 *
 * `[read]` **Ein einziger Eintrag ohne Wert macht den Tag
 * unbelegbar** — dieselbe Regel wie bei der Tagesbilanz: eine Summe
 * aus unvollstaendigen Teilen ist keine Summe.
 */
export function tagesKcal(t: PlanTag): number | null {
  if (t.eintraege.length === 0) return null
  if (t.eintraege.some(e => e.kcal === null)) return null
  return Math.round(t.eintraege.reduce((s, e) => s + (e.kcal ?? 0), 0))
}

export function planKennzahlen(d: PlanDaten): PlanKennzahlen {
  const tage = d.wochen.flatMap(w => w.tage)
  const eintraege = tage.reduce((s, t) => s + t.eintraege.length, 0)
  const belegte = tage
    .map(tagesKcal)
    .filter((k): k is number => k !== null)
  return {
    wochen: d.wochen.length,
    tage: tage.length,
    eintraege,
    kcalSchnitt: belegte.length === 0
      ? null
      : Math.round(belegte.reduce((s, k) => s + k, 0) / belegte.length),
  }
}
