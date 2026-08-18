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

/** Ein Eintrag des kuratierten Katalogs (`supplement_catalog`). */
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

/**
 * Die abgeleiteten Werte einer Position.
 *
 * `[cmd]` Alle vier Positionen auf `dev@lumeos.app` fuehren
 * `serving_size`, und alle 44 Katalogeintraege fuehren
 * `cost_per_serving` — die Rechnung geht also auf. Sie bleibt
 * trotzdem defensiv: fehlt eine der Zahlen, ist das Ergebnis `null`
 * und die Anzeige zeigt einen Strich statt einer erfundenen Zahl.
 */
export function ableiten(
  dose: number,
  stock: number | null,
  schwelle: number | null,
  k: { serving_size: number | null; cost_per_serving: number | null } | null,
): Pick<StackPosition, 'portionen_pro_tag' | 'kosten_pro_tag' | 'tage_bis_leer' | 'unter_schwelle'> {
  const portion = k?.serving_size ?? null
  const proTag = portion != null && portion > 0 ? dose / portion : null
  const preis = k?.cost_per_serving ?? null
  return {
    portionen_pro_tag: proTag,
    kosten_pro_tag: proTag != null && preis != null ? proTag * preis : null,
    tage_bis_leer: stock != null && proTag != null && proTag > 0 ? stock / proTag : null,
    unter_schwelle: stock != null && schwelle != null ? stock <= schwelle : null,
  }
}

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
    const { data: items } = await s
      .from('stack_items')
      .select(`
        id, dose, dose_unit, timing, frequency, sort_order, is_active,
        stock_remaining, stock_unit, low_stock_threshold, custom_name,
        supplement_catalog:supplement_id (
          id, slug, name, category, evidence_grade, evidence_summary,
          typical_dose_min, typical_dose_max, dose_unit, serving_size,
          serving_unit, cost_per_serving, timing_default, requires_food,
          priority, benefits
        )
      `)
      .eq('stack_id', stack.id)
      .eq('is_active', true)
      .order('sort_order')

    positionen = (items ?? []).map(r => {
      const roh = r as unknown as Record<string, unknown>
      // PostgREST liefert die eingebettete Zeile je nach Beziehung als
      // Objekt oder als Einerliste — beides abfangen.
      const kr = roh.supplement_catalog
      const kobj = (Array.isArray(kr) ? kr[0] : kr) as Record<string, unknown> | null
      const katalog: KatalogEintrag | null = kobj ? {
        id: String(kobj.id),
        slug: String(kobj.slug),
        name: String(kobj.name),
        category: String(kobj.category),
        evidence_grade: String(kobj.evidence_grade),
        evidence_summary: (kobj.evidence_summary as string) ?? null,
        typical_dose_min: zahl(kobj.typical_dose_min),
        typical_dose_max: zahl(kobj.typical_dose_max),
        dose_unit: (kobj.dose_unit as string) ?? null,
        serving_size: zahl(kobj.serving_size),
        serving_unit: (kobj.serving_unit as string) ?? null,
        cost_per_serving: zahl(kobj.cost_per_serving),
        timing_default: String(kobj.timing_default ?? 'any'),
        requires_food: kobj.requires_food === true,
        priority: String(kobj.priority ?? 'nice_to_have'),
        benefits: Array.isArray(kobj.benefits) ? (kobj.benefits as string[]) : [],
      } : null

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
        ...ableiten(dose, stock, schwelle, katalog),
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
    .from('supplement_catalog')
    .select('*', { count: 'exact', head: true })

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

  const { data } = await supabase
    .schema('supplements')
    .from('supplement_catalog')
    .select('id,slug,name,category,evidence_grade,evidence_summary,'
      + 'typical_dose_min,typical_dose_max,dose_unit,serving_size,serving_unit,'
      + 'cost_per_serving,timing_default,requires_food,priority,benefits')
    .order('name')

  return (data ?? []).map(r => {
    const roh = r as unknown as Record<string, unknown>
    return {
      id: String(roh.id),
      slug: String(roh.slug),
      name: String(roh.name),
      category: String(roh.category),
      evidence_grade: String(roh.evidence_grade),
      evidence_summary: (roh.evidence_summary as string) ?? null,
      typical_dose_min: zahl(roh.typical_dose_min),
      typical_dose_max: zahl(roh.typical_dose_max),
      dose_unit: (roh.dose_unit as string) ?? null,
      serving_size: zahl(roh.serving_size),
      serving_unit: (roh.serving_unit as string) ?? null,
      cost_per_serving: zahl(roh.cost_per_serving),
      timing_default: String(roh.timing_default ?? 'any'),
      requires_food: roh.requires_food === true,
      priority: String(roh.priority ?? 'nice_to_have'),
      benefits: Array.isArray(roh.benefits) ? (roh.benefits as string[]) : [],
    }
  })
}
