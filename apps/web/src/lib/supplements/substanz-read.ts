// Lese-I/O fuer die Substanzdatenbank.
//
// ── C-252: umgestellt auf den neuen Katalog (2026-08-23) ────────────
//
// `[cmd]` **Gelesen wird jetzt `supplements.supplements`** (566 Zeilen,
// 17 Spalten) plus die Detailtabellen — nicht mehr die Breittabelle
// `supplements.substance_catalog` (566 Zeilen, 67 flache Spalten).
// Beide stehen noch nebeneinander; das Loeschen der alten ist Schritt 5.
//
// ── DIE SICHTBARKEITSREGEL ──────────────────────────────────────────
//
// `[cmd]` **`im_katalog` ist eine generierte Spalte** (C-243) und
// entscheidet, was in den Katalog gehoert: **290 true, 276 false**
// (gemessen 2026-08-23). Die 276 tragen weder Beschreibung noch
// Evidenzgrad. **Ohne `.eq('im_katalog', true)` stehen 566 Eintraege
// in der Liste, davon 276 leer.**
//
// ── DIE BRUECKE ZUR ALTEN TABELLE ───────────────────────────────────
//
// `[cmd]` **`supplements.slug` ist die alte `substance_catalog.id`** —
// bei allen 566 identisch (gemessen 2026-08-23). Die IDs selbst sind
// NICHT vergleichbar: alt ist `text`, neu ist `uuid`.
//
// `[read]` **Deshalb traegt der Listeneintrag beides.** Der Anker
// `substance_catalog:<id>`, den der Stack in `notes` schreibt, bleibt
// damit gueltig, ohne dass `stack-read`/`stack-write` angefasst werden
// muessen (die gehoeren C-250). `[cmd]` Live traegt ohnehin **0 von 11
// `stack_items`** einen Anker.
//
// ── DEUTSCH IST LEER, UEBERALL ──────────────────────────────────────
//
// `[cmd]` **Gemessen am 2026-08-23: JEDE `*_de`-Freitextspalte des
// Schemas ist leer** — `name_de` 0/566, `description_de` 0/290,
// `summary_de` 0/288, `pregnancy_note_de` 0/237, `storage_de` 0/54,
// `metabolism_de` 0/290. Gefuellt ist durchweg `*_en`. Einzige
// Ausnahme sind die drei handgepflegten `supplement_groups.label_de`.
//
// `[read]` **Darum `text()` auf jedem Textfeld**, nicht nur beim Namen:
// erst `de`, dann `en`. Das ist laut Spec so gewollt, bis uebersetzt
// ist — es ist kein Datenfehler und wird nicht als Luecke gemeldet.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

/**
 * Der Anzeigetext: deutsch, wenn es ihn gibt — sonst englisch.
 *
 * `[cmd]` Praktisch immer englisch (Messung im Kopf dieser Datei).
 * `name_de` ist bei allen 566 `NULL`, nicht `''` — `NULLIF` allein
 * traefe das nicht, deshalb beides.
 */
function text(de: unknown, en: unknown): string | null {
  const d = typeof de === 'string' ? de.trim() : ''
  if (d) return d
  const e = typeof en === 'string' ? en.trim() : ''
  return e || null
}

/** Ein Herkunftsvermerk aus `evidence_provenance` — je Feldpfad. */
export type Herkunft = {
  source_id: string
  evidence_class: string
  as_of: string
}

/** Schlanke Zeile fuer die Katalogliste. */
export type SubstanzListenEintrag = {
  id: string
  /**
   * C-252: die alte `substance_catalog.id`. Traegt den Anker, den der
   * Stack in `notes` schreibt — die neue `id` ist ein UUID und passt
   * dort nicht.
   */
  slug: string
  name: string
  domain: string
  compound_type: string | null
  category: string | null
  /** Die Kategorie aus `supplement_categories` (23 Zeilen). */
  canonical_category: string | null
  /**
   * Die Kurzbeschreibung und die Gruppe (`supplement` · `enhanced` ·
   * `peptide`) aus `supplement_groups`. `[cmd]` Gemessen 2026-08-23
   * ueber die 290 sichtbaren: Beschreibung 290, Gruppe 290.
   */
  description: string | null
  gruppe: string | null
  /** `supplements.evidence_grade` — bei allen 290 gesetzt (A–F). */
  grad: string | null
}

/**
 * Der volle Satz. Alle Tiefen-Bloecke sind optional — sie fehlen,
 * solange der Pipeline-Lauf c9c741f nicht live eingespielt ist, und
 * sie fehlen je Substanz, wo die Recherche nichts hergab.
 */
