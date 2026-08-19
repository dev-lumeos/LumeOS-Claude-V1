// Der Daumen an Liste und Detail (G-67).
//
// Tom, 2026-08-18: „Bau in die Detailansicht des Foods einen Daumen
// hoch und Daumen runter ein. Der User kann, wenn er sich ein Resultat
// anschaut, das gleich klassifizieren fuer sich."
//
// `[read]` **Warum nicht ueber `food_preferences_write`:** Die RPC, die
// G-65 benutzt, macht `DELETE FROM food_preference_items WHERE user_id
// = p_user_id` und schreibt danach den ganzen Satz neu. Fuer den
// Assistenten ist das richtig — er zeigt alles und speichert alles.
// **Fuer einen einzelnen Daumen waere es fatal:** ein Klick loeschte
// jede andere Vorliebe. Deshalb schreibt der Daumen gezielt auf die
// eine Zeile.
//
// `[cmd]` Das geht ohne Schemaaenderung: `uq_food_pref_items_user_food`
// ist ein eindeutiger Index auf `(user_id, food_id)`, und die vier
// RLS-Regeln sind auf `auth.uid() = user_id` geschnitten.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

/** Die drei Zustaende des Zyklus. */
export type Daumen = 'neutral' | 'liked' | 'disliked'

/**
 * Der naechste Zustand.
 *
 * `[cmd]` Die Vorlage im Vorgaengerrepo macht es genauso
 * (`FoodPreferences.tsx:695`): `neutral -> like -> dislike -> neutral`.
 * Ein Zyklus, keine zwei Knoepfe mit Loeschfunktion.
 */
export function naechsterDaumen(jetzt: Daumen): Daumen {
  if (jetzt === 'neutral') return 'liked'
  if (jetzt === 'liked') return 'disliked'
  return 'neutral'
}

/**
 * `strength` aus `preference` — die schwaechere Stufe je Richtung.
 *
 * `[read]` **Die Begruendung steht im Bericht und ist eine
 * Entscheidung, keine Ableitung:** Der Assistent (G-65) setzt
 * `hard_exclude` bzw. `boost` — dort sitzt jemand und meint es. Der
 * Daumen faellt beim Suchen nebenbei ab; er setzt deshalb
 * `soft_dislike` und `like`, eine Stufe darunter.
 *
 * `[cmd]` Beide Werte sind in
 * `food_preference_items_strength_check` erlaubt:
 * hard_exclude · strong_avoid · soft_dislike · neutral · like · boost.
 */
export function staerkeFuerDaumen(d: Exclude<Daumen, 'neutral'>): string {
  return d === 'liked' ? 'like' : 'soft_dislike'
}

/**
 * `source` fuer eine Bewertung aus der Suche.
 *
 * `[cmd]` Die Spalte hat KEINE CHECK-Bedingung und den Vorgabewert
 * `'user'`; G-65 schreibt `'settings'`. Ein eigener Wert trennt beide
 * Herkuenfte, ohne dass am Schema etwas zu aendern waere.
 *
 * `[read]` Warum die Trennung zaehlt: Eine Bewertung aus dem
 * Assistenten ist eine **Absicht**, ein Daumen beim Suchen eine
 * **Gewohnheit**. Wer spaeter auswertet, muss beides unterscheiden
 * koennen — auch wenn heute noch nichts davon abhaengt.
 */
export const DAUMEN_QUELLE = 'search_thumb'

export type DaumenErgebnis =
  | { ok: true; zustand: Daumen }
  | { ok: false; fehler: string }

/**
 * Den Daumen fuer ein Lebensmittel setzen.
 *
 * `neutral` loescht die Zeile — der Zyklus kehrt an den Anfang zurueck,
 * und eine Zeile mit `strength: 'neutral'` waere eine Aussage, wo
 * keine gemeint ist.
 */
export async function daumenSetzen(
  foodId: string,
  zustand: Daumen,
): Promise<DaumenErgebnis> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, fehler: 'Keine angemeldete Sitzung.' }

  const tabelle = supabase.schema('nutrition').from('food_preference_items')

  if (zustand === 'neutral') {
    const { error } = await tabelle
      .delete()
      .eq('user_id', user.id)
      .eq('food_id', foodId)
    if (error) return { ok: false, fehler: error.message }
    return { ok: true, zustand }
  }

  // `[read]` Kein `upsert` auf dem Teilindex: PostgREST braucht dafuer
  // `on_conflict` mit einer Spaltenliste, und ein TEILWEISER Index
  // (`WHERE food_id IS NOT NULL`) wird davon nicht sicher getroffen.
  // Loeschen und neu schreiben ist hier gleichwertig — es geht um
  // genau eine Zeile, und die RLS-Regel deckt beide Schritte.
  const { error: loeschFehler } = await tabelle
    .delete()
    .eq('user_id', user.id)
    .eq('food_id', foodId)
  if (loeschFehler) return { ok: false, fehler: loeschFehler.message }

  const { error } = await tabelle.insert({
    user_id: user.id,
    preference: zustand,
    strength: staerkeFuerDaumen(zustand),
    target_type: 'food',
    food_id: foodId,
    source: DAUMEN_QUELLE,
  })
  if (error) return { ok: false, fehler: error.message }
  return { ok: true, zustand }
}

/**
 * Der Daumenstand fuer eine Menge Lebensmittel.
 *
 * `[cmd]` Wird fuer die Trefferliste gebraucht: ohne ihn saehe jede
 * Zeile unbewertet aus, auch wenn sie es nicht ist. Der Auftrag
 * verlangt genau das — „Der Zustand muss sichtbar sein, wenn man
 * dasselbe Lebensmittel wieder oeffnet."
 */
export async function daumenStand(
  foodIds: string[],
): Promise<Record<string, Daumen>> {
  if (foodIds.length === 0) return {}
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  // `[read]` G-64 hat gemessen, dass `.in()` ueber rund 200 IDs mit
  // „URI too long" kippt UND die Bibliothek das als leere Liste
  // weiterreicht. Die Trefferliste zeigt 50 Zeilen, also unkritisch —
  // die Stueckelung steht trotzdem hier, damit ein spaeteres
  // `limit: 500` nicht still falsche Ergebnisse liefert.
  const STUECK = 150
  const stand: Record<string, Daumen> = {}

  for (let i = 0; i < foodIds.length; i += STUECK) {
    const teil = foodIds.slice(i, i + STUECK)
    const { data, error } = await supabase
      .schema('nutrition')
      .from('food_preference_items')
      .select('food_id,preference')
      .eq('user_id', user.id)
      .in('food_id', teil)
    // Ein Fehler darf nicht als „nichts bewertet" durchgehen.
    if (error) throw new Error(`Daumenstand lesen: ${error.message}`)
    for (const r of data ?? []) {
      const roh = r as unknown as Record<string, unknown>
      const p = String(roh.preference)
      // `hard_exclude` aus dem Assistenten zaehlt in der Anzeige als
      // Ablehnung — der Daumen zeigt die Richtung, nicht die Stufe.
      stand[String(roh.food_id)] =
        p === 'liked' ? 'liked' : 'disliked'
    }
  }
  return stand
}
