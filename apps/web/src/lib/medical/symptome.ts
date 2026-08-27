/**
 * Symptome und ihre Biomarker-Zuordnung — G-207.
 *
 * ══ WARUM DIESE DATEI SERVERFREI IST ═══════════════════════════════
 *
 * `[read]` **Damit die Integritaetsregel ohne Browser pruefbar ist.**
 * Dasselbe Muster wie `substanz-luecken.ts` (C-252) und
 * `dosis-zustand.ts` (G-199): die Rechnung hier, das I/O daneben.
 *
 * ══ DIE REGEL, UM DIE ES GEHT ══════════════════════════════════════
 *
 * **Auftrag G-207:** *„Eine Zuordnung auf einen Biomarker, den der
 * Katalog nicht kennt, ist beim Umzug in die Datenbank ein
 * Fremdschluesselbruch — und in der Konstante faellt sie nie auf."*
 *
 * `[cmd]` **Genau das war der Zustand.** `tab-tracking.tsx:114` loeste
 * die Namen gegen die Konstante `BIOMARKERS` auf und warf, was nicht
 * passte, mit `.filter(Boolean)` weg. **Eine falsche Zuordnung sah
 * aus wie „keine Zuordnung".**
 *
 * `[read]` **Hier wird sie stattdessen benannt.** Eine Zuordnung ohne
 * bekannten Marker ist ein Befund, kein Leerraum.
 *
 * ══ WAS GEMESSEN WURDE ═════════════════════════════════════════════
 *
 * `[cmd]` **2026-08-27, gegen die echten Tabellen:**
 *
 *     medical.symptoms                 34 Zeilen
 *     medical.symptom_biomarker_map   102 Zeilen
 *     davon Symptom nicht im Katalog   49
 *     davon Marker nicht im Katalog     2   (lab_bnp, lab_crp)
 *     davon ohne LOINC-Code             6
 *
 * `[read]` **Die 49 sind kein Fehler dieser Datei** — die Tabelle
 * traegt sie selbst als `symptom_match_status = 'symptom_not_in_-
 * catalog'`. **Sie werden gezeigt, nicht verschwiegen.**
 */

/** Eine Zeile aus `medical.symptoms`. */
export type Symptom = {
  symptom_id: string
  slug: string
  name: string
}

/** Eine Zeile aus `medical.symptom_biomarker_map`, aufgeloest. */
export type Zuordnung = {
  symptom_id: string
  marker_id: string
  /** Der Anzeigename aus `lab_marker_catalog` — `null`, wenn unbekannt. */
  analyte: string | null
  kategorie: string | null
  loinc: string | null
  /**
   * Wie eng der Zusammenhang ist: `HIGH` · `MODERATE` · `LOW`.
   *
   * `[cmd]` Gemessen: 10 · 48 · 44.
   */
  spezifitaet: string | null
  /** Warum — auf Deutsch, bei allen 102 gefuellt. */
  grund: string | null
  art: string | null
  /**
   * **Der Befund, der nicht verschwinden darf.**
   *
   * `[read]` `true`, wenn der Marker im Katalog fehlt. Die Anzeige
   * zeigt die Zeile trotzdem — mit Hinweis. **Stilles Wegwerfen war
   * der Fehler, den G-207 abstellt.**
   */
  markerUnbekannt: boolean
  /** `true`, wenn das Symptom nicht im Symptomkatalog steht. */
  symptomUnbekannt: boolean
}

export type SymptomStand = {
  symptome: Symptom[]
  zuordnungen: Zuordnung[]
  /** Was beim Lesen aufgefallen ist — leer heisst sauber. */
  befunde: Befund[]
  fehler: string | null
}

export type Befund = {
  art: 'marker_unbekannt' | 'symptom_unbekannt' | 'ohne_loinc'
  symptom_id: string
  marker_id: string
}

export const LEERER_STAND: SymptomStand = {
  symptome: [], zuordnungen: [], befunde: [], fehler: null,
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

/**
 * Die Zuordnungen aufloesen — und jede Luecke benennen.
 *
 * `[read]` **Nichts wird weggefiltert.** Wer eine Zuordnung auf einen
 * unbekannten Marker hat, sieht sie; sie traegt nur eine Marke.
 * **Das ist der Unterschied zur Konstante.**
 */
export function zuordnungenAus(
  roh: Array<Record<string, unknown>>,
  markerNachId: Map<string, { analyte: string | null; kategorie: string | null }>,
  symptomIds: Set<string>,
): { zuordnungen: Zuordnung[]; befunde: Befund[] } {
  const zuordnungen: Zuordnung[] = []
  const befunde: Befund[] = []

  for (const r of roh) {
    const symptom_id = text(r.symptom_id)
    const marker_id = text(r.marker_id)
    if (!symptom_id || !marker_id) continue

    const marker = markerNachId.get(marker_id)
    const markerUnbekannt = marker === undefined
    const symptomUnbekannt = !symptomIds.has(symptom_id)
    const loinc = text(r.biomarker_loinc_code)

    if (markerUnbekannt) befunde.push({ art: 'marker_unbekannt', symptom_id, marker_id })
    if (symptomUnbekannt) befunde.push({ art: 'symptom_unbekannt', symptom_id, marker_id })
    if (!loinc) befunde.push({ art: 'ohne_loinc', symptom_id, marker_id })

    zuordnungen.push({
      symptom_id,
      marker_id,
      analyte: marker?.analyte ?? null,
      kategorie: marker?.kategorie ?? null,
      loinc,
      spezifitaet: text(r.specificity),
      grund: text(r.reason_de),
      art: text(r.relation_type),
      markerUnbekannt,
      symptomUnbekannt,
    })
  }
  return { zuordnungen, befunde }
}

/**
 * Die Zuordnungen eines Symptoms, nach Aussagekraft geordnet.
 *
 * `[read]` **`HIGH` zuerst.** Wer auf ein Symptom klickt, will
 * wissen, welche Messung am ehesten etwas sagt — nicht die
 * alphabetisch erste.
 */
const RANG: Record<string, number> = { HIGH: 0, MODERATE: 1, LOW: 2 }

export function fuerSymptom(
  stand: SymptomStand, symptom_id: string,
): Zuordnung[] {
  return stand.zuordnungen
    .filter(z => z.symptom_id === symptom_id)
    .sort((a, b) => {
      const ra = RANG[a.spezifitaet ?? ''] ?? 9
      const rb = RANG[b.spezifitaet ?? ''] ?? 9
      if (ra !== rb) return ra - rb
      return (a.analyte ?? a.marker_id).localeCompare(
        b.analyte ?? b.marker_id, 'de')
    })
}
