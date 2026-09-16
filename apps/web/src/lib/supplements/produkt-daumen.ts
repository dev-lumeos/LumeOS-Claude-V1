// Der Daumen je Produkt — G-455, Toms Punkt 4.
//
// ══ WARUM KEINE ZWEITE TABELLE ══════════════════════════════════════
//
// `[cmd]` **C-497 hat `food_preference_items` erweitert statt eine
// zweite Tabelle zu bauen** (gemessen 2026-09-15):
//
//     supplement_product_id  uuid
//     target_type            ... | 'supplement_product'
//     CHECK  exactly_one_target       -- genau EIN Ziel je Zeile
//     CHECK  target_matches_column    -- Typ und Spalte passen zusammen
//
// `[read]` **In G-453 war genau das noch unmoeglich:** `food_id` hatte
// einen FK auf `nutrition.foods`, und ein Produkt-Insert fiel an der
// Datenbank. **Der Befund ging als Messung an C-497, und Codex hat
// ihn bestaetigt** — die Spalte gibt es jetzt.
//
// ══ DIE BAUFORM IST DIE VON NUTRITION ═══════════════════════════════
//
// `[read]` **Uebernommen aus `lib/nutrition/daumen-schreiben.ts`
// (G-67):** gezielt auf die eine Zeile schreiben, nicht den ganzen
// Satz neu. `[cmd]` **Die RPC `food_preferences_write` loescht alle
// Zeilen einer Nutzerin und schreibt neu** — fuer einen einzelnen
// Daumen waere das fatal.
//
// `[read]` **Und dieselbe Stufenwahl:** ein Daumen faellt beim
// Stoebern nebenbei ab, deshalb `like` / `soft_dislike`, eine Stufe
// unter dem, was der Vorlieben-Assistent setzt.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import type { Daumen } from './produkt-daumen-lage'

/** `[cmd]` **Der Wert aus `target_type_check`.** */
const ZIEL = 'supplement_product'

/**
 * `[read]` **Eine eigene Quelle**, wie bei den Lebensmitteln
 * (`search_thumb`) — eine Bewertung aus der Produktliste ist eine
 * Gewohnheit, keine Absicht. Wer spaeter auswertet, muss es trennen
 * koennen.
 */
export const DAUMEN_QUELLE = 'supplement_thumb'

export type DaumenErgebnis =
  | { ok: true; zustand: Daumen }
  | { ok: false; fehler: string }

/**
 * Den Daumen fuer ein Produkt setzen.
 *
 * `neutral` loescht die Zeile — **eine Zeile mit `strength:
 * 'neutral'` waere eine Aussage, wo keine gemeint ist** (G-67).
 */
export async function produktDaumenSetzen(
  produktId: string, zustand: Daumen,
): Promise<DaumenErgebnis> {
  try {
    const c = createSessionClient()
    const { data: { user } } = await c.auth.getUser()
    if (!user) return { ok: false, fehler: 'Keine angemeldete Sitzung.' }

    const tabelle = c.schema('nutrition').from('food_preference_items')

    // `[read]` **Erst loeschen, dann schreiben** — dieselbe
    // Begruendung wie in `daumen-schreiben.ts`: PostgREST braucht fuer
    // `upsert` eine Spaltenliste, und ein TEILWEISER Index wird davon
    // nicht sicher getroffen.
    const { error: weg } = await tabelle.delete()
      .eq('user_id', user.id).eq('supplement_product_id', produktId)
    if (weg) return { ok: false, fehler: weg.message }

    if (zustand === 'neutral') return { ok: true, zustand }

    const { error } = await tabelle.insert({
      user_id: user.id,
      preference: zustand,
      // `[cmd]` **Beide Werte stehen im `strength_check`** —
      // `hard_exclude · soft_dislike · neutral · like · boost`.
      strength: zustand === 'liked' ? 'like' : 'soft_dislike',
      target_type: ZIEL,
      supplement_product_id: produktId,
      source: DAUMEN_QUELLE,
    })
    if (error) return { ok: false, fehler: error.message }
    return { ok: true, zustand }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Der Daumenstand fuer die gezeigten Produkte.
 *
 * `[cmd]` **Gestueckelt zu 150** — G-64 hat gemessen, dass `.in()`
 * ueber rund 200 Ids mit *„URI too long"* kippt UND die Bibliothek das
 * als LEERE Liste weiterreicht. `[read]` **Die Produktliste zeigt seit
 * G-453 bis zu 500 Zeilen**, also ist die Stueckelung hier nicht
 * vorsorglich, sondern noetig.
 */
export async function produktDaumenStand(
  produktIds: readonly string[],
): Promise<Record<string, Daumen>> {
  if (produktIds.length === 0) return {}
  const c = createSessionClient()
  const { data: { user } } = await c.auth.getUser()
  if (!user) return {}

  const STUECK = 150
  const stand: Record<string, Daumen> = {}
  for (let i = 0; i < produktIds.length; i += STUECK) {
    const teil = produktIds.slice(i, i + STUECK)
    const { data, error } = await c.schema('nutrition')
      .from('food_preference_items')
      .select('supplement_product_id,preference')
      .eq('user_id', user.id)
      .eq('target_type', ZIEL)
      .in('supplement_product_id', teil)
    // `[read]` **Ein Fehler darf NICHT als „nichts bewertet"
    // durchgehen** — sonst saehe der Nutzer seine Daumen verschwinden.
    if (error) throw new Error(`Daumenstand lesen: ${error.message}`)
    for (const r of data ?? []) {
      const roh = r as unknown as Record<string, unknown>
      const id = String(roh.supplement_product_id)
      stand[id] = String(roh.preference) === 'liked' ? 'liked' : 'disliked'
    }
  }
  return stand
}

/**
 * Die Meidestoffe — der WEICHE Filter.
 *
 * **Tom:** *„‚Keine Farbstoffe' ist eine Haltung, keine Diagnose."*
 *
 * `[cmd]` **Gelesen werden die Zeilen mit `strength` in
 * (`soft_dislike`, `hard_exclude`) und `target_type='tag'` oder
 * `'catalog_item'`** — das sind die Stoffe, die jemand meiden will,
 * ohne dass es eine Allergie waere.
 *
 * `[read]` **Sie ENTFERNEN nichts** — das Produkt bleibt stehen und
 * wird markiert. **Der Unterschied zur Allergie ist die Haerte, und
 * sie ist Toms Entscheidung, keine technische.**
 */
export async function ladeMeidestoffe(): Promise<string[]> {
  try {
    const c = createSessionClient()
    const { data: { user } } = await c.auth.getUser()
    if (!user) return []
    const { data, error } = await c.schema('nutrition')
      .from('food_preference_items')
      .select('tag_code,catalog_item_code,strength')
      .eq('user_id', user.id)
      .in('strength', ['soft_dislike', 'hard_exclude'])
    if (error) return []
    const aus: string[] = []
    for (const r of data ?? []) {
      const roh = r as unknown as Record<string, unknown>
      const code = roh.catalog_item_code ?? roh.tag_code
      if (typeof code === 'string' && code.trim()) aus.push(code.trim())
    }
    return Array.from(new Set(aus))
  } catch {
    return []
  }
}
