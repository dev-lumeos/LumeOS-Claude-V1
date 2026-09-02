'use client'

// Der Tab „Food DB" mit echten Daten (G-66).
//
// QUELLE: theme-v1/module-nutrition.jsx:520 (`NutritionFoods`).
//
// UEBERNOMMEN: Aufbau und Reihenfolge — Suchfeld, `Filters`,
// `+ Custom food`, eine Reihe Kategorie-Pillen, Tabelle mit
// ★ · Food · Source · kcal/100g · P · C · F · Add.
//
// DIE DATENSCHICHT WIRD GETEILT, NICHT KOPIERT. Der Tab ruft
// `/api/nutrition/foods` auf — dieselbe Route wie `/v2/nutrition/suche`.
// `[cmd]` Dort sitzen `getLocalFoodSearch` und `recordFoodSearchEvent`
// in einem Aufruf; jede Suche von hier schreibt also eine Zeile nach
// `nutrition.search_events`, ohne dass dieser Tab das Protokoll kennt.
//
// `[read]` WARUM DIE EIGENE SEITE BLEIBT: `/v2/nutrition/suche` traegt
// die Detailansicht mit Naehrwertreitern, Portionen und
// Zerlegungsanzeige — das ist eine Arbeitsflaeche, kein Tab-Inhalt.
// Der Tab ist die Uebersicht des Entwurfs; wer ein Lebensmittel
// wirklich ansehen will, geht auf die Seite. Der Tab verlinkt sie.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Card, Pill, Icon, InEntwicklungKnopf } from '@lumeos/ui'

// G-70 / G-112: die acht Achsen und der Mehrfachfilter — serverfrei.
import {
  ALLE_SORTIERUNGEN, SORT_TEXT, SORTIERT_SEITE,
  serverKann, serverSort, sortiereSeite, naechsteSortierung,
  type Sortierung,
} from '../../../lib/nutrition/food-sortierung'
import type {
  NutritionFoodSearchPayload, NutritionFoodSearchRow,
} from '../../../lib/nutrition/food-search'
// G-67: der Daumen in der Trefferliste.
import { DaumenKnoepfe, type Daumen } from './daumen'
import { daumenLesen } from './daumen-aktion'
import { ErfassenModal } from './erfassen-modal'
// G-251: die Herkunfts-Filter. `[read]` A-30: nur Typen und
// Konstanten, kein Leseweg — die Datei ist serverfrei.
import {
  FILTER_LAGE, LEER_SATZ, SUCH_HERKUNFT, type SuchHerkunft,
} from '../../../lib/nutrition/herkunft-filter'

/**
 * Die Pillen des Entwurfs, auf die Kategoriewurzeln abgebildet.
 *
 * `[cmd]` Der Entwurf zeigt zehn: All · Favorites · Recent · Meat ·
 * Fish · Grains · Dairy · Produce · Beverages · Supplements.
 *
 * `[read]` Sieben davon tragen. Was fehlt, steht im Bericht:
 *   - `Favorites` und `Recent` sind KEINE Kategorien. Favorites haengt
 *     an `food_preference_items` (C-94, ausdruecklich nicht dieser
 *     Auftrag), Recent am Protokoll `meal_items`.
 *   - `Supplements` hat keine Entsprechung — der BLS fuehrt keine
 *     Nahrungsergaenzung; das ist das Supplements-Modul.
 *   - `Produce` deckt ZWEI Wurzeln (Gemuese 717 + Obst 275).
 */
const PILLEN: Array<{ label: string; slug: string | null }> = [
  { label: 'All', slug: null },
  { label: 'Meat', slug: 'fleisch-gefluegel' },
  { label: 'Fish', slug: 'fisch-meeresfruechte' },
  { label: 'Grains', slug: 'getreide-brot-pasta' },
  { label: 'Dairy', slug: 'milch-kaese' },
  { label: 'Produce', slug: 'gemuese' },
  { label: 'Fruit', slug: 'obst' },
  { label: 'Beverages', slug: 'getraenke' },
  { label: 'Eggs', slug: 'eier' },
  { label: 'Fats & oils', slug: 'fette-oele' },
  { label: 'Sweets', slug: 'suesses-snacks' },
  { label: 'Legumes & nuts', slug: 'huelsenfruechte-nuesse-samen' },
  { label: 'Spices', slug: 'wuerzmittel-gewuerze' },
]

/** Zeilen je Seite. `[read]` 50 wie bisher — nur jetzt blaetterbar. */
const SEITE_GROESSE = 50

// G-70: die Sortierlogik steht serverfrei in `food-sortierung.ts`.
// `[cmd]` **Hier stand eine zweite Liste mit vier Werten** — sie hielt
// fest, was die Datenbank kann, und liess die uebrigen sechs Achsen
// aus E-23 unter den Tisch fallen.

/**
 * Die Filtergruppen (G-73).
 *
 * `[cmd]` Alle Zahlen am 2026-08-20 gegen `nutrition.food_tags`
 * gemessen. Sie stehen an der Option, damit niemand zwei Filter
 * kombiniert, die zusammen null Treffer ergeben.
 *
 * `[cmd]` **`halal`, `kosher` und `thai_food` fehlen bewusst** — die
 * ersten beiden sind Presets (C-93), `thai_food` hat null Zuordnungen.
 *
 * `[read]` **Die Allergene schalten anders:** man sucht *ohne*
 * Laktose, nicht *mit*. Sie stehen deshalb in einer eigenen Gruppe mit
 * eigener Beschriftung — die Zahl daneben ist die Zahl der
 * MARKIERTEN, nicht die der uebrigbleibenden.
 */
