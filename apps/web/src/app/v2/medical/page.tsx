// Medical der Oberflaeche v2 — seit G-46 teils angebunden.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Medical`
// mit `href: /v2/medical`. Seit G-36 stand dort der Entwurf, ganz
// Attrappe; seit den Kettenschritten 140–143 gibt es das Schema:
//   medical.biomarker_catalog          11.676
//   medical.biomarker_reference_ranges    464
//   medical.biomarker_aliases             292
//   medical.lab_reports / lab_result_values  2 / 6  (Testdaten)
//
// DIESE SEITE LIEST JETZT. Serverseitig, mit der Identitaet der
// angemeldeten Nutzerin — dasselbe Muster wie `/v2/settings`
// (`page.tsx:27`): laden, Fehler auffangen, durchreichen. Der Rahmen
// ist eine Client-Komponente und kann selbst nicht lesen, weil
// `createSessionClient()` Cookies ueber `next/headers` holt.
//
// `[cmd]` Der Katalog wird NICHT geladen, sondern durchsucht: 11.676
// Zeilen. Vorgeladen sind die 25 haeufigsten nach `common_test_rank`
// (0,05 ms ueber den Rangindex), alles weitere holt die Suche.
//
// `[read]` Was noch Attrappe bleibt und warum, steht in
// docs/ssot/109-medical-anbindung.md.
import type { Metadata } from 'next'
import { createSessionClient } from '@lumeos/shared/session'

import { LEERER_STAND, type SymptomStand } from '../../../lib/medical/symptome'

import {
  angemeldeteNutzerin, ladeBefundwerte, ladeMarkerStamm, ladeSystemgruppen,
  ladeSymptome,
  sucheKatalog, zaehleKatalog,
  type BefundWert, type KatalogTreffer,
} from '../../../lib/medical/lesen'
import { zuReihen, type MarkerReihe } from '../../../lib/medical/reihe'
// G-208: der Wirkstoffkatalog — 498 Zeilen, 83 kB (gemessen
// 2026-08-27). `[read]` **Die Liste kommt mit der Seite, das Detail
// nicht** — die Nutzertexte wiegen 1.145 kB, die FAQ 700 kB.
import {
  ladeWirkstoffListe, type WirkstoffZeile,
} from '../../../lib/medical/wirkstoff-read'
import {
  istSystem, rechneScores, type Gesamtwert, type System,
} from '../../../lib/medical/systemscore'
import { MedicalAnsicht } from './ansicht'
import type { LabMarkerEffekt, MedikationEcht } from './echtdaten'
// G-376: Verlauf, Termine und Dokumente — das Schema stand
// seit C-431 live, die Oberflaeche kannte es nicht.
import { ladeDokumente, DOKUMENTE_LEER, type DokumenteStand }
  from '../../../lib/medical/dokumente-read'
import './medical.css'

export const metadata: Metadata = {
  title: 'Medical · LumeOS',
}

// Ohne das wuerde Next die Seite zur Bauzeit einfrieren — mit den
// Werten der Bauzeit, also ohne Session und ohne Zeile.
export const dynamic = 'force-dynamic'

type MedikationZeile = {
  id: string
  name: string
  /** G-211: die Katalogbindung — `null` ist der dritte Zustand. */
  active_substance_id: string | null
  drug_class: string[] | null
  cyp_profile: string[] | null
  dose_amount: number | null
  dose_unit: string | null
  doses_per_day: number | null
  route: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean | null
  indication: string | null
  notes: string | null
  measurement_source: string | null
  source_detail: string | null
}

type StackZeile = { id: string }
type StackItemZeile = { supplement_id: string | null }
type SupplementZeile = { id: string; name_de: string | null; name_en: string | null }
type LabEffektZeile = {
  id: string
  supplement_id: string
  loinc_code: string | null
  lab_marker_id: string | null
  effect_type: string
  direction: string | null
  mechanism_de: string | null
  mechanism_en: string | null
  clinical_consequence_de: string | null
  clinical_consequence_en: string | null
  evidence: string | null
  monitoring_link: string | null
  source: string | null
}

function arrayOderLeer(v: string[] | null): string[] {
  return Array.isArray(v) ? v : []
}

function supplementName(row: SupplementZeile): string {
  return row.name_de?.trim() || row.name_en?.trim() || '—'
}

async function ladeMedikationen(userId: string): Promise<MedikationEcht[]> {
  const { data, error } = await createSessionClient()
    .schema('medical')
    .from('user_medications')
    .select(`
      id, name, active_substance_id,
      drug_class, cyp_profile, dose_amount, dose_unit,
      doses_per_day, route, start_date, end_date, is_active,
      indication, notes, measurement_source, source_detail
    `)
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('start_date', { ascending: false })

  if (error) throw error

  return ((data ?? []) as MedikationZeile[]).map(row => ({
    id: row.id,
    name: row.name,
    active_substance_id: row.active_substance_id,
    drug_class: arrayOderLeer(row.drug_class),
    cyp_profile: arrayOderLeer(row.cyp_profile),
    dose_amount: row.dose_amount,
    dose_unit: row.dose_unit,
    doses_per_day: row.doses_per_day,
    route: row.route,
    start_date: row.start_date,
    end_date: row.end_date,
    is_active: row.is_active ?? false,
    indication: row.indication,
    notes: row.notes,
    measurement_source: row.measurement_source,
    source_detail: row.source_detail,
  }))
}

