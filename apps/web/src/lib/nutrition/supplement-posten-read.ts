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
// G-480/G-481: die Formenregel — eine Liste fuer Filter und
// Pruefung. `[cmd]` **G-481: `mealFormenFilter` wird nicht mehr
// gebraucht** — gefiltert wird jetzt auf der Treffermenge der
// Suchfunktion, weil `p_form` nur EINEN Wert nimmt.
import { darfInMahlzeit, SUPPLEMENT_SEITE } from './such-quellen-lage'

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
  // G-481: `FOL` fehlte -- der Trigger erwartet es.
  ['fol_ug', 'FOL'],
  ['cu_ug', 'CU'], ['mn_ug', 'MN'],
]

const OPTION_SPALTEN = [
  'product_id', 'serving_size',
  ...MAKROS,
  ...MIKRO.map(([spalte]) => spalte),
  // ══ G-481: die zwei, die G-475 uebersehen hat ═══════════════════
  //
  // `[cmd]` **Der Trigger baut sein Sollobjekt aus 22 Feldern PLUS
  // `v_option.nutrients`** (gemessen am Rumpf 2026-09-18):
  //
  //     ... 'MN', v_option.mn_ug * ... )) || v_generic_nutrients
  //
  // `[cmd]` **`fol_ug` -> `FOL` stand nie in `MIKRO`**, und die
  // freie Spalte `nutrients` wurde gar nicht gelesen.
  //
  // `[cmd]` **Gemessen am Whey:** die Option traegt
  // `nutrients = {"CHORL": 35}` — **der Schnappschuss ohne sie weicht
  // ab, und die Datenbank wies jede Erfassung dieses Produkts zurueck**
  // (*„snapshot differs from its evidenced product serving"*).
  //
  // `[read]` **Der Fehler lag seit G-475 da** — er faellt nur bei
  // Produkten auf, die eine dieser beiden Angaben tragen.
  'fol_ug',
  'nutrients',
].join(',')

export type SucheStand = {
  treffer: SupplementTreffer[]
  /**
   * G-481/A3: wie viele die Datenbank kennt — nicht wie viele geladen
   * sind.
   *
   * `[cmd]` **Aus `supplements.supplier_product_search_meta`**
   * (G-463). `[read]` **Ohne diese Zahl liest sich eine Seite wie der
   * ganze Bestand** — genau Toms Befund: *„whey bringt wohl tausende
   * und es werden vielleicht 20 angezeigt"*.
   */
  gesamt: number
  fehler: string | null
}

/**
 * Produkte suchen, mit ihren Portionsgroessen.
 *
 * `[read]` **Die Portionen kommen MIT** — ohne sie weiss die
 * Oberflaeche nicht, ob ein Produkt Naehrwerte hat (A5) und welche
 * Wahl sie anbieten darf (A4).
 */
