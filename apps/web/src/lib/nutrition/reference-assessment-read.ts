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
  /**
   * Bei `RI`-Bereichen die beiden Enden — G-239.
   *
   * `[cmd]` Auf dev tragen sie genau die drei `energy_share`-Zeilen
   * (Fett, Kohlenhydrate, gesaettigte Fettsaeuren, gemessen
   * 2026-08-28). Ohne sie liesse sich ein Bereich nicht als Bereich
   * zeigen.
   */
  reference_pct_min: number | null
  reference_pct_max: number | null
  reference_status: string
  profile_age_years: number | null
  profile_biological_sex: string | null
  /**
   * G-239, Regel 4: die Referenzwerte gelten fuer gesunde Erwachsene.
   * `[read]` Schwangerschaft und Stillzeit verschieben sie — deshalb
   * kommen sie mit, statt still zu fehlen.
   */
  profile_is_pregnant: boolean
  profile_is_lactating: boolean
  /** Worauf sich der Wert bezieht (z. B. je kg Koerpergewicht). */
  reference_basis: string | null
  source: string | null
  /** Die Fundstelle in der Quelle — macht den Beleg nachschlagbar. */
  source_locator: string | null
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
      reference_pct_min: asNumberOrNull(r.reference_pct_min),
      reference_pct_max: asNumberOrNull(r.reference_pct_max),
      reference_status: asText(r.reference_status) || 'no_applicable_reference',
      profile_age_years: asNumberOrNull(r.profile_age_years),
      profile_biological_sex: asText(r.profile_biological_sex) || null,
      profile_is_pregnant: r.profile_is_pregnant === true,
      profile_is_lactating: r.profile_is_lactating === true,
      reference_basis: asText(r.reference_basis) || null,
      source: asText(r.source) || null,
      source_locator: asText(r.source_locator) || null,
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

// ── Der Zeitraum — G-259: entfernt ──────────────────────────────
//
// `[cmd]` **G-259, 2026-08-29: `getNaehrstoffZeitraum` und der Typ
// `NaehrstoffTag` sind geloescht.** Sie hatten keinen Aufrufer —
// **und trugen zusaetzlich die G-249-Falle:** `.limit(20000)` fuer
// 12.420 Zeilen, ohne seitenweises Laden. **PostgREST deckelt bei
// 1.000**, wer sie benutzt haette, haette acht Tage statt neunzig
// bekommen.
//
// `[read]` **A-59:** Code ohne Aufrufer wird beim naechsten Auftrag
// fuer gebaut gehalten. **Git holt ihn zurueck, falls er gebraucht
// wird** — die Tageswerte holt heute `ladeReihen` in
// `naehrstoff-ordnung.ts`, seitenweise und gleichzeitig.

// ── Die Erklaertexte — G-246 ─────────────────────────────────────

/**
 * Ein Erklaertext je Naehrstoff, aus `nutrition.nutrient_details`.
 *
 * `[read]` **Nur `_de`.** Die Tabelle ist dreisprachig; `_en` und
 * `_th` bleiben liegen, bis es eine Sprachumschaltung gibt — sie hier
 * mitzuladen waere Vorrat ohne Abnehmer.
 */
export type Erklaertext = {
  nutrient_code: string
  funktion: string | null
  beiMangel: string | null
  beiUeberschuss: string | null
  quellen: string[]
  rdaStandard: string | null
  rdaAthlet: string | null
  obergrenze: string | null
  wechselwirkungen: string | null
  tipp: string | null
  detail: string | null
  /** Herkunft der Zeile — der Beleg gehoert an den Text. */
  quelle: string | null
}

/**
 * Alle Erklaertexte auf einmal.
 *
 * `[cmd]` **110 Zeilen, 33.697 Zeichen** — `naehrstoff-ordnung.ts`
 * haelt fest, dass das ohne Alias-Schema traegt. `[read]` **Deshalb
 * eine Abfrage statt einer je aufgeklapptem Naehrstoff:** wer eine
 * Zeile aufklappt, klappt meist die naechste auch auf.
 *
 * `[cmd]` **Die Verknuepfung geht ueber zwei verschiedene
 * Spaltennamen:** `nutrient_defs.code` gegen
 * `nutrient_details.nutrient_code`. Dieselbe Sache, andere
 * Bezeichner.
 */
export async function getErklaertexte(): Promise<Erklaertext[]> {
  const supabase = createSessionClient()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('nutrient_details')
    .select('nutrient_code, function_de, deficiency_de, excess_de, '
      + 'top_sources_de, rda_standard_text, rda_athlete_text, '
      + 'upper_limit_text, interactions_de, tip_de, detail_de, source')
    .limit(1000)

  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)

  // `[cmd]` **Ein Feld, keine `Map`.** Die Anzeige ist eine
  // Client-Komponente, und React serialisiert Props nach JSON — eine
  // `Map` kaeme dort LEER an, ohne Fehler. Gemessen am 2026-08-29:
  // die Kacheln blieben stumm, nur der Rueckfallzweig rendete.
  const aus: Erklaertext[] = []
  for (const raw of (data ?? []) as unknown as Array<Record<string, unknown>>) {
    const code = asText(raw.nutrient_code)
    if (!code) continue
    aus.push({
      nutrient_code: code,
      funktion: asText(raw.function_de) || null,
      beiMangel: asText(raw.deficiency_de) || null,
      beiUeberschuss: asText(raw.excess_de) || null,
      quellen: Array.isArray(raw.top_sources_de)
        ? raw.top_sources_de.filter((x): x is string => typeof x === 'string')
        : [],
      rdaStandard: asText(raw.rda_standard_text) || null,
      rdaAthlet: asText(raw.rda_athlete_text) || null,
      obergrenze: asText(raw.upper_limit_text) || null,
      wechselwirkungen: asText(raw.interactions_de) || null,
      tipp: asText(raw.tip_de) || null,
      detail: asText(raw.detail_de) || null,
      quelle: asText(raw.source) || null,
    })
  }
  return aus
}

