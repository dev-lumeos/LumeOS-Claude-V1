// Lese-I/O fuer das Supplements-Modul (G-37).
//
// Liest den Katalog, den aktiven Stack und das Einnahmeprotokoll mit
// der Identitaet der Sitzung — kein Service-Client, wie bei Nutrition.
// Der Zeilenschutz aus C-68 entscheidet, was ankommt.
//
// WAS HIER NICHT PASSIERT: bewerten. `[read]` Ob jemand seinen Stack
// „gut" nimmt, ist eine Aussage ueber einen Menschen. Diese Datei
// liefert, was genommen wurde, und rechnet nur, was sich aus den
// Zahlen selbst ergibt — Tagesdosis, Kosten, Reichweite.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

/** Ein Eintrag des kuratierten Katalogs (`supplements.supplements`). */
export type KatalogEintrag = {
  id: string
  slug: string
  name: string
  category: string
  evidence_grade: string
  evidence_summary: string | null
  typical_dose_min: number | null
  typical_dose_max: number | null
  dose_unit: string | null
  serving_size: number | null
  serving_unit: string | null
  cost_per_serving: number | null
  timing_default: string
  requires_food: boolean
  priority: string
  benefits: string[]
}

type SupplementRoh = {
  id: string
  slug: string
  name_de: string | null
  name_en: string | null
  evidence_grade: string | null
  category_id: string | null
}

type KategorieRoh = {
  id: string
  name_de: string | null
  name_en: string | null
}

type DosingRoh = {
  supplement_id: string
  dose_unit: string | null
  guideline_dose: unknown
  official_label_dose: unknown
  studied_dose_ranges: unknown
  usage_hint_de: string | null
  usage_hint_en: string | null
}

type EvidenceRoh = {
  supplement_id: string
  summary_de: string | null
  summary_en: string | null
  overall_grade: string | null
}

/** Eine Position im Stack, mit aufgeloestem Katalogeintrag. */
export type StackPosition = {
  id: string
  name: string
  dose: number
  dose_unit: string
  timing: string
  frequency: string
  sort_order: number
  is_active: boolean
  stock_remaining: number | null
  stock_unit: string | null
  low_stock_threshold: number | null
  katalog: KatalogEintrag | null
  /**
   * C-229: der Anker zur Substanzdatenbank, wenn die Position von
   * dort zugeteilt wurde (`substance_catalog:<id>`), sonst frei.
   */
  notes: string | null
  /** Portionen je Tag = Dosis / Portionsgroesse. `null` ohne Portionsgroesse. */
  portionen_pro_tag: number | null
  /** Kosten je Tag in Euro. `null`, wenn Preis oder Portionsgroesse fehlt. */
  kosten_pro_tag: number | null
  /** Tage, bis der Bestand aufgebraucht ist. `null` ohne Bestand. */
  tage_bis_leer: number | null
  /** Bestand auf oder unter der Schwelle. `null`, wenn eine der Zahlen fehlt. */
  unter_schwelle: boolean | null
}

/** Eine Zeile des Einnahmeprotokolls. */
export type EinnahmeZeile = {
  id: string
  stack_item_id: string | null
  intake_date: string
  intake_time: string | null
  status: 'planned' | 'taken' | 'skipped' | 'snoozed'
  supplement_name_snapshot: string
  dose_snapshot: number
  dose_unit_snapshot: string
  notes: string | null
  /** Herkunft aus 017: manual · device · import · admin · seed. */
  measurement_source: string | null
}

