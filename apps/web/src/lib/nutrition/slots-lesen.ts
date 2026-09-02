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

/**
 * Die Slots des AKTIVEN Plans — G-336.
 *
 * **Tom, 2026-09-02:** *,,ghostentries bilden ab was im plan drin ist,
 * also muss der plan angepasst werden."*
 *
 * `[cmd]` **`nutrition.meal_plan_slots` steht seit C-396**, PK auf
 * `(plan_id, position)`. `[cmd]` **In `apps/` las sie bis G-336
 * niemand** — nur die Pipeline und ihr Test.
 *
 * `[read]` **`status = 'active'`, nicht `is_active`** — dieselbe
 * Bedingung, unter der `ladeGhostEintraege` seine Positionen holt.
 * **Zwei Bedingungen fuer dieselbe Frage waeren zwei Wahrheiten.**
 *
 * `[read]` **Leer heisst: der Plan bringt keine Struktur mit** — der
 * Aufrufer faellt dann auf die Nutzerslots zurueck (E-58).
 */
export async function ladeAktivPlanSlots(): Promise<MahlzeitSlot[]> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const db = client.schema('nutrition')
  const { data: plan, error: planFehler } = await db
    .from('meal_plans')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (planFehler || !plan) return []

  const planId = (plan as Record<string, unknown>).id
  if (typeof planId !== 'string') return []

  const { data, error } = await db
    .from('meal_plan_slots')
    .select('position, name, planned_time')
    .eq('plan_id', planId)
    .order('position', { ascending: true })
  if (error) return []

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
    position: Number(z.position),
    name: String(z.name ?? ''),
    planned_time: kurzZeit(String(z.planned_time ?? '')),
  }))
}
