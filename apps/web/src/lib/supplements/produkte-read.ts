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

// G-453/3: die gemessene Fenstergroesse — serverfrei, siehe dort.
import { FENSTER } from './produkt-etikett'

// ══ G-453/3: NICHT BLAETTERBAR ══════════════════════════════════════
//
// **Tom, 2026-09-15:** *„Ergebnisse NICHT blaetterbar. Miss, was
// stattdessen traegt — die Liste haelt heute 566 Zeilen (G-176), bei
// 121.959 Treffern brauchst du etwas anderes."*
//
// ══ DIE MESSUNG ═════════════════════════════════════════════════════
//
// `[cmd]` **In der Datenbank** (`EXPLAIN ANALYZE`, On Market nach
// `name_en` sortiert, 2026-09-15):
//
//     LIMIT 50                    17,4 ms
//     LIMIT 500                   23,0 ms
//     OFFSET 100.000 LIMIT 50    113,1 ms
//
// `[cmd]` **Im Browser** (echte Zeilenform, fuenf Zellen je Zeile):
//
//     Zeilen   DOM-Knoten   Anstrich   Hoehe
//         50          302      20 ms    1.849 px
//        200        1.202      27 ms    7.399 px
//        500        3.002      68 ms   18.499 px
//      1.000        6.002     140 ms   36.999 px
//      2.000       12.002     273 ms   73.999 px
//
// `[read]` **Zwei Befunde, die zusammen die Bauform bestimmen:**
//
// **1** — **500 Zeilen kosten in der Datenbank kaum mehr als 50**
// (23 gegen 17 ms), **im Browser 3.002 Knoten** — **unter den 4.713,
// die G-176 gemessen und ausdruecklich als unauffaellig eingestuft
// hat.** `[read]` **Die G-176-Messung ist damit wiederholt**, wie sie
// es verlangt hat.
//
// **2** — **Tiefes Blaettern ist das Teure, nicht die Menge**:
// `OFFSET 100.000` kostet das Sechsfache. `[read]` **Genau der Weg
// faellt weg**, und mit ihm der Grund fuer Seitenzahlen.
//
// `[read]` **Also: ein grosses Fenster und ein Knopf *,,mehr laden"*.**
// **Keine Seitenzahlen, kein `OFFSET` in die Tiefe** — wer mehr als
// 500 Treffer durchsieht, sucht nicht, sondern blaettert, und dafuer
// sind die Filter da.
//
// `[cmd]` **1.000 waere die naechste Stufe und kostet 140 ms Anstrich
// plus 37.000 px Rollweg** — die Grenze ist gemessen, nicht geraten.
//
// ══ WO DIE ZAHL STEHT ══════════════════════════════════════════════
//
// `[read]` **Der WERT steht in `produkt-etikett.ts`**, nicht hier —
// der Reiter braucht ihn fuer den Nachladeknopf, und ein Wert-Import
// von HIER zoege `next/headers` ins Browserbuendel. `[cmd]` **A-30,
// in diesem Auftrag zweimal passiert** (erst `KATEGORIEN`, dann
// `SEITE`).
//
// `[read]` **Nur EIN Ort, nicht zwei** — eine Zahl an zwei Stellen
// waere Drift: der Reiter rechnete mit 500, waehrend die Abfrage 200
// holt, und niemand saehe es.
export const SEITE = FENSTER

/**
 * Wie viele Treffer die Smartsuche hoechstens liefert.
 *
 * `[cmd]` **C-495 nimmt `p_limit`** — und eine
 * Aehnlichkeitssuche, die 500 Zeilen zurueckgibt, liefert am Ende
 * Namen, die mit dem Begriff nichts mehr zu tun haben. `[read]`
 * **Bei einer Suche ist die Rangfolge die Aussage**, nicht die
 * Vollstaendigkeit.
 */
