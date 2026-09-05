// ════════════════════════════════════════════════════════════════════
// LESEWEG: DIE EINKAUFSLISTEN — G-345
// ════════════════════════════════════════════════════════════════════
//
// **E-64, 2026-09-07:** die Einkaufsliste gehoert an die Planwoche.
//
// `[cmd]` **C-407 hat den Leseweg gebaut** — vier Funktionen:
//
//     shopping_list_from_meal_plan_week(week_id, name)  erzeugen
//     shopping_list_read(list_id)                       lesen
//     shopping_list_archive(list_id)                    archivieren
//     shopping_list_items_owner_guard                   Wachhund
//
// `[cmd]` **Gemessen am 2026-09-07: drei Listen auf `dev`**, alle
// `source_type = 'recipe'`, zusammen 11 Posten, keiner abgehakt.
// **Niemand zeigte sie.**
//
// `[cmd]` **Es gibt KEINE Funktion, die alle Listen aufzaehlt** —
// `shopping_list_read` nimmt genau eine Kennung. **Die Uebersicht
// liest deshalb direkt aus der Tabelle**, mit einem `select` je
// Reiteraufruf; die Zeilensicherheit greift ueber die Sitzung.
//
// `[read]` **Laeuft ausschliesslich serverseitig.**
import { createSessionClient } from '@lumeos/shared/session'

/** Ein Posten einer Einkaufsliste. */
export type EinkaufsPosten = {
  id: string
  sort_order: number
  /** `bls` · `custom` · `manual` — woher der Name stammt. */
  item_source: string
  food_id: string | null
  food_name: string
  /** Gramm, wenn die Quelle sie kennt. */
  amount_g: number | null
  /** Stueckzahl, wenn statt Gramm gezaehlt wird. */
  quantity: number | null
  unit_display: string
  is_checked: boolean
  notes: string | null
}

/**
 * Eine Einkaufsliste mit ihren Posten.
 *
 * `[cmd]` **`status` kennt DREI Werte** (CHECK, gemessen 2026-09-07):
 * `open`, `completed`, `archived`.
 *
 * `[read]` **Der Auftrag nannte zwei** — `completed` steht dazwischen:
 * abgearbeitet, aber noch nicht weggeraeumt.
 */
export type Einkaufsliste = {
  id: string
  name: string
  /** `manual` · `recipe` · `meal_plan` · `supplement_reorder`. */
  source_type: string
  status: string
  servings: number
  recipe_id: string | null
  meal_plan_week_id: string | null
  created_at: string
  posten: EinkaufsPosten[]
}

