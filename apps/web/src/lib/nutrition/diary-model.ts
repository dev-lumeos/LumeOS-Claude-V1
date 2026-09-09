// Reines Modell für das Nutrition-Diary (C-03 / WP-02, ADR-0003).
// KEIN I/O, KEIN Import von nutrition-db — dieses Modul wird von
// Client-Komponenten und den Unit-Tests geladen; die Schreib-/Lese-IO
// liegt in diary-write.ts. Die Rechenregel existiert genau hier.
import { z } from 'zod'

/**
 * BEZUGSGRÖSSE — die tragende Regel dieses Moduls.
 *
 * Die Werte in `nutrition.food_nutrients` gelten je **100 g** essbarem
 * Anteil (BLS-Konvention). `[cmd]` 2026-08-06 aus den Daten belegt:
 * max(CHO) = max(FAT) = exakt 100.00000 g; Cornflakes gezuckert
 * (C515600) trägt CHO 88,35 / FAT 0,54 / PROT625 4,62.
 *
 * Daraus folgt der Faktor. Wer diese Konstante ändert, ändert jede
 * Nährwertberechnung des Diary.
 * Dokumentiert in docs/ssot/34-naehrwert-bezugsgroesse.md.
 */
export const NUTRIENT_REFERENCE_GRAMS = 100

/** Mahlzeittypen — deckungsgleich mit dem CHECK in 052. */
export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'pre_workout',
  'post_workout',
  'other',
] as const
export type MealType = (typeof MEAL_TYPES)[number]

/**
 * Herkunft einer Position — deckungsgleich mit dem CHECK in 052.
 * 'custom'/'mealcam' aus SPEC_06 fehlen bewusst: die zugehörigen Tabellen
 * existieren nicht (Entscheidung Tom, 2026-08-06 — ein CHECK auf nicht
 * existierende Quellen wäre eine Behauptung ohne Deckung).
 */
export const FOOD_SOURCES = ['bls', 'manual'] as const
export type FoodSource = (typeof FOOD_SOURCES)[number]

/**
 * Die neun Schnell-Makros, die in 052 als eigene Spalten liegen.
 * Reihenfolge und Codes `[cmd]` gegen nutrition.nutrient_defs geprüft
 * (2026-08-06: alle neun vorhanden).
 * Schlüssel = Spaltenname in meal_items, Wert = Code in food_nutrients.
 */
export const QUICK_MACRO_COLUMNS = {
  enercc: 'ENERCC',
  prot625: 'PROT625',
  fat: 'FAT',
  cho: 'CHO',
  fibt: 'FIBT',
  sugar: 'SUGAR',
  fasat: 'FASAT',
  nacl: 'NACL',
  water_g: 'WATER',
} as const
export type QuickMacroColumn = keyof typeof QUICK_MACRO_COLUMNS

export const mealCreateSchema = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'entry_date muss YYYY-MM-DD sein.'),
  meal_type: z.enum(MEAL_TYPES),
  notes: z.string().max(2000).optional(),
  // ══ G-332: die Uhrzeit ══════════════════════════════
  //
  // **Tom, 2026-09-02:** *,,ein user kann auch jederzeit im diary
  // eine neue mahlzeit anlegen"* — **wer um 22:00 isst, hat dafuer
  // keinen Slot und soll trotzdem erfassen koennen.**
  //
  // `[cmd]` **`meal_time` wurde bis heute NIE gesetzt**
  // (`buildMealInsert`) — die 2.899 vorhandenen Zeiten kommen aus
  // den Seeds. **Eine im Browser angelegte Mahlzeit haette keine**,
  // und die Slot-Zuordnung (E-58) liefe ins Leere.
  //
  // `[cmd]` **`meals_meal_time_minute_check` verlangt volle
  // Minuten** — deshalb `HH:MM`, keine Sekunden.
  //
  // `[read]` **Optional, weil der Bestandsweg sie nicht schickt** —
  // `sicherstellen()` legt weiter ohne an, und das bleibt gueltig.
  meal_time: z.string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'meal_time muss HH:MM sein.')
    .optional(),
})
export type MealCreate = z.infer<typeof mealCreateSchema>