// ── G-153 (2026-08-22): DIE ZAHLEN STEHEN NICHT MEHR HIER ────────
//
// `[cmd]` Bis heute trug jede Option ihre Trefferzahl im Quelltext:
// `{ code: 'vegan', label: 'Vegan', anzahl: 1377 }`. **Alle acht
// stimmten** — am 2026-08-22 gegen `food_tags` nachgezaehlt. **Es war
// kein Fehler, sondern ein Risiko:** sie standen im Code und aenderten
// sich nicht mit den Daten. Bei den Allergenen war genau das
// schiefgegangen (G-133: *„Ohne Laktose 1.021"* war die Zahl MIT).
//
// `[cmd]` **`food_search` liefert sie ohnehin mit** — im `tags`-Block,
// je Code mit `count` (075, `tag_counts`). Es braucht keine zweite
// Abfrage, nur das Durchreichen.
//
// `[read]` **Hier gehoeren sie ersetzt, nicht entfernt.** Anders als
// bei den Allergenen steht die Zahl VOR der Auswahl und hilft beim
// Waehlen; die Trefferzahl ueber der Liste sagt sie nicht voraus.
const FILTERGRUPPEN: Array<{
  titel: string
  art: 'auswahl' | 'ausschluss'
  optionen: Array<{ code: string; label: string }>
}> = [
  {
    // ══ G-134 / E-49: `diet` mischt drei Fragen ══════════════
    //
    // `[cmd]` **Gemessen am 2026-09-02 in `tag_definitions`:** neun
    // Tags tragen `tag_type = 'diet'` — **vier Naehrwertangaben
    // (`high_protein`, `low_carb`, `low_fat`, `high_fiber`), zwei
    // Ernaehrungsformen, `halal`, `kosher` und `thai_food`.**
    //
    // `[read]` **Drei Fragen in einem Feld:** *was isst du nicht*,
    // *wie ist es zusammengesetzt*, *wie stark verarbeitet*. **Die
    // Oberflaeche trennt sie hier;** `tag_type` in der Datenbank
    // bleibt, wie es ist.
    titel: 'Ernährungsform',
    art: 'auswahl',
    optionen: [
      // `[cmd]` Jeder vegane Eintrag traegt auch `vegetarian` — die
      // veganen sind eine Teilmenge. Deshalb stehen sie nebeneinander
      // und nicht als „oder".
      { code: 'vegan', label: 'Vegan' },
      { code: 'vegetarian', label: 'Vegetarisch' },
      // `[cmd]` **`halal` und `kosher` standen in KEINER Gruppe** —
      // sie waren in der Oberflaeche nicht erreichbar, obwohl die
      // Tags seit jeher in der Datenbank stehen (sort_order 130,
      // 140).
      { code: 'halal', label: 'Halal' },
      { code: 'kosher', label: 'Koscher' },
      // ══ `thai_food` ist geparkt, nicht eingeordnet ═════════
      //
      // **E-49:** *,,`thai_food` faellt heraus — eine Kueche."*
      //
      // `[read]` **Eine Kueche ist keine Ernaehrungsform:** wer thai
      // isst, isst nicht *nur* thai, und die anderen vier schliessen
      // etwas aus. **Hierher gehoert sie nicht.**
      //
      // `[read]` **Sie steht trotzdem hier, bis `preferred_cuisines`
      // kommt** — sonst waere der Tag unerreichbar, und ein
      // vorhandener Filter, den niemand mehr findet, ist schlimmer
      // als einer an der falschen Stelle. **Der Vermerk sagt es.**
      { code: 'thai_food', label: 'Thai (Kueche — geparkt)' },
    ],
  },
  {
    titel: 'Nährwert',
    art: 'auswahl',
    optionen: [
      { code: 'high_protein', label: 'Proteinreich' },
      { code: 'low_carb', label: 'Low-Carb' },
      { code: 'low_fat', label: 'Fettarm' },
      { code: 'high_fiber', label: 'Ballaststoffreich' },
    ],
  },
  {
    titel: 'Verarbeitung',
    art: 'auswahl',
    optionen: [
      { code: 'whole_food', label: 'Grundnahrungsmittel' },
      { code: 'ultra_processed', label: 'Hochverarbeitet' },
    ],
  },
]

/**
 * Die Allergene — Ausschluss, nicht Auswahl.
 *
 * `[read]` Man sucht *ohne* Laktose. Das ist die umgekehrte Schaltung
 * der Gruppen oben.
 *
 * `[cmd]` **Seit C-164 kann die Suchfunktion es selbst** — `p_filters`
 * traegt `exclude_tag_codes` und entfernt Treffer aus der
 * GESAMTMENGE, nicht nur aus der geladenen Seite (SSOT 169).
 * Gemessen: ohne Filter 7.140, mit `contains_lactose` **6.119**.
 *
 * `[cmd]` **Der Kommentar hier behauptete bis G-133 das Gegenteil** —
 * *„es gibt keinen Parameter fuer ohne"*. Das stimmte, bis C-164 ihn
 * gebaut hat, und stand danach vier Wochen falsch da.
 *
 * `[read]` **Preferences bleibt etwas anderes** (C-94): das ist der
 * gespeicherte Wunsch einer Nutzerin, der fuer JEDE Suche gilt. Dieser
 * Schalter filtert nur diese eine. GO-22 unterscheidet beides
 * ausdruecklich; beide wirken nebeneinander.
 */
/**
 * Die Beschriftung eines Tag-Codes (G-101).
 *
 * `[read]` Der Code steht im Zustand, aber `high_protein` ist nichts,
 * was man einem Nutzer hinschreibt. Die Gruppen fuehren die
 * Beschriftung ohnehin — hier wird sie nur gefunden.
 */
function filterLabel(code: string): string {
  for (const g of FILTERGRUPPEN) {
    const o = g.optionen.find(x => x.code === code)
    if (o) return o.label
  }
  return code
}

/** Ein gesetzter Filter ueber der Liste, mit Weg-Knopf (G-101). */
function FilterChip({ label, onWeg }: { label: string; onWeg: () => void }) {
  return (
    <span
      className="v2-pill"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 6px 3px 10px', fontSize: 11,
        borderColor: 'color-mix(in oklch, var(--acc-nutri) 45%, var(--border))',
        color: 'var(--acc-nutri)',
        background: 'color-mix(in oklch, var(--acc-nutri) 10%, transparent)',
      }}
    >
      {label}
      <button
        type="button"
        aria-label={`Filter ${label} aufheben`}
        onClick={onWeg}
        style={{
          background: 'none', border: 0, padding: 0, cursor: 'pointer',
          color: 'inherit', display: 'inline-flex', alignItems: 'center',
        }}
      >
        <Icon name="x" className="v2-ic v2-ic-sm" />
      </button>
    </span>
  )
}

