'use server'

// Serveraktionen fuer die Supplement-Vorlieben — G-468.
//
// `[read]` **Eigene Datei** — dieselbe Teilung wie bei den Allergien
// (`settings/allergie-aktionen.ts`, G-455): ein `'use server'` in
// einem Baustein zoege ihn mit hinein.
//
// ══ DIE QUELLE IST EIN CHECK, KEIN FREITEXT ═════════════════════════
//
// `[cmd]` **Gemessen im Rumpf von `supplement_preferences_write`:**
//
//     IF p_source NOT IN ('supplement_preferences', 'settings') THEN
//       RAISE EXCEPTION '… unbekannte Schreibquelle'
//
// `[read]` **Also nicht geraten** — der Reiter schreibt unter
// `supplement_preferences`, und `field_sources` haelt fest, woher
// jedes Feld kam.
import { revalidatePath } from 'next/cache'

import { createSessionClient } from '@lumeos/shared/session'
import {
  ausJson, type SupplementVorlieben,
} from '../../../lib/supplements/vorlieben-lage'

export type SpeicherErgebnis =
  | { ok: true; stand: SupplementVorlieben }
  | { ok: false; fehler: string }

/**
 * Den ganzen Stand schreiben.
 *
 * `[read]` **Immer vollstaendig** — die Funktion fuehrt je Feld mit
 * `COALESCE` zusammen, und was der Reiter nicht mitschickt, bliebe
 * auf dem alten Wert stehen. `[cmd]` **Ein entfernter Eintrag muss
 * als leere Liste ankommen**, sonst laesst er sich nie loeschen.
 */
export async function vorliebenSpeichern(
  stand: SupplementVorlieben,
): Promise<SpeicherErgebnis> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { ok: false, fehler: 'Keine Sitzung.' }

  try {
    const { data, error } = await client.schema('supplements')
      .rpc('supplement_preferences_write', {
        p_user_id: user.id,
        p_source: 'supplement_preferences',
        p_preferences: {
          preferred_brands: stand.preferred_brands,
          avoided_ingredients: stand.avoided_ingredients,
          only_on_market: stand.only_on_market,
          preferred_forms: stand.preferred_forms,
          preferred_intake_times: stand.preferred_intake_times,
          note: stand.note,
        },
      })
    if (error) return { ok: false, fehler: error.message }

    // `[read]` **Der Reiter uebernimmt die ANTWORT, nicht seinen
    // eigenen Entwurf** — die Datenbank sortiert die Listen und
    // schneidet Leerstellen weg. **Wer den Entwurf behielte, zeigte
    // einen Stand, den niemand gespeichert hat.**
    const neu = ausJson(data)

    // `[cmd]` **Beide Orte frischen** — der Produkte-Reiter liest
    // dieselben Vorlieben (A4), und ein alter Stand dort waere
    // genau die zweite Wahrheit, die E-84 verbietet.
    revalidatePath('/v2/supplements')
    return { ok: true, stand: neu }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Marken suchen — fuer das Eingabefeld des Reiters.
 *
 * `[read]` **Serveraktion, keine Route** — es ist eine Lesefrage
 * einer einzigen Flaeche, und eine Route waere ein zweiter Weg zu
 * denselben Daten.
 */
export async function markenSuchen(frage: string): Promise<Array<{
  marke: string; product_count: number; is_preferred: boolean
}>> {
  const { sucheMarken } = await import(
    '../../../lib/supplements/vorlieben-read')
  return sucheMarken(frage)
}
