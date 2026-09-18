// Supplemente in der Mahlzeit — Lese- und Schreibweg, G-475.
//
// `[read]` **Zwei Schemata in einem Weg:** die Produkte liegen in
// `supplements`, der Posten in `nutrition`. `[read]` **Session-Client,
// kein Service-Client** — die Zeilenrechte sind die Sperre.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import {
  DOPPELT_MINUTEN,
  type NaehrwertStand, type PortionsWahl,
  type SupplementPosten, type SupplementTreffer,
} from './supplement-posten-lage'

function s(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}
function n(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim()) {
    const z = Number(v)
    return Number.isFinite(z) ? z : null
  }
  return null
}

/**
 * Die Naehrwertspalten der Portionsoption — in DERSELBEN Reihenfolge,
 * in der der Trigger sie prueft.
 *
 * `[cmd]` **Neun Makros plus 22 Mikronaehrstoffe** (gemessen am
 * Triggerrumpf 2026-09-18). `[read]` **Fehlt einer, wirft die
 * Datenbank** — *„snapshot differs from its evidenced product
 * serving"*.
 */
const MAKROS = [
  'enercc', 'prot625', 'fat', 'cho', 'fibt',
  'sugar', 'fasat', 'nacl', 'water_g',
] as const

/**
 * Die Mikronaehrstoffe: Spalte der Option -> Schluessel in `nutrients`.
 *
 * `[cmd]` **Die Namen stehen im Trigger** — `vita_ug` wird zu `VITA`,
 * `na_mg` zu `NA`. `[read]` **Nicht abgeleitet, sondern abgeschrieben**
 * (`id_ug` -> `ID`, nicht `IOD`).
 */
const MIKRO: ReadonlyArray<readonly [string, string]> = [
  ['alc', 'ALC'], ['vita_ug', 'VITA'], ['vitd_ug', 'VITD'],
  ['vite_mg', 'VITE'], ['vitk_ug', 'VITK'], ['vitc_mg', 'VITC'],
  ['thia_mg', 'THIA'], ['ribf_mg', 'RIBF'], ['nia_mg', 'NIA'],
  ['vitb6_ug', 'VITB6'], ['vitb12_ug', 'VITB12'], ['na_mg', 'NA'],
  ['k_mg', 'K'], ['ca_mg', 'CA'], ['mg_mg', 'MG'], ['p_mg', 'P'],
  ['fe_mg', 'FE'], ['zn_mg', 'ZN'], ['id_ug', 'ID'],
  ['cu_ug', 'CU'], ['mn_ug', 'MN'],
]

const OPTION_SPALTEN = [
  'product_id', 'serving_size',
  ...MAKROS,
  ...MIKRO.map(([spalte]) => spalte),
].join(',')

export type SucheStand = { treffer: SupplementTreffer[]; fehler: string | null }

/**
 * Produkte suchen, mit ihren Portionsgroessen.
 *
 * `[read]` **Die Portionen kommen MIT** — ohne sie weiss die
 * Oberflaeche nicht, ob ein Produkt Naehrwerte hat (A5) und welche
 * Wahl sie anbieten darf (A4).
 */
export async function sucheSupplemente(
  frage: string, grenze = 20,
): Promise<SucheStand> {
  const q = frage.trim()
  if (!q) return { treffer: [], fehler: null }
  try {
    const c = createSessionClient().schema('supplements')
    const { data, error } = await c
      .from('supplier_products')
      .select('id,name_en,marke')
      .ilike('name_en', `%${q}%`)
      .eq('market_status', 'On Market')
      .order('name_en', { ascending: true })
      .limit(grenze)
    if (error) return { treffer: [], fehler: error.message }

    const roh = (Array.isArray(data) ? data : []) as Array<Record<string, unknown>>
    const ids = roh.flatMap(r => s(r.id) ?? [])
    if (ids.length === 0) return { treffer: [], fehler: null }

    // `[cmd]` **`.in()` kippt um 200 Ids** (G-64) — 20 Treffer sind
    // weit darunter, und die Grenze steht in der Signatur.
    const { data: opt, error: oFehler } = await c
      .from('supplier_product_nutrient_serving_options')
      .select(OPTION_SPALTEN)
      .in('product_id', ids)
    if (oFehler) return { treffer: [], fehler: oFehler.message }

    const nachProdukt = new Map<string, PortionsWahl[]>()
    for (const r of (Array.isArray(opt) ? opt : []) as unknown as Array<Record<string, unknown>>) {
      const pid = s(r.product_id)
      const groesse = s(r.serving_size)
      if (!pid || !groesse) continue
      const liste = nachProdukt.get(pid) ?? []
      liste.push({
        serving_size: groesse,
        enercc: n(r.enercc), prot625: n(r.prot625),
        fat: n(r.fat), cho: n(r.cho),
      })
      nachProdukt.set(pid, liste)
    }

    return {
      treffer: roh.flatMap(r => {
        const id = s(r.id)
        const name = s(r.name_en)
        if (!id || !name) return []
        return [{
          product_id: id,
          name,
          marke: s(r.marke),
          // `[read]` **Leer heisst: keine gemessenen Naehrwerte** —
          // das ist eine Auskunft, kein Fehler (A5).
          portionen: (nachProdukt.get(id) ?? [])
            .sort((a, b) => a.serving_size.localeCompare(b.serving_size)),
        }]
      }),
      fehler: null,
    }
  } catch (e) {
    return { treffer: [], fehler: e instanceof Error ? e.message : String(e) }
  }
}