export type SubstanzSatz = {
  id: string
  /** C-252: die alte `substance_catalog.id`, siehe Dateikopf. */
  slug?: string
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

// C-252: die Luecken stehen serverfrei in `substanz-luecken.ts` —
// `substanz-detail.tsx` ist ein Client und darf aus dieser Datei nur
// Typen importieren (A-30). Hier nur weitergereicht.
export { OHNE_QUELLE, type OhneQuelle } from './substanz-luecken'

/**
 * Die Liste fuer den Katalog.
 *
 * `[cmd]` **290 Eintraege, nicht 566** — `im_katalog` haelt die 276
 * Zeilen ohne Beschreibung und ohne Evidenzgrad draussen (C-243).
 * Gegengeprobt am 2026-08-23: ohne den Filter sind es 566.
 *
 * `[read]` **Kategorie und Gruppe kommen ueber die Fremdschluessel**,
 * nicht aus einer Textspalte — `supplement_categories` (23) und
 * `supplement_groups` (3) fuehren die Beschriftungen einmal, statt sie
 * je Zeile zu wiederholen.
 */
export async function ladeSubstanzListe(): Promise<SubstanzListenEintrag[]> {
  const s = createSessionClient().schema('supplements')
  const { data, error } = await s
    .from('supplements')
    .select(
      'id, slug, name_de, name_en, description_de, description_en, form,'
      + ' evidence_grade, source,'
      + ' supplement_categories(name_de, name_en),'
      + ' supplement_groups(code, label_de, label_en)')
    .eq('im_katalog', true)
    .order('sort_order')
    .order('name_en')
  if (error) throw new Error(error.message)
  return (data ?? []).map(r => {
    const x = r as unknown as Record<string, unknown>
    const kat = (x.supplement_categories ?? null) as Record<string, unknown> | null
    const grp = (x.supplement_groups ?? null) as Record<string, unknown> | null
    return {
      id: String(x.id),
      slug: String(x.slug ?? ''),
      // `[read]` Der Name faellt nie weg: `name_en` ist bei allen 566
      // gefuellt (gemessen), `name_de` bei keinem.
      name: text(x.name_de, x.name_en) ?? String(x.slug ?? ''),
      domain: String(x.source ?? ''),
      compound_type: text(null, x.form),
      category: text(kat?.name_de, kat?.name_en),
      canonical_category: text(kat?.name_de, kat?.name_en),
      description: text(x.description_de, x.description_en),
      // `[read]` Die Gruppe wird als `code` gefuehrt, nicht als Label —
      // `filtereGruppe` vergleicht gegen `supplement`/`enhanced`/
      // `peptide`, und die Beschriftung ist Sache der Anzeige.
      gruppe: typeof grp?.code === 'string' ? grp.code : null,
      grad: typeof x.evidence_grade === 'string' && x.evidence_grade
        ? x.evidence_grade : null,
    }
  })
}

/**
 * Der Einzelsatz fuer das Detail — aus dem Kopfsatz und den
 * Detailtabellen zusammengesetzt.
 *
 * `[read]` **Die Form von `SubstanzSatz` bleibt, wie sie war.** Die
 * Anzeige (`substanz-anzeige.ts`) baut daraus ihre Bloecke und laesst
 * jedes leere Feld weg — sie muss dafuer nicht wissen, dass die Werte
 * jetzt aus zehn Tabellen statt aus einer Zeile kommen.
 *
 * `[cmd]` **Angenommen wird `id` (uuid) ODER `slug`** (die alte
 * `substance_catalog.id`). Beides, weil der Stack-Anker in `notes` den
 * Slug traegt und die alten IDs `text` sind.
 */
export async function ladeSubstanz(id: string): Promise<SubstanzSatz | null> {
  const s = createSessionClient().schema('supplements')
  const istUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data, error } = await s
    .from('supplements')
    .select(
      '*,'
      + ' supplement_categories(name_de, name_en),'
      + ' supplement_groups(code, label_de, label_en),'
      + ' supplement_dosing(*), supplement_pharmacology(*),'
      + ' supplement_safety(*), supplement_evidence(*),'
      + ' supplement_regulatory(*), supplement_quality(*),'
      + ' supplement_interactions(*), supplement_monitoring(*),'
      + ' supplement_identifiers(*), supplement_aliases(alias),'
      + ' supplement_field_sources(field_name, source_id, as_of, evidence_class)')
    .eq(istUuid ? 'id' : 'slug', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const x = data as unknown as Record<string, unknown>

  const kat = (x.supplement_categories ?? null) as Record<string, unknown> | null
  const grp = (x.supplement_groups ?? null) as Record<string, unknown> | null
  const dos = ersteZeile(x.supplement_dosing)
  const pha = ersteZeile(x.supplement_pharmacology)
  const saf = ersteZeile(x.supplement_safety)
  const evi = ersteZeile(x.supplement_evidence)
  const reg = ersteZeile(x.supplement_regulatory)
  const qua = ersteZeile(x.supplement_quality)

  return {
    id: String(x.id),
    slug: String(x.slug ?? ''),
    canonical_name: text(x.name_de, x.name_en) ?? String(x.slug ?? ''),
    domain: String(x.source ?? ''),
    compound_type: text(null, x.form),
    category: text(kat?.name_de, kat?.name_en),
    subcategory: null,
    chemical_form: text(null, x.form),
    aliases: alleAliasse(x.supplement_aliases),
    cas_number: kennung(x.supplement_identifiers, 'cas'),
    external_ids: kennungen(x.supplement_identifiers),
    evidence: blockOhneMeta(evi),
    dosing: blockOhneMeta(dos),
    pharmacology: blockOhneMeta(pha),
    half_life: pha?.half_life ?? null,
    half_life_status: (pha?.status as string) ?? null,
    cyp: null,
    canonical_category: text(kat?.name_de, kat?.name_en),
    canonical_compound_type: text(null, x.form),
    canonical_routes: pha?.route ? [String(pha.route)] : null,
    description: text(x.description_de, x.description_en),
    gruppe: typeof grp?.code === 'string' ? grp.code : null,
    safety: blockOhneMeta(saf),
    interactions: alleZeilen(x.supplement_interactions),
    regulatory: blockOhneMeta(reg),
    quality: blockOhneMeta(qua),
    warning_triggers: null,
    evidence_provenance: feldQuellen(x.supplement_field_sources),
    prescription_required: (reg?.prescription_required as boolean) ?? null,
    dose_ceiling_value: null,
    dose_ceiling_unit: (dos?.dose_unit as string) ?? null,
    last_verified: null,
    unii: kennung(x.supplement_identifiers, 'unii'),
    chembl_id: kennung(x.supplement_identifiers, 'chembl'),
    inchikey: kennung(x.supplement_identifiers, 'inchikey'),
  } as SubstanzSatz
}

/** Eine eingebettete 1:n-Beziehung, von der genau eine Zeile zaehlt. */
function ersteZeile(v: unknown): Record<string, unknown> | null {
  if (Array.isArray(v)) return (v[0] as Record<string, unknown>) ?? null
  return (v as Record<string, unknown>) ?? null
}

/**
 * Ein Detailblock ohne seine Verwaltungsspalten.
 *
 * `[read]` `id`, `supplement_id` und die Zeitstempel gehoeren zur
 * Tabelle, nicht zur Substanz — sie wuerden sonst als Anzeigefelder
 * auftauchen. Leere Werte laesst die Anzeige ohnehin weg.
 */
function blockOhneMeta(z: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!z) return null
  const weg = new Set(['id', 'supplement_id', 'created_at', 'updated_at', 'source', 'status'])
  const aus: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(z)) {
    if (weg.has(k) || v === null || v === '') continue
    aus[k] = v
  }
  return Object.keys(aus).length ? aus : null
}

