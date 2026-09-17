// Das Etikett eines Produkts, geordnet — G-452.
//
// `[read]` **Reine Rechnung, kein I/O.** Serverfrei, damit die Anzeige
// sie als Wert importieren darf (A-30) und ein Test sie ohne Datenbank
// pruefen kann.
//
// ══ DIE DREI SACHEN, DIE DER AUFTRAG VERLANGT ═══════════════════════
//
// **1 — Zeilen OHNE Menge gehoeren gezeigt.**
//
// `[cmd]` **Gemessen 2026-09-14 ueber 3.000.982 Zeilen:**
// `not_stated` **1.591.063**, `exact` **1.394.584**, `less_than`
// **14.598**, `greater_than` **737**. `[read]` **Die Mehrheit hat
// keine Zahl** — `Vitamin A`, `Iron`, `Whey Protein concentrate` stehen
// so auf der Packung. **Wer nur Zahlen zeigt, zeigt die Minderheit.**
//
// **2 — Mischungen tragen die Gesamtmenge, die Zutaten folgen.**
//
// `[cmd]` **`blend_id` zeigt auf die `id` der Kopfzeile**, gemessen an
// `21cfe048` (MRI N.O. Black Powder, 54 Zeilen): Zeile 13 traegt
// *Proprietary Blend for Size & Recovery*, **3000 mg**, `blend_id =
// null`; die Zeilen 14 und 15 tragen `blend_id` = deren `id` und keine
// Menge.
//
// `[read]` **Damit braucht die Einrueckung keine Heuristik** — sie
// steht in den Daten. Ein Kopf ist, worauf gezeigt wird.
//
// **3 — Was LumeOS nicht kennt, ist erkennbar.**
//
// `[cmd]` **`supplement_id` ist bei 2.698.689 von 3.000.982 Zeilen
// null** (89,9 %). `[read]` **Deshalb wird NICHT das Unbekannte
// markiert, sondern das Bekannte** — eine Marke auf neun von zehn
// Zeilen ist keine Auskunft mehr, sondern Rauschen.
import type { InhaltsZeile } from './produkte-read'

// ══ WARUM DIE KATEGORIEN HIER STEHEN UND NICHT IN produkte-read ════
//
// `[cmd]` **Sie standen dort, und die Seite gab 500 zurueck:**
// *„You're importing a component that needs next/headers."*
//
// `[cmd]` **`KATEGORIEN` ist ein WERT**, kein Typ — der Reiter
// importiert ihn, und ein Wert-Import zieht die ganze Datei ins
// Browserbuendel, samt `createSessionClient` und `next/headers`.
//
// `[read]` **Genau die Falle aus A-30**, die im Kopf von
// `substanz-tafel.tsx` seit G-180 steht — und die dieser Auftrag
// trotzdem neu gestellt hat. **Typen verschwinden beim Uebersetzen,
// Werte nicht.**
//
// `[read]` **Die Zahlen gehoeren ohnehin hierher:** sie sind
// Messwerte, kein I/O. Diese Datei ist die serverfreie, und sie ist
// ohne Datenbank pruefbar.
// ══ G-453: die Kategorien als Filter ════════════════════════════════
//
// **Tom, 2026-09-15:** *„WEG: diese Kategorien ganz raus, sie sagen
// nichts aus — other ingredient, botanical,
// non-nutrient/non-botanical, other, animal part or source."*
//
// ══ WAS VORHER HIER STAND ═══════════════════════════════════════════
//
// `[cmd]` **Neunzehn Kategorien, zwei davon mit dem Zusatz *„fast
// alle"*.** `[read]` **Die Messung war richtig, die Folgerung zu
// zaghaft:** ein Filter, der 91 % trifft, wird nicht dadurch
// brauchbar, dass daneben steht, wie unbrauchbar er ist.
//
// `[cmd]` **Tom hat drei weitere mitgestrichen, die die Messung NICHT
// auffaellig fand** — `other` (27,6 %), `non-nutrient/non-botanical`
// (31,9 %) und `animal part or source` (3,0 %). `[read]` **Der Grund
// ist nicht die Trennschaerfe, sondern die Aussage:** *„sie sagen
// nichts aus"*. **Eine Kategorie namens `other` beantwortet keine
// Frage, auch wenn sie nur jedes vierte Produkt trifft.**
//
// `[read]` **Das ist die Lehre daraus:** Trennschaerfe ist notwendig,
// nicht hinreichend. **Ein Filter muss auch etwas BEDEUTEN.**
//
// ══ DIE VIERZEHN, DIE BLEIBEN ═══════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-15, DISTINCT Produkte gegen die 121.959
// On-Market-Produkte** — nicht Zeilen, denn ein Produkt mit vierzig
// Vitaminzeilen ist EIN Treffer:
//
//     mineral                39.960   32,8 %
//     vitamin                39.523   32,4 %
//     blend                  33.203   27,2 %
//     sugar                  22.795   18,7 %
//     fat                    18.954   15,5 %
//     amino acid             13.718   11,2 %
//     protein                11.813    9,7 %
//     fiber                  11.445    9,4 %
//     fatty acid              6.707    5,5 %
//     enzyme                  6.168    5,1 %
//     bacteria                5.794    4,8 %
//     hormone                 2.277    1,9 %
//     complex carbohydrate    1.550    1,3 %
//     TBD                       572    0,5 %
//
// `[read]` **Keine liegt mehr ueber einem Drittel** — der Zusatz
// *„fast alle"* und die Schwelle dahinter sind damit gegenstandslos
// und entfernt (G-163: keine Notloesung stehen lassen).
//
// `[cmd]` **Die fuenf gestrichenen bleiben in den DATEN** — sie werden
// nur nicht mehr als Filter angeboten. **Die Tafel zeigt sie weiter**:
// `other ingredient` ist das groesste Buendel *Hilfsstoffe*, und wer
// ein Produkt aufmacht, will das ganze Etikett (Toms Antwort vom
// 2026-09-14).

