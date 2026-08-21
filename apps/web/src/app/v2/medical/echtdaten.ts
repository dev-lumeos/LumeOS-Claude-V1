import type { BefundWert, KatalogTreffer } from '../../../lib/medical/lesen'
import type { MarkerReihe } from '../../../lib/medical/reihe'
import type { Gesamtwert } from '../../../lib/medical/systemscore'

export type MedikationEcht = {
  id: string
  name: string
  drug_class: string[]
  cyp_profile: string[]
  dose_amount: number | null
  dose_unit: string | null
  doses_per_day: number | null
  route: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  indication: string | null
  notes: string | null
  measurement_source: string | null
  source_detail: string | null
}

export type LabMarkerEffekt = {
  id: string
  substance_id: string
  substance_name: string
  supplement_name: string | null
  loinc_code: string | null
  lab_marker_id: string | null
  effect_type: string
  direction: string | null
  direction_enum: string | null
  mechanism: string | null
  clinical_consequence: string | null
  evidence: string | null
  monitoring_link: string | null
  source: string | null
}

export type EchteDaten = {
  reihen: MarkerReihe[]
  befunde: number
  werte: BefundWert[]
  katalogStart: KatalogTreffer[]
  katalogGesamt: number
  medikationen: MedikationEcht[]
  labEffekte: LabMarkerEffekt[]
  /**
   * Die fünf System-Scores und der Gesamtwert (G-135).
   *
   * `null`, wenn die Systemzuordnung nicht geladen werden konnte —
   * dann bleibt die Karte Attrappe, statt eine halbe Zahl zu zeigen.
   */
  scores: Gesamtwert | null
  ladefehler: string | null
}
