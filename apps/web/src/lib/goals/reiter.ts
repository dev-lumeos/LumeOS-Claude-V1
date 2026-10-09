// G-618 + G-636 — der Reiter Goals nach dem Entwurf (`entwurf/Main.dc.html`,
// Dossier 8.4–8.6), rein: kein I/O, kein React.
//
// `[read]` **Steuernd heisst `goal_role = 'controlling'`** (G-617). Die alte
// Rangfolge (`priority` 1–3, `is_primary`) bestimmt hier nichts mehr —
// Messziele sind unbegrenzt (Dossier 8.4).
//
// `[read]` **Laufend ist, was die Kette liefert:** `goals.phase_am`
// (nur Phasen aktiver Ziele, G-613). Der Kopf zaehlt genau diese (G-636).
import { utcTagIso } from '@lumeos/shared/datum'

import { berechnePace, type Pace } from './pace'
import { MESSARTEN, STELLEN, einheitLesbar, type Kategorie } from './messziel'
import type { Herkunft } from '../profile/zielwerte-hindernis'

/** Die Felder, die diese Datei braucht — Teilmenge von `ZielFortschritt`. */
export interface ReiterZiel {
  goal_id: string
  title: string
  goal_type: string | null
  goal_role: 'controlling' | 'measurement' | null
  status: string | null
  measurement_type: string | null
  measurement_rhythm: string | null
  measurement_site: string | null
  target_value: number | null
  target_unit: string | null
  start_value: number | null
  current_value: number | null
  current_source: string | null
  progress_pct: number | null
  progress_status: string | null
  gueltig_ab: string | null
  target_date: string | null
  linked_modules: string[]
}

// ── Steuerung ────────────────────────────────────────────────────

export type SteuerZustand = 'laeuft' | 'kein_ziel' | 'pausiert' | 'ohne_phase'

/**
 * Der Zustand der Steuerungskarte (Entwurf: Zustaende aktiv / pausiert /
 * kein Ziel; dazu G-637).
 *
 * `[read]` **Die Kette entscheidet ueber `zielwerte_am.herkunft`:**
 * `ziel_ohne_laufende_phase` (G-637), `kein_aktives_ziel` /
 * `erhaltung_nicht_berechenbar` (G-622). Fehlt eine Herkunft (aktive
 * Phase ohne gespeichertes Tagesziel), zaehlt das aktive Steuerziel mit
 * laufender Phase aus `phase_am`.
 */
export function steuerZustand(e: {
  herkunft: Herkunft | null
  ruhend: boolean
  steuerziel: ReiterZiel | null
  laufendePhaseZumZiel: boolean
}): SteuerZustand {
  if (e.herkunft === 'ziel_ohne_laufende_phase') return 'ohne_phase'
  if (e.herkunft === 'kein_aktives_ziel' || e.herkunft === 'erhaltung_nicht_berechenbar') {
    return e.ruhend ? 'pausiert' : 'kein_ziel'
  }
  if (e.steuerziel && e.laufendePhaseZumZiel) return 'laeuft'
  if (e.steuerziel) return 'ohne_phase'
  return e.ruhend ? 'pausiert' : 'kein_ziel'
}

/** Das eine aktive steuernde Ziel — `uq_user_goals_one_active_controlling` erlaubt hoechstens eines. */
export const steuerziel = <T extends ReiterZiel>(ziele: T[]): T | null =>
  ziele.find(g => g.goal_role === 'controlling' && g.status === 'active') ?? null

// ── Messziele ────────────────────────────────────────────────────

export const KATEGORIE_NAME: Record<Kategorie, string> = {
  koerper: 'Körper', kraft: 'Kraft', gewohnheit: 'Gewohnheit', eigenes: 'Eigenes',
}
export const KATEGORIE_REIHE: Kategorie[] = ['kraft', 'koerper', 'gewohnheit', 'eigenes']

/**
 * Die Kategorie eines Messziels. `[read]` **Aus der Messart (G-617)**;
 * Ziele aus der Zeit davor tragen keine — dann ihr `goal_type`.
 */
export function kategorieVon(g: Pick<ReiterZiel, 'measurement_type' | 'goal_type'>): Kategorie {
  const a = g.measurement_type as keyof typeof MESSARTEN | null
  if (a && a in MESSARTEN) return MESSARTEN[a].kategorie
  if (g.goal_type === 'body_composition') return 'koerper'
  if (g.goal_type === 'performance') return 'kraft'
  if (g.goal_type === 'lifestyle') return 'gewohnheit'
  return 'eigenes'
}