/**
 * Die Kategorien, die aus der Filterleiste fallen.
 *
 * `[read]` **Als benannte Liste, nicht stumm ausgelassen** — wer
 * spaeter fragt, warum `botanical` fehlt, findet hier die Antwort und
 * den Tag, an dem sie getroffen wurde.
 */
export const KATEGORIEN_OHNE_AUSSAGE: readonly string[] = [
  'other ingredient', 'botanical', 'non-nutrient/non-botanical',
  'other', 'animal part or source',
]

export type KategorieFacette = {
  code: string
  /** DISTINCT Produkte mit mindestens einer Zeile dieser Kategorie. */
  produkte: number
  /** Anteil an den On-Market-Produkten, 0..1. */
  anteil: number
}

/**
 * Die vierzehn Kategorien, die als Filter taugen.
 *
 * `[cmd]` **Die Zahlen sind fest eingetragen, nicht je Aufruf
 * gezaehlt** — `count(DISTINCT product_id)` ueber 3.000.982 Zeilen
 * braucht in der Datenbank mehrere Sekunden, und die Verteilung
 * aendert sich erst mit dem naechsten DSLD-Import.
 *
 * `[read]` **Sie tragen deshalb ihren Stichtag** — wer den Import
 * wiederholt, misst neu. Die Abfrage steht im Kopf dieses Abschnitts.
 */
export const KATEGORIEN: readonly KategorieFacette[] = [
  ['mineral', 39960], ['vitamin', 39523], ['blend', 33203],
  ['sugar', 22795], ['fat', 18954], ['amino acid', 13718],
  ['protein', 11813], ['fiber', 11445], ['fatty acid', 6707],
  ['enzyme', 6168], ['bacteria', 5794], ['hormone', 2277],
  ['complex carbohydrate', 1550], ['TBD', 572],
].map(([code, produkte]) => ({
  code: code as string,
  produkte: produkte as number,
  anteil: (produkte as number) / 121959,
}))