export const SUCH_GRENZE = 200

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
  /**
   * G-455: wie viele Zeilen der harte Allergiefilter entfernt hat.
   *
   * `[read]` **Die Zahl gehoert auf den Schirm** — wer nicht sieht,
   * dass gefiltert wurde, haelt eine kurze Liste fuer den ganzen
   * Bestand. **Auch die Null ist eine Auskunft** (E-72).
   */
  hartEntfernt?: number
  /**
   * G-455: ist `gesamt` genau?
   *
   * `[cmd]` **Bei mehr als 150 ausgeschlossenen Produkten filtert die
   * Datenbank nicht mehr mit** (die Adresse waere zu lang, G-64) —
   * dann ist `gesamt` eine OBERGRENZE. `[read]` **Eine Zahl, die zu
   * gross ist, muss sich als solche zeigen.**
   */
  gesamtUnscharf?: boolean
  /**
   * G-455: wie viele Produkte insgesamt ein Allergen enthalten.
   *
   * `[read]` **Die Route ergaenzt sie**, nicht dieser Leseweg — sie
   * haengt an der Sitzung, nicht an der Suche. `[cmd]` **`0` ist eine
   * echte Auskunft:** die Trefferfunktion braucht einen Alias oder
   * einen exakt gleichen Zutatnamen.
   */
  allergieProdukte?: number
  /** G-455: lief der Filter, oder ist er abgeschaltet? */
  allergienAn?: boolean
  /** G-455: ein Fehler beim Lesen der Allergien — NICHT verschwiegen. */
  allergieFehler?: string | null
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
   * ══ G-464: AN BEIDEM, NICHT AN EINER SPALTE ═══════════════════════
   *
   * `[cmd]` **Hier hing die Marke an `supplement_id` allein** — und
   * Tom sah am Schirm einen Widerspruch (2026-09-08):
   *
   *     Calcium 1440 mg   ohne Marke     nutrient_code CA
   *     Vitamin C 65 mg   ohne Marke     nutrient_code VITC
   *     Iron 5.3 mg       ohne Marke     nutrient_code FE
   *     Zinc 18 mg        ohne Marke     nutrient_code ZN
   *     Thiamin 5.1 mg    auswertbar     supplement_id
   *     Biotin 300 mcg    auswertbar     supplement_id
   *
   * `[read]` **Calcium hat ein gueltiges Naehrstoff-Mapping und
   * stand trotzdem als *nicht im Katalog* da.** `[cmd]` **Gemessen an
   * `Serious Mass Vanilla` (2026-09-17): 22 von 85 Zeilen tragen eine
   * `supplement_id`, aber 62 tragen `supplement_id` ODER
   * `nutrient_code`.**
   *
   * `[read]` **Es sind zwei Wege, dieselbe Zeile auszuwerten:**
   *
   *     supplement_id   als Wirkstoff  (Biotin, Thiamin)
   *     nutrient_code   als Naehrwert  (Calcium, Vitamin C)
   *     beides null     Kandidat       (23 Zeilen)
   */
  bekannt: boolean
  /**
   * Naehrwert, Wirkstoff, Hilfsstoff oder Kandidat — aus C-505.
   *
   * `[cmd]` **`supplements.supplier_product_content_catalog`** traegt
   * die Einstufung selbst. `[read]` **Sie wird GELESEN, nicht
   * nachgerechnet** — eine zweite Fassung hier waere genau die Drift,
   * vor der C-495/G-452 gewarnt hat.
   *
   * `[read]` **`null` heisst: der Rueckfall lief** (die Sicht war
   * nicht erreichbar) — dann gruppiert die Tafel wie vor G-464, und
   * sie sagt es.
   */
  content_class: 'naehrwert' | 'wirkstoff' | 'hilfsstoff' | 'kandidat' | null
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
  /**
   * G-484: die Portionsgroessen MIT Naehrwerten.
   *
   * `[cmd]` **Ueber die Id geholt, nicht ueber den Namen** —
   * gemessen: fuenf Produkte heissen *,,Gold Standard 100% Whey
   * Vanilla Ice Cream"*, und eine Namenssuche traf die falsche Id.
   *
   * `[read]` **Leer heisst: keine hinterlegten Naehrwerte** (A7) —
   * das ist eine Auskunft, kein Fehler.
   */
  portionen: Array<{ serving_size: string; enercc: number | null }>
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
 * @param seite    0-basiert. `[read]` **Heisst seit G-453/3 nicht mehr
 *                 „Seite", sondern „wie oft nachgeladen"** — es gibt
 *                 keinen Weg zurueck auf Seite 1, nur ein laengeres
 *                 Fenster.
 * @param kategorie G-453: nur Produkte, die eine Zeile dieser
 *                  Kategorie tragen. `null` heisst alle.
 * @param form     G-453: die Darreichungsform, MIT E-Code
 *                 (`Capsule [E0159]`) — die Spalte traegt ihn.
 *
 * ══ G-455: MEHRERE MARKEN ═══════════════════════════════════════════
 *
 * **Tom, G-453:** *„marken muessen noch besser geloest werden, dass
 * ein user seine filtermasken mit marken setzen kann und nicht nur
 * eine marke waehlen."*
 *
 * `[cmd]` **`marke` ist jetzt eine LISTE, ODER-verknuepft.**
 * `[cmd]` **Gemessen 2026-09-15: `search_supplier_products` nimmt
 * weiterhin `p_marke text`** — EINE Marke. **Also kann die Smartsuche
 * mehrere Marken nicht**, und der Tabellenweg uebernimmt (`.in()`).
 *
 * `[read]` **Bei genau EINER Marke bleibt die Smartsuche zustaendig**
 * — sonst verlöre man die Fehlertoleranz fuer den haeufigen Fall.
 */
