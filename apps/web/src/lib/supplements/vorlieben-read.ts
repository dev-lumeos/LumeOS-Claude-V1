// Lese-I/O fuer die Supplement-Vorlieben — G-468.
//
// ══ WAS C-511 LIEFERT ═══════════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-24:**
//
//     supplements.supplement_preferences        je Nutzer, 7 Felder
//     supplement_preferences_read(p_user_id)    -> jsonb
//     supplement_preferences_write(p_user_id,
//       p_source, p_preferences)                -> jsonb
//     supplement_brand_options(p_user_id,
//       p_query, p_limit)                       -> TABLE
//
// `[read]` **Alle drei pruefen `p_user_id = auth.uid()`** — in `psql`
// liefern sie deshalb NICHTS. `[cmd]` **Das ist kein Fehler, sondern
// die Rechtepruefung**; ueber die Sitzung antworten sie.
//
// `[cmd]` **`supplement_brand_options` ist eine FUNKTION, keine
// Sicht** — `\d` findet sie nicht, `pg_proc` schon.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { ausJson, type SupplementVorlieben } from './vorlieben-lage'

/** Eine Marke zur Auswahl, mit ihrer Menge. */
export type MarkenWahl = {
  marke: string
  product_count: number
  /** Steht sie schon in den Vorlieben? */
  is_preferred: boolean
}

export type VorliebenDaten = {
  stand: SupplementVorlieben
  marken: MarkenWahl[]
  fehler: string | null
}

/**
 * Die Vorlieben und die Markenliste.
 *
 * `[read]` **Beides in EINEM Lauf** — der Reiter braucht sie
 * zusammen, und zwei Rundreisen fuer eine Flaeche waeren eine zu
 * viel (G-252).
 *
 * `[cmd]` **Die Marken kommen aus C-511, nicht aus einer eigenen
 * Abfrage:** die Funktion sortiert die eigenen zuoberst
 * (`is_preferred DESC, product_count DESC`) — **eine Sortierung
 * hier nachzubauen hiesse, zwei Ordnungen zu pflegen.**
 */
export async function ladeVorlieben(): Promise<VorliebenDaten> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) {
    return { stand: ausJson(null), marken: [], fehler: 'Keine Sitzung.' }
  }
  const c = client.schema('supplements')
  try {
    const [standA, markenA] = await Promise.all([
      c.rpc('supplement_preferences_read', { p_user_id: user.id }),
      // `[cmd]` **`p_limit` deckelt bei 100** (gemessen im Rumpf:
      // `LEAST(GREATEST(…, 1), 100)`) — **die eigenen Marken kommen
      // IMMER mit, auch ueber der Grenze** (`WHERE r.is_preferred OR
      // r.catalog_rank <= …`).
      c.rpc('supplement_brand_options', {
        p_user_id: user.id, p_query: null, p_limit: 40,
      }),
    ])
    if (standA.error) {
      return { stand: ausJson(null), marken: [], fehler: standA.error.message }
    }
    const marken = Array.isArray(markenA.data)
      ? (markenA.data as Array<Record<string, unknown>>).flatMap(r => {
        const m = typeof r.marke === 'string' ? r.marke : null
        if (!m) return []
        return [{
          marke: m,
          product_count: Number(r.product_count) || 0,
          is_preferred: r.is_preferred === true,
        }]
      })
      : []
    return { stand: ausJson(standA.data), marken, fehler: null }
  } catch (e) {
    // `[read]` **Der Reiter steht trotzdem** — mit den Vorgaben und
    // einem Satz. **Eine leere Flaeche ohne Grund saehe aus wie ein
    // Fehler** (G-482, G-486).
    return {
      stand: ausJson(null), marken: [],
      fehler: e instanceof Error ? e.message : String(e),
    }
  }
}

/**
 * Marken suchen — fuer das Eingabefeld.
 *
 * `[cmd]` **`p_query` nutzt `<%`** (pg_trgm, gemessen im Rumpf) —
 * **eine Fehleingabe findet trotzdem.**
 */
export async function sucheMarken(frage: string): Promise<MarkenWahl[]> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []
  try {
    const { data } = await client.schema('supplements')
      .rpc('supplement_brand_options', {
        p_user_id: user.id, p_query: frage.trim() || null, p_limit: 40,
      })
    if (!Array.isArray(data)) return []
    return (data as Array<Record<string, unknown>>).flatMap(r => {
      const m = typeof r.marke === 'string' ? r.marke : null
      return m ? [{
        marke: m,
        product_count: Number(r.product_count) || 0,
        is_preferred: r.is_preferred === true,
      }] : []
    })
  } catch { return [] }
}
