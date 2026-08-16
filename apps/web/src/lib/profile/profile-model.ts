// Reines Modell fuer das Nutzerprofil (GO-01).
// KEIN I/O — der Datenbankverkehr liegt in profile-write.ts.
//
// Die Pruefbedingungen spiegeln die CHECK-Constraints von
// `public.profiles`. `[read]` Sie stehen hier NICHT, um die Datenbank zu
// ersetzen — die bleibt die letzte Instanz. Sie stehen hier, damit die
// Nutzerin einen brauchbaren Satz liest statt einer
// Postgres-Fehlermeldung, und damit ein Tippfehler nicht erst nach dem
// Netzwerkweg auffaellt.
import { z } from 'zod'

/** `[cmd]` Genau die fuenf Werte des CHECK-Constraints. */
export const ACTIVITY_LEVELS = [
  'sedentary', 'light', 'moderate', 'active', 'very_active',
] as const
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]

/** `[cmd]` Genau die sechs Werte des CHECK-Constraints. */
export const NUTRITION_GOALS = [
  'lose_weight', 'maintain', 'gain_muscle',
  'recomposition', 'performance', 'health',
] as const
export type NutritionGoal = (typeof NUTRITION_GOALS)[number]

/** `[cmd]` Genau die zwei Werte des CHECK-Constraints. */
export const BIOLOGICAL_SEXES = ['male', 'female'] as const
export type BiologicalSex = (typeof BIOLOGICAL_SEXES)[number]

/**
 * Die Aktivitaetsstufen mit ihrem TDEE-Multiplikator.
 *
 * `[read]` Der Faktor steht hier zur ANZEIGE, nicht zur Rechnung — die
 * Vorlage zeigt ihn neben jeder Stufe, und ohne ihn ist „moderate"
 * eine leere Behauptung. Gerechnet wird in GO-04.
 * `[read]` Die Werte stammen aus `docs/specs/Goals/SCORING.md`
 * (`ACTIVITY_MULTIPLIER`).
 */
export const ACTIVITY_LEVEL_INFO: Record<ActivityLevel, {
  label: string
  hint: string
  factor: number
}> = {
  sedentary:   { label: 'Sitzend',       hint: 'Buerojob, kaum Bewegung',            factor: 1.2 },
  light:       { label: 'Leicht aktiv',  hint: '1–3 Einheiten pro Woche',            factor: 1.375 },
  moderate:    { label: 'Massig aktiv',  hint: '3–5 Einheiten pro Woche',            factor: 1.55 },
  active:      { label: 'Aktiv',         hint: '6–7 Einheiten pro Woche',            factor: 1.725 },
  very_active: { label: 'Sehr aktiv',    hint: 'Taeglich hart, koerperliche Arbeit', factor: 1.9 },
}

export const NUTRITION_GOAL_LABEL: Record<NutritionGoal, string> = {
  lose_weight:   'Abnehmen',
  maintain:      'Halten',
  gain_muscle:   'Muskelaufbau',
  recomposition: 'Rekomposition',
  performance:   'Leistung',
  health:        'Gesundheit',
}

export const BIOLOGICAL_SEX_LABEL: Record<BiologicalSex, string> = {
  male: 'maennlich',
  female: 'weiblich',
}

// ---------------------------------------------------------------
// Grenzen — wortgleich mit den CHECK-Constraints
// ---------------------------------------------------------------

export const HEIGHT_MIN = 80
export const HEIGHT_MAX = 260
export const WEIGHT_MIN = 20
export const WEIGHT_MAX = 400
export const BIRTH_DATE_MIN = '1900-01-01'

/** Ein leeres Feld ist kein Fehler — es heisst „nicht angegeben". */
const leerZuNull = (v: unknown) =>
  v === '' || v === undefined ? null : v

const datumOderNull = z.preprocess(
  leerZuNull,
  z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum im Format JJJJ-MM-TT.')
    .nullable(),
)

