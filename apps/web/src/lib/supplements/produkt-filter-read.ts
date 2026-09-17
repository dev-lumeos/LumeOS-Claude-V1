// Lese- und Schreibweg der Produktfilter — G-467.
//
// `[cmd]` **`public.user_display_preferences` (C-504)** — dieselbe
// Tabelle, die seit G-122 die Naehrstoffbaum-Ansicht traegt.
// `[read]` **Derselbe Weg wie `ansicht-speichern.ts`**: Session-
// Client, `upsert` auf den zusammengesetzten Schluessel. **Eine
// zweite Bauform waere Drift.**
//
// `[read]` **Session-Client, kein Service-Client** — die vier
// RLS-Policies schneiden auf `auth.uid()`, und das ist die Sperre.
// Dieser Weg ist nur die Absicht.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import {
  FILTER_SCHLUESSEL, VORGABE, ausJson, istVorgabe,
  type ProduktFilter,
} from './produkt-filter-lage'

export type FilterStand = {
  filter: ProduktFilter
  /**
   * Ob eine gespeicherte Zeile gefunden wurde.
   *
   * `[read]` **Der Unterschied zaehlt fuer A5:** *keine Zeile* heisst
   * *Vorgabe*, nicht *leerer Filter*. **Die Oberflaeche darf beides
   * nicht verwechseln.**
   */
  gespeichert: boolean
  fehler: string | null
}

/** Die gespeicherten Filter des angemeldeten Nutzers. */
export async function ladeProduktFilter(): Promise<FilterStand> {
  try {
    const c = createSessionClient()
    const { data: { user } } = await c.auth.getUser()
    if (!user) {
      return { filter: VORGABE, gespeichert: false, fehler: 'Keine Sitzung.' }
    }
    // `[read]` **Ein Zugriff ueber den Primaerschluessel** —
    // `(user_id, preference_key)`.
    const { data, error } = await c
      .from('user_display_preferences')
      .select('value')
      .eq('user_id', user.id)
      .eq('preference_key', FILTER_SCHLUESSEL)
      .maybeSingle()
    if (error) {
      // `[read]` **Ein Lesefehler darf den Reiter nicht umwerfen** —
      // er bekommt die Vorgabe und die Meldung dazu.
      return { filter: VORGABE, gespeichert: false, fehler: error.message }
    }
    if (!data) return { filter: VORGABE, gespeichert: false, fehler: null }
    return {
      filter: ausJson((data as Record<string, unknown>).value),
      gespeichert: true,
      fehler: null,
    }
  } catch (e) {
    return {
      filter: VORGABE, gespeichert: false,
      fehler: e instanceof Error ? e.message : String(e),
    }
  }
}

export type SchreibErgebnis = { ok: true } | { ok: false; fehler: string }

/**
 * Die Filter speichern.
 *
 * `[read]` **Die Vorgabe wird GELOESCHT, nicht geschrieben** —
 * `[cmd]` **sonst stuende nach dem ersten Zuruecksetzen eine Zeile
 * da, die nichts aussagt**, und die Gegenprobe A5 (*„ein Nutzer ohne
 * gespeicherte Filter"*) waere nicht mehr herstellbar.
 */
export async function speichereProduktFilter(
  filter: ProduktFilter,
): Promise<SchreibErgebnis> {
  try {
    const c = createSessionClient()
    const { data: { user } } = await c.auth.getUser()
    if (!user) return { ok: false, fehler: 'Keine angemeldete Sitzung.' }

    if (istVorgabe(filter)) {
      const { error } = await c
        .from('user_display_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('preference_key', FILTER_SCHLUESSEL)
      if (error) return { ok: false, fehler: error.message }
      return { ok: true }
    }

    // `[cmd]` **`value` MUSS ein Objekt sein** — der CHECK
    // `jsonb_typeof(value) = 'object'` weist alles andere ab
    // (gemessen 2026-09-17).
    const { error } = await c
      .from('user_display_preferences')
      .upsert(
        // `[cmd]` **`updated_at` wird NICHT mitgeschickt** — der
        // Trigger `user_display_preferences_touch_updated_at` setzt
        // sie bei jedem UPDATE (gemessen 2026-09-17). **Ein eigener
        // Wert daneben waere ein zweiter Schreibweg fuer dieselbe
        // Spalte.**
        { user_id: user.id, preference_key: FILTER_SCHLUESSEL, value: filter },
        { onConflict: 'user_id,preference_key' },
      )
    if (error) return { ok: false, fehler: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}
