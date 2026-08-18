// Serverseitiger Lesepfad für Medical.
//
// MUSTER: `packages/shared/src/nutrition/nutrition-db.ts` — Session-Client
// auf ein Schema gerichtet, ausschliesslich serverseitig. `[read]` Der
// Auftrag G-46: *„Sieh dort nach, wie es gelöst ist, bevor du eine
// zweite Lösung baust."* Genau dasselbe Muster, nur `medical` statt
// `nutrition`.
//
// **WARUM `rpc()` UND TABELLE GEMISCHT:**
// `[cmd]` `medical.lab_result_values_read` (`140_medical_schema.sql:201`)
// löst den Bereichsvorrang bereits in SQL und liefert `reference_source`
// mit — die wird benutzt, nicht nachgebaut. Sie liefert aber weder
// `entry_confidence` noch `needs_verification`, und die braucht die
// Anzeige für die drei Zuordnungszustände. **Das Schema darf dieser
// Auftrag nicht ändern** („Kein Schema ändern, keine Migration"), also
// kommen die zwei Felder aus einem zweiten, schmalen Lesezugriff auf
// die Rohtabelle. Die RLS-Regel dort ist dieselbe
// (`auth.uid() = user_id`), es entsteht kein zweiter Rechteweg.
//
// `[cmd]` Der Katalog wird NICHT geladen, sondern durchsucht: 11.676
// Zeilen. Gemessen am 2026-08-18 gegen die laufende Instanz:
//   leere Suche, nach Rang         0,05 ms
//   häufiger Begriff („glucose")   1,9 ms
//   seltener Begriff („eisen")    23,2 ms  (Seq Scan, vier Spalten)
// Der Rangindex `biomarker_catalog_rank_idx` trägt die ersten beiden.

import { createSessionClient } from '@lumeos/shared/session'

/** PostgREST-Client, auf `medical` gerichtet. */
function medicalDb() {
  return createSessionClient().schema('medical')
}

export class MedicalLeseFehler extends Error {
  constructor(public code: 'NO_SESSION' | 'DB_UNAVAILABLE' | 'READ_FAILED', message: string) {
    super(message)
    this.name = 'MedicalLeseFehler'
  }
}

/**
 * Die angemeldete Nutzerin.
 *
 * Dasselbe Muster wie `requireSession` in
 * `apps/web/src/lib/profile/profile-write.ts:49` — dort dateilokal,
 * hier ebenso. Ohne Session kommt keine Zeile: die RLS-Regel
 * (`auth.uid() = user_id`) ist die Sperre, dieser Aufruf die Absicht.
 */
export async function angemeldeteNutzerin(): Promise<string> {
  const { data: { user } } = await createSessionClient().auth.getUser()
  if (!user) throw new MedicalLeseFehler('NO_SESSION', 'Keine angemeldete Session.')
  return user.id
}

/** Eine Zeile, wie `medical.lab_result_values_read` sie liefert. */
export type BefundZeile = {
  id: string
  report_id: string
  report_date: string
  report_time: string | null
  lab_name: string | null
  loinc_code: string | null
  marker_name: string
  unit: string
  value_numeric: number | null
  value_text: string | null
  value_operator: string
  reference_low: number | null
  reference_high: number | null
  reference_text: string | null
  reference_unit: string | null
  reference_source: 'lab_report' | 'catalog_fallback' | 'none'
  reference_range_id: string | null
  source: string
  frozen_at: string
}

/** Ein Kandidat aus `match_candidates` — die Datenbank fuehrt sie als JSONB. */
export type MatchKandidat = {
  loinc_code: string
  display_name: string
  confidence: number
  system?: string
}

/**
 * Was die Anzeige zusätzlich braucht und die Funktion nicht liefert.
 *
 * `[cmd]` `match_status` und `match_candidates` stammen aus
 * `142_laborimport_matching.sql`. Sie sind die belastbare Auskunft
 * über die drei Zuordnungszustände — die Pruefbedingung
 * `lab_result_values_match_integrity_check` haelt `match_status` und
 * `loinc_code` zusammen. Bei der mehrdeutigen Glukose stehen drei
 * Kandidaten mit Konfidenz darin (2345-7 · 0,68 / 2339-0 · 0,68 /
 * 5792-7 · 0,58).
 */
export type ZeilenZusatz = {
  entry_confidence: number
  needs_verification: boolean
  match_status: string | null
  match_candidates: MatchKandidat[]
  raw_marker_name: string | null
}

export type BefundWert = BefundZeile & Partial<ZeilenZusatz> & {
  /** Das Optimalband des Katalogs — nur, wenn es eines gibt. */
  optimal_text?: string | null
  optimal_low?: number | null
  optimal_high?: number | null
  optimal_source?: string | null
}

export type KatalogTreffer = {
  loinc_code: string
  display_name: string | null
  short_name: string | null
  consumer_name: string | null
  german_long_name: string | null
  example_units: string | null
  loinc_class: string | null
  common_test_rank: number
}

/**
 * Die Befundwerte der angemeldeten Nutzerin, mit Bereichen.
 *
 * `[cmd]` Die Funktion sortiert bereits (Befunddatum absteigend); die
 * Reihenfolge wird hier nicht angetastet.
 */
