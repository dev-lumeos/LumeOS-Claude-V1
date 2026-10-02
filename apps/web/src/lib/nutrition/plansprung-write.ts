// ════════════════════════════════════════════════════════════════════
// DIE SCHREIBSTELLE FUER DEN PLANSPRUNG — G-579
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **`nutrition.meal_plan_set_next_plan` hatte null Aufrufer**
// — gezaehlt 2026-10-02 in `apps/web/src` und `packages/`, **nicht
// einmal einen Kommentar.**
//
// `[read]` **Sie wird hier gerufen, nicht geaendert** — `supabase/`
// gehoert Codex.
//
// ══ WARUM DIE FUNKTION UND NICHT EIN UPDATE ════════════════════════
//
// `[cmd]` **`meal_plans_sequence_target_check` koppelt zwei Spalten:**
// `lifecycle_type = 'sequence'` gilt nur MIT `next_plan_id`, und
// umgekehrt. `[cmd]` **Gemessen 2026-10-02:** ein `PATCH` mit
// `lifecycle_type: 'sequence'` allein ergibt `23514`.
//
// `[read]` **Die Funktion setzt beide in einer Anweisung** — das ist
// der Grund, warum es sie gibt, und der Grund, warum die Oberflaeche
// sie rufen muss statt selbst zu schreiben.
//
// `[read]` **Sie setzt den vorigen Plan NICHT inaktiv.** Sie
// verknuepft zwei Plaene, sie aktiviert keinen — das Aktivieren
// bleibt `plan_aendern` (G-309).

import { createSessionClient } from '@lumeos/shared/session'

import { fehlerart, fachmeldung } from '../fehler/ladefehler'
import { pruefeSprung, type SprungFehler } from './plansprung'

export class SprungFehlerKlasse extends Error {
  constructor(
    public code: 'NO_SESSION' | 'VALIDATION_FAILED' | 'NICHT_GEFUNDEN'
      | 'WRITE_FAILED',
    message: string,
    public felder?: SprungFehler[],
  ) {
    super(message)
    this.name = 'SprungFehler'
  }
}

/**
 * Den Folgeplan setzen.
 *
 * `[cmd]` **Vier Fehlerfaelle aus dem Rumpf**, je mit eigenem
 * SQLSTATE:
 *
 *     42501  Anmeldung erforderlich        -> seit G-578 ueber den
 *                                             Code als Sitzung
 *     22023  Quelle und unterschiedlicher Folgeplan
 *     P0002  eigener Quellplan nicht gefunden
 *     P0002  eigener Folgeplan nicht gefunden
 *
 * @returns Die `next_plan_id`, wie die Funktion sie zurueckgibt.
 */
export async function folgeplanSetzen(
  planId: string, folgeId: string,
): Promise<string> {
  const felder = pruefeSprung(planId, folgeId)
  if (felder.length) {
    throw new SprungFehlerKlasse('VALIDATION_FAILED',
      felder[0].text, felder)
  }

  const { data, error } = await createSessionClient()
    .schema('nutrition')
    .rpc('meal_plan_set_next_plan', {
      p_plan_id: planId,
      p_next_plan_id: folgeId,
    })

  if (error) {
    const fach = fachmeldung(error.message)
    if (fehlerart(error.message, error.code) === 'sitzung') {
      throw new SprungFehlerKlasse('NO_SESSION',
        fach ?? 'Die Sitzung ist nicht mehr gueltig. Melde dich neu '
          + 'an — deine Daten sind unveraendert.')
    }
    if (error.code === 'P0002') {
      throw new SprungFehlerKlasse('NICHT_GEFUNDEN', fach ?? error.message)
    }
    if (error.code === '22023') {
      throw new SprungFehlerKlasse('VALIDATION_FAILED',
        fach ?? error.message,
        [{ feld: 'folgeplan', text: fach ?? error.message }])
    }
    throw new SprungFehlerKlasse('WRITE_FAILED', fach ?? error.message)
  }

  // `[read]` **G-79: die Rueckgabe pruefen**, nicht auf das Ausbleiben
  // eines Fehlers vertrauen. `[cmd]` **Die Funktion gibt
  // `next_plan_id` zurueck** — kommt nichts, hat das `UPDATE` keine
  // Zeile getroffen.
  if (!data) {
    throw new SprungFehlerKlasse('WRITE_FAILED',
      'Der Folgeplan wurde nicht gesetzt — keine Kennung zurueck.')
  }
  return data as string
}
