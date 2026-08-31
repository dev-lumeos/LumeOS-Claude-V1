// ════════════════════════════════════════════════════════════════════
// REZEPTE UND EINKAUFSLISTEN — G-289 / G-288 / G-300 / G-301
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// **Grundlage: `SPEC_03` Flow 7 und Flow 8, am 2026-08-31 gelesen.**
// **Entscheidung: `E-39`** — `ADR_RECIPES_SCHEMA_ONLY` ist abgeloest.
//
// `[read]` **Hier steht nur, was sich rechnen laesst.** Was in der
// Spec nicht steht, steht auch hier nicht — es ist unten als Luecke
// benannt, nicht ausgedacht.

// ══ DIE HERKUNFT — vorsehen, nicht bauen ════════════════════════════
//
// **Tom, 2026-08-31:** *,,vorsehen dass coach und marketplace
// angebunden wird spaeter."*
//
// `[cmd]` **`SPEC_03` Flow 3, Schritt 2 nennt die Beschriftung je
// Quelle:** eigene ohne Label, *,,Von [Coach-Name]"*, *,,Gekauft:
// [Produkt-Name]"*, *,,Erstellt von Buddy"*.
//
// `[cmd]` **Gemessen am 2026-08-31: `recipes` traegt KEINE
// `source`-Spalte** — 17 Spalten, darunter `measurement_source`
// (`manual|device|import|admin|seed`) und `source_detail`.
// **`ADR_RECIPE_SOURCE_BUDDY` beschreibt ein Feld, das es im Schema
// noch nicht gibt.**
//
// `[read]` **Deshalb wird die Herkunft hier ABGELEITET, nicht
// gelesen** — und die Ableitung sagt, worauf sie beruht. **Sobald die
// Spalte kommt, wird aus der Ableitung ein Feldzugriff, und die
// Anzeige bleibt, wie sie ist.**

export const QUELLEN = ['user', 'coach', 'marketplace', 'buddy'] as const
export type Quelle = (typeof QUELLEN)[number]

/**
 * Die Herkunft eines Rezepts.
 *
 * `[cmd]` **`measurement_source` ist NICHT die Quelle im Sinne von
 * Flow 3** — es sagt, wie gemessen wurde (`manual`, `seed`), nicht,
 * wer es erstellt hat. `[read]` **Die beiden zu verwechseln waere
 * genau der Fehler, den `plan_origin` bei den Plaenen vermeidet.**
 *
 * `[read]` **Bis die Spalte existiert, ist alles `user`** — und das
 * ist keine Behauptung ueber die Zukunft, sondern der gemessene
 * Stand.
 */
export function quelleVon(roh: string | null | undefined): Quelle {
  if (roh === 'coach' || roh === 'marketplace' || roh === 'buddy') return roh
  return 'user'
}

/**
 * Das Etikett je Quelle — Flow 3, Schritt 2.
 *
 * `[read]` **Eigene Rezepte tragen KEIN Label.** Die Spec sagt es so,
 * und es ist richtig: wenn alles ein Etikett traegt, unterscheidet
 * keines mehr.
 */
export function quellenEtikett(q: Quelle, detail?: string | null): string | null {
  if (q === 'user') return null
  if (q === 'coach') return `Von ${detail?.trim() || 'deinem Coach'}`
  if (q === 'marketplace') return `Gekauft: ${detail?.trim() || 'Marktplatz'}`
  return 'Erstellt von Buddy'
}

// ══ FLOW 7 SCHRITT 3 — die Live-Vorschau ════════════════════════════
//
// `[cmd]` **`nutrition.recipe_nutrition(p_recipe_id, p_servings)` ist
// eine FUNKTION, keine Tabelle** — gemessen am 2026-08-31. Sie
// liefert `ingredient_count`, `amount_g`, `enercc`, `prot625`, `fat`,
// `cho` und weitere.
//
// `[read]` **Fuer ein GESPEICHERTES Rezept rechnet sie.** `[read]`
// **Waehrend des Bauens gibt es das Rezept noch nicht** — deshalb
// rechnet die Vorschau im Entwurf aus den Naehrwerten je 100 g, die
// die Suche mitliefert. **Zwei Wege, eine Formel:** die Probe unten
// haelt sie gegeneinander.

/** Eine Zutat im Entwurf — was die Suche liefert plus die Menge. */
export type ZutatEntwurf = {
  food_id: string
  name: string
  amount_g: number
  /** Naehrwerte je 100 g, wie die Suche sie liefert. */
  enercc_100: number | null
  prot625_100: number | null
  fat_100: number | null
  cho_100: number | null
}

