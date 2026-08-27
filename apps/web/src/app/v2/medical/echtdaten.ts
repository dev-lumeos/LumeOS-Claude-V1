import type { BefundWert, KatalogTreffer } from '../../../lib/medical/lesen'
import type { MarkerReihe } from '../../../lib/medical/reihe'
import type { Gesamtwert } from '../../../lib/medical/systemscore'

export type MedikationEcht = {
  id: string
  name: string
  /**
   * Die Bindung an den Wirkstoffkatalog — G-211.
   *
   * `[read]` **`null` ist ein gueltiger Zustand, nicht ein fehlender
   * Wert.** Der Katalog kennt keine deutschen Handelsnamen (`DE` bei
   * 0 von 448 Produkten, G-210); wer Concor nimmt, traegt Freitext
   * ein.
   *
   * `[cmd]` **Und `null` hat eine Folge:** ohne Zuordnung bleiben
   * `drug_class` und `cyp_profile` leer, und **30 der 64 Regeln lesen
   * genau diese beiden Felder** (gemessen 2026-08-27). Der Eintrag
   * wird dann von keiner Regel geprueft.
   */
  active_substance_id: string | null
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

import type { SymptomStand } from '../../../lib/medical/symptome'
import type { WirkstoffZeile } from '../../../lib/medical/wirkstoff-read'

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
  /**
   * Symptome und ihre Biomarker-Zuordnung — G-207.
   *
   * `[cmd]` **Aus `medical.symptoms` (34) und
   * `medical.symptom_biomarker_map` (102)**, nicht mehr aus den
   * Konstanten `SYMPTOMS` (4) und `SYMPTOM_BIOMARKER_MAP` (7/28).
   *
   * `[read]` **`befunde` traegt, was beim Lesen aufgefallen ist** —
   * eine Zuordnung auf einen unbekannten Marker verschwindet nicht
   * mehr still, wie es die Konstante tat.
   */
  symptome: SymptomStand
  /**
   * Der Wirkstoffkatalog — G-208.
   *
   * `[cmd]` **498 Zeilen aus `medical.medication_active_substances`**,
   * mit `kurz_was_de` und `wofuer_de` aus `medication_user_texts`
   * (gemessen 2026-08-27, beide bei allen 498 gefuellt).
   *
   * `[read]` **Nur die Liste, nicht die Texte.** 83 kB gegen 1.145 kB
   * Nutzertexte plus 700 kB FAQ — das Detail laedt die aufgeklappte
   * Zeile ueber `/api/medical/wirkstoff` nach.
   *
   * `[read]` **Nicht nutzergebunden.** Das ist ein Nachschlagewerk;
   * die eigene Medikation steht in `medikationen`.
   */
  wirkstoffe: WirkstoffZeile[]
  ladefehler: string | null
}