export async function ladeBefundwerte(userId: string): Promise<BefundWert[]> {
  const db = medicalDb()

  const { data, error } = await db.rpc('lab_result_values_read', {
    p_user_id: userId,
    p_report_id: null,
  })
  if (error) throw new Error(`lab_result_values_read: ${error.message}`)

  const zeilen = (data ?? []) as BefundZeile[]
  if (zeilen.length === 0) return []

  // Zusatzfelder je Wert-Id. Ein Zugriff, kein N+1.
  const { data: zusatz } = await db
    .from('lab_result_values')
    .select('id, entry_confidence, needs_verification, match_status, '
      + 'match_candidates, raw_marker_name')
    .in('id', zeilen.map(z => z.id))

  const nachId = new Map<string, ZeilenZusatz>()
  // `[cmd]` Ueber `unknown`: supabase-js leitet aus der mehrzeiligen
  // Spaltenliste keinen Zeilentyp ab und meldet `GenericStringError[]`.
  for (const z of (zusatz ?? []) as unknown as Array<{ id: string } & ZeilenZusatz>) {
    nachId.set(z.id, {
      entry_confidence: Number(z.entry_confidence),
      needs_verification: z.needs_verification,
      match_status: z.match_status ?? null,
      match_candidates: Array.isArray(z.match_candidates) ? z.match_candidates : [],
      raw_marker_name: z.raw_marker_name ?? null,
    })
  }

  // Optimalbänder für die zugeordneten Codes — ein Zugriff für alle.
  //
  // `[cmd]` `lab_result_values_read` holt ausdrücklich nur
  // `range_type = 'lab'` (`140_medical_schema.sql:264`). Das Optimalband
  // ist der zweite Bereich des Doppelbereichs und muss separat kommen.
  // `[cmd]` OHNE Spread ueber ein Set: das tsconfig-Ziel dieses Pakets
  // laesst das Iterieren nicht zu (TS2802) — dieselbe Stelle, an der
  // schon `v2-attrappen.test.ts` auf `.match()` ausweicht.
  const codes = Array.from(
    new Set(zeilen.map(z => z.loinc_code).filter((c): c is string => !!c)),
  )
  const optimalNachCode = codes.length > 0 ? await ladeOptimalbaender(codes) : new Map()

  return zeilen.map(z => {
    const opt = z.loinc_code ? optimalNachCode.get(z.loinc_code) : undefined
    return {
      ...z,
      ...(nachId.get(z.id) ?? {}),
      optimal_text: opt?.value_text ?? null,
      optimal_low: opt?.min_value ?? null,
      optimal_high: opt?.max_value ?? null,
      optimal_source: opt?.source ?? null,
    }
  })
}

type Optimalband = {
  loinc_code: string
  value_text: string | null
  min_value: number | null
  max_value: number | null
  source: string
  sex: string
}

/**
 * Das Optimalband je Code.
 *
 * `[cmd]` Gefiltert wie die Lesefunktion es für den Laborbereich tut:
 * `is_active`, und `decision_status <> 'do_not_import_without_source'`.
 * **Diese Filterung entscheidet, was ankommt:** von 464 Bereichszeilen
 * tragen 54 Zahlen — und genau die stehen auf
 * `do_not_import_without_source`. Übrig bleiben 410 Zeilen, die nur
 * `value_text` führen. Der Doppelbereich ist deshalb heute Text, keine
 * Zahl; im Bericht steht, was das für die Anzeige heisst.
 *
 * `[annahme]` Ohne Geschlechtsangabe im Profil greift `all`; die
 * geschlechtsabhängige Auswahl macht die Lesefunktion für den
 * Laborbereich selbst, hier wird sie nachgezogen.
 */
async function ladeOptimalbaender(codes: string[]): Promise<Map<string, Optimalband>> {
  const { data, error } = await medicalDb()
    .from('biomarker_reference_ranges')
    .select('loinc_code, value_text, min_value, max_value, source, sex')
    .in('loinc_code', codes)
    .eq('range_type', 'optimal')
    .eq('is_active', true)
    .neq('decision_status', 'do_not_import_without_source')

  if (error) return new Map()

  const karte = new Map<string, Optimalband>()
  for (const z of (data ?? []) as Optimalband[]) {
    // Geschlechtsspezifisch schlägt `all` — dieselbe Rangfolge wie in
    // `lab_result_values_read` (`CASE br.sex WHEN 'all' THEN 1 ELSE 0`).
    const vorhanden = karte.get(z.loinc_code)
    if (!vorhanden || (vorhanden.sex === 'all' && z.sex !== 'all')) {
      karte.set(z.loinc_code, z)
    }
  }
  return karte
}

/**
 * Katalogsuche — sucht, lädt nicht.
 *
 * `[cmd]` Ohne Begriff kommen die häufigsten Marker nach
 * `common_test_rank` (0,05 ms über den Rangindex). Mit Begriff wird
 * über vier Namensspalten gesucht.
 */
export async function sucheKatalog(begriff: string, limit = 25): Promise<KatalogTreffer[]> {
  const spalten = 'loinc_code, display_name, short_name, consumer_name, '
    + 'german_long_name, example_units, loinc_class, common_test_rank'

  let anfrage = medicalDb()
    .from('biomarker_catalog')
    .select(spalten)
    .order('common_test_rank', { ascending: true })
    .limit(limit)

  const q = begriff.trim()
  if (q) {
    const muster = `%${q.replace(/[%_,()]/g, ' ')}%`
    anfrage = anfrage.or(
      `display_name.ilike.${muster},short_name.ilike.${muster},`
      + `consumer_name.ilike.${muster},german_long_name.ilike.${muster}`,
    )
  }

  const { data, error } = await anfrage
  if (error) throw new Error(`biomarker_catalog: ${error.message}`)
  return (data ?? []) as unknown as KatalogTreffer[]
}

/** Wie viele Marker der Katalog führt — für die Beschriftung der Suche. */
export async function zaehleKatalog(): Promise<number> {
  const { count, error } = await medicalDb()
    .from('biomarker_catalog')
    .select('loinc_code', { count: 'exact', head: true })
  if (error) return 0
  return count ?? 0
}