export type Naehrwerte = {
  kcal: number | null
  protein: number | null
  fett: number | null
  kohlenhydrate: number | null
}

/**
 * Die Summe ueber alle Zutaten.
 *
 * `[read]` **`null` heisst „nicht ermittelbar", nicht 0.** `[cmd]`
 * **Der BLS fuehrt fehlende Werte als `NULL`** — ein Stueck Fleisch
 * ohne Vitamin-C-Wert macht den Tag unvollstaendig, nicht null
 * (siehe `bls-fehlend-heisst-nicht-null`). **Hier gilt dasselbe: hat
 * EINE Zutat keinen Wert, ist die Summe unvollstaendig** und sagt es.
 */
export function summeVon(zutaten: readonly ZutatEntwurf[]): Naehrwerte {
  const feld = (
    w: (z: ZutatEntwurf) => number | null,
  ): number | null => {
    if (zutaten.length === 0) return null
    let summe = 0
    for (const z of zutaten) {
      const je100 = w(z)
      // Eine Luecke macht die Summe unbestimmbar.
      if (je100 === null) return null
      summe += (je100 * z.amount_g) / 100
    }
    return Math.round(summe * 10) / 10
  }
  return {
    kcal: feld(z => z.enercc_100),
    protein: feld(z => z.prot625_100),
    fett: feld(z => z.fat_100),
    kohlenhydrate: feld(z => z.cho_100),
  }
}

/**
 * Je Portion — Flow 7 Schritt 3: *,,Gesamt + pro Portion"*.
 *
 * `[read]` **Bei 0 Portionen gibt es keine Portion**, nicht unendlich
 * viel. Der CHECK verlangt `servings > 0`; hier wird trotzdem
 * geprueft, weil das Formular waehrend der Eingabe leer sein darf.
 */
export function jePortion(gesamt: Naehrwerte, portionen: number): Naehrwerte {
  if (!Number.isFinite(portionen) || portionen <= 0) {
    return { kcal: null, protein: null, fett: null, kohlenhydrate: null }
  }
  const teil = (v: number | null) =>
    v === null ? null : Math.round((v / portionen) * 10) / 10
  return {
    kcal: teil(gesamt.kcal),
    protein: teil(gesamt.protein),
    fett: teil(gesamt.fett),
    kohlenhydrate: teil(gesamt.kohlenhydrate),
  }
}

// ══ DIE FALLE IN `recipe_nutrition` ═════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-31 am Funktionsrumpf:**
// `ri.amount_g * servings_used / recipe.servings`. **`p_servings`
// SKALIERT auf eine Zielportionszahl — es teilt nicht.**
//
// `[cmd]` **Der Beleg an echten Daten:** ein Rezept mit
// `servings = 1` liefert bei `p_servings = 1` **493,2 kcal**, bei
// `p_servings = 2` **986,4**. **Und `recipe_nutrition(id, 4)` auf
// einem Vier-Portionen-Rezept aendert gar nichts.**
//
// `[read]` **Wer *je Portion* mit `recipe_nutrition(id, servings)`
// holt, zeigt zweimal die Gesamtwerte** — und nichts fiele auf, weil
// beide Zahlen plausibel aussehen.

// `[read]` **Deshalb gibt es hier KEINE zweite Funktion fuer
// gespeicherte Rezepte.** `jePortion()` oben teilt, und sie teilt in
// beiden Faellen — im Entwurf wie am gespeicherten Rezept. **Ein
// eigener Name fuer denselben Vorgang waere eine zweite Stelle, an
// der er falsch werden kann.**

/** Der Satz, wenn eine Zutat keine Werte hat. */
export const UNVOLLSTAENDIG_SATZ =
  'Mindestens eine Zutat führt für diesen Nährstoff keinen Wert — '
  + 'die Summe wäre unvollständig und wird deshalb nicht gezeigt.'

// ══ FLOW 8 — die Einkaufsliste aus einem REZEPT ═════════════════════
//
// `[cmd]` **`SPEC_03` Flow 8, Schritt 1: *,,Rezept oeffnen ->
// Einkaufsliste erstellen"*.**
//
// `[cmd]` **Und damit ist die heutige Kachel widerlegt:**
// `plan-lage.ts` sagt *,,Sie entsteht aus einer Planwoche"*. **Flow 8
// sagt: aus einem Rezept.** `[cmd]` **Das Schema kann beides** —
// `shopping_lists.source_type` erlaubt `manual`, `recipe`,
// `meal_plan`, `supplement_reorder`; **gebaut wird `recipe`, weil nur
// das in einem Flow steht.**