/**
 * Die Allergen-Gruppe ist WEG (G-154).
 *
 * `[cmd]` **`ADR_NUTRITION_PREFERENCES_V1` (Final, April 2026):**
 * Allergie ist `hard` — *„absoluter Ausschluss, nie anzeigen, nie
 * vorschlagen"*. **Ein Schalter, mit dem man einen absoluten
 * Ausschluss an- und ausknipst, widerspricht dem.**
 *
 * `[cmd]` **G-133 hatte hier drei Pillen mit `?ohne=` angeschlossen.**
 * Die Durchreiche bleibt und wird gebraucht — sie traegt jetzt die
 * **Unvertraeglichkeiten**, und zwar in der Gegenrichtung: `strong`
 * heisst *„nur auf explizite User-Suche anzeigen"*, die Zeilen sind
 * also von sich aus weg und ein Schalter holt sie DAZU.
 *
 * `[read]` **Was hard ist, hat keinen Schalter** — es steht unter
 * Preferences und wirkt still.
 */

/** Eine Trefferzahl in deutscher Schreibweise. */
function facettenZahl(n: number): string {
  return n.toLocaleString('de-DE')
}

/**
 * Wie `food_search` Unvertraeglichkeits-Codes auf Tags abbildet.
 *
 * `[cmd]` Uebernommen aus `allergy_tag_map` der Funktion (075) —
 * sieben Codes auf drei Tags. **Nicht neu erfunden:** waeren die
 * beiden Listen verschieden, zeigte die Oberflaeche etwas anderes an,
 * als die Datenbank tut.
 */
const UNVERTRAEGLICH_LABEL: Record<string, string> = {
  gluten_wheat: 'Gluten',
  gluten: 'Gluten',
  tree_nuts: 'Nüsse',
  peanuts: 'Erdnüsse',
  nuts: 'Nüsse',
  lactose: 'Laktose',
  milk_protein: 'Milcheiweiss',
}

/**
 * Eine sortierbare Spaltenueberschrift.
 *
 * `[read]` Ein Klick setzt die Sortierung, ein zweiter nimmt sie
 * zurueck auf `relevance`. Die Suchfunktion kennt je Spalte nur EINE
 * Richtung (`kcal_asc`, `protein_desc`) — deshalb kein Umkehren,
 * sondern an/aus. Ein Pfeil, der eine Richtung verspricht, die die
 * Datenbank nicht liefert, waere schlimmer als keiner.
 */
function SortKopf({
  label, spalte, aktiv, setzen,
}: {
  label: string
  spalte: 'protein' | 'kcal' | 'carbs' | 'fat'
  aktiv: Sortierung
  setzen: (s: Sortierung) => void
}) {
  const ab = aktiv === `${spalte}_desc`
  const auf = aktiv === `${spalte}_asc`
  const an = ab || auf
  const titel = ab
    ? `${label}: absteigend — klicken fuer aufsteigend`
    : auf
      ? `${label}: aufsteigend — klicken zum Aufheben`
      : `Nach ${label} sortieren, hoechste zuerst`
  return (
    <button
      type="button"
      aria-pressed={an}
      title={titel}
      onClick={() => setzen(naechsteSortierung(aktiv, spalte))}
      style={{
        background: 'none', border: 0, padding: 0, cursor: 'pointer',
        font: 'inherit', color: an ? 'var(--acc-nutri)' : 'inherit',
        display: 'inline-flex', alignItems: 'center', gap: 3,
      }}
    >
      {label}
      {an && <Icon name={ab ? 'arrow_down' : 'arrow_up'}
                   className="v2-ic v2-ic-sm" />}
    </button>
  )
}