// ══ G-453: die Darreichungsform als Filter ══════════════════════════
//
// **Tom, 2026-09-15:** *„FORM, ohne die Klammern ... der E-Code
// (E0159 etc.) gehoert NICHT in die Anzeige."*
//
// `[cmd]` **`produktform` traegt den Code IM Text**, gemessen
// 2026-09-15: `Capsule [E0159]`, `Powder [E0162]`, `Other (e.g. tea
// bag) [E0172]`.
//
// `[read]` **Der Code muss trotzdem erhalten bleiben** — die Datenbank
// vergleicht gegen den vollen Text. **Also: gefiltert wird mit dem
// Code, angezeigt wird ohne ihn.** Zwei Felder, nicht eines.
//
// ══ ZWEI ZAHLENSAETZE, UND WARUM BEIDE STIMMEN ══════════════════════
//
// `[cmd]` **Der Auftrag nennt `Capsule 79.822`. Gemessen: 79.822 ueber
// ALLE Produkte, 43.301 unter „On Market".**
//
// `[read]` **Beide Zahlen sind richtig, sie zaehlen Verschiedenes** —
// und **der Reiter oeffnet auf „On Market"** (Toms Vorgabe aus G-452).
// **Eine 79.822 neben einer On-Market-Liste waere eine Zahl fuer eine
// Ansicht, die niemand sieht** — dieselbe Falle wie bei den 6.012
// Marken in G-452, die gegen 4.907 On-Market-Marken standen.
//
// `[read]` **Deshalb tragen die Facetten BEIDE Zahlen**, und die
// Anzeige nimmt die zum eingestellten Marktstatus.

export type FormFacette = {
  /** Der volle Wert aus der Spalte, MIT Code — danach wird gefiltert. */
  code: string
  /** Ohne Code — das steht auf dem Schirm. */
  label: string
  /** DISTINCT Produkte, On Market. */
  onMarket: number
  /** DISTINCT Produkte, alle Marktstatus. */
  alle: number
}

/**
 * Die zehn Darreichungsformen.
 *
 * `[cmd]` **Gemessen 2026-09-15** — die Spalte kennt genau diese zehn
 * Werte, kein `NULL` darunter.
 */
export const FORMEN: readonly FormFacette[] = [
  ['Capsule [E0159]', 43301, 79822],
  ['Powder [E0162]', 24074, 36485],
  ['Liquid [E0165]', 20534, 32532],
  ['Tablet or Pill [E0155]', 16798, 33717],
  ['Softgel Capsule [E0161]', 9957, 19924],
  ['Other (e.g. tea bag) [E0172]', 3569, 6171],
  ['Gummy or Jelly [E0176]', 3007, 4677],
  ['Lozenge [E0174]', 496, 994],
  ['Unknown [E0177]', 183, 399],
  ['Bar [E0164]', 40, 59],
].map(([code, onMarket, alle]) => ({
  code: code as string,
  label: formLabel(code as string),
  onMarket: onMarket as number,
  alle: alle as number,
}))

/**
 * Die Form ohne ihren E-Code.
 *
 * **Tom:** *„der E-Code (E0159 etc.) gehoert NICHT in die Anzeige."*
 *
 * `[cmd]` **Nur die ECKIGE Klammer am Ende faellt** — `Other (e.g. tea
 * bag) [E0172]` behaelt seine runde Klammer, weil die zur Bezeichnung
 * gehoert und nicht zum Code. **Ein `replace(/\(.*\)/)` haette aus
 * ihr `Other` gemacht**, und `Other` gibt es als Kategorie schon.
 */
export function formLabel(form: string | null): string {
  if (!form) return ''
  return form.replace(/\s*\[[^\]]*\]\s*$/, '').trim()
}

/** Eine Zeile, wie sie auf dem Schirm steht. */
export type EtikettZeile = InhaltsZeile & {
  /** Steht sie eingerueckt unter einer Mischung? */
  eingerueckt: boolean
  /** Ist sie der Kopf einer Mischung — hat also Zutaten unter sich? */
  istMischung: boolean
}

