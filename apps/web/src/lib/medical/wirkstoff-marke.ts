// Handelsnamen, ihre Aufloesung und das ehrliche Leerergebnis — G-210.
//
// ══ DER ANLASS ══════════════════════════════════════════════════════
//
// **Tom hat nach *Scemblix* gesucht und nichts gefunden.**
//
// `[cmd]` **Scemblix steht in der Datenbank** — zweimal in
// `medication_products`, beide sauber auf `Asciminib` verknuepft. **Der
// Katalog aus G-208 sucht nur in `medication_active_substances`;
// Handelsnamen liegen eine Ebene tiefer.**
//
// `[read]` **Niemand sucht nach *Asciminib*. Menschen suchen nach dem
// Namen auf der Packung.**
//
// ══ WARUM SERVERFREI ════════════════════════════════════════════════
//
// `[read]` **Dieselbe Trennung wie `wirkstoff-luecke.ts` (G-208).**
// Und sie ist dort teuer gelernt worden: ein einziger WERT-Import aus
// dem Leseweg in eine `'use client'`-Datei hat den Build gebrochen
// (A-30). **Hier liegt, was die Anzeige als Wert braucht.**

/**
 * Ein Handelsname mit dem Weg zu seinem Wirkstoff.
 *
 * `[read]` **`hersteller` gehoert dazu, nicht als Zierrat:** dieselbe
 * Marke kommt mehrfach vor, und erst der Hersteller macht die zwei
 * Zeilen unterscheidbar. `[cmd]` Scemblix steht als `Novartis` und als
 * `NOVARTIS PHARMACEUTICALS CANADA INC`.
 */
export type Marke = {
  name: string
  hersteller: string | null
  /** Die Rechtsraeume, in denen das Produkt gefuehrt wird. */
  maerkte: string[]
}

/**
 * Warum ein Suchwort nichts gefunden hat.
 *
 * `[read]` **Ein leeres Ergebnis ohne Erklaerung sieht aus wie *„gibt
 * es nicht"* — und das ist bei Concor falsch.** Bisoprolol steht im
 * Katalog; nur der oesterreichisch-deutsche Handelsname fehlt, weil
 * der Bestand US-lastig ist.
 */
export type LeerGrund = {
  /** Das gesuchte Wort, unveraendert. */
  wort: string
  /** Die Maerkte, die der Katalog ueberhaupt kennt — mit Markenzahl. */
  maerkte: Array<{ markt: string; marken: number }>
}

/**
 * Die Maerkte, die der Katalog kennt — gemessen, nicht angenommen.
 *
 * ══ DAS IST KEINE SPRACHFRAGE, SONDERN EINE MARKTFRAGE ══════════════
 *
 * `[cmd]` **Gemessen 2026-08-27 ueber `unnest(jurisdictions)`,
 * verschiedene Marken je Rechtsraum:**
 *
 *     US   380      TH    62      AU    58
 *     CA    92      UK    60      EU    56
 *     DE     0
 *
 * `[cmd]` **DE steht bei NULL** — kein einziges Produkt traegt `DE` in
 * `jurisdictions`, geprueft mit `'DE' = any(jurisdictions)`.
 *
 * `[read]` **Deshalb findet Tom Concor nicht.** Recherchiert:
 * Bisoprolol heisst in den USA **Zebeta**, in Grossbritannien
 * **Cardicor** oder **Emcor**, in Oesterreich, Brasilien und China
 * **Concor** — dazu **Bicor**, **BisoABZ**, **Bisomerck**,
 * **Cardensiel**, **Monocor**, **Soprol**. **Ein Wirkstoff,
 * mindestens fuenfzehn Marktnamen.**
 *
 * `[read]` **Scemblix ist der andere Fall:** weltweit derselbe Name.
 * **Beide muss dieselbe Suche aushalten**, und die eine Haelfte
 * schafft sie nur, indem sie sagt, was sie nicht weiss.
 */
export const MAERKTE: Array<{ markt: string; marken: number }> = [
  { markt: 'US', marken: 380 },
  { markt: 'CA', marken: 92 },
  { markt: 'TH', marken: 62 },
  { markt: 'UK', marken: 60 },
  { markt: 'AU', marken: 58 },
  { markt: 'EU', marken: 56 },
]

