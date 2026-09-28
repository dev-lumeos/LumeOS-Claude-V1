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

// ── G-519/A3: die Uebergaenge, als Regel ─────────────────────────
//
// `[read]` **Die Regel liegt hier, nicht in der Ansicht.** Diese
// Datei hat kein Server-I/O und ueberlebt, waehrend die Ansicht
// wechselt — **die Ansicht ruft sie spaeter (A5).**
//
// `[cmd]` **Quelle: `docs/specs/Goals/PHASE_MODELS.md`, gemessen am
// 2026-09-28 gegen die Datei selbst** (nicht aus einem Bericht
// abgeschrieben). **Sechs Phasen tragen `transitions_to`:**
//
//     :53   fat_loss      -> reverse_diet, maintenance, lean_bulk
//     :73   lean_bulk     -> mini_cut, maintenance, contest_prep
//     :87   maintenance   -> fat_loss, lean_bulk, recomp, contest_prep
//     :110  reverse_diet  -> maintenance, lean_bulk, fat_loss
//     :143  contest_prep  -> reverse_diet
//     :163  recomp        -> lean_bulk, fat_loss
//
// `[cmd]` **Drei Arten haben KEIN `transitions_to` in der Spec:**
// `mini_cut`, `peak_week`, `expert_bb_annual`.

/**
 * Wohin eine Phase laut Spec wechseln darf.
 *
 * `[read]` **Leeres Array heisst *nicht entschieden*, nicht *keine
 * Folgephase*.** Die Unterscheidung traegt `UEBERGANG_UNBEKANNT`.
 */
export const UEBERGAENGE: Readonly<Record<Phasenart, readonly Phasenart[]>> = {
  // [cmd] PHASE_MODELS.md:53
  fat_loss: ['reverse_diet', 'maintenance', 'lean_bulk'],
  // [cmd] PHASE_MODELS.md:73
  lean_bulk: ['mini_cut', 'maintenance', 'contest_prep'],
  // [cmd] PHASE_MODELS.md:87
  maintenance: ['fat_loss', 'lean_bulk', 'recomp', 'contest_prep'],
  // [cmd] PHASE_MODELS.md:110
  reverse_diet: ['maintenance', 'lean_bulk', 'fat_loss'],
  // [cmd] PHASE_MODELS.md:143
  contest_prep: ['reverse_diet'],
  // [cmd] PHASE_MODELS.md:163
  recomp: ['lean_bulk', 'fat_loss'],

  // [annahme] G-528: mini_cut hat in der Spec KEIN transitions_to.
  // Abgeleitet, nicht belegt: zurueck zu lean_bulk oder maintenance
  // — NICHT reverse_diet. Vier Wochen unterdruecken nichts, was
  // hochgefahren werden muesste.
  mini_cut: ['lean_bulk', 'maintenance'],

  // [cmd] Kein transitions_to in der Spec, und keine belegbare
  // Ableitung. Die Peak Week endet laut Jahresplan
  // (PHASE_MODELS.md:172) in reverse_diet — das gilt aber fuer den
  // ZYKLUS, nicht fuer die Phase allein. Deshalb leer.
  peak_week: [],

  // [cmd] Eine Vorlage, die Phasen ERZEUGT (PHASE_MODELS.md:167-173)
  // — sie wechselt nicht, sie laeuft ab. Deshalb leer.
  expert_bb_annual: [],
} as const

/**
 * Arten, deren Folgephasen die Spec NICHT nennt.
 *
 * `[read]` **Damit laesst sich *,,leer, weil nicht entschieden"* von
 * *,,leer, weil es keine gibt"* unterscheiden** — ohne das sieht ein
 * Aufrufer nur ein leeres Array und weiss nicht, ob er eine Luecke
 * oder ein Ende vor sich hat.
 */
export const UEBERGANG_UNBEKANNT: ReadonlySet<Phasenart> = new Set<Phasenart>([
  'peak_week', 'expert_bb_annual',
])

/**
 * Welche Arten eine laufende Phase als naechste haben darf.
 *
 * `[read]` **Rein — keine Datenbank, kein Zustand.** Deshalb aus der
 * Ansicht wie aus einer Probe heraus aufrufbar.
 *
 * @param laufend Die Art der laufenden Phase, oder `null`.
 * @returns Bei `null` alle neun (ohne Phase ist jeder Anfang
 *   erlaubt — die Datenbank sperrt nur, solange eine LAEUFT).
 */
export function erlaubteFolgephasen(
  laufend: Phasenart | null,
): readonly Phasenart[] {
  if (laufend === null) return PHASENARTEN.map(p => p.id)
  return UEBERGAENGE[laufend] ?? []
}

/** Ob ein Wechsel von `laufend` nach `ziel` der Spec entspricht. */
export function uebergangErlaubt(
  laufend: Phasenart | null, ziel: Phasenart,
): boolean {
  return erlaubteFolgephasen(laufend).includes(ziel)
}

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