export const mealItemCreateSchema = z.object({
  meal_id: z.string().uuid('meal_id muss eine UUID sein.'),
  food_id: z.string().uuid('food_id muss eine UUID sein.'),
  amount_g: z.number().positive('amount_g muss grösser als 0 sein.').finite(),

  // C-51: die gewählte Portion, als Schnappschuss. Entweder alle drei
  // oder keines — `[cmd]` genau so prüft es der CHECK in 058a.
  portion_name: z.string().min(1).max(200).optional(),
  portion_quantity: z.number().positive().finite().optional(),
  portion_amount_g: z.number().positive().finite().optional(),
})
  .refine(
    d => {
      const gesetzt = [d.portion_name, d.portion_quantity, d.portion_amount_g]
        .filter(v => v !== undefined).length
      return gesetzt === 0 || gesetzt === 3
    },
    { message: 'Portion braucht Name, Anzahl und Gramm je Portion — oder nichts davon.' },
  )
  .refine(
    d => d.portion_quantity === undefined || d.portion_amount_g === undefined ||
         // Der CHECK erlaubt 0,01 Abweichung; hier dieselbe Grenze,
         // damit die Meldung aus der Anwendung kommt und nicht aus
         // Postgres.
         Math.abs(d.amount_g - d.portion_quantity * d.portion_amount_g) <= 0.01,
    { message: 'amount_g muss Anzahl × Gramm je Portion sein.', path: ['amount_g'] },
  )
export type MealItemCreate = z.infer<typeof mealItemCreateSchema>

export const mealItemUpdateSchema = z.object({
  id: z.string().uuid('id muss eine UUID sein.'),
  amount_g: z.number().positive('amount_g muss grösser als 0 sein.').finite(),
})
export type MealItemUpdate = z.infer<typeof mealItemUpdateSchema>

/** Eine Zeile aus nutrition.food_nutrients, auf das Nötige reduziert. */
export type FoodNutrientRow = {
  nutrient_code: string
  value: number
}

/** Auf die Menge gerechnete Nährwerte, bereit zum Einfrieren. */
export type FrozenNutrients = {
  /** Vollständiger Schnappschuss: { CODE: wert }. */
  nutrients: Record<string, number>
  /** Die neun Schnell-Makros als Spaltenwerte (null wenn nicht vorhanden). */
  macros: Record<QuickMacroColumn, number | null>
}

/**
 * Der Faktor für eine Menge. Menge 150 g → 1,5.
 * Getrennt herausgezogen, damit die Regel an genau einer Stelle steht.
 */
export function portionFactor(amountGrams: number): number {
  return amountGrams / NUTRIENT_REFERENCE_GRAMS
}

/**
 * Rundung auf 5 Nachkommastellen — deckungsgleich mit numeric(12,5) in
 * food_nutrients. Ohne Rundung schleppt der JSONB-Schnappschuss
 * Gleitkomma-Artefakte mit (0.1 * 3 = 0.30000000000000004).
 */
function round5(value: number): number {
  return Math.round(value * 1e5) / 1e5
}

/**
 * Rechnet die Nährwerte eines Lebensmittels auf eine Menge um.
 *
 * Ein FEHLENDER Nährwert ist NICHT 0: Codes ohne Zeile in food_nutrients
 * erscheinen nicht im Schnappschuss, und die zugehörige Makro-Spalte
 * bleibt null. Das ist der Unterschied zwischen "enthält nichts davon"
 * und "wurde nie gemessen".
 */
export function computeFrozenNutrients(rows: FoodNutrientRow[], amountGrams: number): FrozenNutrients {
  const factor = portionFactor(amountGrams)
  const nutrients: Record<string, number> = {}
  for (const row of rows) {
    if (!row || typeof row.nutrient_code !== 'string' || !Number.isFinite(row.value)) continue
    nutrients[row.nutrient_code] = round5(row.value * factor)
  }
  const macros = {} as Record<QuickMacroColumn, number | null>
  for (const column of Object.keys(QUICK_MACRO_COLUMNS) as QuickMacroColumn[]) {
    const code = QUICK_MACRO_COLUMNS[column]
    macros[column] = code in nutrients ? nutrients[code] : null
  }
  return { nutrients, macros }
}