/** Abgeschlossen: erreicht / verfehlt / beendet (Tom 08.10. 15:57). */
export const ABSCHLUSS: Record<string, string> = {
  achieved: 'erreicht', missed: 'verfehlt', abandoned: 'beendet',
}
export const istAbgeschlossen = (g: Pick<ReiterZiel, 'status'>) => !!g.status && g.status in ABSCHLUSS

export type Lage = 'voraus' | 'im_plan' | 'hinterher'
export const LAGE_TEXT: Record<Lage, string> = { voraus: 'voraus', im_plan: 'im Plan', hinterher: 'hinterher' }
const AUS_PACE: Record<Exclude<Pace, 'unbekannt'>, Lage> = { ahead: 'voraus', 'on-track': 'im_plan', behind: 'hinterher' }

/**
 * Voraus / im Plan / hinterher — aus `berechnePace` (G-554, Ist gegen den
 * gleichmaessigen Verlauf bis heute). Woechentliche Ziele: die Quote der
 * laufenden Woche aus `goal_progress_at` (>= 100 % im Plan).
 * `[read]` **Ohne Grundlage kein Status, sondern ein Grund** (E-72).
 */
export function lageVon(g: ReiterZiel, heute: string): { lage: Lage | null; grund: string | null } {
  if (g.measurement_rhythm === 'weekly') {
    if (g.progress_status !== 'measured' || g.progress_pct === null) return { lage: null, grund: 'diese Woche noch kein Wert' }
    return { lage: g.progress_pct >= 100 ? 'im_plan' : 'hinterher', grund: null }
  }
  const p = berechnePace({
    start_value: g.start_value, current_value: g.current_value, target_value: g.target_value,
    start: g.gueltig_ab, deadline: g.target_date, heute,
  })
  if (p.grund !== null || p.pace === 'unbekannt') return { lage: null, grund: p.grund ?? 'kein Verlauf' }
  return { lage: AUS_PACE[p.pace], grund: null }
}

/**
 * Die Quelle in Worten. `[cmd]` **Jede Quellbezeichnung aus
 * `617_measurement_goal_expansion.sql` hat hier einen Satz** (Test).
 * Unbekanntes: `null` — die Anzeige sagt dann „Quelle unbekannt", nie
 * den Tabellennamen (Dossier 8.4: „Fortschritt · Herkunft entfaellt —
 * zeigt Tabellennamen").
 */
export function quelleLesbar(q: string | null): string | null {
  if (!q) return null
  if (q === 'goals.body_measurements') return 'Waage'
  if (q === 'goals.body_measurements.body_fat_pct') return 'Körpermessung · Körperfett'
  if (q.startsWith('goals.body_circumferences.')) {
    const stelle = q.slice('goals.body_circumferences.'.length)
    return `Umfangmessung · ${STELLEN[stelle] ?? 'Stelle'}`
  }
  if (q === 'training.workout_sets.estimated_1rm') return 'Training · geschätztes 1RM'
  if (q === 'training.workout_sets.weight_kg') return 'Training · Gewicht'
  if (q === 'training.workout_sets.duration_seconds') return 'Training · Dauer'
  if (q === 'training.workout_sets.distance_meters') return 'Training · Strecke'
  if (q === 'training.workout_sets.duration_seconds/distance_meters') return 'Training · Tempo'
  if (q === 'training.workout_sets') return 'Training · bester Satz'
  if (q === 'training.workout_sessions') return 'Trainingseinheiten'
  if (q === 'training.workout_sessions.cardio') return 'Cardio-Einheiten'
  if (q === 'training.workout_sessions.4week_average') return 'Trainingseinheiten · Schnitt 4 Wochen'
  if (q === 'recovery.checkins.sleep_hours') return 'Recovery-Check-in · Schlaf'
  if (q === 'recovery.checkins.4week_average') return 'Recovery-Check-in · Schnitt 4 Wochen'
  if (q === 'goals.user_goals.start_value' || q === 'goals.manual_goal_values') return 'selbst eingetragen'
  return null
}

export type Modul = 'training' | 'nutrition' | 'recovery' | 'supplements' | 'medical' | 'koerper'
export const MODUL_NAME: Record<Modul, string> = {
  training: 'Training', nutrition: 'Ernährung', recovery: 'Recovery',
  supplements: 'Supplements', medical: 'Medical', koerper: 'Körper',
}