function alleZeilen(v: unknown): Record<string, unknown> | null {
  if (!Array.isArray(v) || v.length === 0) return null
  const aus: Record<string, unknown> = {}
  v.forEach((z, i) => {
    const rein = blockOhneMeta(z as Record<string, unknown>)
    if (rein) aus[`${i + 1}`] = rein
  })
  return Object.keys(aus).length ? aus : null
}

function alleAliasse(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map(z => String((z as Record<string, unknown>).alias ?? '')).filter(Boolean)
}

function kennung(v: unknown, art: string): string | null {
  if (!Array.isArray(v)) return null
  const t = v.find(z => String((z as Record<string, unknown>).identifier_type ?? '')
    .toLowerCase() === art)
  const w = t ? (t as Record<string, unknown>).identifier_value : null
  return typeof w === 'string' && w ? w : null
}

function kennungen(v: unknown): Record<string, unknown> | null {
  if (!Array.isArray(v) || v.length === 0) return null
  const aus: Record<string, unknown> = {}
  for (const z of v) {
    const r = z as Record<string, unknown>
    const k = String(r.identifier_type ?? '')
    if (k && r.identifier_value) aus[k] = r.identifier_value
  }
  return Object.keys(aus).length ? aus : null
}

/**
 * Die Herkunftsvermerke, umgelegt auf die Form, die
 * `substanz-anzeige.ts` erwartet: Feldpfad -> Herkunft.
 *
 * `[cmd]` `supplement_field_sources` deckt 286 der 290 (2026-08-23).
 * `[read]` Ohne `source_id` gilt ein Vermerk nicht — dieselbe Regel
 * wie in `herkunftFuer` (C-229).
 */
function feldQuellen(v: unknown): Record<string, Herkunft> | null {
  if (!Array.isArray(v) || v.length === 0) return null
  const aus: Record<string, Herkunft> = {}
  for (const z of v) {
    const r = z as Record<string, unknown>
    const feld = String(r.field_name ?? '')
    if (!feld || !r.source_id) continue
    aus[feld] = {
      source_id: String(r.source_id),
      evidence_class: String(r.evidence_class ?? ''),
      as_of: String(r.as_of ?? ''),
    }
  }
  return Object.keys(aus).length ? aus : null
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
