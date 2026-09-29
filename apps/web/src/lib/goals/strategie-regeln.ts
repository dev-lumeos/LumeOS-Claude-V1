// Die Regeln des Strategiekatalogs — **ohne Server-I/O** (A-30).
//
// `[cmd]` **WARUM DIESE DATEI GETRENNT IST.** `strategie-read.ts`
// importiert `createSessionClient`, das `next/headers` braucht. Ein
// **Wert**-Import von dort in eine `'use client'`-Datei zieht die
// ganze Datei ins Browserbuendel und beantwortet die Seite mit
// **HTTP 500** — dieselbe Klasse Fehler wie in G-74 und G-412.
//
// `[read]` **Hier stehen deshalb die Konstanten und die reinen
// Pruefungen, die BEIDE Seiten benutzen duerfen.** Typen kommen per
// `import type` — das ist folgenlos.

import type { Strategie, Anforderungen } from './strategie-read'

/**
 * Die fuenf Reiter.
 *
 * `[cmd]` **Aus dem Altrepo gelesen**, nicht erfunden:
 * `referenz/lumeos-2026/src/modules/goals/components/nutrition/GoalSelector.tsx:19-23`
 * und die Zuordnung aus `getGoalsForTab` (`:33-42`).
 *
 * `[read]` **Die Falle:** der Reiter heisst `contest`, die Kategorie
 * in der Datenbank heisst `contest_prep` — **Reiterwert und
 * Kategoriewert sind NICHT dasselbe.** `[cmd]` **Und `hybrid`
 * sammelt ZWEI Kategorien** (`hybrid` und `recovery`, `:37`) —
 * deshalb traegt jeder Reiter eine Liste, kein Einzelwort.
 *
 * `[cmd]` **Gemessen 2026-09-29: 6 Kategorien, 17 Zeilen** —
 * `contest_prep` 2, `expert` 3, `fat_loss` 5, `hybrid` 2,
 * `muscle_gain` 4, `recovery` 1. **Jede Kategorie liegt unter genau
 * einem Reiter**; ohne `recovery` bei `hybrid` waere `reverse_diet`
 * unerreichbar.
 */
export const REITER = [
  { id: 'fat_loss', name: 'Fat Loss', kategorien: ['fat_loss'] },
  { id: 'muscle_gain', name: 'Aufbau', kategorien: ['muscle_gain'] },
  { id: 'hybrid', name: 'Hybrid', kategorien: ['hybrid', 'recovery'] },
  { id: 'contest', name: 'Contest', kategorien: ['contest_prep'] },
  { id: 'expert', name: 'Expert', kategorien: ['expert'] },
] as const

export type Reiter = typeof REITER[number]['id']

/** Alle Kategorien, die ueber die Reiter erreichbar sind. */
export const ERREICHBARE_KATEGORIEN: string[] =
  REITER.flatMap(r => [...r.kategorien])

/**
 * Die Strategien eines Reiters — nur `advanced`.
 *
 * `[cmd]` **`getGoalsForTab` filtert jeden Reiter auf
 * `tier === 'advanced'`** (`GoalSelector.tsx:35-39`). `[read]` **Die
 * drei `simple` stehen ueber dem Schalter und wuerden sonst doppelt
 * erscheinen.**
 */
export function strategienFuerReiter(
  alle: Strategie[], reiter: Reiter,
): Strategie[] {
  const def = REITER.find(r => r.id === reiter)
  if (!def) return []
  const k: readonly string[] = def.kategorien
  return alle.filter(s => s.tier === 'advanced' && k.includes(s.category))
}

/** Die drei einfachen Strategien, die ohne Schalter sichtbar sind. */
export function einfacheStrategien(alle: Strategie[]): Strategie[] {
  return alle.filter(s => s.tier === 'simple')
}

/**
 * Das Profil, gegen das die Sperre prueft.
 *
 * `[read]` **Nur was `isGoalAvailable` im Altrepo abfragt** — mehr
 * Felder waeren eine Zusage, die niemand einloest.
 */
export type Profil = {
  experience?: string | null
  bodyFat?: number | null
  hasCoach?: boolean | null
}

export type Verfuegbarkeit = { frei: true } | { frei: false; grund: string }

/**
 * Ob eine Strategie waehlbar ist — A4: **Sperre, nicht Text.**
 *
 * `[cmd]` **Eins zu eins aus dem Altrepo**, `definitions.ts:285-299`
 * — dieselben drei Regeln, dieselbe Reihenfolge.
 *
 * `[read]` **Die Reihenfolge ist die Aussage:** wer als Anfaenger
 * ohne Coach vor `contest_prep` steht, liest den Erfahrungsgrund,
 * nicht den Coachgrund. **Ein Satz am Knopf, nicht drei.**
 *
 * `[read]` **`min_experience` sperrt nur `beginner`** — das ist die
 * Regel des Altrepos, und sie ist die vorsichtigere: wer keine
 * Erfahrung hinterlegt hat, wird nicht ausgesperrt.
 */
export function istWaehlbar(
  anf: Anforderungen, profil: Profil,
): Verfuegbarkeit {
  if (anf.min_experience === 'advanced' && profil.experience === 'beginner') {
    return { frei: false, grund: 'Erfordert fortgeschrittene Trainingserfahrung' }
  }
  if (anf.coach_approval && !profil.hasCoach) {
    return { frei: false, grund: 'Erfordert Coach-Betreuung' }
  }
  if (anf.min_body_fat !== undefined
      && typeof profil.bodyFat === 'number'
      && profil.bodyFat < anf.min_body_fat) {
    return {
      frei: false,
      grund: `Koerperfett zu niedrig (mindestens ${anf.min_body_fat} %)`,
    }
  }
  return { frei: true }
}

/**
 * Die vier Schalterfelder als Marken.
 *
 * `[cmd]` **`GoalSelector.tsx:181-186`** — dieselben vier, dieselbe
 * Reihenfolge.
 */
export function merkmale(s: Strategie): string[] {
  const m: string[] = []
  if (s.macro_cycling) m.push('Cycling')
  if (s.refeed_schedule) m.push('Refeed')
  if (s.auto_adjust) m.push('Auto')
  if (s.peak_week) m.push('Peak')
  return m
}

/**
 * Der TDEE-Faktor als Prozentsatz mit Vorzeichen.
 *
 * `[cmd]` **Die Spalte fuehrt einen Faktor** (`-0.250`), **die Karte
 * des Altrepos zeigt Prozent** (`:212`, `* 100`).
 *
 * `[read]` **`null` gibt `null`, nicht `0 %`** — gemessen: eine der
 * 17 Zeilen traegt keinen Faktor (`expert_bb_annual`, dieselbe Zeile
 * ohne `protein_per_kg`), und `0 %` waere dort eine Aussage, die
 * niemand getroffen hat (A2).
 */
export function tdeeProzent(s: Strategie): string | null {
  if (s.tdee_modifier === null) return null
  const p = Math.round(s.tdee_modifier * 100)
  return `${p > 0 ? '+' : ''}${p} %`
}