/**
 * Die Menge einer Zutat, auf die gewaehlte Portionszahl skaliert.
 *
 * `[cmd]` **Flow 8, Schritt 2: *,,Portionen waehlen (Standard:
 * Rezept-Portionen)"*, Schritt 3: *,,Menge skaliert"*.**
 *
 * `[read]` **Der Faktor ist Zielportionen geteilt durch
 * Rezeptportionen** — bei gleicher Zahl bleibt die Menge, wie sie
 * ist. **Das ist die Probe, die einen vertauschten Bruch findet.**
 */
export function skaliert(
  amountG: number, rezeptPortionen: number, zielPortionen: number,
): number | null {
  if (!Number.isFinite(rezeptPortionen) || rezeptPortionen <= 0) return null
  if (!Number.isFinite(zielPortionen) || zielPortionen <= 0) return null
  return Math.round(amountG * (zielPortionen / rezeptPortionen) * 10) / 10
}

/**
 * Die Anzeige einer Menge — Flow 8 zeigt *,,800g"*.
 *
 * `[read]` **Gramm bleiben Gramm.** `[cmd]` Die Spec zeigt in ihrem
 * Beispiel *,,40ml"* fuer Oel; **`shopping_list_items` traegt dafuer
 * `unit_display`**, und der Wert kommt aus der Zutat, nicht aus einer
 * Umrechnung hier. **Milliliter aus Gramm zu erfinden waere eine
 * Dichteannahme.**
 */
export function mengeAnzeige(amountG: number | null, einheit = 'g'): string {
  if (amountG === null) return '—'
  const gerundet = Math.round(amountG * 10) / 10
  return `${gerundet.toLocaleString('de-DE')} ${einheit}`
}

/** Wie viele Posten abgehakt sind — Flow 8, Schritt 5. */
export function fortschritt(posten: readonly { is_checked: boolean }[]): {
  erledigt: number; gesamt: number; anteil: number | null
} {
  const gesamt = posten.length
  const erledigt = posten.filter(p => p.is_checked).length
  return {
    erledigt, gesamt,
    anteil: gesamt === 0 ? null : Math.round((erledigt / gesamt) * 100),
  }
}

// ══ WAS IN SPEC_03 NICHT STEHT — gemeldet, nicht ausgedacht ═════════
//
// **Der Auftrag: *,,Wenn ein Schritt in der Spec fehlt: melden, nicht
// ausdenken."*** `[cmd]` **C-370 ist genau so entstanden** — das
// Anlegen eines LEEREN Plans steht in keinem Flow.
//
// `[read]` **Diese drei Luecken sind beim Lesen von Flow 7 und 8
// aufgefallen. Sie sind hier benannt und im Bericht vorgelegt.**

export const SPEC_LUECKEN = [
  {
    flow: 'Flow 8, Schritt 6',
    fehlt: 'Teilen / Exportieren',
    was: 'Die Spec sagt „Teilen / Exportieren möglich" — ohne Format, '
      + 'ohne Ziel, ohne Mechanismus. Nicht gebaut.',
  },
  {
    flow: 'Flow 7, Schritt 2',
    fehlt: 'cooking_skill',
    was: 'Die Spalte ist NOT NULL mit CHECK auf beginner/intermediate/'
      + 'advanced. Flow 7 nennt sie nicht — gesetzt wird „beginner“, '
      + 'und das Feld steht im Formular, damit die Wahl sichtbar ist.',
  },
  {
    flow: 'Flow 7',
    fehlt: 'Rezept löschen',
    was: 'Kein Flow beschreibt das Entfernen eines Rezepts. Nicht '
      + 'gebaut — das Bearbeiten deckt Flow 7 ab.',
  },
] as const

/**
 * Die Vorgabe fuer `cooking_skill`.
 *
 * `[cmd]` **NOT NULL, CHECK auf drei Werte** — ohne Angabe schlaegt
 * der Insert fehl. `[read]` **Die Vorgabe steht hier und nicht
 * verstreut im Formular**, damit es eine Stelle gibt, die sie kennt.
 */
export const KOENNEN = ['beginner', 'intermediate', 'advanced'] as const
export type Koennen = (typeof KOENNEN)[number]
export const KOENNEN_LABEL: Record<Koennen, string> = {
  beginner: 'einfach',
  intermediate: 'mittel',
  advanced: 'anspruchsvoll',
}
export const KOENNEN_VORGABE: Koennen = 'beginner'