/** Insert-Payload für nutrition.meals. */
export function buildMealInsert(userId: string, input: MealCreate) {
  return {
    user_id: userId,
    entry_date: input.entry_date,
    meal_type: input.meal_type,
    notes: input.notes ?? null,
    // G-332: `null` heisst weiterhin „keine Zeit erfasst“ — der
    // Bestandsweg schickt sie nicht, und das bleibt gueltig.
    meal_time: input.meal_time ?? null,
  }
}

/**
 * Insert-Payload für nutrition.meal_items — mit eingefrorenen Werten.
 *
 * `frozen_at` wird bewusst NICHT gesetzt: die Datenbank vergibt now()
 * als DEFAULT. Ein clientseitiger Zeitstempel wäre manipulierbar und
 * hinge an der Uhr des Aufrufers.
 */
export function buildMealItemInsert(
  userId: string,
  input: MealItemCreate,
  foodName: string,
  frozen: FrozenNutrients,
) {
  return {
    meal_id: input.meal_id,
    user_id: userId,
    food_id: input.food_id,
    food_source: 'bls' as const,
    food_name: foodName,
    amount_g: input.amount_g,
    // C-51: Die Gramm je Portion werden MITGESCHRIEBEN, nicht als
    // Verweis auf foods_portions. `[read]` Sonst hinge ein erfasster
    // Tag an einer Tabelle, die sich ändern kann — derselbe Grund wie
    // beim Einfrieren der Nährwerte.
    portion_name: input.portion_name ?? null,
    portion_quantity: input.portion_quantity ?? null,
    portion_amount_g: input.portion_amount_g ?? null,
    ...frozen.macros,
    nutrients: frozen.nutrients,
  }
}

// ════════════════════════════════════════════════════════════════════
// QUICK-ADD: EINE ZAHL OHNE LEBENSMITTEL — G-340
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-09-02:** *„Quick-Add bauen."*
//
// `[read]` **Der Fall: wer im Restaurant isst, kennt die Kalorien vom
// Menue, aber kein Lebensmittel.** **Er soll eine Zahl eintragen
// koennen, ohne zu suchen.**
//
// `[cmd]` **Das Schema sieht ihn ausdruecklich vor** —
// `meal_items_source_target_check`:
//
//     food_source = 'manual' AND food_id IS NULL
//                            AND custom_food_id IS NULL
//
// `[cmd]` **Gemessen am 2026-09-05: alle 9.051 Posten tragen `bls`**
// — `manual` und `custom` sind unbenutzt.

/**
 * Ein manueller Posten: Name, Kalorien, optional die drei Makros.
 *
 * `[read]` **Kein `food_id`** — genau das unterscheidet ihn.
 *
 * `[cmd]` **`amount_g` ist OPTIONAL, obwohl die Spalte NOT NULL ist**
 * — die Begruendung steht bei `buildManualItemInsert`.
 *
 * `[read]` **Keine Naehrwertschaetzung** (C-378): was der Nutzer nicht
 * eingibt, bleibt leer. **Aus 450 kcal folgt kein Proteinwert.**
 */
export const manualItemCreateSchema = z.object({
  meal_id: z.string().uuid('meal_id muss eine UUID sein.'),
  food_name: z.string().trim().min(1, 'Der Name darf nicht leer sein.').max(200),
  enercc: z.number().nonnegative('Kalorien duerfen nicht negativ sein.').finite(),
  // `[read]` **Die drei Makros sind freiwillig** — wer nur die
  // Kalorien der Menuekarte kennt, hat sie nicht.
  prot625: z.number().nonnegative().finite().optional(),
  fat: z.number().nonnegative().finite().optional(),
  cho: z.number().nonnegative().finite().optional(),
  // `[cmd]` **Der CHECK verlangt `> 0`** — deshalb `positive`, nicht
  // `nonnegative`. **Wer nichts angibt, bekommt die Vorgabe unten.**
  amount_g: z.number().positive('Die Menge muss groesser als 0 sein.')
    .finite().optional(),
})

export type ManualItemCreate = z.infer<typeof manualItemCreateSchema>