/**
 * Die Zeilen in Etikettreihenfolge, Mischungen mit ihren Zutaten.
 *
 * `[read]` **Die Reihenfolge kommt aus `reihenfolge`, nicht aus der
 * Verschachtelung** — C-485 hat sie in Etikettreihenfolge geschrieben,
 * und auf der Packung steht die Zutat einer Mischung direkt unter ihr.
 * **Es reicht also, die Zeilen zu sortieren und jede zu markieren**;
 * ein Baum waere hier eine Umstellung, die die Packung nicht hat.
 *
 * `[cmd]` **Gegenprobe an `21cfe048`:** nach `reihenfolge` sortiert
 * folgen auf Zeile 13 (Kopf, 3000 mg) genau die Zeilen 14 und 15 mit
 * ihrem `blend_id` — die Sortierung allein stellt die Packung her.
 */
export function etikettZeilen(inhalt: readonly InhaltsZeile[]): EtikettZeile[] {
  // `[read]` **Zeilen ohne `reihenfolge` ans Ende, in gegebener
  // Folge** — sie tragen keine Aussage ueber ihren Platz, und eine
  // erfundene waere schlimmer als eine angehaengte.
  const sortiert = [...inhalt].sort((a, b) => {
    if (a.reihenfolge === null && b.reihenfolge === null) return 0
    if (a.reihenfolge === null) return 1
    if (b.reihenfolge === null) return -1
    return a.reihenfolge - b.reihenfolge
  })

  // Ein Kopf ist, worauf ein `blend_id` zeigt — gemessen, nicht geraten.
  const koepfe = new Set(
    sortiert.flatMap(z => z.blend_id ? [z.blend_id] : []),
  )

  return sortiert.map(z => ({
    ...z,
    eingerueckt: z.blend_id !== null,
    istMischung: koepfe.has(z.id),
  }))
}

// ══ G-453: die Gruppierung nach Kategorie ═══════════════════════════
//
// **Tom, 2026-09-08:** *„auflistung: nach parent/child, sprich
// kategorie aus product_contents als parent und produkte als child."*
//
// `[cmd]` **19 Kategorien fuehrt `ingredient_category`**, gemessen
// 2026-09-14. `[read]` **Sie einzeln untereinander zu zeigen waere
// wieder eine lange Liste** — nur mit Zwischenueberschriften.
//
// `[read]` **Deshalb vier BUENDEL, nicht neunzehn Abschnitte.** Die
// Zuordnung ist keine Erfindung: sie folgt dem, was auf einem Etikett
// ohnehin getrennt steht — *Supplement Facts* oben, *Other
// Ingredients* unten.
//
// `[cmd]` **Am Beleg `#Shatter SX-7` nachgezaehlt** (28 Zeilen):
// Naehrwerte 4, Wirkstoffe 13, Mischungen 2 + 7 Zutaten, Hilfsstoffe 2.

/** Die vier Buendel, in der Reihenfolge des Etiketts. */
export const BUENDEL = [
  { id: 'naehrwerte', titel: 'Nährwerte' },
  { id: 'wirkstoffe', titel: 'Wirkstoffe' },
  { id: 'mischungen', titel: 'Mischungen' },
  { id: 'hilfsstoffe', titel: 'Hilfsstoffe' },
] as const

export type BuendelId = typeof BUENDEL[number]['id']

/**
 * Welches Buendel traegt diese Kategorie?
 *
 * `[cmd]` **Die 19 Werte sind gemessen, nicht geraten** — und die
 * Zuordnung nennt jede einzeln. `[read]` **Ein `default` waere hier
 * gefaehrlich:** kommt eine zwanzigste Kategorie dazu, soll sie
 * sichtbar bei den Hilfsstoffen landen und nicht stumm zwischen den
 * Wirkstoffen verschwinden.
 */
export function buendelFuer(kategorie: string | null): BuendelId {
  switch (kategorie) {
    // Was auf dem Etikett im Naehrwertblock steht.
    case 'fat': case 'sugar': case 'fiber': case 'protein':
    case 'complex carbohydrate':
      return 'naehrwerte'
    // Was der Hersteller als Wirkung verkauft.
    case 'vitamin': case 'mineral': case 'amino acid': case 'botanical':
    case 'enzyme': case 'bacteria': case 'fatty acid': case 'hormone':
    case 'animal part or source': case 'non-nutrient/non-botanical':
      return 'wirkstoffe'
    case 'blend':
      return 'mischungen'
    // `[read]` **`other ingredient` ist der Hilfsstoff schlechthin** —
    // `[cmd]` 980.854 Zeilen, und auf dem Etikett steht er unter
    // *Other Ingredients*. `other` und `TBD` daneben: **unbestimmt ist
    // kein Wirkstoff**, und sie hier zu zeigen ist ehrlicher, als sie
    // unter die Wirkstoffe zu mischen.
    case 'other ingredient': case 'other': case 'TBD':
      return 'hilfsstoffe'
    default:
      return 'hilfsstoffe'
  }
}

