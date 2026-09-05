// ════════════════════════════════════════════════════════════════════
// SCHREIBWEG: REZEPTE UND EINKAUFSLISTEN — G-289 / G-288
// ════════════════════════════════════════════════════════════════════
//
// **Grundlage: `SPEC_03` Flow 7 (Schritt 1-5) und Flow 8 (1-5).**
// **Entscheidung: `E-39`.**
//
// `[read]` **Dieselbe Form wie `plan-write.ts`:** Zod-Schema, Logik
// hier, HTTP in der Route.
//
// ══ WAS HIER NICHT ENTSTEHT ═════════════════════════════════════════
//
// `[cmd]` **Kein zweiter Weg ins Tagebuch.** Flow 7 Schritt 5 schreibt
// `Meal + MealItems` — **das ist `createMeal` / `addMealItem` aus
// G-272**, mitsamt `computeFrozenNutrients`. **Ein eigener Insert
// hier waere die zweite Kopie derselben Einfrierregel.**
import { z } from 'zod'

import { createSessionClient } from '@lumeos/shared/session'
import { DiaryWriteError, MEAL_TYPES } from './diary-model'
import { createMeal, addMealItem } from './diary-write'
import { KOENNEN, KOENNEN_VORGABE } from './rezept-lage'

async function sitzung() {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new DiaryWriteError('NO_SESSION', 'Keine angemeldete Session.')
  return { db: client.schema('nutrition'), user }
}

// ══ FLOW 7, SCHRITT 1-4: das Rezept ═════════════════════════════════

/**
 * `[cmd]` **Die Felder aus Flow 7 Schritt 2**, dazu die Zutaten aus
 * Schritt 3. `[read]` **`cooking_skill` ist NOT NULL** und steht in
 * keinem Flow — die Vorgabe kommt aus `rezept-lage`, damit es eine
 * Stelle gibt, die sie kennt.
 */
export const zutatSchema = z.object({
  food_id: z.string().uuid(),
  amount_g: z.number().positive('Die Menge muss groesser als 0 sein.').max(100000),
})

export const rezeptAnlegenSchema = z.object({
  art: z.literal('rezept'),
  name_de: z.string().trim().min(2, 'Der Name braucht mindestens zwei Zeichen.').max(200),
  servings: z.number().positive('Mindestens eine Portion.').max(100),
  description: z.string().trim().max(2000).nullish(),
  instructions: z.string().trim().max(10000).nullish(),
  prep_time_min: z.number().int().nonnegative().max(1440).nullish(),
  cook_time_min: z.number().int().nonnegative().max(1440).nullish(),
  cooking_skill: z.enum(KOENNEN).default(KOENNEN_VORGABE),
  zutaten: z.array(zutatSchema).min(1, 'Ein Rezept braucht mindestens eine Zutat.'),
})

export const rezeptAendernSchema = rezeptAnlegenSchema
  .omit({ art: true })
  .partial()
  .extend({
    art: z.literal('rezept_aendern'),
    id: z.string().uuid(),
    zutaten: z.array(zutatSchema).min(1).optional(),
  })

export type RezeptAnlegen = z.infer<typeof rezeptAnlegenSchema>
export type RezeptAendern = z.infer<typeof rezeptAendernSchema>

export type GespeichertesRezept = {
  id: string
  name_de: string
  servings: number
  zutaten: number
}

/**
 * Die Zutaten eines Rezepts setzen.
 *
 * `[read]` **Ersetzen, nicht ergaenzen.** Beim Aendern kaeme sonst
 * jede Zutat ein zweites Mal dazu. `[cmd]` **`sort_order` wird hier
 * vergeben** (0-basiert, der CHECK verlangt `>= 0`) — nicht vom
 * Browser geschickt, sonst kollidieren zwei Fenster.
 */
