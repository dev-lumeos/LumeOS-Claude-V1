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

/**
 * Eine Herkunftszeile des Stichtags — G-426.
 *
 * **Tom, 2026-09-08:** *„und denk an die detailansichten, da muss
 * natuerlich supplements auch rein."*
 *
 * `[read]` **In der Uebersicht steht eine Zahl — hier steht,
 * WORAUS sie kommt.**
 *
 * `[cmd]` **`nutrition.nutrient_intake_detail_for_day` (C-466)
 * kennt DREI Arten**, nicht zwei: `food`, `supplement` (der Stack)
 * und seit C-513/C-519 `meal_supplement` (das Praeparat im Essen).
 * `[read]` **Die Uebersicht fasst die beiden letzten zu einer
 * Zeile zusammen** (Tom will zwei Zeilen) — **hier bleiben sie
 * auseinander**, denn die Frage lautet ja gerade: woher.
 */
export type Herkunft = {
  art: 'food' | 'supplement' | 'meal_supplement'
  /** Produktname wenn ein Produkt-FK haengt, sonst die Substanz
   *  aus dem Einnahme-Schnappschuss (C-466). */
  name: string
  menge: number | null
  einheit: string | null
  /** Die Dosis, wie sie protokolliert wurde — „33 Gram(s)". */
  dosis: number | null
  dosisEinheit: string | null
  /** `true`, wenn der Name aus einem verknuepften Produkt stammt. */
  ausProdukt: boolean
}

/**
 * Die Obergrenze ueber BEIDE Quellen — G-426, C-344.
 *
 * `[cmd]` **`nutrition.nutrient_upper_limit_assessment_with_
 * supplements`** rechnet sie; **die Kachel baut die Regel nicht
 * nach.**
 *
 * `[read]` **`bereich` sagt, gegen WELCHE Referenz sie laeuft** —
 * bei Magnesium, Niacin und Folsaeure gilt die Grenze nur fuer
 * Supplemente (C-344). **Ohne diesen Satz waere eine Warnung nicht
 * einzuordnen.**
 *
 * `[read]` **`menge` ist `null`, wenn die Rechnung nicht
 * aufgeht** — `status` sagt dann, was fehlt, statt eine Zahl zu
 * erfinden.
 */
export type Obergrenze = {
  wert: number | null
  einheit: string | null
  bereich: string
  menge: number | null
  prozent: number | null
  status: string
  darueber: boolean | null
}

export type NaehrstoffDetail = {
  code: string
  erklaerung: NaehrstoffErklaerung | null
  referenzen: Referenzzeile[]
  /** Die persoenliche Bewertung des Stichtags fuer diesen Code. */
  bewertung: ReferenceAssessmentRow[]
  trend: TrendPunkt[]
  /** G-426: woraus die Zahl des Stichtags besteht. */
  herkunft: Herkunft[]
  /** G-426: die Obergrenze ueber beide Quellen; `null` wenn der
   *  Code keine gefuehrte Grenze hat. */
  obergrenze: Obergrenze | null
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

  const [detailR, refsR, bewertungR, trendR, herkunftR, grenzeR] = await Promise.allSettled([
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
    // G-426: die Herkunft der Zahl und die Obergrenze ueber beide
    // Quellen — beide aus C-466, beide auf den Stichtag bezogen.
    db.rpc('nutrient_intake_detail_for_day', {
      p_user_id: user.id, p_entry_date: stichtag, p_nutrient_code: code,
    }),
    db.rpc('nutrient_upper_limit_assessment_with_supplements', {
      p_user_id: user.id, p_entry_date: stichtag,
    }),
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

  // ══ G-426: woraus die Zahl besteht ════════════════════════════
  //
  // `[cmd]` **Gemessen am 2026-09-24, dev@lumeos.app:** am
  // 2026-09-22 fuer `PROT625` dreizehn `food`-Zeilen und sieben
  // `meal_supplement`-Zeilen mit Produktnamen; am 2026-08-19 fuer
  // `FAPUN3` eine `supplement`-Zeile **ohne** Produkt-FK — dort
  // traegt sie die Substanz *„Omega-3 (EPA/DHA)"*.
  const herkunft: Herkunft[] = []
  if (herkunftR.status === 'fulfilled' && !herkunftR.value.error) {
    for (const r of (herkunftR.value.data ?? []) as unknown as Array<Record<string, unknown>>) {
      const art = text(r.source_kind)
      if (art !== 'food' && art !== 'supplement' && art !== 'meal_supplement') continue
      // `[read]` **Der Produktname gewinnt, die Substanz traegt** —
      // C-466: *„mit Produkt-FK der Produktname, ohne FK die
      // Substanz."* `source_name` ist der historische
      // Schnappschuss und faellt nie aus.
      //
      // `[cmd]` **Gemessen am 2026-09-24: `product_name` ist NICHT
      // das Unterscheidungsmerkmal.** Die Funktion fuellt es
      // inzwischen auch ohne Produkt-FK — bei `FAPUN3` am
      // 2026-08-19 steht dort *„Omega-3 (EPA/DHA)"*, waehrend
      // `product_id` leer ist. `[read]` **Die Frage *,,kommt der
      // Name aus einem Produkt?"* beantwortet nur `product_id`**;
      // der Name allein saehe in beiden Faellen gleich aus.
      const produkt = text(r.product_name)
      const name = produkt ?? text(r.source_name)
      if (!name) continue
      herkunft.push({
        art,
        name,
        menge: zahl(r.amount),
        einheit: text(r.nutrient_unit),
        dosis: zahl(r.dose_amount),
        dosisEinheit: text(r.dose_unit),
        ausProdukt: text(r.product_id) !== null,
      })
    }
  }

  // Die Obergrenze liefert alle Codes des Tages — hier zaehlt
  // einer. `[read]` **Kein Nachrechnen:** die Funktion kennt die
  // C-344-Ausnahme, die Anzeige nicht.
  let obergrenze: Obergrenze | null = null
  if (grenzeR.status === 'fulfilled' && !grenzeR.value.error) {
    const zeilen = (grenzeR.value.data ?? []) as unknown as Array<Record<string, unknown>>
    const treffer = zeilen.find(r => text(r.nutrient_code) === code)
    if (treffer) {
      obergrenze = {
        wert: zahl(treffer.upper_limit_value),
        einheit: text(treffer.nutrient_unit),
        bereich: text(treffer.upper_limit_scope) ?? 'all_recorded_intake_sources',
        menge: zahl(treffer.upper_limit_amount),
        prozent: zahl(treffer.upper_limit_pct),
        status: text(treffer.upper_limit_status) ?? 'complete',
        darueber: treffer.above_upper_limit === true ? true
          : treffer.above_upper_limit === false ? false : null,
      }
    }
  }

  return { code, erklaerung, referenzen, bewertung, trend, herkunft, obergrenze }
}
