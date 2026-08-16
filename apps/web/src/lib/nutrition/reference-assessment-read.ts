// Lese-I/O fuer die Referenzbewertung eines Tages (C-48 / G-03).
//
// Ruft nutrition.daily_reference_assessment(user, datum) auf. Die
// Funktion laeuft SECURITY INVOKER, die Rechte der Sitzung gelten also
// — kein Service-Client.
//
// WAS HIER NICHT PASSIERT: rechnen. Die Funktion liefert
// `reference_pct`, `reference_status` und `reference_direction` fertig.
// [read] C-48 haelt fest, dass die Prozentwerte in der Datenbank
// entstehen; eine zweite Rechnung in der Oberflaeche waere eine zweite
// Wahrheit — und genau die Stelle, an der aus einem Fehlzaehler eine
// Null wird.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { DiaryWriteError } from './diary-model'

/** Ein Naehrstoff des Tages, bewertet gegen seinen Referenzwert. */
export type ReferenceAssessmentRow = {
  nutrient_code: string
  nutrient_name_de: string
  nutrient_unit: string
  /** Tagessumme. `null` heisst: nichts erfasst. */
  actual_value: number | null
  /** Positionen ohne Wert fuer diesen Naehrstoff. */
  missing_count: number
  value_complete: boolean
  reference_kind: string | null
  reference_direction: string | null
  reference_value_min: number | null
  reference_value_max: number | null
  reference_unit: string | null
  /** `null`, sobald ein Fehlzaehler > 0 ist — NICHT 0. */
  reference_pct: number | null
  reference_status: string
  profile_age_years: number | null
  profile_biological_sex: string | null
  source: string | null
  notes: string | null
}

function asNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null
}

function asCount(value: unknown): number {
  const n = asNumberOrNull(value)
  return n === null ? 0 : Math.trunc(n)
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function parseAssessmentRows(rows: unknown): ReferenceAssessmentRow[] {
  if (!Array.isArray(rows)) return []
  const out: ReferenceAssessmentRow[] = []
  for (const raw of rows) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    const code = asText(r.nutrient_code)
    if (!code) continue
    out.push({
      nutrient_code: code,
      nutrient_name_de: asText(r.nutrient_name_de) || code,
      nutrient_unit: asText(r.nutrient_unit),
      actual_value: asNumberOrNull(r.actual_value),
      missing_count: asCount(r.missing_count),
      value_complete: r.value_complete === true,
      reference_kind: asText(r.reference_kind) || null,
      reference_direction: asText(r.reference_direction) || null,
      reference_value_min: asNumberOrNull(r.reference_value_min),
      reference_value_max: asNumberOrNull(r.reference_value_max),
      reference_unit: asText(r.reference_unit) || null,
      reference_pct: asNumberOrNull(r.reference_pct),
      reference_status: asText(r.reference_status) || 'no_applicable_reference',
      profile_age_years: asNumberOrNull(r.profile_age_years),
      profile_biological_sex: asText(r.profile_biological_sex) || null,
      source: asText(r.source) || null,
      notes: asText(r.notes) || null,
    })
  }
  return out
}

/**
 * Die Bewertung eines Tages fuer die angemeldete Person.
 *
 * Leeres Ergebnis heisst nicht "alles null", sondern "kein Eintrag an
 * diesem Tag" — die Funktion liefert dann gar keine Zeilen.
 */
export async function getReferenceAssessment(
  entryDate: string,
): Promise<ReferenceAssessmentRow[]> {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new DiaryWriteError('NO_SESSION', 'Keine angemeldete Session.')
  }

  // `.schema('nutrition')` ist noetig: PostgREST sucht sonst in
  // `public` und meldet "Could not find the function
  // public.daily_reference_assessment". Dasselbe Muster wie
  // `nutritionRpc()` in @lumeos/shared.
  const { data, error } = await supabase
    .schema('nutrition')
    .rpc('daily_reference_assessment', {
      p_user_id: user.id,
      p_entry_date: entryDate,
    })

  if (error) {
    throw new DiaryWriteError('WRITE_FAILED', error.message)
  }
  return parseAssessmentRows(data)
}
