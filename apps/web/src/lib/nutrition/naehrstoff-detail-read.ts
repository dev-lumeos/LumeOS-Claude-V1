// Lese-I/O fuer das Naehrstoff-Detailmodal (G-122).
//
// Vier Quellen, eine Antwort:
// - `nutrition.nutrient_details` (C-161): 110 Erklaerungen aus dem
//   Vorgaengerrepo — Funktion, Mangel, Ueberschuss, Quellen, Tipps.
//   `[read]` Anzeigeinhalt, keine Diagnose und keine Referenzquelle;
//   `rda_*_text` bleibt Text (164-naehrstoffbaum.md).
// - `nutrition.nutrient_reference_values`: die wissenschaftlichen
//   Referenzen (EFSA/WHO/US) mit `source_url` und `source_version` —
//   alle Zeilen des Codes, auch NO_REFERENCE-Arten samt `notes`.
// - `daily_reference_assessment`: das persoenliche Ziel des Tages —
//   beide Werte stehen im Modal nebeneinander.
// - `daily_nutrient_summary_long` (C-157): die letzten 14 Tage als
//   echte Reihe. `[read]` Im Mockup ist der Trend erfunden (Z. 694
//   „Fake 14-day trend") — hier sind es Tageswerte.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import {
  getReferenceAssessment, type ReferenceAssessmentRow,
} from './reference-assessment-read'

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

export type NaehrstoffErklaerung = {
  funktion: string | null
  beiMangel: string | null
  beiUeberschuss: string | null
  detail: string | null
  tipp: string | null
  wechselwirkungen: string | null
  quellenListe: string[]
  /** Alttexte aus dem Vorgaengerrepo — Text, KEINE Referenzwerte. */
  rdaStandardText: string | null
  rdaAthletText: string | null
  ulText: string | null
}

export type Referenzzeile = {
  art: string
  richtung: string | null
  gruppe: string | null
  geschlecht: string | null
  alterMin: number | null
  alterMax: number | null
  wertMin: number | null
  wertMax: number | null
  einheit: string | null
  basis: string | null
  quelle: string | null
  quelleVersion: string | null
  quelleUrl: string | null
  hinweis: string | null
}

export type TrendPunkt = {
  tag: string
  wert: number | null
  vollstaendig: boolean
}

export type NaehrstoffDetail = {
  code: string
  erklaerung: NaehrstoffErklaerung | null
  referenzen: Referenzzeile[]
  /** Die persoenliche Bewertung des Stichtags fuer diesen Code. */
  bewertung: ReferenceAssessmentRow[]
  trend: TrendPunkt[]
}

/** 14 Tage bis zum Stichtag, aeltester zuerst. */
function trendVon(stichtag: string): string {
  const d = new Date(`${stichtag}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 13)
  return d.toISOString().slice(0, 10)
}

export async function ladeNaehrstoffDetail(
  code: string, stichtag: string,
): Promise<NaehrstoffDetail> {
  const client = createSessionClient()
  const db = client.schema('nutrition')
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Keine Sitzung')

  const [detailR, refsR, bewertungR, trendR] = await Promise.allSettled([
    db.from('nutrient_details')
      .select('function_de, deficiency_de, excess_de, detail_de, tip_de, '
        + 'interactions_de, top_sources_de, rda_standard_text, '
        + 'rda_athlete_text, upper_limit_text')
      .eq('nutrient_code', code)
      .maybeSingle(),
    db.from('nutrient_reference_values')
      .select('reference_kind, population_group, sex, age_min, age_max, '
        + 'value_min, value_max, unit, basis, target_applies_to, source, '
        + 'source_version, source_url, notes')
      .eq('nutrient_code', code)
      .order('reference_kind', { ascending: true }),
    getReferenceAssessment(stichtag),
    db.from('daily_nutrient_summary_long')
      .select('entry_date, total_value, value_complete')
      .eq('user_id', user.id)
      .eq('nutrient_code', code)
      .gte('entry_date', trendVon(stichtag))
      .lte('entry_date', stichtag)
      .order('entry_date', { ascending: true }),
  ])

  let erklaerung: NaehrstoffErklaerung | null = null
  if (detailR.status === 'fulfilled' && !detailR.value.error && detailR.value.data) {
    const d = detailR.value.data as unknown as Record<string, unknown>
    erklaerung = {
      funktion: text(d.function_de),
      beiMangel: text(d.deficiency_de),
      beiUeberschuss: text(d.excess_de),
      detail: text(d.detail_de),
      tipp: text(d.tip_de),
      wechselwirkungen: text(d.interactions_de),
      quellenListe: Array.isArray(d.top_sources_de)
        ? d.top_sources_de.filter((x): x is string => typeof x === 'string')
        : [],
      rdaStandardText: text(d.rda_standard_text),
      rdaAthletText: text(d.rda_athlete_text),
      ulText: text(d.upper_limit_text),
    }
  }

  const referenzen: Referenzzeile[] = []
  if (refsR.status === 'fulfilled' && !refsR.value.error) {
    for (const r of (refsR.value.data ?? []) as unknown as Array<Record<string, unknown>>) {
      referenzen.push({
        art: text(r.reference_kind) ?? '—',
        richtung: Array.isArray(r.target_applies_to)
          ? null : text(r.target_applies_to),
        gruppe: text(r.population_group),
        geschlecht: text(r.sex),
        alterMin: zahl(r.age_min),
        alterMax: zahl(r.age_max),
        wertMin: zahl(r.value_min),
        wertMax: zahl(r.value_max),
        einheit: text(r.unit),
        basis: text(r.basis),
        quelle: text(r.source),
        quelleVersion: text(r.source_version),
        quelleUrl: text(r.source_url),
        hinweis: text(r.notes),
      })
    }
  }

  const bewertung = bewertungR.status === 'fulfilled'
    ? bewertungR.value.filter(r => r.nutrient_code === code)
    : []

  const trend: TrendPunkt[] = []
  if (trendR.status === 'fulfilled' && !trendR.value.error) {
    for (const r of (trendR.value.data ?? []) as unknown as Array<Record<string, unknown>>) {
      const tag = text(r.entry_date)
      if (!tag) continue
      trend.push({
        tag,
        wert: zahl(r.total_value),
        vollstaendig: r.value_complete === true,
      })
    }
  }

  return { code, erklaerung, referenzen, bewertung, trend }
}