/**
 * Wie viele Ausschluesse die Datenbank noch mitfiltern kann.
 *
 *  **G-64 hat gemessen, dass  um rund 200 Ids mit
 * *,,URI too long"* kippt** — und die Bibliothek reicht das als LEERE
 * Liste weiter. **150 ist der Abstand dazu.**
 */
const HART_GRENZE = 150

export async function sucheProdukte(
  frage: string,
  marken: readonly string[] = [],
  status: string | null = 'On Market',
  seite = 0,
  kategorie: string | null = null,
  form: string | null = null,
  /**
   * G-455: die Produkt-Ids, die wegen einer Allergie HART ausfallen.
   *
   * `[read]` **Sie werden ABGEZOGEN, nicht markiert** — eine
   * Nussallergie gilt ueberall (Toms Entscheidung).
   */
  harteIds: readonly string[] = [],
): Promise<ProduktListe> {
  const c = createSessionClient().schema('supplements')
  const q = frage.trim()
  // `[read]` **Eine Marke: der Smartweg kann es. Mehrere: nicht.**
  const marke = marken.length === 1 ? marken[0] : null

  // ── Der Weg aus C-495 ────────────────────────────────────────────
  //
  // `[cmd]` **C-495 ist seit 2026-09-14, 15:31 Uhr eingespielt** —
  // gemessen: `search_supplier_products('gold standart wey')` gibt 50
  // Treffer, `supplier_product_brands` 4.907 Zeilen.
  //
  // `[read]` **Nur bei einem Begriff** — eine Aehnlichkeitssuche ohne
  // Begriff hat nichts, wogegen sie messen koennte. Die leere Liste
  // beim Oeffnen des Reiters kommt deshalb immer aus dem Tabellenweg.
  //
  // `[cmd]` **UND nur ohne Kategorie- und Formfilter.** **Die Funktion
  // nimmt vier Argumente** (`p_query, p_market_status, p_marke,
  // p_limit`) — **weder Kategorie noch Form sind darunter.** `[read]`
  // **Sie nachtraeglich auf der geladenen Menge zu filtern waere die
  // Falle aus G-133:** die Ausgefilterten fehlten, `gesamt` waere
  // gelogen, und beim Nachladen kaemen wieder ungefilterte Zeilen.
  // **Also: einer der beiden gewaehlt -> der Tabellenweg, der in der
  // Datenbank filtert.**
  //
  // `[cmd]` **Und nur auf der ersten Ladung** — die Funktion kennt
  // kein `OFFSET`. `[read]` **Wer nachlaedt, bekommt den Tabellenweg**;
  // bei einer Aehnlichkeitssuche ist das kein Verlust, denn `p_limit`
  // deckelt ohnehin nach Rang.
  //
  // `[cmd]` **G-455: und nur bei HOECHSTENS EINER Marke** — die
  // Funktion nimmt `p_marke text`, kein Array (gemessen 2026-09-15).
  if (q && !kategorie && !form && seite === 0 && marken.length <= 1) {
    try {
      const { data, error } = await c.rpc('search_supplier_products', {
        p_query: q,
        p_marke: marke,
        p_market_status: status,
        p_limit: SUCH_GRENZE,
      })
      if (!error && Array.isArray(data)) {
        const roh = (data as Array<Record<string, unknown>>)
          .flatMap(r => zeileAus(r) ?? [])
        // ══ G-455: der harte Filter gilt AUCH hier ════════════════
        //
        // `[cmd]` **`search_supplier_products` kennt die Allergien
        // nicht** — sie nimmt vier Argumente, keine Ausschlussliste.
        // `[read]` **Also wird nach dem Lesen abgezogen.**
        //
        // `[read]` **Das ist hier VERTRETBAR, anders als beim
        // Kategoriefilter** (G-133/G-453): die Funktion liefert
        // hoechstens `SUCH_GRENZE` Zeilen, es gibt kein Nachladen, und
        // `gesamt` ist die Laenge der gezeigten Liste. **Es entsteht
        // also keine gelogene Gesamtzahl und keine zweite Seite mit
        // ungefilterten Zeilen.**
        const zeilen = harteIds.length > 0
          ? roh.filter(z => !harteIds.includes(z.id))
          : roh
        return {
          zeilen, gesamt: zeilen.length, weg: 'smart', fehler: null,
          hartEntfernt: roh.length - zeilen.length,
        }
      }
    } catch {
      // `[read]` **Bewusst stumm weiter zum Rueckfall** — der
      // Tabellenweg beantwortet dieselbe Frage, nur ohne
      // Fehlertoleranz.
    }
  }

  // ── Der Rueckfall: die Tabelle selbst ────────────────────────────
  //
  // `[cmd]` **`count: 'exact'` statt `.length`** — PostgREST deckelt
  // die Zeilen bei 1.000, und `zeilen.length` waere bei 214.780 immer
  // die Seitengroesse. Die Gesamtzahl kommt aus dem Zaehler, nicht aus
  // dem Array.
  try {
    // ══ G-453: die Kategorie filtert PRODUKTE ══════════════════════
    //
    // **Tom, 2026-09-14, auf die Rueckfrage:** *„Kategorienfilter: auf
    // PRODUKTE. Trefferliste einschraenken, Tafel zeigt weiter ALLE
    // Zeilen. Der Filter ist ein Suchwerkzeug."*
    //
    // `[cmd]` **`!inner` ist der Unterschied zwischen Filtern und
    // Anhaengen:** ohne das `!inner` liefert PostgREST jedes Produkt
    // und haengt eine leere Zutatenliste an — der Filter waere
    // wirkungslos und `count` unveraendert.
    //
    // `[read]` **Und `select` statt zweier Abfragen**, weil die
    // Datenbank die Einschraenkung ohnehin macht; eine Vorabliste von
    // Produkt-Ids waere bei 111.522 Treffern (`other ingredient`)
    // nicht uebertragbar.
    const spalten = 'id,name_en,marke,market_status,produktform,'
      + 'portionsgroesse,portionseinheit'
    let f = kategorie
      ? c.from('supplier_products')
          .select(`${spalten},product_contents!inner(ingredient_category)`,
                  { count: 'exact' })
          .eq('product_contents.ingredient_category', kategorie)
      : c.from('supplier_products').select(spalten, { count: 'exact' })
    if (status) f = f.eq('market_status', status)
    // ══ G-455: MEHRERE MARKEN, ODER-verknuepft ═══════════════════
    //
    // **Tom:** *„dass ein user seine filtermasken mit marken setzen
    // kann und nicht nur eine marke waehlen."*
    //
    // `[read]` **`.in()` statt `.eq()`** — und es filtert in der
    // DATENBANK, also stimmt `count` auch bei drei Marken.
    if (marken.length === 1) f = f.eq('marke', marken[0])
    else if (marken.length > 1) f = f.in('marke', [...marken])
    // ══ G-455: der harte Allergiefilter ═════════════════════════
    //
    // `[read]` **In der Datenbank abgezogen, nicht auf der Seite** —
    // die Lehre aus G-133: clientseitig blieben die Ausgefilterten
    // beim Nachladen stehen, und `gesamt` waere gelogen.
    //
    // `[cmd]` **`not in` vertraegt keine beliebig lange Liste** — die
    // Adresse waere sonst zu lang (G-64: `.in()` kippt um 200 Ids mit
    // *„URI too long"*, und die Bibliothek meldet das als LEERE
    // Liste). **Deshalb gedeckelt, und der Rest wird nach dem Lesen
    // abgezogen; die Oberflaeche sagt, wenn das passiert.**
    if (harteIds.length > 0 && harteIds.length <= HART_GRENZE) {
      f = f.not('id', 'in', `(${harteIds.join(',')})`)
    }
    // `[cmd]` **G-453: die Form kommt MIT E-Code** — die Spalte traegt
    // `Capsule [E0159]`, und ein Vergleich gegen `Capsule` traefe
    // nichts. `[read]` **Ohne Code steht sie nur auf dem Schirm**
    // (`formLabel`).
    if (form) f = f.eq('produktform', form)
    if (q) f = f.ilike('name_en', `%${q}%`)
    // ══ G-453/3: EIN WACHSENDES FENSTER, KEINE SEITE ═══════════════
    //
    // `[cmd]` **Hier stand `.range(seite * SEITE, seite * SEITE +
    // SEITE - 1)`** — ein Fenster, das WANDERT. `[read]` **Jetzt eines,
    // das WAECHST:** immer von 0 bis `(seite + 1) * SEITE`.
    //
    // `[read]` **Der Unterschied ist der Knopf.** *„Mehr laden"* haengt
    // die naechsten 500 an die vorhandenen an; ein wanderndes Fenster
    // haette sie ersetzt, und der Nutzer haette seine Stelle verloren.
    //
    // `[cmd]` **Die Kosten sind gemessen** (siehe `SEITE`): das erste
    // Fenster 23 ms / 3.002 Knoten, das zweite bleibt flach, weil
    // `OFFSET 0` nie in die Tiefe geht. **Teuer ist tiefes Blaettern,
    // nicht die Menge** — und genau das gibt es hier nicht mehr.
    const bis = (seite + 1) * SEITE - 1
    const { data, error, count } = await f
      .order('name_en', { ascending: true })
      .range(0, bis)
    if (error) {
      return { zeilen: [], gesamt: 0, weg: 'einfach', fehler: error.message }
    }
    const roh = (Array.isArray(data) ? data as Array<Record<string, unknown>> : [])
      .flatMap(r => zeileAus(r) ?? [])
    // `[read]` **Nur der Rest oberhalb der Deckelung** — bis
    // `HART_GRENZE` hat die Datenbank schon gefiltert, und `count`
    // stimmt dann. `[cmd]` **Darueber wird nachgezogen, und `gesamt`
    // traegt die Unschaerfe**: die Oberflaeche sagt es.
    const zeilen = harteIds.length > HART_GRENZE
      ? roh.filter(z => !harteIds.includes(z.id))
      : roh
    return {
      zeilen,
      gesamt: count ?? zeilen.length,
      weg: 'einfach',
      fehler: null,
      hartEntfernt: roh.length - zeilen.length,
      // `[read]` **Die Oberflaeche muss wissen, ob `gesamt` genau ist**
      // — bei mehr als `HART_GRENZE` Ausschluessen ist es eine
      // Obergrenze, keine Zahl.
      gesamtUnscharf: harteIds.length > HART_GRENZE,
    }
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
    // ══ G-453: POSTGREST DECKELT BEI 1.000 ═══════════════════════
    //
    // `[cmd]` **Hier stand ein blosses `.select('marke')`, und der
    // Reiter zeigte *„1.000 Marken"*** — gemessen 2026-09-14 im
    // Browser, waehrend die Sicht in der Datenbank **4.907** Zeilen
    // hat.
    //
    // `[read]` **Die Grenze ist eine Voreinstellung von PostgREST,
    // kein Fehler der Sicht** — und `.limit(20000)` hebt sie NICHT
    // auf. **Was hilft, ist geblaettertes Lesen mit `range`.**
    //
    // `[cmd]` **Fuenf Seiten a 1.000 reichen** (4.907); die Schleife
    // hoert auf, sobald eine Seite kuerzer als die Seitengroesse
    // zurueckkommt. **Die Obergrenze von zehn Runden ist eine
    // Reissleine**, kein erwarteter Fall — sie verhindert eine
    // Endlosschleife, wenn die Sicht einmal wachsen sollte.
    const GROESSE = 1000
    const alle: string[] = []
    for (let runde = 0; runde < 10; runde++) {
      const von = runde * GROESSE
      const { data, error } = await c.from('supplier_product_brands')
        .select('marke').range(von, von + GROESSE - 1)
      if (error) break
      const stueck = (Array.isArray(data) ? data as Array<Record<string, unknown>> : [])
        .flatMap(r => s(r.marke) ?? [])
      alle.push(...stueck)
      if (stueck.length < GROESSE) break
    }
    if (alle.length > 0) {
      return { marken: Array.from(new Set(alle)).sort(), vollstaendig: true }
    }
  } catch {
    // `[read]` **Stumm weiter zum Rueckfall** — faellt die Sicht aus,
    // liefert die Tabelle einen Ausschnitt, und die Oberflaeche sagt
    // es.
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

/**
 * Die vier Klassen aus C-505 — und nur die vier.
 *
 * `[read]` **Ein unbekannter Wert wird `null`, nicht geraten.**
 * `[cmd]` **Kaeme eine fuenfte Klasse dazu, gruppierte die Tafel sie
 * wie vor G-464** — sichtbar falsch ist besser als stumm falsch
 * einsortiert.
 */
export function pruefeKlasse(v: unknown): InhaltsZeile['content_class'] {
  return v === 'naehrwert' || v === 'wirkstoff'
    || v === 'hilfsstoff' || v === 'kandidat'
    ? v
    : null
}

function inhaltAus(r: Record<string, unknown>): InhaltsZeile | null {
  const id = s(r.id) ?? s(r.product_content_id)
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
    // ══ G-464: DIE MARKE HAENGT AN BEIDEM ════════════════════════
    //
    // `[cmd]` **Hier stand nur `supplement_id`** — und `Calcium` mit
    // dem gueltigen Mapping `CA` galt als unbekannt (Toms Befund).
    //
    // `[read]` **`nutrient_code` ist der zweite Weg:** die Zeile ist
    // als NAEHRWERT auswertbar, auch wenn keine Substanz im
    // Wirkstoffkatalog ihr entspricht.
    bekannt: s(r.supplement_id) !== null
      || s(r.nutrient_code) !== null
      || s(r.supplement_name_en) !== null,
    content_class: pruefeKlasse(r.content_class),
  }
}

/**
 * Ein Produkt vollstaendig — Kopf, Etikett, Firmen.
 *
 * ══ WARUM HIER NICHT C-495 GERUFEN WIRD ═════════════════════════════
 *
 * `[cmd]` **Hier stand `rpc('supplier_product_detail', { p_id: id })`
 * — und der Aufruf ist NIE durchgegangen.** Die Funktion heisst ihr
 * Argument `p_product_id`; Postgres meldet *„No function matches the
 * given name and argument types"*, der `catch` schluckte es, und
 * gelesen wurde immer der Tabellenweg darunter. **Die Anzeige war
 * richtig, der Grund war falsch** — genau die Art Fehler, die erst in
 * Monaten auffaellt.
 *
 * `[cmd]` **Beim Berichtigen gemessen, warum der Name nicht das
 * einzige Problem war** (2026-09-14, gegen `21cfe048` und
 * `6ef78e94`):
 *
 *     contents-Felder   amount_per_serving, amount_qualifier,
 *                       blend_id, ingredient_category,
 *                       ingredient_name, reihenfolge,
 *                       supplement_name_en, unit
 *     -> KEIN `id`
 *     header-Felder     gtin, marke, market_status, name_en,
 *                       packungs*, portions*
 *     -> KEIN `suggested_use`, KEIN `produktform`
 *
 * `[read]` **Beides bricht eine Abnahmebedingung.**
 *
 * **1** — `[cmd]` **`blend_id` zeigt auf die `id` der Kopfzeile**
 * (G-452). **C-495 liefert das `blend_id`, aber nicht die `id`, auf
 * die es zeigt** — 28 von 54 Zeilen bei `21cfe048` tragen einen
 * Zeiger ohne Ziel. **Die Einrueckung waere nicht herstellbar** (A5).
 *
 * **2** — `[cmd]` **`suggested_use` fehlt im Kopf**, und A6 verlangt
 * den Einnahmehinweis.
 *
 * `[read]` **Deshalb liest das Detail die drei Tabellen.** **Das ist
 * kein Nachbauen einer C-495-Funktion** — es ist dieselbe Leseart, die
 * schon vor C-495 lief, und sie bleibt, bis die Funktion `id` und
 * `suggested_use` mitliefert. **Such- und Markenweg nutzen C-495
 * sehr wohl**, dort ist sie der bessere Weg.
 *
 * `[read]` **Die drei Abfragen laufen parallel** — keine baut auf
 * einer anderen auf.
 */
/**
 * Die Etikettenzeilen aus Sicht (C-505) und Tabelle.
 *
 * `[read]` **Die Ordnung fuehrt, nicht die Sicht** — sonst stuenden
 * die Zeilen in der Reihenfolge, die Postgres gerade liefert, und das
 * Etikett verloere seine eigene Abfolge.
 *
 * `[cmd]` **Ist die Sicht leer, traegt die Tabelle allein** — dann
 * fehlt die Einstufung, und `content_class` bleibt `null`.
 */
function zeilenVerbinden(
  ausSicht: unknown, ausTabelle: unknown,
): InhaltsZeile[] {
  const sicht = (Array.isArray(ausSicht) ? ausSicht : []) as Array<Record<string, unknown>>
  const ordnung = (Array.isArray(ausTabelle) ? ausTabelle : []) as Array<Record<string, unknown>>

  const nachId = new Map<string, Record<string, unknown>>()
  for (const r of sicht) {
    const k = s(r.product_content_id)
    if (k) nachId.set(k, r)
  }

  // `[read]` **Die Tabelle gibt die Reihenfolge vor** — jede ihrer
  // Zeilen einmal, angereichert um das, was die Sicht dazu weiss.
  if (ordnung.length > 0) {
    return ordnung.flatMap(o => {
      const k = s(o.id)
      const dazu = k ? nachId.get(k) : undefined
      // `[cmd]` **Ohne Gegenstueck in der Sicht bleibt die Zeile
      // trotzdem stehen** — eine fehlende Einstufung darf keine
      // Etikettenzeile verschlucken.
      return inhaltAus({ ...(dazu ?? {}), ...o }) ?? []
    })
  }

  // Rueckfall: nur die Sicht.
  return sicht.flatMap(r => inhaltAus(r) ?? [])
}

export async function ladeProdukt(id: string): Promise<ProduktSatz | null> {
  const c = createSessionClient().schema('supplements')

  try {
    const [kopfA, inhaltA, ordnungA, firmenA, portionenA] = await Promise.all([
      c.from('supplier_products')
        .select('id,name_en,marke,market_status,produktform,packungsgroesse,packungseinheit,portionsgroesse,portionseinheit,gtin,suggested_use')
        .eq('id', id).maybeSingle(),
      // ══ G-464: DIE SICHT AUS C-505, NICHT DIE ROHTABELLE ═══════
      //
      // `[cmd]` **Hier stand `from('product_contents')`** — und die
      // Tabelle traegt weder `nutrient_code` noch die Einstufung.
      // **Deshalb konnte die Tafel die Marke nur an `supplement_id`
      // haengen und musste die Gruppe aus `ingredient_category`
      // raten.**
      //
      // `[cmd]` **`supplier_product_content_catalog` (C-505) traegt
      // beides** — gemessen 2026-09-17, `authenticated` hat SELECT.
      //
      // `[read]` **`blend_id` fehlt der Sicht** (gemessen) — die
      // Einrueckung kommt weiter aus `product_contents`, und beide
      // Abfragen werden ueber `product_content_id` zusammengefuehrt.
      c.from('supplier_product_content_catalog')
        .select('product_content_id,ingredient_name,ingredient_category,amount_per_serving,unit,amount_qualifier,ist_wirkstoff,supplement_id,nutrient_code,content_class')
        .eq('product_id', id),
      c.from('product_contents')
        .select('id,blend_id,reihenfolge')
        .eq('product_id', id).order('reihenfolge', { ascending: true, nullsFirst: false }),
      c.from('product_suppliers')
        .select('rolle,suppliers(name,land)').eq('product_id', id),
      // G-484: die Portionen -- ueber die ID, nicht den Namen.
      c.from('supplier_product_nutrient_serving_options')
        .select('serving_size,enercc')
        .eq('product_id', id)
        .order('serving_size', { ascending: true }),
    ])
    const k = kopfA.data as Record<string, unknown> | null
    if (!k || !s(k.name_en)) return null
    return {
      id,
      // G-484: leer heisst: keine hinterlegten Naehrwerte (A7).
      portionen: ((portionenA.data ?? []) as Array<Record<string, unknown>>)
        .flatMap(r => {
          const g = s(r.serving_size)
          return g === null ? [] : [{ serving_size: g, enercc: n(r.enercc) }]
        }),
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
      // ══ G-464: Sicht und Tabelle zusammenfuehren ═══════════════
      //
      // `[read]` **Die Sicht sagt WAS die Zeile ist, die Tabelle WO
      // sie steht** — `blend_id` (Einrueckung) und `reihenfolge`
      // (Etikettenordnung) gibt es nur in `product_contents`.
      //
      // `[cmd]` **Faellt die Sicht aus, traegt die Tabelle allein**:
      // dann fehlen `nutrient_code` und `content_class`, die Marke
      // haengt wieder an `supplement_id`, und die Tafel gruppiert wie
      // vor G-464. `[read]` **Ein Rueckfall, der WENIGER kann, ist
      // besser als eine leere Tafel** — aber er muss sichtbar sein.
      inhalt: zeilenVerbinden(inhaltA.data, ordnungA.data),
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
