// Lese-I/O fuer den Produkte-Reiter (G-452).
//
// ══ WAS HIER GELESEN WIRD ═══════════════════════════════════════════
//
// `[cmd]` **`supplements.supplier_products`: 214.780 Zeilen**, gemessen
// 2026-09-14 gegen die laufende Instanz:
//
//     gesamt        214.780
//     On Market     121.959
//     Off Market     92.821
//     Marken           6.012
//
// `[cmd]` **C-467 hat die Tabelle gebaut, C-485 gefuellt** — und bis
// hierher fuehrte KEIN Leseweg in `apps/` dorthin.
//
// ══ WARUM SERVERSEITIG GESUCHT WIRD ═════════════════════════════════
//
// `[read]` **Der Katalog-Reiter laedt alle 566 Substanzen in den
// Browser und filtert dort** (`substanz-detail.tsx:151`). `[cmd]`
// **G-176 hat das gemessen und ausdruecklich erlaubt: 4.713 DOM-Knoten,
// 3.270–3.494 ms** — und den Satz dazugeschrieben: *„Wenn der Katalog
// einmal Tausende traegt, ist die Messung zu wiederholen."*
//
// `[cmd]` **214.780 ist das 380-fache.** `[read]` **Damit faellt die
// Bauform des Katalogs fuer die Datenbeschaffung aus** — sein AUSSEHEN
// bleibt die Vorlage (Toms Vorgabe), seine Mechanik nicht. Gesucht,
// gefiltert und geblaettert wird in der Datenbank.
//
// ══ DIE FUNKTIONEN AUS C-495 ════════════════════════════════════════
//
// `[read]` **Die Suche wird hier NICHT nachgebaut** — der Auftrag
// verbietet es und C-495 liefert sie:
//
//     supplements.search_supplier_products(text, text, text, integer)
//     supplements.supplier_product_detail(uuid)
//     supplements.supplier_product_brands
//
// `[cmd]` **Gemessen 2026-09-14, 15:20 Uhr: keine der drei existiert.**
// `pg_proc` kennt in `supplements` nur `create_supplier_product` aus
// C-467, die Migrationsdatei
// `20260914080541_c495_supplier_product_catalog_read.sql` ist **0
// Byte** — Codex schreibt noch.
//
// `[read]` **Deshalb rufen die drei Lesewege unten die C-495-Funktion
// ZUERST und fallen auf die Tabellen zurueck, wenn sie fehlt.** Das ist
// kein zweiter Suchweg neben C-495: der Rueckfall kann `ILIKE`, mehr
// nicht, und er verschwindet in dem Augenblick, in dem die Funktion da
// ist — ohne dass hier etwas geaendert werden muss.
//
// `[cmd]` **Der Unterschied ist messbar und steht in der Oberflaeche:**
// `smart` sagt, dass die pg_trgm-Suche geantwortet hat, `einfach`, dass
// der Rueckfall lief. **Eine Fehleingabe wie „gold standart wey" findet
// NUR die erste** — der Rueckfall zeigt dann ehrlich nichts, statt so
// zu tun, als sei die Smartsuche gebaut.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

/** Wie viele Treffer eine Seite traegt. */
export const SEITE = 50

/**
 * Welcher Weg geantwortet hat.
 *
 * `[read]` **Das ist kein Schoenheitsfehler, den man versteckt** — wer
 * eine Fehleingabe tippt und nichts findet, muss wissen, ob die
 * Smartsuche geantwortet hat oder gar nicht lief.
 */
export type Suchweg = 'smart' | 'einfach'

export type ProduktZeile = {
  id: string
  name_en: string
  marke: string | null
  market_status: string | null
  produktform: string | null
  portionsgroesse: number | null
  portionseinheit: string | null
  /** Nur der Smartweg liefert sie — beim Rueckfall `null`. */
  similarity: number | null
}

export type ProduktListe = {
  zeilen: ProduktZeile[]
  /** Wie viele die Datenbank kennt, nicht wie viele geladen sind. */
  gesamt: number
  weg: Suchweg
  fehler: string | null
}

