// Die Regeln fuer einen Phasenstart — G-513.
//
// **DIESE DATEI HAT KEIN SERVER-I/O.** `[read]` Sie liegt neben
// `phase-write.ts` aus demselben Grund wie `ziel-regeln.ts` neben
// `schreiben.ts`: der Schreibweg zieht `next/headers`, und wer die
// Regeln aus einer `'use client'`-Datei als WERT importiert, zoege
// den Server-Baum ins Browserbuendel (die Lehre aus G-412).
//
// `[read]` **Die Grenzen hier sind die der TABELLE, nicht eigene.**
// Jede Zeile unten hat ihren Beleg im Schema.

/**
 * Die neun Phasenarten.
 *
 * `[cmd]` **Gemessen 2026-09-26 gegen `pg_constraint`:**
 * `goal_phases_phase_type_check` erlaubt genau diese neun.
 *
 * `[read]` **Nicht aus dem Mockup abgeschrieben** — das kennt nur
 * sieben (`GOAL_PHASES` in `module-goals-pro.jsx:5-68`) und nennt
 * `mini_cut` als Folgephase, ohne sie zu definieren (G-515, W2).
 *
 * `[read]` **Die Bezeichner sind Anzeigetexte, keine Daten** — der
 * CHECK kennt nur die Schluessel.
 */
export const PHASENARTEN = [
  { id: 'fat_loss', name: 'Fat loss', zweck: 'Fett verlieren, Kraft halten' },
  { id: 'lean_bulk', name: 'Lean bulk', zweck: 'Masse aufbauen, Fett begrenzen' },
  { id: 'maintenance', name: 'Maintenance', zweck: 'Gewicht halten' },
  { id: 'recomp', name: 'Recomp', zweck: 'Fett runter, Muskel rauf' },
  { id: 'contest_prep', name: 'Contest prep', zweck: 'Auf einen Termin hin' },
  { id: 'reverse_diet', name: 'Reverse diet', zweck: 'Nach einer Diaet hoch' },
  { id: 'expert_bb_annual', name: 'Expert BB annual', zweck: 'Zwoelfmonatszyklus' },
  { id: 'mini_cut', name: 'Mini cut', zweck: 'Kurz und scharf' },
  { id: 'peak_week', name: 'Peak week', zweck: 'Die Woche vor dem Termin' },
] as const

export type Phasenart = typeof PHASENARTEN[number]['id']

/** Was ein Start braucht. `goal_id` und die zwei Zusatzfelder sind frei. */
export type Phasenstart = {
  phase_type: Phasenart
  /** ISO-Tag. Die Funktion setzt sonst CURRENT_DATE. */
  gueltig_ab: string
  goal_id?: string | null
  projected_end_date?: string | null
  variant?: string | null
}

export type Feldfehler = { feld: string; text: string }

/** Ein ISO-Tag, wie ihn `<input type="date">` liefert. */
const ISO_TAG = /^\d{4}-\d{2}-\d{2}$/

/**
 * Prueft einen Phasenstart gegen die Tabelle.
 *
 * `[read]` **Drei Pruefungen, jede mit einem CHECK dahinter** —
 * keine erfundene vierte.
 */
export function pruefePhasenstart(e: Phasenstart): Feldfehler[] {
  const f: Feldfehler[] = []

  // `[cmd]` `goal_phases_phase_type_check`
  if (!PHASENARTEN.some(p => p.id === e.phase_type)) {
    f.push({ feld: 'phase_type', text: 'Diese Phasenart gibt es nicht.' })
  }

  // `[cmd]` `gueltig_ab DATE NOT NULL`
  if (!ISO_TAG.test(e.gueltig_ab ?? '')) {
    f.push({ feld: 'gueltig_ab', text: 'Ein Startdatum ist erforderlich.' })
  }

  // `[cmd]` CHECK: `projected_end_date IS NULL OR >= gueltig_ab`
  if (e.projected_end_date) {
    if (!ISO_TAG.test(e.projected_end_date)) {
      f.push({ feld: 'projected_end_date', text: 'Kein gueltiges Datum.' })
    } else if (ISO_TAG.test(e.gueltig_ab ?? '')
      && e.projected_end_date < e.gueltig_ab) {
      f.push({
        feld: 'projected_end_date',
        text: 'Das geplante Ende liegt vor dem Beginn.',
      })
    }
  }

  return f
}

/** `lean_bulk` -> `Lean bulk`. Faellt auf den Schluessel zurueck. */
export function phasenName(id: string | null | undefined): string {
  if (!id) return '—'
  return PHASENARTEN.find(p => p.id === id)?.name ?? id.replace(/_/g, ' ')
}