/**
 * Wie viele Naehrstoffe an einem Tag Luecken tragen — G-248.
 *
 * `[cmd]` **Eine Abfrage statt 35 Spalten.** `daily_summary` fuehrt
 * 35 `_missing`-Zaehler; der Diary-Leseweg laedt neun, und davon
 * feuert genau einer (`fibt`, gemessen 2026-08-29). **Die
 * Gesamtzahl steht in `daily_nutrient_summary_long`:** am selben Tag
 * 76 von 138 Naehrstoffen unvollstaendig.
 *
 * `[read]` **`head: true` mit `count: 'exact'`** — es kommen keine
 * Zeilen zurueck, nur die Zahl. Bei 138 Zeilen je Tag waere alles
 * andere Verschwendung.
 */
export async function getLueckenZahl(
  entryDate: string,
): Promise<{ unvollstaendig: number; gesamt: number } | null> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const db = supabase.schema('nutrition')
  const [alle, offen] = await Promise.all([
    db.from('daily_nutrient_summary_long')
      .select('nutrient_code', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('entry_date', entryDate),
    db.from('daily_nutrient_summary_long')
      .select('nutrient_code', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('entry_date', entryDate)
      .eq('value_complete', false),
  ])
  if (alle.error || offen.error) return null
  return { unvollstaendig: offen.count ?? 0, gesamt: alle.count ?? 0 }
}


// ── Die Dauer je Naehrstoff — C-323 ──────────────────────────────
//
// `[cmd]` **Gemessen am 2026-08-29, `explain (analyze, buffers)` auf
// `dev@lumeos.app`:**
//
//     reference_assessment_window(dev, 2026-08-29,  7)    149 ms
//                                              30)    642 ms
//                                              90)  1.786 ms
//
// `[cmd]` **Die Zeit ist die Rechnung selbst, nicht die Auslieferung:**
// ein blosses `count(*)` ueber dieselbe Funktion braucht **1.895 ms**,
// serverseitiges Zaehlen **1.864 ms**. **Ein Filter spart nichts.**
// `temp read/written` liegt bei 124.792 Bloecken.
//
// `[read]` **Deshalb wird die Fensterfunktion NICHT bei jedem
// Seitenaufruf gerufen.** Der Aufrufer entscheidet, wann er die Dauer
// braucht; **90 Tage kosten knapp zwei Sekunden, und das gehoert
// gewusst, bevor es jemand in einen Seitenaufbau haengt.**
//
// `[read]` **Warum trotzdem diese Funktion und nicht der billigere
// Weg:** `daily_nutrient_summary_long` liefert die Tagesmengen in
// 195 ms, aber **ohne Bewertung** — wer daraus Prozentwerte bildet,
// rechnet die Referenzlogik ein zweites Mal nach. **Das ist genau die
// zweite Wahrheit, die der Kopf dieser Datei ausschliesst.**
// **Gemeldet als Befund, nicht umgangen.**

/** Ein Naehrstoff mit seinen Tageswerten im Zeitraum. */
export type NaehrstoffDauer = {
  nutrient_code: string
  nutrient_name_de: string
  reference_direction: string | null
  tage: Array<{ tag: string; pct: number | null; status: string }>
}

/**
 * Die Tagesbewertungen im Zeitraum, je Naehrstoff.
 *
 * `[cmd]` **`reference_assessment_window` liefert je Naehrstoff EINE
 * Zeile** mit `daily_assessments` als jsonb — auf dev 154 Zeilen mit
 * zusammen 13.860 Tageseintraegen (8,3 MB) fuer 90 Tage.
 *
 * `[read]` **Kein PostgREST-Deckel-Problem** (G-249): 154 Zeilen
 * liegen weit unter 1.000. **Die Tageswerte stecken im jsonb, nicht in
 * eigenen Zeilen** — genau deshalb.
 */
export async function getNaehrstoffDauer(
  bisDatum: string, tage: number,
): Promise<NaehrstoffDauer[]> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DiaryWriteError('NO_SESSION', 'Keine angemeldete Session.')

  const { data, error } = await supabase
    .schema('nutrition')
    .rpc('reference_assessment_window', {
      p_user_id: user.id,
      p_end_date: bisDatum,
      p_days: tage,
    })
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)

  const aus: NaehrstoffDauer[] = []
  for (const raw of (data ?? []) as unknown as Array<Record<string, unknown>>) {
    const code = asText(raw.nutrient_code)
    if (!code) continue
    const roh = Array.isArray(raw.daily_assessments) ? raw.daily_assessments : []
    const tagesliste: NaehrstoffDauer['tage'] = []
    for (const d of roh as Array<Record<string, unknown>>) {
      const tag = asText(d.entry_date)
      if (!tag) continue
      tagesliste.push({
        tag,
        pct: asNumberOrNull(d.reference_pct),
        status: asText(d.reference_status),
      })
    }
    aus.push({
      nutrient_code: code,
      nutrient_name_de: asText(raw.nutrient_name_de) || code,
      reference_direction: asText(raw.reference_direction) || null,
      tage: tagesliste,
    })
  }
  return aus
}
