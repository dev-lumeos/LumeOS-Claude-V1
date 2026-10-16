// G-615 — der Planer: vom Termin rueckwaerts. **Reine Rechnung, kein I/O.**
//
// **Tom, 2026-10-07:** *„reiter phase engine ist doch genau der planner"*.
// `[cmd]` **Mockup `module-goals-editor.jsx`:** *„Weeks-out are anchored
// to your show date"* — Spalten Stage / Weeks out / Deficit / Cardio.
//
// `[read]` **Keine neue Rechnung:** die Wochen je Stufe kommen aus
// `stufenplan` (G-562/G-608), der Anker aus `ankerplan` (G-607), das Ende
// aus `planende` (G-610). Dieselben Bausteine wie die Zeitachse — die
// Vorschau zeigt, was die Zeitachse nach dem Anlegen zeigt.
import { ankerplan, planende, stufenplan, teilphasenAusWochen } from './anker'
import type { Strategie } from './strategie-read'

export type Planstufe = {
  name: string
  wochen: number
  /** ISO-Tag, an dem die Stufe beginnt. */
  beginn: string
  /** Wochen vor dem Termin, an denen die Stufe beginnt. */
  wochenVorher: number
  /** Defizit aus `tdee_multiplier` (0.85 → 15 %), sonst `null`. */
  defizitPct: number | null
  /** Aus dem `cardio`-Objekt der Stufe, sonst `null`. */
  cardio: string | null
}

export type Planvorschau =
  | { ok: true; stufen: Planstufe[]; ende: string; verschoben: boolean; summe: number }
  | { ok: false; grund: string }

const zahlAus = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

function cardioText(c: unknown): string | null {
  if (typeof c !== 'object' || c === null) return null
  const o = c as Record<string, unknown>
  const spanne = (v: unknown) => Array.isArray(v) && v.length === 2 ? `${v[0]}–${v[1]}` : null
  const teile = [
    typeof o.type === 'string' ? o.type : null,
    spanne(o.minutes) ? `${spanne(o.minutes)} min` : null,
    spanne(o.sessions_per_week) ? `${spanne(o.sessions_per_week)}×/Wo` : null,
  ].filter(Boolean)
  return teile.length ? teile.join(' · ') : null
}

/**
 * Die Stufen eines Plans, vom Termin rueckwaerts.
 *
 * `[read]` **Ein Plan ohne Teilphasen ist EINE Stufe** ueber
 * `max_duration_weeks` (Peak Week: 1). **Ohne Dauer keine Vorschau** —
 * kein erfundenes Datum (G-544).
 */
export function planvorschau(
  s: Strategie, termin: string, zielbeginn: string,
): Planvorschau {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(termin)) return { ok: false, grund: 'Ohne Termin lässt sich nichts rückwärts rechnen.' }
  if (termin < zielbeginn) return { ok: false, grund: 'Der Termin liegt vor dem Zielbeginn.' }

  const teil = s.sub_phases.length > 0
    ? stufenplan(s.sub_phases, s.max_duration_weeks, {})
    : s.max_duration_weeks !== null
      ? { namen: [s.label], wochen: [s.max_duration_weeks] }
      : null
  if (!teil?.wochen) {
    return { ok: false, grund: `${s.label} nennt keine Dauer im Katalog — die Stufen lassen sich nicht rechnen.` }
  }

  const summe = teil.wochen.reduce((a, w) => a + w, 0)
  const { ende, verschoben } = planende(zielbeginn, termin, summe)
  const zeilen = ankerplan(ende, teilphasenAusWochen(teil.namen, teil.wochen))
  const stufen = teil.namen.map((name, i): Planstufe => {
    const z = zeilen.find(x => !x.anker && x.name === name)!
    const roh = s.sub_phases.find(p => p.name === name)?.roh ?? {}
    const m = zahlAus(roh.tdee_multiplier)
    return {
      name, wochen: teil.wochen![i]!, beginn: z.datum, wochenVorher: z.wochenVorher,
      defizitPct: m === null ? null : Math.round((1 - m) * 100),
      cardio: cardioText(roh.cardio),
    }
  })
  return { ok: true, stufen, ende, verschoben, summe }
}