/**
 * Das Buendel einer Zeile — G-464.
 *
 * `[read]` **Die Einstufung aus C-505 fuehrt, die Kategorie faengt
 * auf.** `[cmd]` **Ohne Einstufung (`null`) gruppiert die Tafel wie
 * vor G-464** — das ist der Rueckfall, wenn die Sicht ausfaellt, und
 * er ist besser als eine Zeile, die verschwindet.
 *
 * `[cmd]` **Die vier Klassen sind gemessen** (C-505, 2026-09-17):
 *
 *     naehrwert    nm.dsld_name IS NOT NULL      -> Naehrwerte
 *     hilfsstoff   NOT ist_wirkstoff             -> Hilfsstoffe
 *     wirkstoff    supplement_id IS NOT NULL     -> Wirkstoffe
 *     kandidat     weder noch                    -> nach Kategorie
 *
 * `[read]` **`kandidat` bekommt KEIN eigenes Buendel** — der Auftrag
 * nennt vier Ueberschriften, und eine fuenfte waere eine Entscheidung,
 * die Tom nicht getroffen hat. **Er wird einsortiert wie bisher**, und
 * die fehlende Marke sagt, dass LumeOS ihn nicht auswerten kann.
 */
export function buendelFuerZeile(
  z: Pick<InhaltsZeile, 'ingredient_category' | 'content_class'>,
): BuendelId {
  switch (z.content_class) {
    case 'naehrwert': return 'naehrwerte'
    case 'wirkstoff': return 'wirkstoffe'
    case 'hilfsstoff': return 'hilfsstoffe'
    // `kandidat` und `null`: die Kategorie entscheidet.
    default: return buendelFuer(z.ingredient_category)
  }
}

export type EtikettBuendel = {
  id: BuendelId
  titel: string
  zeilen: EtikettZeile[]
}

/**
 * Die Zeilen, in vier Buendel sortiert — G-453.
 *
 * ══ ZWEI EBENEN, NICHT EINE ═══════════════════════════════════════
 *
 * `[cmd]` **Eine Mischung IST eine Kategorie (`blend`) UND hat
 * Kinder.** `[read]` **Deshalb wandern die Zutaten einer Mischung mit
 * ihrem Kopf**, statt nach ihrer eigenen Kategorie einsortiert zu
 * werden.
 *
 * `[cmd]` **Gemessen an `21cfe048`:** die 28 eingerueckten Zeilen
 * tragen Kategorien von `amino acid` bis `other ingredient`. **Nach
 * Kategorie verteilt wuerde die Mischung zerrissen** — `L-Arginine
 * Alpha-Ketoglutarate` stuende unter *Wirkstoffe*, seine Schwester
 * `L-Arginine Hydrochloride` woanders, und die Gesamtmenge von 3000 mg
 * haette keine Zutaten mehr unter sich.
 *
 * `[read]` **Das ist der Unterschied zwischen Gruppieren und
 * Auseinanderreissen.**
 *
 * `[read]` **Ein leeres Buendel erscheint nicht** (§9) — vier
 * Ueberschriften, von denen zwei nichts tragen, sind schlechter als
 * zwei.
 */
