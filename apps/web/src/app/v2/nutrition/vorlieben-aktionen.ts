'use server'

// Serveraktionen des Preferences-Tabs (G-65).
//
// `[cmd]` **Geschrieben wird ueber `nutrition.food_preferences_write`**
// (C-87) — nicht ueber einzelne Tabellenzugriffe. Die Funktion
// upsertet die Basiszeile und **ersetzt die Items atomar**; die
// Unique-Indizes aus Kettenschritt `054` bleiben der Duplikatschutz.
// `[read]` Der Auftrag verbietet Schemaaenderungen, und eine zweite
// Schreibroutine neben der Funktion waere ein zweiter Weg zu denselben
// Zeilen.
//
// `[cmd]` `SECURITY INVOKER`: die Funktion laeuft unter der Identitaet
// der Sitzung, der Zeilenschutz greift wie bei einem direkten
// Tabellenzugriff. Kein Service-Schluessel.
//
// **DIE ITEMS WERDEN IMMER VOLLSTAENDIG GESCHICKT.** Die Funktion
// ersetzt sie; wer nur eine Aenderung schickt, loescht den Rest. Der
// Tab haelt deshalb den ganzen Stand und sendet ihn als Ganzes.

import { createSessionClient } from '@lumeos/shared/session'

import {
  ladeVorlieben, type Grundeinstellungen, type VorliebenStand,
} from '../../../lib/nutrition/vorlieben-lesen'

/** Was der Tab schickt: ein Item ohne Datenbank-Id. */
export type VorliebeEingabe = {
  target_type: 'food' | 'category' | 'tag' | 'cuisine' | 'exclusion_preset' | 'catalog_item'
  preference: 'liked' | 'disliked' | 'hard_exclude'
  food_id?: string | null
  category_id?: string | null
  tag_code?: string | null
  cuisine_code?: string | null
  exclusion_preset_code?: string | null
  catalog_item_code?: string | null
}

/**
 * `strength` aus `preference`.
 *
 * `[cmd]` Die Pruefbedingung erlaubt sechs Werte (`hard_exclude`,
 * `strong_avoid`, `soft_dislike`, `neutral`, `like`, `boost`). Genommen
 * sind die drei, die der Bestand benutzt — dieselbe Zuordnung wie in
 * `preferences-model.ts:strengthForPreference`, nur dass die
 * Testdaten `boost` statt `like` fuehren.
 */
function staerke(p: VorliebeEingabe['preference']): string {
  switch (p) {
    case 'hard_exclude': return 'hard_exclude'
    case 'disliked': return 'soft_dislike'
    case 'liked': return 'boost'
  }
}

export type Schreibantwort =
  | { ok: true; stand: VorliebenStand }
  | { ok: false; fehler: string }

/**
 * Grundeinstellungen und Items in einem Zug schreiben.
 *
 * Gibt den **neu gelesenen** Stand zurueck, nicht den geschickten: was
 * die Datenbank daraus gemacht hat, ist die Wahrheit — Voreinstellungen
 * und Pruefbedingungen koennen abweichen.
 */
export async function vorliebenSpeichern(
  grund: Partial<Grundeinstellungen>,
  items: VorliebeEingabe[],
): Promise<Schreibantwort> {
  try {
    const supabase = createSessionClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, fehler: 'Keine angemeldete Session.' }

    const nutzlast = {
      diet_type: grund.diet_type ?? null,
      allergies: grund.allergies ?? [],
      intolerances: grund.intolerances ?? [],
      general_exclusions: grund.general_exclusions ?? [],
      preferred_cuisines: grund.preferred_cuisines ?? [],
      meals_per_day: grund.meals_per_day ?? null,
      snacks_per_day: grund.snacks_per_day ?? null,
      cooking_skill: grund.cooking_skill ?? null,
      prep_time_max_min: grund.prep_time_max_min ?? null,
      budget_level: grund.budget_level ?? null,
      meal_prep_ok: grund.meal_prep_ok ?? null,
      planner_notes: grund.planner_notes ?? null,
    }

    // `source: 'settings'` wie die Testdaten — die Spalte sagt, woher
    // ein Eintrag kam. Der Tab ist die Einstellungsseite.
    const itemNutzlast = items.map(i => ({
      target_type: i.target_type,
      preference: i.preference,
      strength: staerke(i.preference),
      food_id: i.food_id ?? null,
      category_id: i.category_id ?? null,
      tag_code: i.tag_code ?? null,
      cuisine_code: i.cuisine_code ?? null,
      exclusion_preset_code: i.exclusion_preset_code ?? null,
      catalog_item_code: i.catalog_item_code ?? null,
      source: 'settings',
    }))

    const { error } = await supabase.schema('nutrition').rpc('food_preferences_write', {
      p_user_id: user.id,
      p_preferences: nutzlast,
      p_items: itemNutzlast,
    })
    if (error) return { ok: false, fehler: error.message }

    return { ok: true, stand: await ladeVorlieben(user.id) }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}