/** Der Kopf einer Liste, ohne ihre Posten — fuer die Uebersicht. */
export type EinkaufslisteKurz = {
  id: string
  name: string
  source_type: string
  status: string
  created_at: string
  posten: number
  abgehakt: number
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

/**
 * Alle Listen des Nutzers, neueste zuerst — G-345.
 *
 * `[read]` **Offene UND archivierte**, denn der Reiter zeigt beide.
 * **Das Aussortieren macht die Anzeige**, nicht die Abfrage: wer
 * archivierte Listen sucht, soll sie finden.
 *
 * `[cmd]` **Die Postenzahl kommt aus einer zweiten Abfrage**, nicht
 * aus einer Schleife je Liste. **Bei drei Listen waere beides
 * gleich; bei dreissig nicht** (G-252: kein `await` je Zeile).
 */
export async function ladeEinkaufslisten(): Promise<EinkaufslisteKurz[]> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []
  const db = client.schema('nutrition')

  const { data: kopfRoh, error } = await db
    .from('shopping_lists')
    .select('id, name, source_type, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return []

  const koepfe = (kopfRoh ?? []) as unknown as Array<Record<string, unknown>>
  if (koepfe.length === 0) return []

  // `[read]` **Eine Abfrage fuer ALLE Posten**, danach im Speicher
  // gruppiert — nicht je Liste eine.
  const ids = koepfe.map(k => text(k.id)).filter((v): v is string => v !== null)
  const { data: postenRoh } = await db
    .from('shopping_list_items')
    .select('shopping_list_id, is_checked')
    .in('shopping_list_id', ids)
    .limit(2000)

  const gesamt = new Map<string, number>()
  const geprueft = new Map<string, number>()
  for (const p of (postenRoh ?? []) as unknown as Array<Record<string, unknown>>) {
    const k = text(p.shopping_list_id)
    if (!k) continue
    gesamt.set(k, (gesamt.get(k) ?? 0) + 1)
    if (p.is_checked === true) geprueft.set(k, (geprueft.get(k) ?? 0) + 1)
  }

  return koepfe.map(k => {
    const id = text(k.id) ?? ''
    return {
      id,
      name: text(k.name) ?? '(ohne Namen)',
      source_type: text(k.source_type) ?? 'manual',
      status: text(k.status) ?? 'open',
      created_at: text(k.created_at) ?? '',
      posten: gesamt.get(id) ?? 0,
      abgehakt: geprueft.get(id) ?? 0,
    }
  })
}

/**
 * Eine Liste mit ihren Posten — ueber `shopping_list_read` (C-407).
 *
 * `[cmd]` **Die Funktion gibt EIN `jsonb` zurueck**, keine Zeilen.
 * `[read]` **Ein `count(*)` darueber waere immer 1** — die Zahl der
 * Posten steht im Feld `items`.
 *
 * `[read]` **`null`, wenn es sie nicht gibt oder sie einem anderen
 * gehoert** — die Funktion prueft den Eigentuemer selbst.
 */
export async function ladeEinkaufsliste(
  id: string,
): Promise<Einkaufsliste | null> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null

  const { data, error } = await client
    .schema('nutrition')
    .rpc('shopping_list_read', { p_shopping_list_id: id })
  if (error || !data) return null

  const l = data as Record<string, unknown>
  const roh = Array.isArray(l.items)
    ? (l.items as Array<Record<string, unknown>>)
    : []

  return {
    id: text(l.id) ?? id,
    name: text(l.name) ?? '(ohne Namen)',
    source_type: text(l.source_type) ?? 'manual',
    status: text(l.status) ?? 'open',
    servings: zahl(l.servings) ?? 1,
    recipe_id: text(l.recipe_id),
    meal_plan_week_id: text(l.meal_plan_week_id),
    created_at: text(l.created_at) ?? '',
    posten: roh
      .map(p => ({
        id: text(p.id) ?? '',
        sort_order: zahl(p.sort_order) ?? 0,
        item_source: text(p.item_source) ?? 'manual',
        food_id: text(p.food_id),
        food_name: text(p.food_name) ?? '(ohne Namen)',
        amount_g: zahl(p.amount_g),
        quantity: zahl(p.quantity),
        unit_display: text(p.unit_display) ?? 'g',
        is_checked: p.is_checked === true,
        notes: text(p.notes),
      }))
      .sort((a, b) => a.sort_order - b.sort_order),
  }
}

/**
 * Die Liste zu einer Planwoche, falls es schon eine gibt — G-345.
 *
 * `[read]` **Damit der Knopf an der Woche weiss, ob er *erzeugen*
 * oder *oeffnen* heisst.** `[cmd]` **Archivierte zaehlen nicht** —
 * wer eine Woche neu einkauft, bekommt eine neue Liste.
 */
export async function ladeWochenliste(
  wocheId: string,
): Promise<EinkaufslisteKurz | null> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null

  const { data, error } = await client
    .schema('nutrition')
    .from('shopping_lists')
    .select('id, name, source_type, status, created_at')
    .eq('user_id', user.id)
    .eq('meal_plan_week_id', wocheId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .limit(1)
  if (error || !data || data.length === 0) return null

  const k = data[0] as unknown as Record<string, unknown>
  return {
    id: text(k.id) ?? '',
    name: text(k.name) ?? '(ohne Namen)',
    source_type: text(k.source_type) ?? 'meal_plan',
    status: text(k.status) ?? 'open',
    created_at: text(k.created_at) ?? '',
    posten: 0,
    abgehakt: 0,
  }
}