/**
 * Eine Produktzeile, so wie sie aus der Datenbank kommt.
 *
 * `[read]` **Roh, nicht aufgeloest** — `formulation_id` ist eine
 * Kennung, kein Wirkstoff. Die Aufloesung ist der Schritt, der
 * schiefgehen kann.
 */
export type ProduktZeile = {
  formulation_id: string | null
  brand_name: string | null
  manufacturer: string | null
  jurisdictions: string[]
}

/**
 * Ein Produkt, dessen Kette zum Wirkstoff nicht traegt.
 *
 * `[read]` **Es wird gezaehlt, nicht verschwiegen.** Dieselbe Linie
 * wie `Befund` in `symptome.ts` (G-207): was der Lesepfad nicht
 * aufloesen kann, verschwindet nicht still.
 */
export type UnaufloesbarkeitsGrund = 'ohne_formulierung' | 'formulierung_unbekannt'

export type Unaufloesbar = {
  marke: string
  grund: UnaufloesbarkeitsGrund
}

/**
 * Produktzeilen auf ihre Wirkstoffe abbilden.
 *
 * ══ WAS HIER NICHT PASSIEREN DARF ═══════════════════════════════════
 *
 * **Auftrag: *„Der Treffer muss verschwinden oder sich als
 * unaufloesbar zeigen, nicht auf einen falschen Wirkstoff fallen."***
 *
 * `[read]` **Ein Produkt, dessen Kette reisst, wird UEBERGANGEN und
 * gezaehlt.** Es auf irgendeinen Wirkstoff fallen zu lassen waere
 * `b?.abbr ?? m` (G-207) mit einem Medikament — **und ein falscher
 * Handelsname fuehrt zum falschen Praeparat.** Das ist der Grund,
 * warum diese Funktion einen zweiten Rueckgabewert hat statt nur
 * einer Map.
 *
 * ══ UND OB DER FALL UEBERHAUPT ENTSTEHEN KANN ═══════════════════════
 *
 * `[cmd]` **Gemessen 2026-08-27: heute nicht.** `formulation_id` ist
 * `NOT NULL`, traegt den Fremdschluessel
 * `medication_products_formulation_id_fkey` auf
 * `medication_formulations(id)`, und **0 von 448 Produkten sind
 * unaufloesbar.** Die Datenbank weist beide Eingriffe ab, mit denen
 * ich es pruefen wollte.
 *
 * `[read]` **Der Waechter bleibt trotzdem, und das ist eine
 * Entscheidung, keine Gewohnheit:** die Zusage ist eine
 * Datenbankregel, kein Naturgesetz. Ein `ON DELETE SET NULL`, ein
 * Import ueber den Service-Client oder eine spaetere Lockerung
 * genuegen. **Was er kostet, sind vier Zeilen; was er verhindert, ist
 * ein falsches Medikament.**
 */
export function markenJeWirkstoff(
  produkte: ProduktZeile[],
  wirkstoffJeFormulierung: Map<string, string>,
): { marken: Map<string, Marke[]>; unaufloesbar: Unaufloesbar[] } {
  const marken = new Map<string, Marke[]>()
  const unaufloesbar: Unaufloesbar[] = []
  for (const p of produkte) {
    const name = typeof p.brand_name === 'string' ? p.brand_name.trim() : ''
    if (!name) continue
    const fid = typeof p.formulation_id === 'string' ? p.formulation_id.trim() : ''
    if (!fid) {
      unaufloesbar.push({ marke: name, grund: 'ohne_formulierung' })
      continue
    }
    const sid = wirkstoffJeFormulierung.get(fid)
    if (!sid) {
      unaufloesbar.push({ marke: name, grund: 'formulierung_unbekannt' })
      continue
    }
    const bisher = marken.get(sid) ?? []
    bisher.push({
      name,
      hersteller: typeof p.manufacturer === 'string' && p.manufacturer.trim()
        ? p.manufacturer.trim() : null,
      maerkte: Array.isArray(p.jurisdictions)
        ? p.jurisdictions.map(j => String(j ?? '').trim()).filter(Boolean) : [],
    })
    marken.set(sid, bisher)
  }
  return { marken, unaufloesbar }
}