export function etikettBuendel(
  inhalt: readonly InhaltsZeile[],
): EtikettBuendel[] {
  const zeilen = etikettZeilen(inhalt)
  // Welcher Kopf gehoert zu welcher Zeile — fuer die Kinder.
  const vonId = new Map(zeilen.map(z => [z.id, z]))

  const faecher = new Map<BuendelId, EtikettZeile[]>(
    BUENDEL.map(b => [b.id, [] as EtikettZeile[]]),
  )

  for (const z of zeilen) {
    // `[read]` **Ein Kind folgt seinem Kopf**, nicht seiner Kategorie.
    // Fehlt der Kopf (kaeme vor, wenn eine Zeile auf eine geloeschte
    // zeigt), entscheidet die eigene Kategorie — besser eingeordnet
    // als verloren.
    const kopf = z.blend_id ? vonId.get(z.blend_id) : undefined
    const massgeblich = kopf ?? z
    const ziel = massgeblich.istMischung
      ? 'mischungen'
      // ══ G-464: DIE EINSTUFUNG FUEHRT, NICHT DIE KATEGORIE ══════
      //
      // `[cmd]` **Hier stand `buendelFuer(ingredient_category)`
      // allein** — und `vitamin`/`mineral` landeten bei den
      // Wirkstoffen. **Toms Befund: `Vitamin A`, `Calcium`, `Iron`
      // standen unter WIRKSTOFFE, obwohl es Naehrwerte sind.**
      //
      // `[cmd]` **Gemessen an `Serious Mass Vanilla` (2026-09-17):
      // 40 Zeilen tragen `vitamin` oder `mineral` und sind nach
      // C-505 `naehrwert`** — sie standen alle in der falschen
      // Gruppe.
      //
      // `[read]` **Die Kategorie sagt, WORAUS die Zutat ist; die
      // Einstufung sagt, WIE LumeOS sie auswertet.** **Die Tafel
      // gruppiert nach der zweiten Frage** — deshalb steht `Calcium`
      // jetzt bei `Total Fat` und `Protein`.
      : buendelFuerZeile(massgeblich)
    faecher.get(ziel)!.push(z)
  }

  return BUENDEL
    .map(b => ({ id: b.id, titel: b.titel, zeilen: faecher.get(b.id)! }))
    .filter(b => b.zeilen.length > 0)
}

/**
 * Die Menge als Text — oder der Grund, dass keine dasteht.
 *
 * `[cmd]` **`not_stated` heisst NICHT null.** Der Hersteller nennt die
 * Zutat auf dem Etikett ohne Zahl; eine `0` waere eine Behauptung, ein
 * `—` saehe aus wie eine Angabe.
 *
 * `[read]` **Deshalb gibt diese Funktion `null` zurueck, wenn es keine
 * Menge gibt** — die Anzeige setzt dann den benannten Hinweis, nicht
 * ein Zeichen.
 */
export function mengeText(z: InhaltsZeile): string | null {
  if (z.amount_per_serving === null) return null
  // `[cmd]` **Die Einheit kann `{Calories}` sein** (gemessen bei
  // `Calories` und `Calories from Fat`) — die geschweiften Klammern
  // stehen so in den DSLD-Daten und gehoeren nicht auf den Schirm.
  const einheit = (z.unit ?? '').replace(/[{}]/g, '').trim()
  const zahl = String(z.amount_per_serving)
  const vor = z.amount_qualifier === 'less_than' ? '< '
    : z.amount_qualifier === 'greater_than' ? '> '
    : ''
  return einheit ? `${vor}${zahl} ${einheit}` : `${vor}${zahl}`
}

/**
 * Wie viele Zutaten LumeOS auswerten kann.
 *
 * `[read]` **Zwei Zahlen, nicht eine Quote** — „11 %" sagt nicht, ob
 * von neun oder von neunhundert die Rede ist.
 */
export function bekanntZaehlen(
  inhalt: readonly InhaltsZeile[],
): { bekannt: number; gesamt: number } {
  return {
    bekannt: inhalt.filter(z => z.bekannt).length,
    gesamt: inhalt.length,
  }
}

/**
 * Die Portion als Text — `40 g [2 scoops]`.
 *
 * `[cmd]` **Die Einheit traegt die Klammerangabe bereits:** gemessen
 * bei Dr. Mercola steht in `portionseinheit` woertlich `Gram(s) [2
 * scoops]`. **Sie wird NICHT zerlegt** — was der Hersteller in einem
 * Feld nennt, gehoert in einer Zeile gezeigt.
 */