/**
 * Insert-Payload für einen manuellen Posten — G-340.
 *
 * ── Warum `amount_g` die Vorgabe 1 bekommt ────────────────────────
 *
 * `[cmd]` **Die Spalte ist NOT NULL und der CHECK verlangt `> 0`** —
 * eine Null ist unmöglich, `null` auch.
 *
 * `[cmd]` **Gemessen: `amount_g` wird zum Hochrechnen NICHT benutzt.**
 * `059b_daily_nutrient_summary_long.sql` liest die eingefrorenen
 * Spalten direkt; die Menge steht nirgends in einer Multiplikation.
 * **Eine falsche Zahl verfälscht also keinen Nährwert.**
 *
 * `[cmd]` **Aber sie fällt in die Grammsumme des Tages**
 * (`mahlzeiten.tsx:725`), und die steht in der Kopfzeile.
 *
 * **Tom zu dieser Zeile (G-330):** *„eine Angabe, die man direkt
 * nachwiegen kann."*
 *
 * `[read]` **Deshalb wird kein Gewicht erfunden.** Ein Restaurantteller
 * mit „450 kcal" wiegt nicht 450 g und nicht 100 g — **jede geratene
 * Zahl wäre eine Behauptung über etwas, das niemand gewogen hat.**
 *
 * `[read]` **`1` ist der kleinstmögliche Wert, den der CHECK zulässt**
 * — er hält die Zeile schreibbar und verschiebt die Grammsumme um das
 * Minimum. `[cmd]` **Zwei Bestandsposten tragen bereits `1`**, der Wert
 * ist also kein Fremdkörper.
 *
 * `[read]` **Wer das Gewicht kennt, gibt es an** — dann steht es da,
 * und die Summe stimmt.
 *
 * ── Warum `nutrients` leer bleibt ─────────────────────────────────
 *
 * `[cmd]` **Gemessen in `059b`, Zeile 94-96:** der jsonb-Zweig
 * schliesst die neun Spaltencodes ausdrücklich aus —
 * `WHERE kv.key NOT IN ('ENERCC','PROT625','FAT','CHO', …)`.
 *
 * `[read]` **Die Eingaben gehören also in die SPALTEN, nicht in den
 * jsonb.** Dort geschrieben würden sie schlicht ignoriert — und ein
 * Wert, den niemand liest, ist eine zweite Wahrheit, die auf ihren
 * Fehler wartet.
 *
 * `[cmd]` **`{}` ist der Spaltenvorgabewert** und heisst genau das
 * Richtige: **für die übrigen 138 Codes gibt es keine Messung.**
 * `[read]` **Seit G-341 sagt der Nährstoffreiter das auch** — der Tag
 * bleibt „unvollständig", und das ist ehrlich (C-378).
 */
export function buildManualItemInsert(userId: string, input: ManualItemCreate) {
  return {
    meal_id: input.meal_id,
    user_id: userId,
    // `[cmd]` **Beide NULL** — sonst greift der CHECK.
    food_id: null,
    custom_food_id: null,
    food_source: 'manual' as const,
    food_name: input.food_name.trim(),
    amount_g: input.amount_g ?? 1,
    enercc: input.enercc,
    // `[read]` **`null`, nicht `0`** — wer kein Protein angibt, sagt
    // nicht „null Gramm", sondern „ich weiss es nicht". **Genau die
    // Unterscheidung, die C-48 Regel 1 traegt.**
    prot625: input.prot625 ?? null,
    fat: input.fat ?? null,
    cho: input.cho ?? null,
    nutrients: {},
    measurement_source: 'manual' as const,
    // `frozen_at` bleibt der Datenbank überlassen — dieselbe
    // Begründung wie bei `buildMealItemInsert`.
  }
}

/**
 * Update-Payload beim nachträglichen Ändern der Menge.
 *
 * Die Werte werden NEU eingefroren, inklusive frozen_at — sonst behauptete
 * der Zeitstempel einen Stand, gegen den nicht gerechnet wurde. Genau
 * dieser Fall ist im Dateikopf von 052 als Anwendungspflicht benannt:
 * die Datenbank rechnet NICHT nach.
 */
