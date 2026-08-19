// Lesepfad fuer den Preferences-Tab (G-65).
//
// **NICHT NACHGEBAUT:** `nutrition.food_preferences_read` gibt es seit
// C-87 und liefert bereits alles mit Beschriftungen — Basiszeile,
// Items mit `food_name`/`tag_name_de`/`category_name_de`, und die
// vorbereitete Struktur `search_application`. `[read]` Der Auftrag
// verbietet Schemaaenderungen, und eine zweite Leseroutine waere eine
// zweite Wahrheit.
//
// Diese Datei uebersetzt die Antwort der Funktion in Typen und holt
// die zwei Kataloge dazu, die die Kacheln zum Auswaehlen brauchen:
// Kategorien und Tags.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

export class VorliebenLeseFehler extends Error {
  constructor(public code: 'NO_SESSION' | 'READ_FAILED', message: string) {
    super(message)
    this.name = 'VorliebenLeseFehler'
  }
}

function nutritionDb() {
  return createSessionClient().schema('nutrition')
}

export async function angemeldeteNutzerin(): Promise<string> {
  const { data: { user } } = await createSessionClient().auth.getUser()
  if (!user) throw new VorliebenLeseFehler('NO_SESSION', 'Keine angemeldete Session.')
  return user.id
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

function liste(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

/** Die Basiszeile aus `nutrition.food_preferences` — 14 Spalten. */
export type Grundeinstellungen = {
  diet_type: string | null
  allergies: string[]
  intolerances: string[]
  general_exclusions: string[]
  preferred_cuisines: string[]
  meals_per_day: number | null
  snacks_per_day: number | null
  cooking_skill: string | null
  prep_time_max_min: number | null
  budget_level: string | null
  meal_prep_ok: boolean | null
  planner_notes: string | null
  updated_at: string | null
}

/**
 * Ein Eintrag aus `food_preference_items`.
 *
 * `[cmd]` Die Pruefbedingung `food_preference_items_exactly_one_target`
 * erzwingt **genau ein** gesetztes Ziel je Zeile — sechs Arten sind
 * moeglich: `food`, `category`, `tag`, `cuisine`, `exclusion_preset`
 * und `catalog_item`. Der Auftrag nennt fuenf; **`catalog_item` ist die
 * sechste** und im Bericht vermerkt.
 */
export type Vorliebe = {
  id: string
  target_type: string
  preference: 'liked' | 'disliked' | 'hard_exclude'
  strength: string
  source: string | null
  food_id: string | null
  food_name: string | null
  bls_code: string | null
  category_id: string | null
  category_name_de: string | null
  category_slug: string | null
  tag_code: string | null
  tag_name_de: string | null
  cuisine_code: string | null
  exclusion_preset_code: string | null
  catalog_item_code: string | null
}

export type VorliebenStand = {
  grund: Grundeinstellungen
  items: Vorliebe[]
}

/** Eine Wurzelkategorie fuer die Kategorie-Kachel. */
export type Kategorie = { id: string; slug: string; name_de: string }

/** Eine Tag-Beschreibung fuer die Tag-Kachel. */
export type TagDefinition = {
  code: string
  name_de: string
  tag_type: string | null
  is_exclusion_relevant: boolean
}

const LEER: Grundeinstellungen = {
  diet_type: null, allergies: [], intolerances: [], general_exclusions: [],
  preferred_cuisines: [], meals_per_day: null, snacks_per_day: null,
  cooking_skill: null, prep_time_max_min: null, budget_level: null,
  meal_prep_ok: null, planner_notes: null, updated_at: null,
}

/**
 * Der gespeicherte Stand.
 *
 * `[cmd]` `food_preferences_read` ist `SECURITY INVOKER` und laeuft
 * unter der Identitaet der Sitzung — der Zeilenschutz bleibt die
 * Sperre, dieser Aufruf ist nur die Absicht. Ohne Zeile kommt eine
 * leere Struktur zurueck, kein Fehler: „noch nichts eingestellt" ist
 * ein gueltiger Zustand.
 */
export async function ladeVorlieben(userId: string): Promise<VorliebenStand> {
  const { data, error } = await nutritionDb().rpc('food_preferences_read', { p_user_id: userId })
  if (error) throw new VorliebenLeseFehler('READ_FAILED', `food_preferences_read: ${error.message}`)

  const wurzel = (data ?? {}) as Record<string, unknown>
  const p = (wurzel.preferences ?? {}) as Record<string, unknown>
  const roh = Array.isArray(wurzel.items) ? wurzel.items : []

  return {
    grund: {
      diet_type: text(p.diet_type),
      allergies: liste(p.allergies),
      intolerances: liste(p.intolerances),
      general_exclusions: liste(p.general_exclusions),
      preferred_cuisines: liste(p.preferred_cuisines),
      meals_per_day: zahl(p.meals_per_day),
      snacks_per_day: zahl(p.snacks_per_day),
      cooking_skill: text(p.cooking_skill),
      prep_time_max_min: zahl(p.prep_time_max_min),
      budget_level: text(p.budget_level),
      meal_prep_ok: typeof p.meal_prep_ok === 'boolean' ? p.meal_prep_ok : null,
      planner_notes: text(p.planner_notes),
      updated_at: text(p.updated_at),
    },
    items: (roh as Array<Record<string, unknown>>).map(z => ({
      id: String(z.id ?? ''),
      target_type: text(z.target_type) ?? '',
      preference: (text(z.preference) ?? 'liked') as Vorliebe['preference'],
      strength: text(z.strength) ?? '',
      source: text(z.source),
      food_id: text(z.food_id),
      food_name: text(z.food_name),
      bls_code: text(z.bls_code),
      category_id: text(z.category_id),
      category_name_de: text(z.category_name_de),
      category_slug: text(z.category_slug),
      tag_code: text(z.tag_code),
      tag_name_de: text(z.tag_name_de),
      cuisine_code: text(z.cuisine_code),
      exclusion_preset_code: text(z.exclusion_preset_code),
      catalog_item_code: text(z.catalog_item_code),
    })),
  }
}

/** Leerer Stand, wenn niemand angemeldet ist. */
export function leererStand(): VorliebenStand {
  return { grund: { ...LEER }, items: [] }
}

/**
 * Die Wurzelkategorien.
 *
 * `[cmd]` `nutrition.food_categories` fuehrt **518 Zeilen, davon 13
 * Wurzeln**. Die Kachel zeigt die Wurzeln: „Kekse & Plätzchen" ist als
 * Zeile in einer Vorliebenliste brauchbar, aber 518 Zeilen sind keine
 * Auswahl. Untergeordnete Kategorien bleiben ueber die Suche
 * erreichbar (C-94).
 */
export async function ladeKategorien(): Promise<Kategorie[]> {
  const { data, error } = await nutritionDb()
    .from('food_categories')
    .select('id, slug, name_de')
    .is('parent_id', null)
    .order('name_de')
    .limit(200)
  if (error) throw new VorliebenLeseFehler('READ_FAILED', `food_categories: ${error.message}`)

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
    id: String(z.id),
    slug: text(z.slug) ?? '',
    name_de: text(z.name_de) ?? '',
  }))
}