export const profileWriteSchema = z.object({
  birth_date: z.preprocess(
    leerZuNull,
    z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Geburtsdatum im Format JJJJ-MM-TT.')
      .refine(v => v >= BIRTH_DATE_MIN, `Geburtsdatum fruehestens ${BIRTH_DATE_MIN}.`)
      // `[cmd]` Der Constraint prueft gegen CURRENT_DATE. Hier gegen
      // die Uhr des Servers — die Datenbank entscheidet endgueltig.
      .refine(v => v <= new Date().toISOString().slice(0, 10),
              'Geburtsdatum darf nicht in der Zukunft liegen.')
      .nullable(),
  ),

  biological_sex: z.preprocess(leerZuNull, z.enum(BIOLOGICAL_SEXES).nullable()),

  height_cm: z.preprocess(
    leerZuNull,
    z.coerce.number()
      .min(HEIGHT_MIN, `Groesse mindestens ${HEIGHT_MIN} cm.`)
      .max(HEIGHT_MAX, `Groesse hoechstens ${HEIGHT_MAX} cm.`)
      .nullable(),
  ),

  body_weight_kg: z.preprocess(
    leerZuNull,
    z.coerce.number()
      .min(WEIGHT_MIN, `Gewicht mindestens ${WEIGHT_MIN} kg.`)
      .max(WEIGHT_MAX, `Gewicht hoechstens ${WEIGHT_MAX} kg.`)
      .nullable(),
  ),

  activity_level: z.preprocess(leerZuNull, z.enum(ACTIVITY_LEVELS).nullable()),
  nutrition_goal: z.preprocess(leerZuNull, z.enum(NUTRITION_GOALS).nullable()),

  // Zeitraeume, keine Eigenschaften. `[cmd]` So sind sie angelegt:
  // je ein Start- und ein Enddatum, Ende darf nicht vor Start liegen.
  pregnancy_started_on: datumOderNull,
  pregnancy_ended_on: datumOderNull,
  lactation_started_on: datumOderNull,
  lactation_ended_on: datumOderNull,
})
  .refine(
    d => !d.pregnancy_started_on || !d.pregnancy_ended_on ||
         d.pregnancy_ended_on >= d.pregnancy_started_on,
    { message: 'Ende der Schwangerschaft liegt vor dem Beginn.',
      path: ['pregnancy_ended_on'] },
  )
  .refine(
    d => !d.lactation_started_on || !d.lactation_ended_on ||
         d.lactation_ended_on >= d.lactation_started_on,
    { message: 'Ende der Stillzeit liegt vor dem Beginn.',
      path: ['lactation_ended_on'] },
  )
  // Ein Ende ohne Beginn ist kein Zeitraum. Die Datenbank laesst das
  // durch (ihr CHECK prueft nur die Reihenfolge) — fachlich ist es ein
  // halber Datensatz.
  .refine(
    d => !d.pregnancy_ended_on || !!d.pregnancy_started_on,
    { message: 'Ende ohne Beginn — bitte auch den Beginn angeben.',
      path: ['pregnancy_started_on'] },
  )
  .refine(
    d => !d.lactation_ended_on || !!d.lactation_started_on,
    { message: 'Ende ohne Beginn — bitte auch den Beginn angeben.',
      path: ['lactation_started_on'] },
  )

export type ProfileWrite = z.infer<typeof profileWriteSchema>

/** Eine Zeile aus `public.profiles`, wie die Oberflaeche sie braucht. */
export type StoredProfile = {
  birth_date: string | null
  biological_sex: BiologicalSex | null
  height_cm: number | null
  body_weight_kg: number | null
  activity_level: ActivityLevel | null
  nutrition_goal: NutritionGoal | null
  pregnancy_started_on: string | null
  pregnancy_ended_on: string | null
  lactation_started_on: string | null
  lactation_ended_on: string | null
}

export const EMPTY_PROFILE: StoredProfile = {
  birth_date: null,
  biological_sex: null,
  height_cm: null,
  body_weight_kg: null,
  activity_level: null,
  nutrition_goal: null,
  pregnancy_started_on: null,
  pregnancy_ended_on: null,
  lactation_started_on: null,
  lactation_ended_on: null,
}