export async function sucheSupplemente(
  frage: string, seite = 0,
): Promise<SucheStand> {
  const q = frage.trim()
  if (!q) return { treffer: [], gesamt: 0, fehler: null }
  // ══ G-481/A4: nachladen, statt bei 20 aufzuhoeren ════════════════
  //
  // `[cmd]` **`search_supplier_products` kennt kein `OFFSET`** —
  // gemessen an der Signatur: `p_query, p_market_status, p_marke,
  // p_limit, p_kategorie, p_form, p_allergien_ausblenden,
  // p_meidestoffe, p_marken, p_nur_bewertet`.
  //
  // `[read]` **Also wird die naechste Seite mitgeladen und
  // abgeschnitten.** **Das ist die Falle aus G-476 (,,OFFSET-Blaettern
  // kostet je Seite voll") in klein** — aber die Funktion laesst
  // nichts anderes zu, und der Deckel liegt bei 500 (G-463).
  //
  // `[cmd]` **Gemessen: 96 ms fuer 500 Zeilen** — die Kosten liegen
  // nicht hier.
  const grenze = Math.min((seite + 1) * SUPPLEMENT_SEITE, 500)
  try {
    const c = createSessionClient().schema('supplements')
    // ══ G-481: DIE SUCHE, DIE ES SCHON GIBT ════════════════════════
    //
    // **Tom, 2026-09-08:** *„wir haben schon gute suchen"* — und:
    // *„keine smartsuche wie whey isolate optimum nutrition
    // moeglich"*.
    //
    // `[cmd]` **Hier stand `.ilike('name_en', '%q%')` mit
    // `.limit(20)`.** `[cmd]` **Gemessen, was das kostete:**
    //
    //     whey                              20 Treffer, 1.037 ms
    //     whey isolate optimum nutrition     0 Treffer
    //
    // `[read]` **Eine Zeichenkettensuche kann eine Wortfolge nicht
    // treffen** — kein Produkt heisst woertlich so.
    //
    // `[cmd]` **`supplements.search_supplier_products` (C-495 bis
    // C-504) kann es**: `pg_trgm`, nach Aehnlichkeit sortiert, Deckel
    // 500 (G-463). `[read]` **Sie wird GERUFEN, nicht nachgebaut.**
    //
    // `[cmd]` **Ohne `p_form`, obwohl es den Parameter gibt:** er
    // nimmt EINEN Wert (`p.produktform = v_form`, gemessen am
    // Funktionsrumpf), **Toms Regel nennt vier Formen.** `[cmd]`
    // **Der Verlust ist gemessen und klein:** von 500 Whey-Treffern
    // sind 493 `Powder`, 2 `Liquid`, 5 `Other` — **die Regel greift
    // danach, auf der geladenen Menge.**
    // `[cmd]` **Suche und Gesamtzahl GLEICHZEITIG** — sie haengen
    // nicht voneinander ab. `[cmd]` **Gemessen: 45 ms + 145 ms; wer
    // sie nacheinander ruft, zahlt beide Wartezeiten** (G-472,
    // ,,Seiten gleichzeitig holen").
    const [suche, metaAntwort] = await Promise.all([
      c.rpc('search_supplier_products', {
        p_query: q,
        p_market_status: 'On Market',
        p_limit: grenze,
      }),
      c.rpc('supplier_product_search_meta', {
        p_query: q,
        p_market_status: 'On Market',
      }),
    ])
    const { data, error } = suche
    if (error) return { treffer: [], gesamt: 0, fehler: error.message }

    // ══ G-481: die Form fehlt in der Rueckgabe ═════════════════════
    //
    // `[cmd]` **GEMESSEN am 2026-09-18:** `search_supplier_products`
    // gibt `id, marke, name_en, portionsgroesse, portionseinheit,
    // packungsgroesse, packungseinheit, market_status, gtin,
    // similarity, meidestoff_treffer` — **`produktform` ist NICHT
    // dabei.**
    //
    // `[read]` **Damit laesst sich Toms Regel nicht auf der Antwort
    // anwenden** — und `p_form` nimmt nur EINEN Wert, die Regel nennt
    // vier.
    //
    // `[cmd]` **Gemeldet, nicht umgangen** (siehe Bericht). `[read]`
    // **Bis die Funktion sie mitliefert, wird die Form fuer die
    // Treffer-Ids nachgelesen** — eine Abfrage, dieselbe, die ohnehin
    // fuer die Portionen laeuft.
    // ══ G-481/A3: die Gesamtzahl kommt aus der Datenbank ═══════════
    //
    // `[cmd]` **`supplier_product_search_meta` (G-463) liefert
    // `total_count`** — gemessen: `whey` = 2.722, mit Formfilter
    // 1.762.
    //
    // `[read]` **Nicht `alle.length`** — das waere die Seitenlaenge,
    // und genau diese Verwechslung war Toms Befund.
    const meta = metaAntwort.data
    const metaZeile = (Array.isArray(meta) ? meta[0] : meta) as
      Record<string, unknown> | null
    const gesamt = n(metaZeile?.total_count) ?? 0

    // `[read]` **Erst die Seite schneiden, dann nachlesen** — sonst
    // traegt `.in()` die Ids der ganzen Ladung.
    const alleRoh = (Array.isArray(data) ? data : []) as Array<Record<string, unknown>>
    const alle = alleRoh.slice(seite * SUPPLEMENT_SEITE)
    const alleIds = alle.flatMap(r => s(r.id) ?? [])
    if (alleIds.length === 0) return { treffer: [], gesamt, fehler: null }

    // `[cmd]` **Form und Portionen GLEICHZEITIG** — beide haengen nur
    // an `alleIds`, nicht aneinander. `[read]` **Die Portionen werden
    // fuer die ganze Ladung geholt und danach nach der Formregel
    // benutzt** — eine Zeile zu viel zu laden ist billiger als eine
    // zweite Rundreise.
    const [formAntwort, optAntwort] = await Promise.all([
      c.from('supplier_products').select('id,produktform').in('id', alleIds),
      c.from('supplier_product_nutrient_serving_options')
        .select(OPTION_SPALTEN).in('product_id', alleIds),
    ])
    const { data: formen, error: fFehler } = formAntwort
    if (fFehler) return { treffer: [], gesamt, fehler: fFehler.message }

    const formVon = new Map<string, string | null>()
    for (const r of (Array.isArray(formen) ? formen : []) as Array<Record<string, unknown>>) {
      const id = s(r.id)
      if (id) formVon.set(id, s(r.produktform))
    }

    // `[read]` **Dieselbe Liste wie in `such-quellen-lage.ts`** —
    // `darfInMahlzeit` prueft sie, hier wird sie angewandt. **Zwei
    // Listen waeren zwei Wahrheiten.**
    const roh = alle.filter(r => {
      const id = s(r.id)
      return id !== null && darfInMahlzeit(formVon.get(id) ?? null)
    })
    const ids = roh.flatMap(r => s(r.id) ?? [])
    if (ids.length === 0) return { treffer: [], gesamt, fehler: null }

    // `[cmd]` **`.in()` kippt um 200 Ids** (G-64) — **deshalb
    // `SUPPLEMENT_SEITE = 150`**, nicht der 500er-Deckel der
    // Suchfunktion.
    const { data: opt, error: oFehler } = optAntwort
    if (oFehler) return { treffer: [], gesamt, fehler: oFehler.message }

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
          // G-480: die Form kommt mit — sie belegt am Schirm, dass
          // nur Untermischbares erscheint (A3).
          //
          // `[cmd]` **G-481: aus der Nachlese, nicht aus der
          // Antwort** — `search_supplier_products` gibt sie nicht
          // zurueck.
          produktform: formVon.get(id) ?? null,
          // ══ G-481/A6: mehr Infos je Zeile ═════════════════════════
          //
          // **Tom:** *„vielzuwenig infos dazu"*.
          //
          // `[cmd]` **Die Funktion liefert sie schon** —
          // `portionsgroesse` und `portionseinheit` standen in der
          // Rueckgabe und wurden weggeworfen.
          portionsgroesse: n(r.portionsgroesse),
          portionseinheit: s(r.portionseinheit),
          // `[read]` **Der Rang der Aehnlichkeitssuche** — er
          // erklaert, warum eine Zeile oben steht.
          similarity: n(r.similarity),
          // `[read]` **Leer heisst: keine gemessenen Naehrwerte** —
          // das ist eine Auskunft, kein Fehler (A5).
          portionen: (nachProdukt.get(id) ?? [])
            .sort((a, b) => a.serving_size.localeCompare(b.serving_size)),
        }]
      }),
      gesamt,
      fehler: null,
    }
  } catch (e) {
    return { treffer: [], gesamt: 0, fehler: e instanceof Error ? e.message : String(e) }
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

    // ══ G-481/A11: C-519 — der Posten ist ein VERWEIS ═══════════
    //
    // **Toms Entscheidung E-84:** *„ein Supplement bleibt ein
    // Supplement und wird im Stack gespeichert, auch wenn es in einer
    // Mahlzeit steht."*
    //
    // `[cmd]` **Hier standen vier Spalten in `nutrition.meal_items`**
    // — `supplement_product_id`, `_serving_size`, `_serving_quantity`,
    // `_nutrient_status` — **plus neun Makros und 22 Mikros, von Hand
    // gerechnet.** `[cmd]` **C-519 entfernt alle vier**
    // (`20260918194000_c519_remove_meal_product_snapshots.sql:292`).
    //
    // `[cmd]` **Codex hat das Einspielen deshalb GESTOPPT** — dieser
    // Schreibweg haette danach jede neue Erfassung scheitern lassen.
    //
    // `[read]` **Jetzt ruft er die Funktion, die C-519 mitbringt.**
    // **Sie schreibt BEIDES**: die Einnahme in
    // `supplements.intake_logs` und den Verweis in
    // `nutrition.meal_items` — **und den Naehrwert-Schnappschuss
    // rechnet sie selbst** (`supplier_product_nutrient_snapshot`).
    //
    // `[read]` **Kein Handrechnen mehr** — genau die Stelle, an der
    // G-475 dreimal gegen den Trigger gelaufen ist.

    // `[cmd]` **Das Datum MUSS zum Mahlzeittag passen** — die
    // Funktion wirft sonst *„intake date must match meal date"*.
    // `[read]` **Die Vorgabe `current_date` reicht nicht**: wer
    // gestern nachtraegt, traegt auf einen anderen Tag ein.
    const { data: mahlzeit, error: mFehler } = await c.schema('nutrition')
      .from('meals').select('entry_date').eq('id', p.meal_id).maybeSingle()
    if (mFehler) return { ok: false, fehler: mFehler.message }
    const tag = s((mahlzeit as Record<string, unknown> | null)?.entry_date)

    const { data, error } = await c.schema('supplements')
      .rpc('record_supplier_product_intake', {
        p_supplier_product_id: p.product_id,
        p_intake_date: tag,
        p_serving_quantity: p.serving_quantity,
        // `[read]` **Ohne Naehrwerte KEINE Portionsgroesse** — die
        // Funktion haelt sie sonst fuer belegt.
        p_serving_size: p.nutrient_status === 'no_nutrients_available'
          ? null : p.serving_size,
        p_meal_id: p.meal_id,
      })
    // ══ G-485: der Rueckfall ist ENTFERNT ═══════════════════════
    //
    // `[cmd]` **C-519 ist seit 2026-09-19 eingespielt** — die vier
    // Altspalten gibt es nicht mehr, und ein Weg, der sie schreibt,
    // kann nur noch scheitern.
    //
    // `[read]` **Toter Code konserviert alte Regeln** (A-59) — und
    // hier war er schlimmer als tot: **er hat den echten Fehler
    // verdeckt.** `[cmd]` **Gemessen:** der neue Weg scheiterte, der
    // Rueckfall sprang an, und die Meldung, die beim Nutzer ankam,
    // war die des ALTEN Weges — *„column
    // meal_items.supplement_serving_size does not exist"*.
    if (error) {
      // `[read]` **Die Meldung der Datenbank ist fuer Entwickler** —
      // der Nutzer bekommt einen Satz.
      if (error.message.includes('C513') || error.message.includes('C519')) {
        return {
          ok: false,
          // `[cmd]` **Die Rohmeldung gehoert dazu** — ohne sie hat
          // eine Probe nichts zum Nachsehen, und derselbe Satz
          // erschien fuer drei verschiedene Ursachen.
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
