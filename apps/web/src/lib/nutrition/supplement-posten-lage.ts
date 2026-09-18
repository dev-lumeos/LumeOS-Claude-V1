// Supplemente in der Mahlzeit — G-475, die Rechenregeln.
//
// **Tom, 2026-09-18:** *„wann kommt eigentlich das todo, dass ich in
// nutrition diary auch supplements wie whey hinzufuegen kann?"*
//
// ══ WAS C-513 GEBAUT HAT — GEMESSEN, NICHT ABGESCHRIEBEN ════════════
//
// `[cmd]` **`nutrition.meal_items` (gemessen 2026-09-18):**
//
//     food_source                  + 'supplement'
//     supplement_product_id        uuid
//     supplement_serving_size      text
//     supplement_serving_quantity  numeric
//     supplement_nutrient_status   text
//
// `[cmd]` **Und vier CHECKs, die jede Zeile hier bestimmen:**
//
//     amount_g            MUSS NULL sein bei 'supplement'
//     serving_quantity    NOT NULL und > 0
//     nutrient_status     'available' | 'no_nutrients_available'
//     portion_*           alle drei NULL
//
// ══ DIE NAEHRWERTE PRUEFT DIE DATENBANK ═════════════════════════════
//
// `[cmd]` **Der Trigger `meal_items_supplement_snapshot_guard_trg`
// PRUEFT jeden Naehrwert — er fuellt ihn NICHT.** `[cmd]` **Ein
// erster Versuch schickte nur Produkt, Portion und Anzahl und fiel
// sofort:** *„supplement nutrient snapshot differs from its
// evidenced product serving"*.
//
// `[read]` **Der Aufrufer schreibt also den GANZEN Schnappschuss**
// (neun Makros plus `nutrients`), **je Wert genau `Option x
// Anzahl`** — und der Trigger rechnet nach. **Er ist ein Waechter,
// kein Rechner.**
//
// `[cmd]` **Gemessen 2026-09-18 in einer Transaktion:** Portion
// `31 Gram(s)`, Anzahl 1 -> **120 kcal, 24 g Protein**, angenommen.
//
// **Und er wirft bei jedem Abweichen:**
//
//     C513: supplement snapshot requires an evidenced serving size
//     C513: product without measured nutrients must remain visibly
//           unknown
//
// `[read]` **Diese Datei rechnet trotzdem NICHTS nach.** **Der
// Leseweg holt die Option und reicht ihre Werte durch** — die
// einzige Multiplikation ist `x Anzahl`, und sie steht an EINER
// Stelle (`buildSupplementInsert`). `[read]` **Zwei Kopien derselben
// Rechenregel driften** (dieselbe Lehre wie bei
// `updateMealItemAmount`).
//
// `[read]` **Serverfrei** — diese Datei rechnet nur (A-30).

/** Die zwei Werte, die der CHECK erlaubt. */
export type NaehrwertStand = 'available' | 'no_nutrients_available'

/**
 * Eine waehlbare Portionsgroesse eines Produkts.
 *
 * `[cmd]` **Aus `supplements.supplier_product_nutrient_serving_options`**
 * — gemessen 2026-09-18: **116.200 Zeilen ueber 113.264 Produkte**,
 * davon **2.760 mit mehr als einer Portion** (A4).
 */
export type PortionsWahl = {
  serving_size: string
  /** Kilokalorien je EINER Portion. */
  enercc: number | null
  /** Protein je EINER Portion, in Gramm. */
  prot625: number | null
  fat: number | null
  cho: number | null
}

export type SupplementTreffer = {
  product_id: string
  name: string
  marke: string | null
  /** Leer heisst: keine gemessenen Naehrwerte (A5). */
  portionen: PortionsWahl[]
}

/**
 * Hat das Produkt gemessene Naehrwerte?
 *
 * **A5:** *„ein Produkt ohne Naehrwerte: was steht da?"*
 *
 * `[cmd]` **Der Trigger verlangt dann `no_nutrients_available`, kein
 * `serving_size` und KEINEN einzigen Naehrwert** — sonst wirft er.
 * `[read]` **Die Oberflaeche darf also nicht raten**, sondern muss
 * sagen, dass nichts bekannt ist.
 */
export function hatNaehrwerte(t: Pick<SupplementTreffer, 'portionen'>): boolean {
  return t.portionen.length > 0
}

export function standFuer(t: Pick<SupplementTreffer, 'portionen'>): NaehrwertStand {
  return hatNaehrwerte(t) ? 'available' : 'no_nutrients_available'
}

/**
 * Was die Oberflaeche zu einem Produkt OHNE Naehrwerte sagt.
 *
 * `[read]` **Kein „0 kcal"** — das waere eine Behauptung. `[read]`
 * **Und kein Strich** — der sieht aus wie ein fehlender Wert, nicht
 * wie eine Auskunft. **Ein Satz, der die Lage benennt** (E-72).
 */
export const OHNE_NAEHRWERTE_SATZ =
  'Für dieses Produkt sind keine Nährwerte hinterlegt. '
  + 'Es wird erfasst, zählt aber nicht in die Tagesbilanz.'

