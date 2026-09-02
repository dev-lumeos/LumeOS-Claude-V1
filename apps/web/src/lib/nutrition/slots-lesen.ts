// ════════════════════════════════════════════════════════════════════
// LESEWEG: DIE MAHLZEITEN-SLOTS — G-332
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **`nutrition.meal_slots` seit C-392**, vier Policies, PK auf
// `(user_id, position)`.
//
// `[read]` **Läuft ausschliesslich serverseitig** — die Zeilensicherheit
// greift über die Sitzung, ein fremder Nutzer bekommt nichts.
import { createSessionClient } from '@lumeos/shared/session'

import { kurzZeit, type MahlzeitSlot } from './slots-lage'

/**
 * Die Slots des angemeldeten Nutzers, nach Position.
 *
 * `[cmd]` **Am 2026-09-02 gemessen:** `dev@lumeos.app` trägt fünf,
 * `test-user@lumeos.local` **null** — er hat weder Preferences noch
 * Meals (C-394).
 *
 * `[read]` **Eine leere Liste ist kein Fehler**, sondern der
 * Leerzustand. **Die Anzeige unterscheidet beides** — ein Fehler
 * bekommt einen Satz, ein leerer Stand ein Angebot.
 */
export async function ladeSlots(): Promise<MahlzeitSlot[]> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const { data, error } = await client.schema('nutrition')
    .from('meal_slots')
    .select('position, name, planned_time')
    .order('position', { ascending: true })
  if (error) return []

  const zeilen = (data ?? []) as unknown as Array<Record<string, unknown>>
  return zeilen.map(z => ({
    position: Number(z.position),
    name: String(z.name ?? ''),
    // `[read]` **Die Datenbank liefert `07:30:00`** — die Anzeige und
    // `<input type="time">` wollen `07:30`.
    planned_time: kurzZeit(String(z.planned_time ?? '')),
  }))
}