async function ladeLabEffekte(userId: string): Promise<LabMarkerEffekt[]> {
  const db = createSessionClient().schema('supplements')

  const { data: stacks, error: stackFehler } = await db
    .from('user_stacks')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
  if (stackFehler) throw stackFehler

  const stackIds = ((stacks ?? []) as StackZeile[]).map(s => s.id)
  if (stackIds.length === 0) return []

  const { data: items, error: itemFehler } = await db
    .from('stack_items')
    .select('supplement_id')
    .in('stack_id', stackIds)
    .eq('is_active', true)
  if (itemFehler) throw itemFehler

  const supplementIds = Array.from(new Set(
    ((items ?? []) as StackItemZeile[])
      .map(i => i.supplement_id)
      .filter((id): id is string => Boolean(id)),
  ))
  if (supplementIds.length === 0) return []

  const { data: supplemente, error: suppFehler } = await db
    .from('supplements')
    .select('id, name_de, name_en')
    .in('id', supplementIds)
  if (suppFehler) throw suppFehler

  const supplementZeilen = (supplemente ?? []) as SupplementZeile[]
  const supplementNameNachId = new Map(supplementZeilen.map(s => [s.id, supplementName(s)]))
  if (supplementNameNachId.size === 0) return []

  const { data: effekte, error: effektFehler } = await db
    .from('supplement_lab_effects')
    .select(`
      id, supplement_id, loinc_code, lab_marker_id, effect_type,
      direction, mechanism_de, mechanism_en,
      clinical_consequence_de, clinical_consequence_en,
      evidence, monitoring_link, source
    `)
    .in('supplement_id', supplementIds)
  if (effektFehler) throw effektFehler

  return ((effekte ?? []) as LabEffektZeile[]).map(row => ({
    id: row.id,
    substance_id: row.supplement_id,
    substance_name: supplementNameNachId.get(row.supplement_id) ?? '—',
    supplement_name: supplementNameNachId.get(row.supplement_id) ?? null,
    loinc_code: row.loinc_code,
    lab_marker_id: row.lab_marker_id,
    effect_type: row.effect_type,
    direction: row.direction,
    direction_enum: null,
    mechanism: row.mechanism_de || row.mechanism_en,
    clinical_consequence: row.clinical_consequence_de || row.clinical_consequence_en,
    evidence: row.evidence,
    monitoring_link: row.monitoring_link,
    source: row.source,
  }))
}

export default async function V2MedicalPage() {
  let werte: BefundWert[] = []
  let reihen: MarkerReihe[] = []
  let befunde = 0
  let katalogStart: KatalogTreffer[] = []
  let katalogGesamt = 0
  let medikationen: MedikationEcht[] = []
  let labEffekte: LabMarkerEffekt[] = []
  let scores: Gesamtwert | null = null
  // G-207: Symptome und ihre Biomarker-Zuordnung.
  let symptome: SymptomStand = LEERER_STAND
  // G-208: der Wirkstoffkatalog.
  let wirkstoffe: WirkstoffZeile[] = []
  let ladefehler: string | null = null

  try {
    const userId = await angemeldeteNutzerin()
    ;[werte, katalogStart, katalogGesamt, medikationen, labEffekte,
      symptome, wirkstoffe] = await Promise.all([
      ladeBefundwerte(userId),
      sucheKatalog(''),
      zaehleKatalog(),
      ladeMedikationen(userId),
      ladeLabEffekte(userId),
      // G-207: haengt an keiner der uebrigen — laeuft mit.
      ladeSymptome(),
      // G-208: ebenso. `[read]` **Nicht sequenziell angehaengt** —
      // die Lehre aus G-190: fuenf Auftraege haben je „haeng zwei
      // Abfragen an" gesagt, keiner hat die Summe gemessen.
      ladeWirkstoffListe(),
    ])

    // Kurzname und Klasse je Code — ein Zugriff fuer alle, erst wenn
    // die Werte da sind, weil er ihre Codes braucht.
    const codes = Array.from(
      new Set(werte.map(w => w.loinc_code).filter((c): c is string => !!c)),
    )
    reihen = zuReihen(werte, await ladeMarkerStamm(codes))
    befunde = new Set(werte.map(w => w.report_id)).size

    // G-135: die fuenf System-Scores. Die Zuordnung steht in
    // `biomarker_spec_enrichment.system_groups` — ein Zugriff, 49
    // Zeilen, unabhaengig von der Zahl der Marker.
    const { jeCode, erwartetJeSystem } = await ladeSystemgruppen()
    scores = rechneScores(
      reihen,
      new Map(Array.from(jeCode, ([c, g]) => [c, g.filter(istSystem)])),
      new Map(Array.from(erwartetJeSystem).filter(([s]) => istSystem(s)) as Array<[System, number]>),
    )
  } catch (e) {
    ladefehler = e instanceof Error ? e.message : String(e)
  }

  // `[read]` **Eigener Aufruf, eigener Fehler** — faellt der
  // Dokumentteil aus, bleiben die uebrigen Reiter gueltig.
  let dokumente: DokumenteStand = DOKUMENTE_LEER
  try {
    dokumente = await ladeDokumente()
  } catch (e) {
    dokumente = {
      ...DOKUMENTE_LEER,
      fehler: e instanceof Error ? e.message : String(e),
    }
  }

  return (
    <MedicalAnsicht
      dokumente={dokumente}
      echt={{
        reihen, befunde, werte, katalogStart, katalogGesamt,
        medikationen, labEffekte, scores, ladefehler, symptome,
        wirkstoffe,
      }}
    />
  )
}