async function zutatenSetzen(
  db: Awaited<ReturnType<typeof sitzung>>['db'],
  userId: string, rezeptId: string,
  zutaten: ReadonlyArray<{ food_id: string; amount_g: number }>,
): Promise<void> {
  const { error: weg } = await db
    .from('recipe_ingredients').delete().eq('recipe_id', rezeptId)
  if (weg) throw new DiaryWriteError('WRITE_FAILED', weg.message)

  const { error } = await db.from('recipe_ingredients').insert(
    zutaten.map((z, i) => ({
      recipe_id: rezeptId,
      user_id: userId,
      sort_order: i,
      // `[cmd]` `recipe_ingredients_source_target_check`: bei `bls`
      // MUSS `food_id` gesetzt und `custom_food_id` leer sein.
      food_source: 'bls',
      food_id: z.food_id,
      custom_food_id: null,
      amount_g: z.amount_g,
    })),
  )
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
}

/** Flow 7, Schritt 4 — speichern. */
export async function rezeptAnlegen(
  eingabe: RezeptAnlegen,
): Promise<GespeichertesRezept> {
  const { db, user } = await sitzung()
  const { art: _art, zutaten, ...felder } = eingabe

  const { data, error } = await db
    .from('recipes')
    .insert({
      ...felder,
      user_id: user.id,
      // `[read]` **`manual`, nicht `seed`** — dieses Rezept hat ein
      // Mensch angelegt. `[cmd]` Die sechs Bestandsrezepte tragen
      // `seed`; die Unterscheidung bleibt damit ablesbar.
      measurement_source: 'manual',
    })
    .select('id, name_de, servings')
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)

  const rezept = data as unknown as { id: string; name_de: string; servings: number }
  await zutatenSetzen(db, user.id, rezept.id, zutaten)
  return { ...rezept, zutaten: zutaten.length }
}

/** Flow 7 — dasselbe Formular, vorhandenes Rezept. */
export async function rezeptAendern(
  eingabe: RezeptAendern,
): Promise<GespeichertesRezept> {
  const { db, user } = await sitzung()
  const { art: _art, id, zutaten, ...felder } = eingabe

  if (Object.keys(felder).length > 0) {
    const { error } = await db.from('recipes').update(felder).eq('id', id)
    if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  }
  if (zutaten) await zutatenSetzen(db, user.id, id, zutaten)

  const { data, error: leseFehler } = await db
    .from('recipes').select('id, name_de, servings').eq('id', id).single()
  if (leseFehler) throw new DiaryWriteError('WRITE_FAILED', leseFehler.message)
  const r = data as unknown as { id: string; name_de: string; servings: number }

  const { count } = await db
    .from('recipe_ingredients')
    .select('id', { count: 'exact', head: true })
    .eq('recipe_id', id)
  return { ...r, zutaten: count ?? 0 }
}

// ══ FLOW 7, SCHRITT 5: als Mahlzeit loggen ══════════════════════════

export const rezeptLoggenSchema = z.object({
  art: z.literal('rezept_loggen'),
  recipe_id: z.string().uuid(),
  portionen: z.number().positive('Mindestens eine Portion.').max(100),
  // `[read]` **`MEAL_TYPES` kommt aus `diary-model`, nicht als
  // zweite Liste hierher** - sie wuerde beim naechsten neuen Typ
  // auseinanderlaufen.
  meal_type: z.enum(MEAL_TYPES),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum als YYYY-MM-DD.'),
})

export type RezeptLoggen = z.infer<typeof rezeptLoggenSchema>

/**
 * Flow 7, Schritt 5 — *,,Meal + MealItems, eine Zeile pro Zutat,
 * Naehrstoffe eingefroren"*.
 *
 * `[cmd]` **`ADR_GHOST_ENTRY_RECIPE`: ein Rezept ist eine Vorlage.**
 * `[read]` **Beim Loggen entstehen IMMER Einzelzutaten** — je Zutat
 * ein `MealItem`. **Ein „Rezept als Einheit" gibt es nicht;** es
 * braeche die Mengen-Anpassbarkeit je Zutat.
 *
 * `[read]` **Die Menge wird auf die gewaehlten Portionen skaliert:**
 * `amount_g * portionen / servings`. **Bei den Rezeptportionen bleibt
 * sie, wie sie ist** — die Probe, die einen vertauschten Bruch
 * findet.
 *
 * `[cmd]` **Das Einfrieren macht `addMealItem` (G-272)**, nicht diese
 * Funktion — sonst gaebe es zwei Kopien derselben Regel.
 */