/** Eine Zeile des Etiketts. */
export type InhaltsZeile = {
  id: string
  ingredient_name: string
  ingredient_category: string | null
  amount_per_serving: number | null
  unit: string | null
  /**
   * `exact` | `not_stated` | `less_than` | `greater_than`.
   *
   * `[cmd]` **Gemessen 2026-09-14 ueber alle 3.000.982 Zeilen:**
   * `not_stated` **1.591.063**, `exact` **1.394.584**, `less_than`
   * **14.598**, `greater_than` **737**.
   *
   * `[read]` **Die Mehrheit hat keine Zahl** — eine Anzeige, die nur
   * Zahlen zeigt, zeigt die Minderheit.
   */
  amount_qualifier: string | null
  /**
   * Die Mischung, zu der die Zeile gehoert — oder `null`.
   *
   * `[cmd]` **`blend_id` zeigt auf die `id` der KOPFZEILE**, gemessen
   * an `21cfe048` (N.O. Black Powder): Zeile 13 traegt 3000 mg und
   * `blend_id = null`, die Zeilen 14 und 15 tragen `blend_id =
   * <id von Zeile 13>` und keine Menge.
   *
   * `[read]` **Daraus folgt die Einrueckung ohne jede Rechnung:** wer
   * ein `blend_id` hat, steht eingerueckt unter seinem Kopf.
   */
  blend_id: string | null
  reihenfolge: number | null
  ist_wirkstoff: boolean
  /**
   * Kennt LumeOS die Zutat?
   *
   * `[cmd]` **`supplement_id` ist bei 2.698.689 von 3.000.982 Zeilen
   * null** (89,9 %, gemessen 2026-09-14) — die Zutat steht auf dem
   * Etikett, aber keine Substanz im Katalog entspricht ihr.
   *
   * `[read]` **Der Auftrag verlangt, dass man das sieht:** wer ein
   * Produkt ansieht, soll wissen, welche Zutaten LumeOS auswerten
   * kann.
   */
  bekannt: boolean
}

export type FirmenZeile = {
  name: string
  land: string | null
  rolle: string
}

export type ProduktSatz = {
  id: string
  name_en: string
  marke: string | null
  market_status: string | null
  produktform: string | null
  packungsgroesse: number | null
  packungseinheit: string | null
  portionsgroesse: number | null
  portionseinheit: string | null
  gtin: string | null
  suggested_use: string | null
  inhalt: InhaltsZeile[]
  firmen: FirmenZeile[]
}

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

function zeileAus(r: Record<string, unknown>): ProduktZeile | null {
  const id = s(r.id)
  const name = s(r.name_en)
  if (!id || !name) return null
  return {
    id,
    name_en: name,
    marke: s(r.marke),
    market_status: s(r.market_status),
    produktform: s(r.produktform),
    portionsgroesse: n(r.portionsgroesse),
    portionseinheit: s(r.portionseinheit),
    similarity: n(r.similarity),
  }
}

/**
 * Die Produktsuche.
 *
 * `[read]` **Zuerst `supplements.search_supplier_products` (C-495)**,
 * die pg_trgm kann und deshalb Fehleingaben versteht. **Fehlt sie,
 * laeuft der `ILIKE`-Rueckfall** — und das Ergebnis sagt mit `weg`,
 * welcher von beiden geantwortet hat.
 *
 * @param frage    der getippte Begriff
 * @param marke    Markenfilter, `null` heisst alle
 * @param status   `'On Market'` als Vorgabe (Toms Antwort), `null` alle
 * @param seite    0-basiert
 */