/**
 * Der Eintrag, den die Oberflaeche schickt.
 *
 * `[read]` **Keine Naehrwerte darin** — der Leseweg holt sie zur
 * gewaehlten Portion und multipliziert sie mit der Anzahl. **Die
 * Oberflaeche kennt nur Produkt, Portion und Anzahl.**
 */
export type SupplementPosten = {
  meal_id: string
  product_id: string
  /** `null` NUR bei Produkten ohne Naehrwerte (der Trigger verlangt es). */
  serving_size: string | null
  /** Wie viele Portionen. Muss > 0 sein (CHECK). */
  serving_quantity: number
  nutrient_status: NaehrwertStand
  food_name: string
}

/**
 * Prueft einen Eintrag, bevor er an die Datenbank geht.
 *
 * `[read]` **Die CHECKs stehen hier abgeschrieben** — der Nutzer soll
 * einen Satz sehen, keine Postgres-Meldung. `[cmd]` **Die Datenbank
 * bleibt die Sperre**, dies ist nur die Absicht.
 */
export function pruefePosten(p: SupplementPosten): string | null {
  if (!p.meal_id) return 'Keine Mahlzeit gewählt.'
  if (!p.product_id) return 'Kein Produkt gewählt.'
  if (!Number.isFinite(p.serving_quantity) || p.serving_quantity <= 0) {
    return 'Die Anzahl der Portionen muss größer als 0 sein.'
  }
  // `[cmd]` **Der Trigger wirft bei einer Portion, die es nicht
  // gibt** (*„requires an evidenced serving size"*) — und bei einer
  // Portion, wo es gar keine geben darf.
  if (p.nutrient_status === 'available' && !p.serving_size) {
    return 'Bitte eine Portionsgröße wählen.'
  }
  if (p.nutrient_status === 'no_nutrients_available' && p.serving_size) {
    return 'Für dieses Produkt gibt es keine hinterlegte Portionsgröße.'
  }
  return null
}

/**
 * Was ein Posten zur Tagesbilanz beitraegt.
 *
 * `[read]` **Nur zur ANZEIGE** — geschrieben wird nichts davon. Die
 * Datenbank hat die Zahlen beim Einfuegen selbst gesetzt.
 */
export function vorschau(
  wahl: PortionsWahl | null, anzahl: number,
): { enercc: number | null; prot625: number | null } {
  if (!wahl || !Number.isFinite(anzahl) || anzahl <= 0) {
    return { enercc: null, prot625: null }
  }
  const mal = (v: number | null) =>
    typeof v === 'number' && Number.isFinite(v)
      ? Math.round(v * anzahl * 100) / 100
      : null
  return { enercc: mal(wahl.enercc), prot625: mal(wahl.prot625) }
}

/**
 * Der Text einer Portionszeile im Pulldown.
 *
 * `[cmd]` **`serving_size` traegt die Einheit schon** (`31 Gram(s)`)
 * — gemessen. `[read]` **Die Zahlen daneben sind die Auskunft**, die
 * die Wahl traegt.
 */
export function portionsLabel(w: PortionsWahl): string {
  const teile = [w.serving_size]
  if (typeof w.enercc === 'number') {
    teile.push(`${w.enercc.toLocaleString('de-DE')} kcal`)
  }
  if (typeof w.prot625 === 'number') {
    teile.push(`${w.prot625.toLocaleString('de-DE')} g Protein`)
  }
  return teile.join(' · ')
}

// ══ A6: DASSELBE PRODUKT IM STACK UND IN DER MAHLZEIT ═══════════════
//
// **Der Auftrag:** *„dasselbe Produkt im Stack UND in der Mahlzeit
// innerhalb 60 Minuten -> die Nachfrage aus C-513."*
//
// `[read]` **Das ist keine Fehlermeldung, sondern eine Frage** — wer
// sein Whey im Stack abhakt und dann ins Tagebuch schreibt, hat es
// womoeglich einmal genommen und zweimal erfasst. **Aber vielleicht
// auch wirklich zweimal.**

/** Das Fenster, in dem nachgefragt wird. */
export const DOPPELT_MINUTEN = 60

export function doppeltSatz(produkt: string, minuten: number): string {
  const m = Math.max(1, Math.round(minuten))
  return `„${produkt}" ist vor ${m} Minute${m === 1 ? '' : 'n'} schon im `
    + 'Stack erfasst worden. Beide Einträge behalten?'
}

/**
 * Liegt eine Einnahme nahe genug, um nachzufragen?
 *
 * `[read]` **Nur gleiche PRODUKT-Id zaehlt** — ein anderes Whey ist
 * ein anderer Posten.
 */
export function fragtNach(
  einnahmen: ReadonlyArray<{ product_id: string; minutenHer: number }>,
  productId: string,
): { frage: true; minutenHer: number } | { frage: false } {
  const treffer = einnahmen
    .filter(e => e.product_id === productId && e.minutenHer <= DOPPELT_MINUTEN)
    .sort((a, b) => a.minutenHer - b.minutenHer)[0]
  return treffer ? { frage: true, minutenHer: treffer.minutenHer } : { frage: false }
}