/**
 * Die Modul-Pillen einer Kachel: woher der Wert kommt (Messart) plus
 * `linked_modules`. `[read]` **Keine erfundene Verknuepfung** — eine
 * Pille steht nur, wo die Kette eine Quelle hat oder die Spalte sie nennt.
 */
export function moduleVon(g: Pick<ReiterZiel, 'measurement_type' | 'goal_type' | 'linked_modules'>): Modul[] {
  const k = kategorieVon(g)
  const aus: Modul[] = k === 'koerper' ? ['koerper'] : k === 'kraft' ? ['training'] : []
  if (g.measurement_type === 'training_sessions_week' || g.measurement_type === 'cardio_sessions_week') aus.push('training')
  if (g.measurement_type === 'sleep_hours_night') aus.push('recovery')
  for (const m of g.linked_modules) if (m in MODUL_NAME && !aus.includes(m as Modul)) aus.push(m as Modul)
  return aus
}

/** Ein Wert mit lesbarer Einheit („3 pro Woche", nicht `sessions_per_week`). */
export function wertMitEinheit(n: number | null, einheit: string | null): string {
  if (n === null) return '—'
  const zahl = n.toLocaleString('de-DE', { maximumFractionDigits: 2 })
  const e = einheitLesbar(einheit)
  return e ? `${zahl} ${e}` : zahl
}

// ── Diese Woche ──────────────────────────────────────────────────

/** Der Montag der Woche (ISO), in der `tag` liegt. */
export function wochenStart(tag: string): string {
  const d = new Date(`${tag}T12:00:00Z`)
  const wt = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - wt)
  return utcTagIso(d)
}

/** ISO-Kalenderwoche. */
export function kalenderwoche(tag: string): number {
  const d = new Date(`${tag}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7))
  const j = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  return 1 + Math.round(((d.getTime() - j.getTime()) / 86400000 - 3 + ((j.getUTCDay() + 6) % 7)) / 7)
}

/**
 * Die Gewichtsbewegung dieser Woche: juengste Messung der Woche gegen die
 * juengste davor. Soll = Phasentempo (% Koerpergewicht/Woche) × Startgewicht.
 * `null`, wenn eine der beiden Messungen fehlt — dann sagt die Zeile das.
 */
export function gewichtWoche(
  messungen: Array<{ measurement_date: string; weight_kg: number | null }>,
  heute: string,
  tempoPct: number | null,
): { delta: number | null; soll: number | null; grund: string | null } {
  const ab = wochenStart(heute)
  const mit = messungen.filter(m => m.weight_kg !== null && m.measurement_date <= heute)
    .sort((a, b) => a.measurement_date.localeCompare(b.measurement_date))
  const diese = mit.filter(m => m.measurement_date >= ab).at(-1)
  const davor = mit.filter(m => m.measurement_date < ab).at(-1)
  const soll = tempoPct !== null && davor ? Math.round(davor.weight_kg! * tempoPct) / 100 : null
  if (!diese) return { delta: null, soll, grund: 'diese Woche noch nicht gewogen' }
  if (!davor) return { delta: null, soll, grund: 'keine Messung vor dieser Woche' }
  return { delta: Math.round((diese.weight_kg! - davor.weight_kg!) * 10) / 10, soll, grund: null }
}

// ── Module ───────────────────────────────────────────────────────

export type Beitrag = { module: string; contribution_score: number | null; contribution_date: string }

/**
 * Der Schnitt je Modul ueber die uebergebenen Tage (`goal_contributions`,
 * Skala 0–100). `[read]` **Ein Modul ohne Zeile ist „kommt", nicht 0.**
 */
export function modulSchnitt(beitraege: Beitrag[], module: string[]): Array<{ module: string; schnitt: number | null; tage: number }> {
  return module.map(m => {
    const w = beitraege.filter(b => b.module === m && b.contribution_score !== null).map(b => b.contribution_score as number)
    return { module: m, schnitt: w.length ? Math.round(w.reduce((a, b) => a + b, 0) / w.length) : null, tage: w.length }
  })
}

/** Der Engpass: das Modul mit dem niedrigsten Schnitt — nur unter gemessenen. */
export function engpass(schnitte: Array<{ module: string; schnitt: number | null }>) {
  const mit = schnitte.filter(s => s.schnitt !== null)
  return mit.length ? mit.reduce((a, b) => (b.schnitt! < a.schnitt! ? b : a)) : null
}