export type SchreibErgebnis = { ok: true; id: string } | { ok: false; fehler: string }

/**
 * Einen Supplementposten anlegen.
 *
 * ══ DER SCHNAPPSCHUSS WIRD GESCHRIEBEN, NICHT GERECHNET ═════════════
 *
 * `[cmd]` **Der Trigger PRUEFT jeden Wert gegen `Option x Anzahl`**
 * und wirft bei jeder Abweichung. `[read]` **Deshalb werden die
 * Werte DER OPTION geholt und mit der Anzahl multipliziert** — an
 * dieser einen Stelle, nirgends sonst.
 */
export async function legeSupplementPostenAn(
  p: SupplementPosten,
): Promise<SchreibErgebnis> {
  try {
    const c = createSessionClient()
    const { data: { user } } = await c.auth.getUser()
    if (!user) return { ok: false, fehler: 'Keine angemeldete Sitzung.' }

    const grund: Record<string, unknown> = {
      meal_id: p.meal_id,
      user_id: user.id,
      food_source: 'supplement',
      food_name: p.food_name,
      // `[cmd]` **MUSS NULL sein** — `meal_items_amount_g_check`.
      amount_g: null,
      food_id: null,
      custom_food_id: null,
      portion_name: null, portion_quantity: null, portion_amount_g: null,
      supplement_product_id: p.product_id,
      supplement_serving_size: p.serving_size,
      supplement_serving_quantity: p.serving_quantity,
      supplement_nutrient_status: p.nutrient_status,
    }

    if (p.nutrient_status === 'no_nutrients_available') {
      // `[cmd]` **Der Trigger verlangt: kein `serving_size`, KEIN
      // Naehrwert, `nutrients = {}`** — sonst *„must remain visibly
      // unknown"*.
      grund.supplement_serving_size = null
      for (const m of MAKROS) grund[m] = null
      grund.nutrients = {}
    } else {
      const { data: opt, error } = await c.schema('supplements')
        .from('supplier_product_nutrient_serving_options')
        .select(OPTION_SPALTEN)
        .eq('product_id', p.product_id)
        .eq('serving_size', p.serving_size ?? '')
        .maybeSingle()
      if (error) return { ok: false, fehler: error.message }
      if (!opt) {
        return { ok: false, fehler: 'Diese Portionsgröße gibt es für das Produkt nicht.' }
      }
      const o = opt as unknown as Record<string, unknown>
      const mal = (v: unknown) => {
        const z = n(v)
        return z === null ? null : z * p.serving_quantity
      }
      for (const m of MAKROS) grund[m] = mal(o[m])
      // `[cmd]` **`jsonb_strip_nulls` im Trigger** — also duerfen
      // hier keine `null` stehen, sonst weicht das Objekt ab.
      const mikro: Record<string, number> = {}
      for (const [spalte, schluessel] of MIKRO) {
        const z = mal(o[spalte])
        if (z !== null) mikro[schluessel] = z
      }
      grund.nutrients = mikro
    }

    const { data, error } = await c.schema('nutrition')
      .from('meal_items').insert(grund).select('id').maybeSingle()
    if (error) {
      // `[read]` **Die Meldung des Triggers ist fuer Entwickler** —
      // der Nutzer bekommt einen Satz.
      if (error.message.includes('C513')) {
        return {
          ok: false,
          fehler: 'Die Nährwerte passen nicht zur gewählten Portion. '
            + 'Bitte Portionsgröße neu wählen.',
        }
      }
      return { ok: false, fehler: error.message }
    }
    const id = s((data as Record<string, unknown> | null)?.id)
    return id ? { ok: true, id } : { ok: false, fehler: 'Kein Posten angelegt.' }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}
