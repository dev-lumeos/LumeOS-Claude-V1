// Lese-I/O fuer die Substanzdatenbank (C-224).
//
// `[cmd]` `supplements.substance_catalog` traegt 566 Zeilen, davon 290
// aus der Kimi-Recherche (`domain='kimi_supplement'`) — und wurde von
// `apps/web` bis C-224 NULL MAL gelesen. Der Stack liest daneben die
// aeltere `supplement_catalog` (44 Zeilen); die bleibt unberuehrt, die
// Ablesung der beiden Tabellen gegeneinander ist ein eigener Punkt.
//
// **Liste und Einzelsatz sind getrennt** — die Liste braucht fuenf
// Spalten, das Detail alle. Der Einzelsatz liest `select('*')` und ist
// damit tolerant gegen den Spaltenstand: `[cmd]` die Pipeline traegt
// seit c9c741f 60 Spalten (safety, regulatory, interactions, quality,
// warning_triggers, evidence_provenance …); was der Live-Stand davon
// fuehrt, kommt an, was fehlt, bleibt `undefined` — und die Anzeige
// zeigt dann nichts, keinen Platzhalter.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

/** Ein Herkunftsvermerk aus `evidence_provenance` — je Feldpfad. */
export type Herkunft = {
  source_id: string
  evidence_class: string
  as_of: string
}

/** Schlanke Zeile fuer die Katalogliste. */
export type SubstanzListenEintrag = {
  id: string
  name: string
  domain: string
  compound_type: string | null
  category: string | null
  /**
   * C-227: die kanonische Kategorie aus C-197 — `null`, solange die
   * Spalte live fehlt (C-226) oder die Zeile keinen Kimi-Satz hat.
   */
  canonical_category: string | null
  /**
   * C-229: die Kurzbeschreibung („was ist das ueberhaupt") und die
   * Gruppe (supplement · peptide · enhanced) aus C-228. `[cmd]` Die
   * Spalte heisst `gruppe` (Nachtrag 2026-08-23; live gemessen:
   * supplement 307 · enhanced 177 · peptide 82).
   */
  description: string | null
  gruppe: string | null
  /** `evidence.overall_grade`, wenn vorhanden — sonst null. */
  grad: string | null
}

/**
 * Der volle Satz. Alle Tiefen-Bloecke sind optional — sie fehlen,
 * solange der Pipeline-Lauf c9c741f nicht live eingespielt ist, und
 * sie fehlen je Substanz, wo die Recherche nichts hergab.
 */
export type SubstanzSatz = {
  id: string
  canonical_name: string
  domain: string
  compound_type: string | null
  category: string | null
  subcategory: string | null
  chemical_form: string | null
  aliases: string[]
  cas_number: string | null
  external_ids: Record<string, unknown> | null
  evidence: Record<string, unknown> | null
  dosing: Record<string, unknown> | null
  pharmacology: Record<string, unknown> | null
  half_life: unknown
  half_life_status: string | null
  cyp: Record<string, unknown> | null
  // — die 60-Spalten-Tiefe (c9c741f), live erst nach dem Pipeline-Lauf —
  canonical_category?: string | null
  canonical_compound_type?: string | null
  canonical_routes?: string[] | null
  /** C-228: „was ist das ueberhaupt" und die Gruppe (Spalte `gruppe`). */
  description?: string | null
  gruppe?: string | null
  safety?: Record<string, unknown> | null
  interactions?: Record<string, unknown> | null
  regulatory?: Record<string, unknown> | null
  quality?: Record<string, unknown> | null
  warning_triggers?: Record<string, unknown> | null
  evidence_provenance?: Record<string, Herkunft> | null
  wada_status?: string | null
  prescription_required?: boolean | null
  dose_ceiling_value?: number | null
  dose_ceiling_unit?: string | null
  missing_fields?: unknown[] | null
  missing_reason?: Record<string, unknown> | null
  last_verified?: string | null
  confidence?: number | null
  source_count?: number | null
  unii?: string | null
  pubchem_cid?: number | null
  chembl_id?: string | null
  inchikey?: string | null
  molecular_formula?: string | null
  molecular_weight?: number | null
  peptide_sequence?: string | null
}

export type EigenerStack = { id: string; name: string; is_active: boolean }

/**
 * Die Liste fuer den Katalog — 566 Zeilen, fuenf Spalten plus
 * `evidence` fuer den Grad.
 */
export async function ladeSubstanzListe(): Promise<SubstanzListenEintrag[]> {
  const s = createSessionClient().schema('supplements')
  // C-227/C-229: neuere Spalten zuerst — kennt der Live-Stand eine
  // noch nicht (Pipeline-Lauf steht aus), wird SIE gestrichen und
  // erneut gefragt, statt die ganze Liste zu verlieren.
  const basis = ['id', 'canonical_name', 'domain', 'compound_type', 'category', 'evidence']
  const neuere = ['canonical_category', 'description', 'gruppe']
  let spalten = basis.concat(neuere)
  let data: unknown[] | null = null
  let error: { message: string } | null = null
  for (let versuch = 0; versuch <= neuere.length; versuch++) {
    const r = await s
      .from('substance_catalog')
      .select(spalten.join(', '))
      .eq('is_active', true)
      .order('canonical_name')
    data = r.data
    error = r.error
    if (!error) break
    const fehlend = neuere.find(sp => error && error.message.includes(sp) && spalten.includes(sp))
    if (!fehlend) break
    spalten = spalten.filter(sp => sp !== fehlend)
  }
  if (error) throw new Error(error.message)
  return (data ?? []).map(r => {
    const x = r as unknown as Record<string, unknown>
    const ev = (x.evidence ?? null) as Record<string, unknown> | null
    const grad = ev?.overall_grade
    return {
      id: String(x.id),
      name: String(x.canonical_name),
      domain: String(x.domain),
      compound_type: (x.compound_type as string) ?? null,
      category: (x.category as string) ?? null,
      canonical_category: (x.canonical_category as string) ?? null,
      description: (x.description as string) ?? null,
      gruppe: (x.gruppe as string) ?? null,
      grad: typeof grad === 'string' && grad ? grad : null,
    }
  })
}

/** Der Einzelsatz fuer das Detail — alle Spalten, die es live gibt. */
export async function ladeSubstanz(id: string): Promise<SubstanzSatz | null> {
  const s = createSessionClient().schema('supplements')
  const { data, error } = await s
    .from('substance_catalog')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const x = data as unknown as Record<string, unknown>
  return {
    ...x,
    id: String(x.id),
    canonical_name: String(x.canonical_name),
    domain: String(x.domain),
    aliases: (x.aliases as string[]) ?? [],
  } as SubstanzSatz
}

/**
 * Die eigenen Stacks — fuer die Zuteilung „zu gewaehltem Stack".
 * `[cmd]` Die Zeilenrechte begrenzen auf `user_id = auth.uid()`.
 */
export async function ladeEigeneStacks(): Promise<EigenerStack[]> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []
  const { data, error } = await client.schema('supplements')
    .from('user_stacks')
    .select('id, name, is_active')
    .order('is_active', { ascending: false })
  if (error) return []
  return (data ?? []).map(r => {
    const x = r as unknown as Record<string, unknown>
    return {
      id: String(x.id),
      name: String(x.name),
      is_active: x.is_active === true,
    }
  })
}