export async function rezeptLoggen(eingabe: RezeptLoggen): Promise<{
  meal_id: string; positionen: number
  /** G-348: Zutaten ohne `food_id` — sie tragen keine Naehrwerte. */
  uebersprungen: number
  skalierung: number
}> {
  const { db } = await sitzung()

  const { data: rezept, error: rFehler } = await db
    .from('recipes').select('id, name_de, servings')
    .eq('id', eingabe.recipe_id).single()
  if (rFehler) throw new DiaryWriteError('WRITE_FAILED', rFehler.message)
  const r = rezept as unknown as { name_de: string; servings: number }

  const { data: zutaten, error: zFehler } = await db
    .from('recipe_ingredients')
    .select('food_id, amount_g, sort_order')
    .eq('recipe_id', eingabe.recipe_id)
    .order('sort_order')
  if (zFehler) throw new DiaryWriteError('WRITE_FAILED', zFehler.message)

  const liste = (zutaten ?? []) as unknown as Array<{
    food_id: string | null; amount_g: number
  }>
  if (liste.length === 0) {
    throw new DiaryWriteError('VALIDATION_FAILED',
      'Dieses Rezept hat keine Zutaten — es laesst sich nicht loggen.')
  }

  const servings = Number(r.servings)
  if (!Number.isFinite(servings) || servings <= 0) {
    throw new DiaryWriteError('WRITE_FAILED',
      'Das Rezept traegt keine gueltige Portionszahl.')
  }
  const skalierung = eingabe.portionen / servings

  const mahlzeit = await createMeal({
    entry_date: eingabe.entry_date,
    meal_type: eingabe.meal_type,
    // `[read]` Der Rezeptname steht an der Mahlzeit, damit im Tagebuch
    // erkennbar bleibt, woraus die Positionen stammen.
    // `[cmd]` Das Feld heisst `notes` (mealCreateSchema), nicht `note`.
    notes: `Rezept: ${r.name_de}`,
  })

  // ══ G-348: das Ueberspringen wird gezaehlt ═══════════════════
  //
  // `[cmd]` **`recipe_ingredients.food_id` ist NULL-bar** — heute
  // hat keine der 22 Zeilen ein `null`, **aber der Weg steht.**
  //
  // `[read]` **Mitnehmen geht NICHT:** eine Zutat ohne `food_id`
  // traegt nur `food_name_snapshot`, keine Naehrwerte. **Sie zu
  // uebernehmen hiesse, Zahlen zu erfinden** (C-378).
  //
  // `[read]` **Also bleibt es beim Ueberspringen** — aber nicht mehr
  // still: **der Aufrufer bekommt die Zahl** und kann es sagen.
  // **Das war der Befund bei `wieGestern`** (G-348): nicht das
  // Ueberspringen, sondern das stille.
  let positionen = 0
  let uebersprungen = 0
  for (const z of liste) {
    if (!z.food_id) { uebersprungen += 1; continue }
    await addMealItem({
      meal_id: mahlzeit.id,
      food_id: z.food_id,
      amount_g: Math.round(Number(z.amount_g) * skalierung * 10) / 10,
    })
    positionen += 1
  }

  return { meal_id: mahlzeit.id, positionen, uebersprungen, skalierung }
}

// ══ FLOW 8: die Einkaufsliste aus einem REZEPT ══════════════════════

export const listeAusRezeptSchema = z.object({
  art: z.literal('einkaufsliste'),
  recipe_id: z.string().uuid(),
  portionen: z.number().positive('Mindestens eine Portion.').max(100),
})

// G-350: `postenHakenSchema` ist entfernt — der Vorgang laeuft
// ueber `postenAbhaken` (G-345), und eine Serveraktion braucht kein
// Routen-Schema.

export type ListeAusRezept = z.infer<typeof listeAusRezeptSchema>