/** Der Stack einer Nutzerin, so wie die Seite ihn braucht. */
export type StackDaten = {
  stack_name: string | null
  stack_goal: string | null
  positionen: StackPosition[]
  einnahmen: EinnahmeZeile[]
  /** Verschiedene Tage im Protokoll — entscheidet, ob Compliance rechenbar ist. */
  protokoll_tage: number
  katalog_groesse: number
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function anzeigename(de: unknown, en: unknown, fallback = '—'): string {
  return text(de) ?? text(en) ?? fallback
}

function ersterStringAusJson(v: unknown, schluessel: string[]): string | null {
  if (v == null || typeof v !== 'object') return null
  const obj = v as Record<string, unknown>
  for (const key of schluessel) {
    const val = obj[key]
    if (typeof val === 'string' && val.trim()) return val.trim()
    if (typeof val === 'number' && Number.isFinite(val)) return String(val)
  }
  return null
}

function dosisText(d: DosingRoh | null): string | null {
  if (!d) return null
  return text(d.usage_hint_de)
    ?? text(d.usage_hint_en)
    ?? ersterStringAusJson(d.guideline_dose, ['text_de', 'text_en', 'text', 'display'])
    ?? ersterStringAusJson(d.official_label_dose, ['text_de', 'text_en', 'text', 'display'])
    ?? ersterStringAusJson(d.studied_dose_ranges, ['text_de', 'text_en', 'text', 'display'])
}

function katalogAusNeu(
  s: SupplementRoh,
  kategorien: Map<string, KategorieRoh>,
  dosing: Map<string, DosingRoh>,
  evidence: Map<string, EvidenceRoh>,
): KatalogEintrag {
  const d = dosing.get(s.id) ?? null
  const e = evidence.get(s.id) ?? null
  const kat = s.category_id ? kategorien.get(s.category_id) ?? null : null
  const dosierung = dosisText(d)
  return {
    id: s.id,
    slug: s.slug,
    name: anzeigename(s.name_de, s.name_en),
    category: kat ? anzeigename(kat.name_de, kat.name_en) : '—',
    evidence_grade: text(e?.overall_grade) ?? text(s.evidence_grade) ?? '—',
    evidence_summary: text(e?.summary_de) ?? text(e?.summary_en),
    typical_dose_min: null,
    typical_dose_max: null,
    dose_unit: text(d?.dose_unit),
    serving_size: null,
    serving_unit: null,
    cost_per_serving: null,
    timing_default: 'any',
    requires_food: false,
    priority: 'unknown',
    benefits: dosierung ? [dosierung] : [],
  }
}

async function ladeKatalogMaps(
  s: ReturnType<ReturnType<typeof createSessionClient>['schema']>,
  ids: string[],
) {
  const eindeutig = Array.from(new Set(ids.filter(Boolean)))
  const supplements = new Map<string, SupplementRoh>()
  const kategorien = new Map<string, KategorieRoh>()
  const dosing = new Map<string, DosingRoh>()
  const evidence = new Map<string, EvidenceRoh>()
  if (eindeutig.length === 0) return { supplements, kategorien, dosing, evidence }

  const { data: suppRows, error: suppFehler } = await s
    .from('supplements')
    .select('id, slug, name_de, name_en, evidence_grade, category_id')
    .in('id', eindeutig)
  if (suppFehler) throw suppFehler
  for (const row of (suppRows ?? []) as SupplementRoh[]) supplements.set(row.id, row)

  const categoryIds = Array.from(new Set(
    Array.from(supplements.values())
      .map(row => row.category_id)
      .filter((id): id is string => Boolean(id)),
  ))
  if (categoryIds.length > 0) {
    const { data, error } = await s
      .from('supplement_categories')
      .select('id, name_de, name_en')
      .in('id', categoryIds)
    if (error) throw error
    for (const row of (data ?? []) as KategorieRoh[]) kategorien.set(row.id, row)
  }

  const { data: dosingRows, error: dosingFehler } = await s
    .from('supplement_dosing')
    .select('supplement_id, dose_unit, guideline_dose, official_label_dose, studied_dose_ranges, usage_hint_de, usage_hint_en')
    .in('supplement_id', eindeutig)
  if (dosingFehler) throw dosingFehler
  for (const row of (dosingRows ?? []) as DosingRoh[]) dosing.set(row.supplement_id, row)

  const { data: evidenceRows, error: evidenceFehler } = await s
    .from('supplement_evidence')
    .select('supplement_id, summary_de, summary_en, overall_grade')
    .in('supplement_id', eindeutig)
  if (evidenceFehler) throw evidenceFehler
  for (const row of (evidenceRows ?? []) as EvidenceRoh[]) evidence.set(row.supplement_id, row)

  return { supplements, kategorien, dosing, evidence }
}

/**
 * Die abgeleiteten Werte einer Position.
 *
 * `[cmd]` Alle vier Positionen auf `dev@lumeos.app` fuehren
 * `serving_size`, und alle 44 Katalogeintraege fuehren
 * `cost_per_serving` — die Rechnung geht also auf. Sie bleibt
 * trotzdem defensiv: fehlt eine der Zahlen, ist das Ergebnis `null`
 * und die Anzeige zeigt einen Strich statt einer erfundenen Zahl.
 *
 * **DIE REICHWEITE HAENGT AN DER EINHEIT — G-74, gemessen.**
 *
 * `[cmd]` `stock_unit` sagt bei den vier Positionen zweierlei:
 *
 *   Kreatin     30 **g**        bei 5 g/Tag  → **6 Tage**
 *   Vitamin D3   4 **softgels** bei 5000 IU  → **4 Tage**
 *   Omega-3     14 **softgels** bei 2 g      → **14 Tage**
 *   Magnesium   24 **capsules** bei 400 mg   → **24 Tage**
 *
 * **Die Regel folgt daraus:**
 *   - `stock_unit == dose_unit` → der Bestand ist in **Dosiseinheit**
 *     gefuehrt, also `Bestand ÷ Tagesdosis`.
 *   - sonst → der Bestand ist in **Stueck** gefuehrt (softgels,
 *     capsules, tablets), und ein Stueck ist eine Portion, also
 *     `Bestand ÷ Portionen pro Tag`.
 *
 * `[read]` **Vorher rechnete diese Funktion immer die zweite Variante**
 * und meldete fuer Kreatin 30 Tage statt 6 — die Zahl stand auch so im
 * Auftragstext. Tom dazu: *„`stock_unit` sagt `g`, und die Tagesdosis
 * sagt 5 g. Die Spalten sind eindeutig — sie zu ignorieren, weil eine
 * Auftragszahl anders klingt, waere der Fehler."*
 */
export function ableiten(
  dose: number,
  stock: number | null,
  schwelle: number | null,
  k: { serving_size: number | null; cost_per_serving: number | null } | null,
  doseUnit?: string | null,
  stockUnit?: string | null,
): Pick<StackPosition, 'portionen_pro_tag' | 'kosten_pro_tag' | 'tage_bis_leer' | 'unter_schwelle'> {
  const portion = k?.serving_size ?? null
  const proTag = portion != null && portion > 0 ? dose / portion : null
  const preis = k?.cost_per_serving ?? null

  // Einheitenvergleich ohne Gross-/Kleinschreibung und Leerraum: die
  // Spalten sind Freitext, `g` und `G` waeren sonst zwei Einheiten.
  const gleich = (a?: string | null, b?: string | null) =>
    a != null && b != null && a.trim().toLowerCase() === b.trim().toLowerCase()

  let tage: number | null = null
  if (stock != null) {
    if (gleich(doseUnit, stockUnit)) {
      // Bestand in Dosiseinheit — Kreatin: 30 g ÷ 5 g = 6.
      tage = dose > 0 ? stock / dose : null
    } else if (proTag != null && proTag > 0) {
      // Bestand in Stueck — D3: 4 softgels ÷ 1 Portion = 4.
      tage = stock / proTag
    }
  }

  return {
    portionen_pro_tag: proTag,
    kosten_pro_tag: proTag != null && preis != null ? proTag * preis : null,
    tage_bis_leer: tage,
    unter_schwelle: stock != null && schwelle != null ? stock <= schwelle : null,
  }
}

// `[cmd]` **`nachfuellstufe` steht in `auswertung.ts`, nicht hier.**
// Diese Datei importiert `next/headers`; wer die Stufenrechnung von
// hier holt, zieht das ganze I/O-Modul ins Browserbuendel — die Seite
// antwortet dann mit HTTP 500. Gemessen beim Bau von G-74.

/**
 * Der aktive Stack samt Katalog und Protokoll.
 *
 * Gibt `null` zurueck, wenn keine Sitzung besteht — die Seite zeigt
 * dann die Attrappe weiter, statt eine leere Oberflaeche zu bauen.
 */
export async function getStackDaten(): Promise<StackDaten | null> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const s = supabase.schema('supplements')

  // Der aktive Stack. `[cmd]` Ein eindeutiger Index laesst je Nutzerin
  // nur einen aktiven zu (`uq_user_stacks_one_active`).
  const { data: stacks } = await s
    .from('user_stacks')
    .select('id,name,goal,is_active')
    .eq('is_active', true)
    .limit(1)
  const stack = stacks?.[0] ?? null

  let positionen: StackPosition[] = []
  if (stack) {
    const { data: items, error: itemFehler } = await s
      .from('stack_items')
      .select(`
        id, dose, dose_unit, timing, frequency, sort_order, is_active,
        stock_remaining, stock_unit, low_stock_threshold, custom_name, notes,
        supplement_id
      `)
      .eq('stack_id', stack.id)
      .eq('is_active', true)
      .order('sort_order')

    if (itemFehler) throw itemFehler

    const itemRows = (items ?? []) as unknown as Record<string, unknown>[]
    const maps = await ladeKatalogMaps(
      s,
      itemRows.map(row => (row.supplement_id as string) ?? '').filter(Boolean),
    )

    positionen = itemRows.map(r => {
      const roh = r as unknown as Record<string, unknown>
      const supplementId = (roh.supplement_id as string) ?? null
      const supplement = supplementId ? maps.supplements.get(supplementId) ?? null : null
      const katalog = supplement
        ? katalogAusNeu(supplement, maps.kategorien, maps.dosing, maps.evidence)
        : null

      const dose = zahl(roh.dose) ?? 0
      const stock = zahl(roh.stock_remaining)
      const schwelle = zahl(roh.low_stock_threshold)
      return {
        id: String(roh.id),
        name: katalog?.name ?? String(roh.custom_name ?? '—'),
        dose,
        dose_unit: String(roh.dose_unit ?? ''),
        timing: String(roh.timing ?? 'any'),
        frequency: String(roh.frequency ?? 'daily'),
        sort_order: Math.trunc(zahl(roh.sort_order) ?? 0),
        is_active: roh.is_active !== false,
        stock_remaining: stock,
        stock_unit: (roh.stock_unit as string) ?? null,
        low_stock_threshold: schwelle,
        katalog,
        notes: (roh.notes as string) ?? null,
        // Die Einheiten entscheiden ueber die Reichweite — siehe
        // `ableiten`. Ohne sie rechnete Kreatin 30 statt 6 Tage.
        ...ableiten(
          dose, stock, schwelle, katalog,
          String(roh.dose_unit ?? ''), (roh.stock_unit as string) ?? null,
        ),
      }
    })
  }

  // Das Protokoll. Ohne Stack trotzdem lesen — Eintraege koennen die
  // Position ueberleben (`ON DELETE SET NULL`).
  const { data: logs } = await s
    .from('intake_logs')
    .select('id,stack_item_id,intake_date,intake_time,status,'
      + 'supplement_name_snapshot,dose_snapshot,dose_unit_snapshot,notes,measurement_source')
    .order('intake_date', { ascending: false })
    .order('intake_time', { ascending: true })

  const einnahmen: EinnahmeZeile[] = (logs ?? []).map(r => {
    const roh = r as unknown as Record<string, unknown>
    return {
      id: String(roh.id),
      stack_item_id: (roh.stack_item_id as string) ?? null,
      intake_date: String(roh.intake_date),
      intake_time: (roh.intake_time as string) ?? null,
      status: String(roh.status) as EinnahmeZeile['status'],
      supplement_name_snapshot: String(roh.supplement_name_snapshot),
      dose_snapshot: zahl(roh.dose_snapshot) ?? 0,
      dose_unit_snapshot: String(roh.dose_unit_snapshot ?? ''),
      notes: (roh.notes as string) ?? null,
      measurement_source: (roh.measurement_source as string) ?? null,
    }
  })

  const { count } = await s
    .from('supplements')
    .select('*', { count: 'exact', head: true })
    .eq('im_katalog', true)

  return {
    stack_name: stack ? String(stack.name) : null,
    stack_goal: stack ? String(stack.goal) : null,
    positionen,
    einnahmen,
    protokoll_tage: new Set(einnahmen.map(e => e.intake_date)).size,
    katalog_groesse: count ?? 0,
  }
}

/** Der ganze Katalog, fuer den Tab „Database". */
export async function getKatalog(): Promise<KatalogEintrag[]> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const s = supabase.schema('supplements')
  const { data, error } = await s
    .from('supplements')
    .select('id,slug,name_de,name_en,evidence_grade,category_id')
    .eq('im_katalog', true)
    .order('name_en')

  if (error) throw error
  if (!data || data.length === 0) return []

  const maps = await ladeKatalogMaps(s, data.map(r => String((r as { id: string }).id)))

  return (data ?? []).map(r => {
    const roh = r as unknown as SupplementRoh
    return katalogAusNeu(roh, maps.kategorien, maps.dosing, maps.evidence)
  })
}
