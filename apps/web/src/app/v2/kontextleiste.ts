'use server'

// Die Kontextleiste rechts — G-657. **Tom, 16.10. 19:18: standardmaessig
// eingeklappt, in der ganzen App.**
//
// `[cmd]` **Die Wahl liegt in `public.user_display_preferences`** — eine
// Zeile je Nutzer und Schluessel, vier RLS-Regeln, dasselbe Muster wie
// `lib/goals/einheit-speichern.ts`. Kein Cookie: die Wahl gehoert dem
// Nutzer, nicht dem Browser.
import { createSessionClient } from '@lumeos/shared/session'

const SCHLUESSEL = 'shell.kontextleiste'

/** Offen nur, wenn der Nutzer sie aufgeklappt hat. Ein Lesefehler ist keine Wahl. */
export async function ladeKontextOffen(): Promise<boolean> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return false
  const { data } = await client
    .from('user_display_preferences')
    .select('value')
    .eq('user_id', user.id)
    .eq('preference_key', SCHLUESSEL)
    .maybeSingle()
  return (data as { value?: { offen?: unknown } } | null)?.value?.offen === true
}

export async function speichereKontextOffen(offen: boolean): Promise<void> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Keine Sitzung.')
  const { data, error } = await client
    .from('user_display_preferences')
    .upsert(
      { user_id: user.id, preference_key: SCHLUESSEL, value: { offen: offen === true } },
      { onConflict: 'user_id,preference_key' },
    )
    // G-79: zaehlen, ein vom Zeilenschutz gefiltertes Upsert kaeme sonst als Erfolg zurueck.
    .select('preference_key')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('Die Einstellung wurde nicht gespeichert.')
}