export async function sucheProdukte(
  frage: string,
  marke: string | null = null,
  status: string | null = 'On Market',
  seite = 0,
): Promise<ProduktListe> {
  const c = createSessionClient().schema('supplements')
  const q = frage.trim()

  // ── Der Weg aus C-495 ────────────────────────────────────────────
  //
  // `[read]` **Nur bei einem Begriff** — eine Aehnlichkeitssuche ohne
  // Begriff hat nichts, wogegen sie messen koennte. Die leere Liste
  // beim Oeffnen des Reiters kommt deshalb immer aus dem Tabellenweg.
  if (q) {
    try {
      const { data, error } = await c.rpc('search_supplier_products', {
        p_query: q,
        p_marke: marke,
        p_market_status: status,
        p_limit: SEITE,
      })
      if (!error && Array.isArray(data)) {
        const zeilen = (data as Array<Record<string, unknown>>)
          .flatMap(r => zeileAus(r) ?? [])
        return { zeilen, gesamt: zeilen.length, weg: 'smart', fehler: null }
      }
    } catch {
      // `[read]` **Bewusst stumm weiter zum Rueckfall.** Solange C-495
      // nicht eingespielt ist, ist „Funktion gibt es nicht" der
      // Normalfall und kein Fehler, den jemand lesen muesste.
    }
  }

  // ── Der Rueckfall: die Tabelle selbst ────────────────────────────
  //
  // `[cmd]` **`count: 'exact'` statt `.length`** — PostgREST deckelt
  // die Zeilen bei 1.000, und `zeilen.length` waere bei 214.780 immer
  // die Seitengroesse. Die Gesamtzahl kommt aus dem Zaehler, nicht aus
  // dem Array.
  try {
    let f = c.from('supplier_products')
      .select('id,name_en,marke,market_status,produktform,portionsgroesse,portionseinheit',
              { count: 'exact' })
    if (status) f = f.eq('market_status', status)
    if (marke) f = f.eq('marke', marke)
    if (q) f = f.ilike('name_en', `%${q}%`)
    const { data, error, count } = await f
      .order('name_en', { ascending: true })
      .range(seite * SEITE, seite * SEITE + SEITE - 1)
    if (error) {
      return { zeilen: [], gesamt: 0, weg: 'einfach', fehler: error.message }
    }
    const zeilen = (Array.isArray(data) ? data as Array<Record<string, unknown>> : [])
      .flatMap(r => zeileAus(r) ?? [])
    return { zeilen, gesamt: count ?? zeilen.length, weg: 'einfach', fehler: null }
  } catch (e) {
    return {
      zeilen: [], gesamt: 0, weg: 'einfach',
      fehler: e instanceof Error ? e.message : String(e),
    }
  }
}

/**
 * Die Markenliste fuer den Filter.
 *
 * `[read]` **Zuerst `supplements.supplier_product_brands` (C-495).**
 * `[cmd]` **Der Rueckfall liefert NICHT alle 6.012** — PostgREST kann
 * kein `DISTINCT`, und 214.780 Zeilen zu holen, um daraus Marken zu
 * falten, waere ein Missbrauch der Leitung. **Er liefert die Marken
 * der ersten 1.000 On-Market-Zeilen**, und die Oberflaeche sagt, dass
 * es ein Ausschnitt ist.
 */
export async function ladeMarken(): Promise<{ marken: string[]; vollstaendig: boolean }> {
  const c = createSessionClient().schema('supplements')
  try {
    const { data, error } = await c.from('supplier_product_brands').select('marke')
    if (!error && Array.isArray(data)) {
      const marken = (data as Array<Record<string, unknown>>)
        .flatMap(r => s(r.marke) ?? [])
      if (marken.length > 0) return { marken: marken.sort(), vollstaendig: true }
    }
  } catch {
    // siehe `sucheProdukte` — der Rueckfall ist der Normalfall bis C-495.
  }

  try {
    const { data } = await c.from('supplier_products')
      .select('marke').eq('market_status', 'On Market').not('marke', 'is', null)
      .order('marke', { ascending: true }).limit(1000)
    const marken = Array.from(new Set(
      (Array.isArray(data) ? data as Array<Record<string, unknown>> : [])
        .flatMap(r => s(r.marke) ?? []),
    )).sort()
    return { marken, vollstaendig: false }
  } catch {
    return { marken: [], vollstaendig: false }
  }
}

function inhaltAus(r: Record<string, unknown>): InhaltsZeile | null {
  const id = s(r.id)
  const name = s(r.ingredient_name) ?? s(r.supplement_name_en)
  if (!id || !name) return null
  return {
    id,
    ingredient_name: name,
    ingredient_category: s(r.ingredient_category),
    amount_per_serving: n(r.amount_per_serving),
    unit: s(r.unit),
    amount_qualifier: s(r.amount_qualifier),
    blend_id: s(r.blend_id),
    reihenfolge: n(r.reihenfolge),
    ist_wirkstoff: r.ist_wirkstoff === true,
    // `[read]` **Der Rueckfall liest `supplement_id`, C-495 liefert
    // `supplement_name_en`** — beides beantwortet dieselbe Frage:
    // kennt LumeOS die Zutat?
    bekannt: s(r.supplement_id) !== null || s(r.supplement_name_en) !== null,
  }
}

