// ════════════════════════════════════════════════════════════════════
// DIE MENGENRECHNUNG — G-320
// ════════════════════════════════════════════════════════════════════
//
// **`SPEC_10`:** *„Mengen-Eingabe mit Portions-Selector und
// Live-Naehrstoff-Preview"*. `[cmd]` **Nirgends gebaut.**
//
// ══ WARUM HIER GERECHNET WIRD UND NICHT GEFRAGT ═════════════════════
//
// `[cmd]` **Gemessen am 2026-09-02, Hammelfleisch roh
// (`U806000`, 112 kcal/100 g):**
//
//     food_nutrient_snapshot(..., 150)   168.00 kcal   30.60 g Protein
//     112.0 * 150 / 100                  168.00 kcal   30.60 g Protein
//
// `[read]` **`food_nutrient_snapshot` rechnet linear** — die
// Vorschau darf dasselbe tun, ohne den Server zu fragen. **Bei jedem
// Tastendruck eine Rundreise waere G-252 in klein.**
//
// `[read]` **Was NICHT hier entsteht, ist der gespeicherte Wert.**
// `[cmd]` **Der kommt weiter aus `food_nutrient_snapshot`**, so wie
// in `plan-lesen.ts:1080` — **eine Vorschau ist eine Vorschau, kein
// zweiter Rechenweg.** Weicht die Datenbank je von der Linearität ab
// (Zubereitungsverluste etwa), ändert sich der gespeicherte Wert und
// diese Vorschau bleibt eine Näherung — **das ist der Grund, warum
// sie „Vorschau" heisst und nicht „Wert".**

/** Die vier Nährwerte, die `food_search` je 100 g mitliefert. */
export type Naehrwerte100 = {
  /** Energie in kcal je 100 g. */
  enercc: string | number | null
  /** Protein in g je 100 g. */
  prot625: string | number | null
  /** Fett in g je 100 g. */
  fat: string | number | null
  /** Kohlenhydrate in g je 100 g. */
  cho: string | number | null
}

export type Vorschau = {
  kcal: number | null
  protein: number | null
  fett: number | null
  kh: number | null
}

/** Eine Zahl aus einem Feld, das Text oder Zahl sein kann. */
function zahl(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Was `menge` Gramm dieses Lebensmittels bedeuten — G-320.
 *
 * `[read]` **Auf eine Nachkommastelle**, weil mehr eine Genauigkeit
 * vortäuscht, die die BLS-Werte nicht haben.
 *
 * `[cmd]` **Ein fehlender Nährwert bleibt `null`, er wird nicht 0.**
 * **Das ist die Lehre aus `bls-fehlend-heisst-nicht-null`:** ein
 * Stück Fleisch ohne Vitamin-C-Wert hat nicht null Vitamin C — es ist
 * unbekannt, und eine 0 wäre eine Behauptung.
 */
export function vorschauFuer(w: Naehrwerte100, menge: number): Vorschau {
  const f = (v: string | number | null) => {
    const n = zahl(v)
    if (n === null || !Number.isFinite(menge) || menge < 0) return null
    return Math.round(n * menge / 100 * 10) / 10
  }
  return {
    kcal: f(w.enercc),
    protein: f(w.prot625),
    fett: f(w.fat),
    kh: f(w.cho),
  }
}

/** Eine Portion aus `nutrition.food_portions` (C-51). */
export type Portion = {
  name_de: string
  amount_g: number
  is_default: boolean
}

/**
 * Die Menge in Gramm aus Portion und Anzahl.
 *
 * `[read]` **Ohne Portion zählt das Grammfeld direkt** — „Custom
 * amount (g)" ist kein Sonderfall, sondern der Normalfall ohne
 * Auswahl.
 */
export function mengeAusPortion(
  portionen: readonly Portion[], name: string, anzahl: number,
): number | null {
  const p = portionen.find(x => x.name_de === name)
  if (!p || !Number.isFinite(anzahl) || anzahl <= 0) return null
  return Math.round(p.amount_g * anzahl * 10) / 10
}

/**
 * Wo der Tag mit dieser Menge landet — G-320.
 *
 * **Der Auftrag:** *„Wer mittags 800 kcal eintraegt, soll sehen, wo
 * er landet."*
 *
 * `[cmd]` **Der Plan trägt `target_kcal`** — bei den Seed-Plänen
 * 2.200, 3.100, 2.700.
 *
 * `[read]` **Ohne Ziel gibt es keinen Anteil**, und `null` ist die
 * ehrliche Antwort. **Eine 0 % hiesse „nichts vom Ziel", und das ist
 * etwas anderes als „kein Ziel gesetzt".**
 */
export function tagesLage(
  schonImTag: number | null, dazu: number | null, ziel: number | null,
): { summe: number | null; anteil: number | null; ueber: boolean } {
  const a = schonImTag ?? 0
  const b = dazu ?? 0
  const summe = (schonImTag === null && dazu === null) ? null : Math.round(a + b)
  if (summe === null || ziel === null || ziel <= 0) {
    return { summe, anteil: null, ueber: false }
  }
  return {
    summe,
    anteil: Math.round(summe / ziel * 100),
    ueber: summe > ziel,
  }
}
