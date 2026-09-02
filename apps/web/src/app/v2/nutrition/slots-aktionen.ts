'use server'

// ════════════════════════════════════════════════════════════════════
// SCHREIBWEG: DIE MAHLZEITEN-SLOTS — G-332
// ════════════════════════════════════════════════════════════════════
//
// **Ein Schreibweg, zwei Orte** — der Auftrag: *„Ein Formular, zwei
// Orte — nicht zwei Formulare."*
//
// `[cmd]` **Preferences und `/v2/settings` rufen dieselbe Aktion.**
// `[read]` **Die Kollision aus G-72 fällt weg:** dort lagen die
// Mahlzeitenzahlen in `food_preferences`, während Settings nach
// `user_profiles` schrieb. **`meal_slots` ist eine eigene Tabelle** —
// beide Orte schreiben denselben Weg.
//
// ══ WARUM LÖSCHEN UND EINFÜGEN, NICHT UPDATE ════════════════════════
//
// `[cmd]` **Der PK ist `(user_id, position)`, es gibt keine `id`.**
// `[cmd]` **Am 2026-09-02 gegen die Datenbank gemessen:**
//
//     DELETE position=2, dann UPDATE 3 -> 2     geht
//     UPDATE 3 -> 2, waehrend 2 noch steht      duplicate key
//
// `[read]` **Mit `UPDATE` hinge die Richtigkeit an der Reihenfolge der
// Anweisungen** — beim Löschen einer mittleren Zeile müsste man von
// vorn nach hinten schieben, beim Einfügen von hinten nach vorn.
// **Ein Fehler dort fällt erst auf, wenn jemand die dritte von fünf
// Mahlzeiten löscht.**
//
// `[read]` **Löschen und neu einfügen kann nicht kollidieren** — nach
// dem `DELETE` ist der Nummernraum leer.
import { createSessionClient } from '@lumeos/shared/session'

import { listenFehler, type MahlzeitSlot } from '../../../lib/nutrition/slots-lage'

export type SlotsErgebnis =
  | { ok: true; slots: MahlzeitSlot[] }
  | { ok: false; fehler: string }

/**
 * Die Slots eines Nutzers vollständig ersetzen.
 *
 * `[read]` **Vollständig, nicht einzeln** — das Formular führt die
 * ganze Liste, und ein Teil-Update müsste raten, was gelöscht wurde.
 *
 * `[cmd]` **Die Prüfung läuft VOR dem Schreiben** (`listenFehler`):
 * alle vier Spalten sind NOT NULL, ein leerer Name käme sonst als
 * Datenbankfehler zurück.
 */
export async function slotsSpeichern(
  slots: readonly MahlzeitSlot[],
): Promise<SlotsErgebnis> {
  const fehler = listenFehler(slots)
  if (fehler) return { ok: false, fehler }

  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { ok: false, fehler: 'Keine angemeldete Sitzung.' }
    const db = client.schema('nutrition')

    // `[read]` **Erst räumen** — siehe oben, sonst kollidiert die
    // Nummer.
    const { error: weg } = await db
      .from('meal_slots').delete().eq('user_id', user.id)
    if (weg) return { ok: false, fehler: weg.message }

    if (slots.length > 0) {
      const { error: rein } = await db.from('meal_slots').insert(
        slots.map((s, i) => ({
          user_id: user.id,
          // `[read]` **Die Nummer kommt aus der Reihenfolge**, nicht
          // aus dem Feld — so kann keine Lücke entstehen.
          position: i + 1,
          name: s.name.trim(),
          planned_time: s.planned_time,
        })),
      )
      if (rein) return { ok: false, fehler: rein.message }
    }

    return {
      ok: true,
      slots: slots.map((s, i) => ({ ...s, position: i + 1, name: s.name.trim() })),
    }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}