/**
 * Flow 8, Schritte 1-3 — Liste aus einem Rezept, Mengen skaliert.
 *
 * `[cmd]` **`shopping_lists_source_target_check`: bei
 * `source_type = 'recipe'` MUSS `recipe_id` gesetzt und
 * `meal_plan_week_id` leer sein.**
 *
 * `[read]` **Und damit ist die heutige Kachel widerlegt** — sie sagt,
 * die Liste entstehe aus einer Planwoche. **Flow 8 sagt: aus einem
 * Rezept.**
 */
export async function listeAusRezept(eingabe: ListeAusRezept): Promise<{
  id: string; name: string; posten: number
}> {
  const { db, user } = await sitzung()

  const { data: rezept, error: rFehler } = await db
    .from('recipes').select('id, name_de, servings')
    .eq('id', eingabe.recipe_id).single()
  if (rFehler) throw new DiaryWriteError('WRITE_FAILED', rFehler.message)
  const r = rezept as unknown as { name_de: string; servings: number }

  const servings = Number(r.servings)
  if (!Number.isFinite(servings) || servings <= 0) {
    throw new DiaryWriteError('WRITE_FAILED',
      'Das Rezept traegt keine gueltige Portionszahl.')
  }
  const faktor = eingabe.portionen / servings

  const { data: zutaten, error: zFehler } = await db
    .from('recipe_ingredients')
    .select('food_id, amount_g, sort_order, food_name_snapshot')
    .eq('recipe_id', eingabe.recipe_id)
    .order('sort_order')
  if (zFehler) throw new DiaryWriteError('WRITE_FAILED', zFehler.message)

  const liste = (zutaten ?? []) as unknown as Array<{
    food_id: string | null; amount_g: number; food_name_snapshot: string | null
  }>
  if (liste.length === 0) {
    throw new DiaryWriteError('VALIDATION_FAILED',
      'Dieses Rezept hat keine Zutaten — eine Liste waere leer.')
  }

  // Die Namen der Lebensmittel — `food_name` ist NOT NULL.
  const ids = liste.map(z => z.food_id).filter((x): x is string => Boolean(x))
  const { data: foods } = await db
    .from('foods').select('id, name_de').in('id', ids)
  const namen = new Map(
    ((foods ?? []) as unknown as Array<{ id: string; name_de: string | null }>)
      .map(f => [f.id, f.name_de ?? '']),
  )

  const { data: kopf, error: kFehler } = await db
    .from('shopping_lists')
    .insert({
      user_id: user.id,
      name: `${r.name_de} (${eingabe.portionen} Portionen)`,
      source_type: 'recipe',
      recipe_id: eingabe.recipe_id,
      meal_plan_week_id: null,
      servings: eingabe.portionen,
      status: 'open',
      measurement_source: 'manual',
    })
    .select('id, name')
    .single()
  if (kFehler) throw new DiaryWriteError('WRITE_FAILED', kFehler.message)
  const l = kopf as unknown as { id: string; name: string }

  const { error: pFehler } = await db.from('shopping_list_items').insert(
    liste.map((z, i) => ({
      shopping_list_id: l.id,
      user_id: user.id,
      sort_order: i,
      item_source: z.food_id ? 'bls' : 'free_text',
      food_id: z.food_id,
      custom_food_id: null,
      food_name: (z.food_id ? namen.get(z.food_id) : null)
        || z.food_name_snapshot || 'Unbenannt',
      amount_g: Math.round(Number(z.amount_g) * faktor * 10) / 10,
      quantity: null,
      unit_display: 'g',
      is_checked: false,
    })),
  )
  if (pFehler) throw new DiaryWriteError('WRITE_FAILED', pFehler.message)

  return { id: l.id, name: l.name, posten: liste.length }
}

// ══ G-350: `postenHaken` ist entfernt ════════════════════
//
// `[cmd]` **Flow 8, Schritt 5 steht jetzt in
// `einkaufsliste-aktionen.ts`** (`postenAbhaken`, G-345) — dort,
// wo die Liste seit E-64 hingehoert: Planner, Rezept und eigener
// Reiter.
//
// `[read]` **Zwei Wege auf dieselbe Spalte laufen auseinander**
// (G-335, dasselbe Muster bei den Namenslisten). `[cmd]` **A-59:
// entfernt, nicht auskommentiert.**