export function buildMealItemAmountUpdate(amountGrams: number, frozen: FrozenNutrients) {
  return {
    amount_g: amountGrams,
    ...frozen.macros,
    nutrients: frozen.nutrients,
    frozen_at: new Date().toISOString(),
  }
}

/** Zeile aus nutrition.meals, auf das UI-relevante reduziert. */
export type StoredMeal = {
  id: string
  entry_date: string
  meal_type: MealType
  /**
   * G-15: die Uhrzeit der Mahlzeit (`HH:MM:SS`).
   *
   * `[cmd]` Seit Kettenschritt 052a gibt es sie, und der UNIQUE-Index
   * auf (user, datum, typ) ist weg — zwei Snacks am Tag sind erlaubt.
   * `null` bleibt moeglich, solange aeltere Zeilen ohne Zeit denkbar
   * sind; heute traegt jede der 686 Mahlzeiten eine.
   */
  meal_time: string | null
  notes: string | null
}

/** Zeile aus nutrition.meal_items, auf das UI-relevante reduziert. */
export type StoredMealItem = {
  id: string
  meal_id: string
  food_id: string | null
  /**
   * G-348: `bls` · `custom` · `manual` — welcher der drei Faelle.
   *
   * `[read]` **`food_id` allein genuegt nicht:** `custom` und
   * `manual` haben beide `food_id IS NULL`. **Wer sie nicht
   * unterscheidet, behandelt beide gleich falsch.**
   */
  food_source: string
  custom_food_id: string | null
  food_name: string
  amount_g: number
  enercc: number | null
  prot625: number | null
  fat: number | null
  cho: number | null
  /** C-51: gewaehlte Portion. `null` heisst: direkt in Gramm erfasst. */
  portion_name: string | null
  portion_quantity: number | null
  portion_amount_g: number | null
  /**
   * G-223: wann die Naehrwerte eingefroren wurden.
   *
   * `[cmd]` **Die Spalte stand seit C-03 in der Tabelle und wurde nie
   * gelesen.** `diary-model.ts` SCHREIBT sie an drei Stellen (Insert,
   * Mengenaenderung, Neueinfrieren) ? **kein Leseweg nahm sie mit.**
   *
   * `[read]` **Ohne sie ist nicht entscheidbar, ob der Schnappschuss
   * noch dem Bestand entspricht.** SPEC_10 verlangt genau diesen
   * Vergleich fuer den Neuberechnen-Knopf.
   */
  frozen_at: string | null
  /**
   * G-223: `updated_at` des Lebensmittels, gegen das eingefroren wurde.
   *
   * `[read]` **Kommt aus dem Verbund** (`foods!inner(updated_at)`),
   * nicht aus `meal_items`. **`null` bei manuellen Posten und eigenen
   * Lebensmitteln** ? die haben kein `food_id`, also keinen Bestand,
   * gegen den sich vergleichen liesse.
   */
  food_updated_at: string | null
}

/**
 * Ist der Schnappschuss dieser Zeile ueberholt? ? G-223.
 *
 * `[cmd]` **SPEC_10:** *„der Knopf erscheint, wenn die
 * Lebensmitteldaten neuer sind als der Schnappschuss."*
 *
 * `[read]` **Herausgezogen, damit die Entscheidung messbar ist** ?
 * eine Bedingung im JSX prueft nur das Wort, nicht die Sache.
 *
 * `[read]` **Drei Faelle geben `false`, und jeder aus eigenem
 * Grund:**
 * - **kein `frozen_at`:** es gibt keinen Schnappschuss, also nichts
 *   zu vergleichen ? **nicht „aktuell", sondern unbekannt.**
 * - **kein `food_updated_at`:** manueller Posten oder eigenes
 *   Lebensmittel; **es gibt keinen Bestand dahinter.**
 * - **gleich alt:** `>` und nicht `>=` ? wer im selben Augenblick
 *   einfriert, hat den Stand gerechnet.
 */