function textOderNull(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

function zahlOderNull(v: unknown): number | null {
  if (v === null || v === undefined) return null
  // PostgREST liefert numeric als String, damit keine Praezision
  // verloren geht.
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function ausListe<T extends string>(v: unknown, erlaubt: readonly T[]): T | null {
  const s = textOderNull(v)
  return s !== null && (erlaubt as readonly string[]).includes(s) ? (s as T) : null
}

/** Rohzeile defensiv auf das Modell filtern. */
export function parseStoredProfile(row: unknown): StoredProfile {
  if (!row || typeof row !== 'object') return EMPTY_PROFILE
  const r = row as Record<string, unknown>
  return {
    birth_date: textOderNull(r.birth_date),
    biological_sex: ausListe(r.biological_sex, BIOLOGICAL_SEXES),
    height_cm: zahlOderNull(r.height_cm),
    body_weight_kg: zahlOderNull(r.body_weight_kg),
    activity_level: ausListe(r.activity_level, ACTIVITY_LEVELS),
    nutrition_goal: ausListe(r.nutrition_goal, NUTRITION_GOALS),
    pregnancy_started_on: textOderNull(r.pregnancy_started_on),
    pregnancy_ended_on: textOderNull(r.pregnancy_ended_on),
    lactation_started_on: textOderNull(r.lactation_started_on),
    lactation_ended_on: textOderNull(r.lactation_ended_on),
  }
}

/**
 * Wie viele der sechs TDEE-relevanten Felder sind gesetzt?
 *
 * `[read]` Die Schwangerschafts- und Stillzeitraeume zaehlen NICHT mit:
 * sie treffen die wenigsten zu, und ein Fortschrittsbalken, der bei
 * 6 von 10 stehen bleibt, weil jemand nicht schwanger ist, ist eine
 * schlechte Aussage.
 */
export function profileCompleteness(p: StoredProfile): {
  gesetzt: number
  gesamt: number
  fehlend: Array<keyof StoredProfile>
} {
  const felder: Array<keyof StoredProfile> = [
    'birth_date', 'biological_sex', 'height_cm',
    'body_weight_kg', 'activity_level', 'nutrition_goal',
  ]
  const fehlend = felder.filter(f => p[f] === null)
  return { gesetzt: felder.length - fehlend.length, gesamt: felder.length, fehlend }
}

/**
 * Reichen die Angaben fuer die Referenzbewertung?
 *
 * `[cmd]` `nutrition.daily_reference_assessment` verlangt Geburtsdatum
 * UND biologisches Geschlecht (`profile_complete`); ohne beides liefert
 * sie fuer jeden Naehrstoff `missing_profile`.
 */
export function hasReferenceProfile(p: StoredProfile): boolean {
  return p.birth_date !== null && p.biological_sex !== null
}

/**
 * Reichen die Angaben fuer eine TDEE-Formel?
 *
 * `[read]` Harris-Benedict braucht Gewicht, Groesse, Alter und
 * Geschlecht; der Aktivitaetsfaktor kommt aus `activity_level`.
 * Gerechnet wird hier nichts — das ist GO-04.
 */
export function hasTdeeProfile(p: StoredProfile): boolean {
  return p.birth_date !== null
    && p.biological_sex !== null
    && p.height_cm !== null
    && p.body_weight_kg !== null
    && p.activity_level !== null
}

// ---------------------------------------------------------------
// Fehler
// ---------------------------------------------------------------

export type ProfileWriteErrorCode =
  | 'NO_SESSION'
  | 'INVALID_INPUT'
  | 'DB_UNAVAILABLE'
  | 'WRITE_FAILED'

export class ProfileWriteError extends Error {
  constructor(
    readonly code: ProfileWriteErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'ProfileWriteError'
  }
}

export function httpStatusForProfileError(code: ProfileWriteErrorCode): number {
  switch (code) {
    case 'NO_SESSION': return 401
    case 'INVALID_INPUT': return 400
    case 'DB_UNAVAILABLE': return 503
    default: return 500
  }
}