function zahl(text: string): number | null {
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

/** Ein Makro auf eine Nachkommastelle, oder ein Strich. */
function makro(text: string): string {
  const n = zahl(text)
  if (n === null) return '—'
  return n >= 10 ? String(Math.round(n)) : n.toFixed(1)
}

export function NutritionFoodsTab({
  start,
  datum,
  unvertraeglichkeiten = [],
}: {
  start: NutritionFoodSearchPayload | null
  /**
   * G-272: der Tag, in den `+ Add` schreibt.
   *
   * `[read]` **Der Reiter kannte bis heute kein Datum** — er suchte
   * nur. Zum Schreiben braucht er einen Tag, und der steht in der
   * Seitenadresse; ihn hier zu erfinden (etwa „heute") waere eine
   * zweite Wahrheit neben dem Datumswaehler im Kopf.
   *
   * `[read]` **`null` ist erlaubt und heisst: kein Tag bekannt.**
   * Dann bleibt `+ Add` sichtbar, aber stumm — besser als in einen
   * geratenen Tag zu schreiben.
   */
  datum: string | null
  /**
   * G-154: die gesetzten Unvertraeglichkeiten (`strong`).
   *
   * `[cmd]` **Der ADR:** `strong` heisst *„nur auf explizite
   * User-Suche anzeigen"* — die Zeilen sind von sich aus weg, und ein
   * Schalter holt sie dazu. **Wer keine gesetzt hat, sieht die Gruppe
   * nicht** — ein Schalter ohne Wirkung waere schlimmer als keiner.
   */
  unvertraeglichkeiten?: string[]
}) {
  // G-266 / E-33: der Suchbegriff kann aus der Adresse kommen — wer
  // von der Detailsuche zurueckkehrt, findet sein Wort wieder.
  // `[read]` **Als Anfangswert, nicht als Effekt:** so steht er schon
  // beim ersten Bild da und flackert nicht nach.
  const [suche, setSuche] = React.useState(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('q') ?? ''
  })
  const [kategorie, setKategorie] = React.useState<string | null>(null)
  const [payload, setPayload] = React.useState<NutritionFoodSearchPayload | null>(start)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [dauerMs, setDauerMs] = React.useState<number | null>(null)
  // G-272: das Lebensmittel, das gerade erfasst wird — `null` heisst
  // geschlossen.
  const [erfassen, setErfassen] = React.useState<
    { id: string; name: string; kcal: number | null } | null>(null)

  // G-73: Filterleiste, Blaettern und Sortierung.
  const [filterOffen, setFilterOffen] = React.useState(false)
  // ══ G-112: mehrere Filter-Tags ═════════════════════════════════
  // `[cmd]` Hier stand `useState<string | null>` — **ein Tag, oder
  // keiner.** `food_search` kann seit C-164 mehr: `p_filters.tag_groups`
  // nimmt eine Liste von Gruppen, ODER innerhalb, UND zwischen.
  // **Gemessen 2026-08-29: vegan 1.377, high_protein 1.400, ODER 2.712,
  // UND 65.**
  const [tags, setTags] = React.useState<Set<string>>(new Set())
  const [seite, setSeite] = React.useState(0)
  const [sortierung, setSortierung] = React.useState<Sortierung>('relevance')
  /**
   * G-133: Tag-Codes, die `food_search` aus der Gesamtmenge nimmt.
   *
   * `[read]` **Seit G-154 setzt die Oberflaeche sie nicht mehr selbst.**
   * Die Durchreiche bleibt (`?ohne=` → `p_filters.exclude_tag_codes`)
   * und ist gemessen; sie hat nur kein Bedienelement mehr, seit
   * Allergien ueber Preferences laufen.
   */
  const [ohne, setOhne] = React.useState<Set<string>>(new Set())

  // ── G-251: die Herkunfts-Filter ───────────────────────────────────
  //
  // `[read]` **Etwas anderes als die Tag-Filter darueber:** die fragen
  // nach Eigenschaften des Lebensmittels, dieser nach der Beziehung
  // des Nutzers dazu. **Deshalb ein eigener Zustand, keine weitere
  // Tag-Gruppe.**
  //
  // `[read]` **Einer zur Zeit, kein Set.** „Bevorzugt" und „nur eigene"
  // schliessen einander sachlich aus — `foods_custom` traegt keine
  // Vorlieben. Ein Set liesse eine Kombination zu, die immer 0
  // liefert, und die saehe kaputt aus statt leer.
  const [herkunft, setHerkunft] = React.useState<SuchHerkunft | null>(null)

  /**
   * G-154: die gesetzten Unvertraeglichkeiten, benannt.
   *
   * `[cmd]` Nur die, die `food_search` kennt — ein Code ohne Abbildung
   * traegt nichts bei und wuerde eine Zeile anzeigen, die nichts tut.
   */
  /**
   * G-153: die Trefferzahl je Tag, aus der Antwort.
   *
   * `[cmd]` `food_search` liefert sie im `tags`-Block mit
   * (075, `tag_counts`) — je Code ein `count`.
   *
   * `[read]` **Aus `start`, nicht aus `payload`:** die Zahlen sollen
   * den ganzen Katalog beschreiben, nicht die gerade gefilterte
   * Teilmenge. Sonst zeigte „Vegan 1.377" nach dem Klick auf
   * „Vegetarisch" eine andere Zahl, und niemand wuesste, welche gilt.
   */
  const facetten = React.useMemo(() => {
    const k = new Map<string, number>()
    for (const f of start?.tags ?? []) k.set(f.code, f.count)
    return k
  }, [start])

  const unvertraeglichZeigbar = React.useMemo(() => {
    const gesehen = new Set<string>()
    const raus: Array<{ code: string; label: string }> = []
    for (const c of unvertraeglichkeiten) {
      const label = UNVERTRAEGLICH_LABEL[c]
      if (!label || gesehen.has(label)) continue
      gesehen.add(label)
      raus.push({ code: c, label })
    }
    return raus
  }, [unvertraeglichkeiten])

  // G-67: der Daumenstand je Lebensmittel, und was nach dem Abwerten
  // ausgeblendet ist.
  const [daumen, setDaumen] = React.useState<Record<string, Daumen>>({})
  const [ausgeblendet, setAusgeblendet] = React.useState<Set<string>>(new Set())

  const daumenGesetzt = React.useCallback((foodId: string, neu: Daumen) => {
    setDaumen(d => ({ ...d, [foodId]: neu }))
    // `[read]` Tom: „Sicherheitsabfrage, dann weg." Die Zeile
    // verschwindet erst nach dem Bestaetigen — die Abfrage sitzt im
    // Knopf, hier kommt nur noch das Ergebnis an.
    setAusgeblendet(s => {
      const n = new Set(s)
      if (neu === 'disliked') n.add(foodId)
      else n.delete(foodId)
      return n
    })
  }, [])

  // G-266: der erste Lauf wird uebersprungen, weil `start` die
  // Anfangstreffer schon mitbringt. `[read]` **Kam der Begriff aber
  // aus der Adresse, passt `start` nicht dazu** — dann muss die Suche
  // gleich laufen, sonst steht das Wort im Feld und die Liste zeigt
  // etwas anderes.
  const ersterLauf = React.useRef(suche.trim().length === 0)
  const laufend = React.useRef<AbortController | null>(null)

  React.useEffect(() => {
    if (ersterLauf.current) { ersterLauf.current = false; return }
    const zeit = setTimeout(async () => {
      // Laufende Anfrage abbrechen, sonst ueberholt eine langsame
      // aeltere Antwort die neuere — dieselbe Vorsicht wie auf
      // `/v2/nutrition/suche`.
      laufend.current?.abort()
      const ctrl = new AbortController()
      laufend.current = ctrl

      setLaeuft(true)
      setFehler(null)
      const start = performance.now()
      const params = new URLSearchParams({
        q: suche,
        limit: String(SEITE_GROESSE),
        offset: String(seite * SEITE_GROESSE),
        // G-70: nur was die Datenbank kann; der Rest wird auf der
        // Seite sortiert (`sortiereSeite`).
        sort: serverSort(sortierung),
        // G-154: Preferences sind die Konfiguration dieses Katalogs.
        // `[read]` Tom, 2026-08-22: *„Preferences ist exakt die Konfig
        // fuer den Food-DB-Zugriff des Kunden, dass er das sieht was
        // er sehen will."* Die Kennung selbst steht NICHT in der
        // Adresse — sie kommt aus der Sitzung.
        prefs: '1',
      })
      if (kategorie) params.set('category', kategorie)
      // G-112: alle gewaehlten Tags, kommagetrennt.
      if (tags.size > 0) params.set('tags', Array.from(tags).sort().join(','))
      // G-133: der Ausschluss geht an die Suchfunktion, nicht mehr an
      // einen Filter auf der geladenen Seite.
      if (ohne.size > 0) params.set('ohne', Array.from(ohne).sort().join(','))
      // G-251: die Herkunft geht an die Suchfunktion, nicht an einen
      // Filter auf der geladenen Seite. `[read]` **Dieselbe Lehre wie
      // G-133:** clientseitig blieben die Ausgeschlossenen auf Seite 2
      // stehen — und `total` waere gelogen.
      if (herkunft) params.set('herkunft', herkunft)
      try {
        const antwort = await fetch(`/api/nutrition/foods?${params.toString()}`,
          { signal: ctrl.signal })
        if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`)
        // Die Route gibt die Nutzlast unverpackt zurueck.
        const daten = await antwort.json() as NutritionFoodSearchPayload
        setDauerMs(Math.round(performance.now() - start))
        setPayload(daten)
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return
        setFehler(e instanceof Error ? e.message : String(e))
      } finally {
        setLaeuft(false)
      }
    }, 180)
    return () => clearTimeout(zeit)
    // G-133: `ohne` gehoert in die Abhaengigkeiten. `[cmd]` Vorher
    // fehlte es — der Ausschluss wirkte nur clientseitig und brauchte
    // kein neues Laden. Jetzt entscheidet er die Trefferzahl.
    // G-251: `herkunft` gehoert aus demselben Grund dazu — sie
    // entscheidet die Trefferzahl, nicht die Darstellung.
  }, [suche, kategorie, tags, seite, sortierung, ohne, herkunft])

  // Jede Filteraenderung beginnt wieder auf Seite 1 — sonst stuende
  // man nach dem Filtern auf einer Seite, die es nicht mehr gibt.
  React.useEffect(() => {
    setSeite(0)
  }, [suche, kategorie, tags, sortierung, ohne, herkunft])

  const alleZeilen = React.useMemo<NutritionFoodSearchRow[]>(
    () => payload?.foods ?? [],
    [payload?.foods],
  )
  // Abgewertete Zeilen verschwinden aus der Liste — aber erst nach dem
  // Bestaetigen, und nur bis zum naechsten Laden.
  //
  // ── G-154 (2026-08-22): DIE ENTSCHEIDUNG IST GEDREHT ─────────────
  //
  // `[cmd]` Hier stand bis heute: *„C-94 KANN diese Liste laengst
  // filtern; sie tut es BEWUSST nicht: das hier ist ein Katalog, und
  // ein Katalog, dem Eintraege fehlen, ist kaputt"* (G-13,
  // geprueft in G-104).
  //
  // `[read]` **Tom, 2026-08-22:** *„Preferences ist exakt die Konfig
  // fuer den Food-DB-Zugriff des Kunden, dass er das sieht was er
  // sehen will."* Damit ist es kein neutraler Katalog, sondern SEIN
  // Katalog — und `prefs=1` steht jetzt an der Anfrage.
  //
  // `[cmd]` **`ADR_NUTRITION_PREFERENCES_V1` (Status Final, April
  // 2026) entscheidet dasselbe:** Allergie ist `hard` — *„nie
  // anzeigen, nie vorschlagen"*. Ein Katalog, der sie zeigt, folgt
  // dem ADR nicht.
  //
  // `[read]` Der alte Satz war nicht falsch gedacht, er beantwortete
  // nur eine andere Frage: *„darf eine Liste unvollstaendig sein"* —
  // ja, wenn die Unvollstaendigkeit die Konfiguration IST und
  // dasteht, dass sie wirkt.
  //
  // `[cmd]` **Die Daumen-Ausblendung unten bleibt davon unberuehrt** —
  // sie ist eine Geste in dieser Sitzung, keine Konfiguration.
  // ══ G-70: die sechs Achsen, die die Datenbank nicht kann ═══════
  // `[cmd]` Sie kennt `relevance`, `name_asc`, `protein_desc`,
  // `kcal_asc` — die uebrigen sechs fielen bisher STILL auf
  // `relevance` zurueck (gemessen 2026-08-29). `[read]` **Jeder
  // Treffer traegt alle vier Makros mit**, also wird hier sortiert,
  // ohne `food_search` anzufassen (Codex' Bereich, G-107).
  const zeilen = sortiereSeite(
    alleZeilen.filter(f => !ausgeblendet.has(f.id)),
    sortierung,
  )
  // G-133: Der Allergenfilter der geladenen Seite ist WEG. `[cmd]` Er
  // stand hier seit G-73 und blendete nur aus, was gerade geladen war
  // — bei 143 Seiten standen die Treffer auf Seite 2 wieder da. Seit
  // C-164 filtert `food_search` selbst (`p_filters.exclude_tag_codes`,
  // SSOT 169), und `total` sinkt mit. Beides zugleich waere doppelt.
  const gesamt = payload?.total ?? 0
  const seiten = Math.max(1, Math.ceil(gesamt / SEITE_GROESSE))
  // Die Groesse des GANZEN Katalogs — aus dem ersten, ungefilterten
  // Laden. `gesamt` aendert sich beim Tippen und taugt nicht fuer den
  // Platzhalter.
  const katalogGroesse = start?.total ?? 0
  const aktiveFilter = tags.size + ohne.size
  const filterZuruecksetzen = React.useCallback(() => {
    setTags(new Set())
    setOhne(new Set())
  }, [])

  /** G-112: einen Tag an- oder abwaehlen, ohne die anderen zu verlieren. */
  const tagUmschalten = React.useCallback((code: string) => {
    setTags(alt => {
      const neu = new Set(alt)
      if (neu.has(code)) neu.delete(code)
      else neu.add(code)
      return neu
    })
  }, [])

  // G-67: den Daumenstand zu den sichtbaren Treffern nachladen.
  // `[read]` Ohne ihn saehe jede Zeile unbewertet aus, auch wenn sie es
  // nicht ist — der Auftrag verlangt ausdruecklich, dass der Zustand
  // beim Wiederoeffnen dasteht.
  React.useEffect(() => {
    const ids = alleZeilen.map(f => f.id)
    if (ids.length === 0) return
    let verworfen = false
    void daumenLesen(ids).then(stand => {
      if (verworfen) return
      setDaumen(stand)
      // Was schon abgewertet ist, gehoert beim Laden gleich ausgeblendet.
      setAusgeblendet(new Set(
        Object.entries(stand).filter(([, v]) => v === 'disliked').map(([k]) => k)))
    })
    return () => { verworfen = true }
  }, [alleZeilen])

  return (
    <div style={{ marginTop: 16 }}>
      <div className="v2-train-lib-filter" style={{ marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Icon name="search" className="v2-ic v2-ic-sm"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
          <input
            aria-label="Search foods"
            value={suche}
            onChange={e => setSuche(e.target.value)}
            // G-73: „· BLS (Bundeslebensmittelschluessel)" entfernt,
            // wie im Kopf, in der Suche und im Erfassungsfenster.
            placeholder={katalogGroesse > 0
              ? `Search across ${katalogGroesse.toLocaleString('en-US')} foods`
              : 'Search foods'}
            style={{
              width: '100%', height: 32, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '0 12px 0 30px', fontSize: 12, outline: 'none', color: 'var(--fg)',
            }}
          />
        </div>
        {/* G-73, Tom 2026-08-18: „Wir haben so viel Platz — lass die
            Filter einfach logisch darunter aufbauen, und der
            Filterknopf ist das Setup zum Filter ein- oder
            ausblenden." */}
        <button
          type="button"
          className={filterOffen ? 'v2-btn v2-btn-primary' : 'v2-btn'}
          aria-expanded={filterOffen}
          aria-controls="v2-food-filter"
          onClick={() => setFilterOffen(o => !o)}
        >
          <Icon name="filter" className="v2-ic v2-ic-sm" /> Filters
          {aktiveFilter > 0 && (
            <span className="v2-num" style={{ marginLeft: 6 }}>{aktiveFilter}</span>
          )}
        </button>
        <InEntwicklungKnopf titel="Custom food" className="v2-btn v2-btn-primary">
          <Icon name="plus" className="v2-ic v2-ic-sm" /> Custom food
        </InEntwicklungKnopf>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {PILLEN.map(p => {
          const aktiv = p.slug === kategorie
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setKategorie(p.slug)}
              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
            >
              <Pill variant={aktiv ? 'acc' : undefined}>{p.label}</Pill>
            </button>
          )
        })}
      </div>

      {/* ── G-251: die Herkunfts-Filter ──────────────────────────────
          `[read]` **Eigene Zeile, nicht zwischen die Kategorien.** Die
          Kategoriepillen teilen den Katalog nach dem, WAS ein
          Lebensmittel ist; diese nach der Beziehung des Nutzers dazu.
          Nebeneinander gestellt saehen sie aus wie dreizehn
          gleichrangige Kategorien, und „Bevorzugt" waere eine davon.

          `[cmd]` **Beide gehen an `food_search`** (C-355), nicht an
          einen Filter auf der geladenen Seite — `total` ist deshalb
          die echte Menge, nicht die der Seite. */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap',
        alignItems: 'center' }}>
        <span className="v2-eyebrow" style={{ marginRight: 2 }}>Meine</span>
        {SUCH_HERKUNFT.map(h => {
          const aktiv = herkunft === h
          return (
            <button
              key={h}
              type="button"
              // Nochmal klicken hebt auf — sonst gaebe es keinen Weg
              // zurueck zum vollen Katalog ausser Neuladen.
              onClick={() => setHerkunft(aktiv ? null : h)}
              aria-pressed={aktiv}
              title={FILTER_LAGE[h].hinweis}
              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
            >
              <Pill variant={aktiv ? 'acc' : undefined}>{FILTER_LAGE[h].label}</Pill>
            </button>
          )
        })}
      </div>

      {/* G-73: die Filter stehen darunter, nicht hinter dem Knopf.
          Auf 375 px wird daraus ein Vollbild-Fenster (nutrition.css). */}
      {filterOffen && (
        <div id="v2-food-filter" className="v2-food-filter">
          <div className="v2-food-filter-kopf">
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Filter</span>
            {aktiveFilter > 0 && (
              <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                      onClick={filterZuruecksetzen}>
                Zurücksetzen
              </button>
            )}
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => setFilterOffen(false)}>
              <Icon name="x" className="v2-ic v2-ic-sm" />
              <span className="v2-food-filter-schliessen-text">Schliessen</span>
            </button>
          </div>

          <div className="v2-food-filter-gruppen">
            {FILTERGRUPPEN.map(g => (
              <div key={g.titel}>
                <div className="v2-eyebrow" style={{ marginBottom: 6 }}>{g.titel}</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {g.optionen.map(o => {
                    const aktiv = tags.has(o.code)
                    return (
                      <button
                        key={o.code} type="button"
                        aria-pressed={aktiv}
                        className="v2-pill"
                        style={{
                          cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                          borderColor: aktiv
                            ? 'color-mix(in oklch, var(--acc-nutri) 45%, var(--border))'
                            : 'var(--border)',
                          color: aktiv ? 'var(--acc-nutri)' : 'var(--fg-muted)',
                          background: aktiv
                            ? 'color-mix(in oklch, var(--acc-nutri) 10%, transparent)'
                            : 'var(--surface)',
                        }}
                        onClick={() => tagUmschalten(o.code)}
                      >
                        {o.label}
                        {/* G-153: die Zahl kommt aus dem `tags`-Block der
                            Antwort. Fehlt sie, steht keine da — eine
                            erfundene waere schlimmer als keine. */}
                        {facetten.get(o.code) !== undefined && (
                          <span className="v2-num v2-dim" style={{ marginLeft: 5, fontSize: 10 }}>
                            {facettenZahl(facetten.get(o.code) as number)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* ── G-154: KEIN SCHALTER FUER UNVERTRAEGLICHKEITEN ────
                `[cmd]` **Die Funktion setzt die ADR-Regel bereits um**,
                und zwar ohne Parameter (`075`, `preference_scores`):

                    preference_excluded =
                      hard OR (strong AND p_normalized_query = '')

                **Die „explizite User-Suche" IST das Suchwort.** Wer
                nichts eingibt, sieht `strong` nicht; wer „milch" tippt,
                sieht es. Gemessen am 2026-08-22 auf `dev@lumeos.app`:
                leere Suche **5.292**, „milch" **168 von 261**.

                `[read]` **Ein Schalter waere hier falsch gewesen** — er
                haette entweder nichts getan oder die Regel umgangen.
                Der Auftrag verlangte einen; die Messung sagt, dass die
                Sache schon steht. Im Bericht als Befund. */}
            {unvertraeglichZeigbar.length > 0 && (
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                  Unverträglichkeiten
                </div>
                <div className="v2-dim" style={{ fontSize: 10, lineHeight: 1.5 }}>
                  {unvertraeglichZeigbar.map(u => u.label).join(' · ')} sind
                  ausgeblendet, solange du nichts suchst — <strong>tippe
                  einen Namen</strong>, und sie erscheinen. Allergien
                  bleiben immer ausgeblendet.{' '}
                  Zu ändern unter <strong>Preferences</strong>.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap',
      }}>
        <span className="v2-num" style={{ fontSize: 12 }}>
          {laeuft ? '…' : gesamt.toLocaleString('de-DE')}
          <span className="v2-dim"> Treffer</span>
        </span>
        {dauerMs != null && !laeuft && (
          <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{dauerMs} ms</span>
        )}
        {/* G-73, Tom: „Wenn man Treffer 279 zeigt, dann gibt man auch
            die Moeglichkeit, die alle anzuschauen." Statt „die ersten
            50" steht hier, WELCHE 50 — und die Knoepfe daneben. */}
        {gesamt > 0 && (
          <span className="v2-dim v2-num" style={{ fontSize: 10.5 }}>
            {(seite * SEITE_GROESSE + 1).toLocaleString('de-DE')}–
            {Math.min((seite + 1) * SEITE_GROESSE, gesamt).toLocaleString('de-DE')}
          </span>
        )}
        <Link href={'/v2/nutrition/suche' as Route} className="v2-link"
              style={{ marginLeft: 'auto', fontSize: 11.5 }}>
          Detailsuche mit Nährwerten →
        </Link>
      </div>

      {/*
        G-101, Tom 2026-08-20: „die angezeigte Liste filtermaessig
        anzeigen."

        `[cmd]` **Der Filter griff — man sah es nur nicht.** Gemessen
        am 2026-08-20: nach einem Klick auf „Proteinreich" steht die
        Trefferzahl auf 1.400, Avocado und Banane verschwinden aus der
        Liste. **Aber sobald das Filterband zu ist, kommt das Wort
        „Proteinreich" auf der ganzen Seite null Mal vor** — nur eine
        kleine `1` am Knopf.

        `[read]` Wer eine gefilterte Liste sieht, ohne zu wissen wonach,
        haelt sie fuer die ganze. Deshalb stehen die gesetzten Filter
        jetzt ueber der Liste — mit ihrem Namen, und jeder einzeln
        abwaehlbar.
      */}
      {aktiveFilter > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 12, flexWrap: 'wrap',
        }}>
          <span className="v2-eyebrow">Gefiltert nach</span>
          {Array.from(tags).sort().map(code => (
            <FilterChip
              key={code}
              label={filterLabel(code)}
              onWeg={() => tagUmschalten(code)}
            />
          ))}
          {Array.from(ohne).map(code => (
            <FilterChip
              key={code}
              // G-154: Die Allergen-Liste ist weg; der Chip benennt den
              // Tag-Code, falls `ohne` je wieder gesetzt wird.
              label={`ohne ${filterLabel(code)}`}
              onWeg={() => setOhne(s => {
                const n = new Set(s)
                n.delete(code)
                return n
              })}
            />
          ))}
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                  onClick={filterZuruecksetzen}>
            Alle aufheben
          </button>
        </div>
      )}

      {fehler && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--neg)' }}>
            Die Suche antwortet nicht: {fehler}
          </div>
        </Card>
      )}

      <Card>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                {/* G-67: die schmale erste Spalte des Entwurfs traegt
                    jetzt den Daumen. Sie war fuer das Lesezeichen
                    gedacht; Favorit und Daumen sind zwei Absichten,
                    und `food_preference_items` traegt beide. */}
                <th style={{ width: 58 }} />
                <th>Food</th>
                <th style={{ width: 70 }}>Source</th>
                {/* ══ G-70: alle vier Spalten sortieren ═══════════
                    `[cmd]` Hier stand: *„C und F haben keine
                    Sortierung, eine im Browser waere nur die geladene
                    Seite und damit eine Falschaussage."* **Der
                    Einwand stimmt und ist geloest, nicht umgangen:**
                    die Grenze steht jetzt als Satz unter der Tabelle
                    (`SORTIERT_SEITE`), statt die Achsen wegzulassen.
                    `[cmd]` **Gemessen 2026-08-29: die Datenbank kennt
                    vier Werte, nicht zehn** — `protein_desc`,
                    `kcal_asc`, `name_asc`, `relevance`. Die uebrigen
                    sechs fielen STILL auf `relevance` zurueck. */}
                <th style={{ width: 90, textAlign: 'right' }}>
                  <SortKopf label="kcal/100g" spalte="kcal"
                            aktiv={sortierung} setzen={setSortierung} />
                </th>
                <th style={{ width: 60, textAlign: 'right' }}>
                  <SortKopf label="P" spalte="protein"
                            aktiv={sortierung} setzen={setSortierung} />
                </th>
                <th style={{ width: 60, textAlign: 'right' }}>
                  <SortKopf label="C" spalte="carbs"
                            aktiv={sortierung} setzen={setSortierung} />
                </th>
                <th style={{ width: 60, textAlign: 'right' }}>
                  <SortKopf label="F" spalte="fat"
                            aktiv={sortierung} setzen={setSortierung} />
                </th>
                <th style={{ width: 80, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {zeilen.map(f => {
                const k = zahl(f.enercc)
                return (
                  <tr key={f.id}>
                    <td>
                      <DaumenKnoepfe
                        foodId={f.id}
                        name={f.name_display_de || f.name_de}
                        zustand={daumen[f.id] ?? 'neutral'}
                        onGesetzt={neu => daumenGesetzt(f.id, neu)}
                      />
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                        {f.name_display_de || f.name_de}
                      </div>
                      <div className="v2-muted" style={{ fontSize: 10.5 }}>
                        {f.category_name_de || '—'}
                      </div>
                    </td>
                    <td><Pill>BLS</Pill></td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {k === null ? '—' : Math.round(k)}
                    </td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{makro(f.prot625)}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{makro(f.cho)}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{makro(f.fat)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {/* G-265, Tom: „food db +add falsches modal".
                          `[cmd]` **Gemessen am 2026-08-29:** der Knopf
                          ist ein Link auf die Detailsuche — und dort
                          wurde `?food=` NIE gelesen. Die Zielseite kam
                          leer an: null Treffer, das Lebensmittel
                          nirgends genannt.
                          `[cmd]` **Der Name geht jetzt als `q` mit**,
                          damit die Suche etwas zu suchen hat; die
                          Kennung waehlt den Treffer aus.
                          `[cmd]` **G-272: der Knopf schreibt jetzt.**
                          Er oeffnet das Erfassungsmodal, das ueber
                          `/api/nutrition/diary` in `meals` und
                          `meal_items` schreibt — **derselbe Weg, den
                          das Tagebuch seit C-51 benutzt.** Der Verweis
                          auf die Detailsuche steht daneben als Lupe:
                          *Add* fuegt hinzu, die Lupe zeigt Naehrwerte.
                          */}
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        {/* `[cmd]` **`name_de`, nicht `name_display_de`:**
                            der Anzeigename traegt Klammerzusaetze
                            („Weisser Reis (roh)"), die die Volltextsuche
                            nicht findet — gemessen: 0 Treffer. */}
                        <Link href={`/v2/nutrition/suche?food=${f.id}`
                          + `&q=${encodeURIComponent(f.name_de)}` as Route}
                              className="v2-btn v2-btn-ghost"
                              title="Nährwerte ansehen"
                              aria-label={`Nährwerte von ${f.name_display_de || f.name_de}`}
                              style={{ height: 22, fontSize: 11, padding: '0 7px' }}>
                          <Icon name="search" className="v2-ic v2-ic-sm" />
                        </Link>
                        <button
                          type="button"
                          className="v2-btn"
                          style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                          onClick={() => setErfassen({
                            id: f.id,
                            name: f.name_display_de || f.name_de,
                            kcal: Number(f.enercc) || null,
                          })}
                        >
                          <Icon name="plus" className="v2-ic v2-ic-sm" />Add
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* G-251: leer ist nicht gleich leer.
            `[cmd]` **`foods_custom` hat 0 Zeilen** — wer „Eigene"
            waehlt, bekommt garantiert nichts, und das liegt nicht an
            seinem Suchbegriff. `[read]` **Ein allgemeines „passt
            nichts" liesse ihn die Suche aendern, was nichts aendern
            wuerde.** Deshalb nennt der Satz den Grund. */}
        {zeilen.length === 0 && !laeuft && !fehler && (
          <div className="v2-muted" style={{ fontSize: 12, padding: '14px 0', textAlign: 'center' }}>
            {herkunft
              ? LEER_SATZ[herkunft]
              : 'Kein Lebensmittel passt zu dieser Auswahl.'}
          </div>
        )}

        {/* ══ G-70: die Grenze der Seitensortierung ═══════════════
            `[read]` **Sie steht da, statt die Achsen wegzulassen.**
            `[cmd]` Die Datenbank sortiert vier Werte ueber alle 7.140
            Treffer; die uebrigen sechs ordnen die geladene Seite.
            **Ohne diesen Satz haelt jemand die Seitenspitze fuer die
            Gesamtspitze.** */}
        {!serverKann(sortierung) && zeilen.length > 0 && (
          <div className="v2-dim" style={{
            fontSize: 11, padding: '8px 0', lineHeight: 1.5,
          }}>
            <Icon name="alert" className="v2-ic v2-ic-sm"
                  style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {SORTIERT_SEITE}
          </div>
        )}

        {/* G-73: Blaettern. `[cmd]` `nutrition.food_search` nimmt
            `p_offset` — gemessen: Offset 0 liefert „Tofu", Offset 50
            „Rind Oberschale, roh". */}
        {seiten > 1 && (
          <div className="v2-food-blaettern">
            <button type="button" className="v2-btn v2-btn-sm"
                    disabled={seite === 0 || laeuft}
                    onClick={() => setSeite(s => Math.max(0, s - 1))}>
              <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
              Zurück
            </button>
            <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
              Seite {(seite + 1).toLocaleString('de-DE')} von {seiten.toLocaleString('de-DE')}
            </span>
            <button type="button" className="v2-btn v2-btn-sm"
                    disabled={seite + 1 >= seiten || laeuft}
                    onClick={() => setSeite(s => Math.min(seiten - 1, s + 1))}>
              Weiter
              <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
            </button>
          </div>
        )}
      </Card>

      {/* G-272: das Erfassungsmodal. `[read]` Es steht hier und nicht
          je Zeile — ein Modal je Treffer waere 50 Modale im Baum. */}
      {erfassen && datum && (
        <ErfassenModal
          food={erfassen}
          datum={datum}
          onClose={() => setErfassen(null)}
          onFertig={() => undefined}
        />
      )}
    </div>
  )
}