export function istSchnappschussVeraltet(zeile: {
  frozen_at?: string | null
  food_updated_at?: string | null
}): boolean {
  if (!zeile.frozen_at || !zeile.food_updated_at) return false
  const eingefroren = Date.parse(zeile.frozen_at)
  const bestand = Date.parse(zeile.food_updated_at)
  if (!Number.isFinite(eingefroren) || !Number.isFinite(bestand)) return false
  return bestand > eingefroren
}

function asNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  // PostgREST liefert numeric als String, damit keine Präzision verloren geht.
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null
}

/** Rohzeilen defensiv auf das Modell filtern (Muster aus preferences-model). */
export function parseStoredMeals(rows: unknown): StoredMeal[] {
  if (!Array.isArray(rows)) return []
  const types = new Set<string>(MEAL_TYPES)
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return []
    const record = row as Record<string, unknown>
    if (
      typeof record.id !== 'string' ||
      typeof record.entry_date !== 'string' ||
      typeof record.meal_type !== 'string' ||
      !types.has(record.meal_type)
    ) {
      return []
    }
    return [
      {
        id: record.id,
        meal_time: typeof record.meal_time === 'string' ? record.meal_time : null,
        entry_date: record.entry_date,
        meal_type: record.meal_type as MealType,
        notes: typeof record.notes === 'string' ? record.notes : null,
      },
    ]
  })
}

export function parseStoredMealItems(rows: unknown): StoredMealItem[] {
  if (!Array.isArray(rows)) return []
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return []
    const record = row as Record<string, unknown>
    if (
      typeof record.id !== 'string' ||
      typeof record.meal_id !== 'string' ||
      typeof record.food_name !== 'string'
    ) {
      return []
    }
    const amount = asNumberOrNull(record.amount_g)
    if (amount === null) return []
    return [
      {
        id: record.id,
        meal_id: record.meal_id,
        food_id: typeof record.food_id === 'string' ? record.food_id : null,
        // ══ G-348: die Herkunft muss mit ═══════════════════
        //
        // `[cmd]` **Der CHECK erlaubt drei Faelle**, und **zwei davon
        // haben `food_id IS NULL`:**
        //
        //     bls      food_id NOT NULL, custom_food_id NULL
        //     custom   food_id NULL,     custom_food_id NOT NULL
        //     manual   food_id NULL,     custom_food_id NULL
        //
        // `[read]` **Wer nur `food_id` liest, kann `manual` und
        // `custom` nicht unterscheiden** — und behandelt beide
        // gleich falsch. **`wieGestern` uebersprang sie deshalb
        // still** (G-348).
        food_source: typeof record.food_source === 'string'
          ? record.food_source : 'bls',
        custom_food_id: typeof record.custom_food_id === 'string'
          ? record.custom_food_id : null,
        food_name: record.food_name,
        amount_g: amount,
        enercc: asNumberOrNull(record.enercc),
        prot625: asNumberOrNull(record.prot625),
        fat: asNumberOrNull(record.fat),
        cho: asNumberOrNull(record.cho),
        // G-12: der Schnappschuss der gewaehlten Portion (C-51).
        // Fehlt er, wurde direkt in Gramm erfasst.
        portion_name: typeof record.portion_name === 'string' ? record.portion_name : null,
        portion_quantity: asNumberOrNull(record.portion_quantity),
        portion_amount_g: asNumberOrNull(record.portion_amount_g),
        // ══ G-223: der Schnappschuss und der Bestand ════════════════
        //
        // `[read]` **`frozen_at` kommt aus der Zeile**, `updated_at`
        // aus dem verbundenen Lebensmittel. **PostgREST liefert den
        // Verbund als eingebettetes Objekt** ? bei einem
        // `!inner`-Verbund ein Objekt, bei `!left` moeglicherweise
        // `null`. Beide Formen werden hier abgefangen.
        frozen_at: typeof record.frozen_at === 'string' ? record.frozen_at : null,
        food_updated_at: eingebettetesDatum(record.foods, 'updated_at'),
      },
    ]
  })
}

/**
 * Ein Datumsfeld aus einem eingebetteten PostgREST-Verbund lesen.
 *
 * `[read]` **PostgREST liefert `foods!left(updated_at)` als Objekt**,
 * bei manchen Formen als Array mit einem Element. **Fehlt der
 * Verbundpartner, steht `null`** ? und genau das ist der Fall bei
 * manuellen Posten (`food_id IS NULL`).
 */