/**
 * Passt das Suchwort auf einen Handelsnamen?
 *
 * `[read]` **Gross- und Kleinschreibung sind egal**, sonst findet
 * *scemblix* nichts. `[cmd]` Der Bestand schreibt uneinheitlich:
 * `Scemblix`, `ALPHAGAN P`, `allergy relief`, `B. AMOX` — **und
 * `Effexor XR` steht zweimal, als `Effexor XR` und `Effexor Xr`.**
 * Das sind die 428 Marken, von denen nur 427 nach Normalisierung
 * verschieden sind.
 */
export function markeTrifft(marke: Marke, wort: string): boolean {
  const q = wort.trim().toLowerCase()
  if (!q) return false
  return marke.name.toLowerCase().includes(q)
}

/**
 * Ein Wirkstoff steht in der Ergebnisliste EINMAL — auch wenn zwei
 * Produkte auf ihn zeigen.
 *
 * ══ WARUM DAS EINE EIGENE FUNKTION IST ══════════════════════════════
 *
 * **Auftrag: *„Eine Marke kann mehrfach vorkommen — Scemblix zweimal,
 * mit verschiedenen Herstellerschreibweisen. Ein Wirkstoff darf in der
 * Ergebnisliste trotzdem nur einmal stehen."***
 *
 * `[cmd]` **Gemessen 2026-08-27: 20 Marken haben mehr als eine
 * Produktzeile**, je zwei Hersteller — Scemblix, Lipitor, Ozempic,
 * Eliquis, Glucophage, Norvasc, Plavix, Seroquel, Sprycel, Tasigna …
 *
 * `[read]` **Die Entdoppelung laeuft ueber die Wirkstoff-ID, nicht
 * ueber den Markennamen.** Zwei verschiedene Marken desselben
 * Wirkstoffs (Lipitor und ATORVIN 40) sollen die Zeile ebenso nur
 * einmal erzeugen — mit beiden Marken als Beleg.
 */
export function entdoppelt<T extends { id: string }>(treffer: T[]): T[] {
  const gesehen = new Set<string>()
  const aus: T[] = []
  for (const t of treffer) {
    if (gesehen.has(t.id)) continue
    gesehen.add(t.id)
    aus.push(t)
  }
  return aus
}

/**
 * Die Marken, die einen Treffer BEGRUENDEN — entdoppelt, in
 * Fundreihenfolge.
 *
 * `[read]` **Der Treffer muss zeigen, warum er ein Treffer ist.** Wer
 * *Scemblix* eingibt und *Asciminib* bekommt, sieht sonst einen
 * Fehler. **Deshalb wandert die passende Marke in die Trefferzeile,
 * nicht nur in die Detailansicht.**
 *
 * `[cmd]` **Zwei Zeilen mit demselben Markennamen werden zu einer**
 * — der Hersteller unterscheidet sie, aber fuer die Begruendung
 * *„Scemblix ist Asciminib"* zaehlt der Name einmal.
 */
export function passendeMarken(marken: Marke[], wort: string): Marke[] {
  const gesehen = new Set<string>()
  const aus: Marke[] = []
  for (const m of marken) {
    if (!markeTrifft(m, wort)) continue
    const schluessel = m.name.trim().toLowerCase()
    if (gesehen.has(schluessel)) continue
    gesehen.add(schluessel)
    aus.push(m)
  }
  return aus
}

/**
 * Wie viele Hersteller dieselbe Marke fuehren — fuer die Trefferzeile.
 *
 * `[read]` **Die Zahl wird gezeigt, nicht die Liste.** *„Scemblix ·
 * Novartis · noch 1 Hersteller"* ist kuerzer als zwei Zeilen und sagt
 * dasselbe; wer beide braucht, klappt auf.
 */
export function herstellerZahl(marken: Marke[], name: string): number {
  const q = name.trim().toLowerCase()
  const namen = new Set<string>()
  for (const m of marken) {
    if (m.name.trim().toLowerCase() !== q) continue
    if (m.hersteller) namen.add(m.hersteller.trim().toLowerCase())
  }
  return namen.size
}