/**
 * Ein Ausschluss-Preset.
 *
 * `[cmd]` **C-93 ist waehrend dieses Auftrags fertig geworden** —
 * `nutrition.exclusion_presets` fuehrt seit 2026-08-19 **elf Presets**
 * mit `kind` (`personal` / `religious`) und `caveat_de`. Der Auftrag
 * ging noch von einem Leerzustand aus; gebaut ist die Auswahl.
 *
 * `[read]` **Der Vorbehalt kommt aus der Spalte, nicht aus dem Code.**
 * `caveat_de` sagt bei Halal: *„Echtes Halal haengt an der Schlachtung
 * — die BLS-Daten kennen sie nicht."* Das ist genau der Satz, den der
 * Auftrag sichtbar haben will, und er steht damit an einer Stelle
 * statt an zweien.
 */
export type AusschlussPreset = {
  code: string
  name_de: string
  kind: string | null
  caveat_de: string | null
}

export async function ladePresets(): Promise<AusschlussPreset[]> {
  const { data, error } = await nutritionDb()
    .from('exclusion_presets')
    .select('code, name_de, kind, caveat_de')
    .eq('is_active', true)
    .order('sort_order')
    .limit(200)
  // Ein Fehler ist hier kein Abbruch: der Katalog ist jung, und ohne
  // ihn bleibt die Kachel bedienbar — sie zeigt dann, was gesetzt ist.
  if (error) return []

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
    code: text(z.code) ?? '',
    name_de: text(z.name_de) ?? '',
    kind: text(z.kind),
    caveat_de: text(z.caveat_de),
  }))
}

/**
 * Die Tag-Beschreibungen.
 *
 * `[cmd]` 14 Zeilen in `nutrition.tag_definitions`, mit `tag_type`
 * (`diet` · `processing` · `allergen`) und `sort_order`. Die Spalte
 * heisst `tag_type`, nicht `tag_group`.
 */
export async function ladeTags(): Promise<TagDefinition[]> {
  const { data, error } = await nutritionDb()
    .from('tag_definitions')
    .select('code, name_de, tag_type, is_exclusion_relevant')
    .order('sort_order')
    .limit(200)
  if (error) throw new VorliebenLeseFehler('READ_FAILED', `tag_definitions: ${error.message}`)

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
    code: text(z.code) ?? '',
    name_de: text(z.name_de) ?? '',
    tag_type: text(z.tag_type),
    is_exclusion_relevant: z.is_exclusion_relevant === true,
  }))
}