function eingebettetesDatum(wert: unknown, feld: string): string | null {
  const objekt = Array.isArray(wert) ? wert[0] : wert
  if (!objekt || typeof objekt !== 'object') return null
  const v = (objekt as Record<string, unknown>)[feld]
  return typeof v === 'string' ? v : null
}

/**
 * Summiert Positionen für die Anzeige einer Mahlzeit.
 *
 * ACHTUNG, Abgrenzung zu C-04: das hier ist eine Anzeige-Hilfe über eine
 * bereits geladene Liste, KEIN Aggregationsweg für Tagessummen. Welche
 * Form die Tagessumme bekommt (Sicht, materialisierte Sicht,
 * Summentabelle), entscheidet C-04.
 * Null bleibt null: fehlt bei einer Position ein Wert, wird er nicht als
 * 0 mitgezählt — sonst behauptet die Summe eine Genauigkeit, die es nicht gibt.
 */
export function sumMealItemMacros(items: StoredMealItem[]): {
  enercc: number | null
  prot625: number | null
  fat: number | null
  cho: number | null
  incompleteFields: string[]
} {
  const fields = ['enercc', 'prot625', 'fat', 'cho'] as const
  const totals: Record<string, number | null> = {}
  const incompleteFields: string[] = []
  for (const field of fields) {
    let sum = 0
    let seen = 0
    let missing = false
    for (const item of items) {
      const value = item[field]
      if (value === null) missing = true
      else {
        sum += value
        seen += 1
      }
    }
    totals[field] = seen === 0 ? null : round5(sum)
    if (missing) incompleteFields.push(field)
  }
  return {
    enercc: totals.enercc,
    prot625: totals.prot625,
    fat: totals.fat,
    cho: totals.cho,
    incompleteFields,
  }
}

/** Stabile Fehlercodes des Diary-Schreibpfads (Konvention §6). */
export type DiaryWriteErrorCode =
  | 'NO_SESSION'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN_FOOD'
  | 'DUPLICATE_MEAL'
  | 'NOT_FOUND'
  | 'DB_UNAVAILABLE'
  | 'WRITE_FAILED'
  // G-269: die Bearbeitung ist erlaubt, aber nicht fuer diesen Plan.
  // `[read]` **Kein Validierungsfehler** — die Eingabe war richtig,
  // die Herkunft verbietet es. 403 statt 400, damit die Oberflaeche
  // beides unterscheiden kann.
  | 'FORBIDDEN'
  // G-306/E-42: eine PROTOKOLLIERTE Position ist eingefroren.
  //
  // `[cmd]` **Berichtigt am 2026-09-01:** hier stand `PLAN_AKTIV`,
  // und die Sperre galt fuer jeden aktiven Plan. **E-42 loest das
  // ab** — gesperrt ist die einzelne Position, sobald sie ein Log mit
  // `status <> 'pending'` traegt.
  //
  // `[read]` **Nicht `FORBIDDEN` (403):** dort fehlt das Recht; hier
  // steht Vergangenes im Weg. **409 sagt: der Zustand passt nicht,
  // nicht: du darfst nicht.**
  | 'POSITION_GELOGGT'

export class DiaryWriteError extends Error {
  constructor(
    readonly code: DiaryWriteErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'DiaryWriteError'
  }
}

/** HTTP-Status je Fehlercode — eine Zuordnung, von Route und Tests genutzt. */
export function httpStatusForDiaryError(code: DiaryWriteErrorCode): number {
  switch (code) {
    case 'NO_SESSION':
      return 401
    case 'VALIDATION_FAILED':
    case 'UNKNOWN_FOOD':
      return 400
    case 'DUPLICATE_MEAL':
    // E-42: eine protokollierte Position ist Vergangenheit.
    case 'POSITION_GELOGGT':
      return 409
    case 'NOT_FOUND':
      return 404
    case 'FORBIDDEN':
      return 403
    case 'DB_UNAVAILABLE':
      return 503
    case 'WRITE_FAILED':
      return 500
  }
}