/**
 * Ein Produkt vollstaendig — Kopf, Etikett, Firmen.
 *
 * `[read]` **Zuerst `supplements.supplier_product_detail` (C-495)**,
 * die alles in EINER Antwort liefert. Der Rueckfall braucht drei
 * Abfragen; sie laufen parallel, weil keine auf einer anderen aufbaut.
 */
export async function ladeProdukt(id: string): Promise<ProduktSatz | null> {
  const c = createSessionClient().schema('supplements')

  try {
    const { data, error } = await c.rpc('supplier_product_detail', { p_id: id })
    if (!error && data && typeof data === 'object') {
      const d = data as Record<string, unknown>
      const kopf = (d.header ?? {}) as Record<string, unknown>
      if (s(kopf.name_en)) {
        return {
          id,
          name_en: s(kopf.name_en) ?? '',
          marke: s(kopf.marke),
          market_status: s(kopf.market_status),
          produktform: s(kopf.produktform),
          packungsgroesse: n(kopf.packungsgroesse),
          packungseinheit: s(kopf.packungseinheit),
          portionsgroesse: n(kopf.portionsgroesse),
          portionseinheit: s(kopf.portionseinheit),
          gtin: s(kopf.gtin),
          suggested_use: s(kopf.suggested_use),
          inhalt: (Array.isArray(d.contents) ? d.contents as Array<Record<string, unknown>> : [])
            .flatMap(r => inhaltAus(r) ?? []),
          firmen: (Array.isArray(d.suppliers) ? d.suppliers as Array<Record<string, unknown>> : [])
            .flatMap(r => {
              const name = s(r.name)
              return name ? [{ name, land: s(r.land), rolle: s(r.rolle) ?? '' }] : []
            }),
        }
      }
    }
  } catch {
    // siehe `sucheProdukte`.
  }

  // ── Der Rueckfall: die drei Tabellen ─────────────────────────────
  try {
    const [kopfA, inhaltA, firmenA] = await Promise.all([
      c.from('supplier_products')
        .select('id,name_en,marke,market_status,produktform,packungsgroesse,packungseinheit,portionsgroesse,portionseinheit,gtin,suggested_use')
        .eq('id', id).maybeSingle(),
      c.from('product_contents')
        .select('id,ingredient_name,ingredient_category,amount_per_serving,unit,amount_qualifier,blend_id,reihenfolge,ist_wirkstoff,supplement_id')
        .eq('product_id', id).order('reihenfolge', { ascending: true, nullsFirst: false }),
      c.from('product_suppliers')
        .select('rolle,suppliers(name,land)').eq('product_id', id),
    ])
    const k = kopfA.data as Record<string, unknown> | null
    if (!k || !s(k.name_en)) return null
    return {
      id,
      name_en: s(k.name_en) ?? '',
      marke: s(k.marke),
      market_status: s(k.market_status),
      produktform: s(k.produktform),
      packungsgroesse: n(k.packungsgroesse),
      packungseinheit: s(k.packungseinheit),
      portionsgroesse: n(k.portionsgroesse),
      portionseinheit: s(k.portionseinheit),
      gtin: s(k.gtin),
      suggested_use: s(k.suggested_use),
      inhalt: (Array.isArray(inhaltA.data) ? inhaltA.data as Array<Record<string, unknown>> : [])
        .flatMap(r => inhaltAus(r) ?? []),
      firmen: (Array.isArray(firmenA.data) ? firmenA.data as Array<Record<string, unknown>> : [])
        .flatMap(r => {
          const f = (r as Record<string, unknown>).suppliers as Record<string, unknown> | null
          const name = f ? s(f.name) : null
          return name
            ? [{ name, land: s(f!.land), rolle: s((r as Record<string, unknown>).rolle) ?? '' }]
            : []
        }),
    }
  } catch {
    return null
  }
}