export function portionText(
  groesse: number | null, einheit: string | null,
): string | null {
  if (groesse === null && !einheit) return null
  if (groesse === null) return einheit
  return einheit ? `${groesse} ${einheit}` : String(groesse)
}

// ══ G-453: die Marken im Pulldown ═══════════════════════════════════
//
// **Tom, 2026-09-15:** *„MARKE: im Pulldown anwaehlbar, plus das
// Eingabefeld aus Punkt 1 des urspruenglichen Auftrags."*
//
// `[read]` **Beides, nicht eins von beiden** — dieselbe
// Zustandsgroesse, zwei Bedienungen: wer den Namen kennt, tippt; wer
// stoebern will, klappt auf.
//
// `[cmd]` **Das Pulldown traegt NICHT alle 4.907.** Genau das waere
// das Scrollen, gegen das Punkt 1 gebaut wurde — und ein `<select>`
// laesst sich nicht durchsuchen, nur durchblaettern.
//
// `[cmd]` **Gemessen 2026-09-15: die 25 haeufigsten Marken decken
// 28,6 % der 121.959 On-Market-Produkte.** `[read]` **Jede weitere
// bringt unter einem halben Prozent** — die Liste ist ein langer
// Schwanz, und fuer den ist das Eingabefeld da.
//
// `[read]` **Die Zeile unter dem Filter sagt beides** — wie viele
// Marken es gibt und dass das Pulldown nur die haeufigsten fuehrt.
// **Ein Pulldown, das so tut, als sei es vollstaendig, waere eine
// Falle.**
export const MARKEN_PULLDOWN: readonly string[] = [
  'BulkSupplements.com', 'TerraVita Premium Collection', 'Herbal Terra',
  'Hawaii Pharm', 'TerraVita', 'Wonder Laboratories', 'DC',
  'Douglas Laboratories', 'NOW', 'Source Naturals', 'The Vitamin Shoppe',
  "Nature's Way", "Puritan's Pride", 'Bluebonnet', 'Life Extension',
  'Pure Encapsulations', 'Swanson', 'Herbadiet', 'Herb Pharm', 'Carlson',
  'Vitamin World', 'Solgar', 'Pure Herbs', 'Nature Made', 'NutraBio',
]

/**
 * Wie viele Treffer ein Fenster traegt — G-453/3.
 *
 * ══ WARUM DIE ZAHL HIER STEHT UND NICHT NUR IN `produkte-read` ══════
 *
 * `[cmd]` **Der Reiter importierte sie als `SEITE` aus
 * `produkte-read.ts`, und die Seite gab 500 zurueck:** *„You're
 * importing a component that needs next/headers."*
 *
 * `[cmd]` **Zum ZWEITEN Mal in diesem Auftrag** — dieselbe Falle wie
 * bei `KATEGORIEN` einen Tag zuvor, und die Warnung steht seit G-180
 * im Kopf von `substanz-tafel.tsx` sowie seit gestern im Kopf dieser
 * Datei. `[read]` **Ein Wert-Import zieht die ganze Datei ins
 * Browserbuendel; Typen verschwinden beim Uebersetzen, Werte nicht.**
 *
 * `[read]` **Die Zahl steht deshalb HIER**, und `produkte-read` nimmt
 * sie von hier. **Eine Zahl an zwei Orten waere Drift** — der Reiter
 * rechnete mit 500, waehrend die Abfrage 200 holt, und niemand saehe
 * es.
 *
 * ══ DIE MESSUNG ════════════════════════════════════════════════════
 *
 * `[cmd]` **Im Browser gemessen 2026-09-15** (echte Zeilenform):
 *
 *     Zeilen   DOM-Knoten   Anstrich      Hoehe
 *        500        3.002      68 ms   18.499 px
 *      1.000        6.002     140 ms   36.999 px
 *
 * `[read]` **500 liegt unter den 4.713 Knoten, die G-176 gemessen und
 * ausdruecklich als unauffaellig eingestuft hat** — die dort
 * verlangte Wiederholung der Messung ist damit erbracht.
 */
export const FENSTER = 500
