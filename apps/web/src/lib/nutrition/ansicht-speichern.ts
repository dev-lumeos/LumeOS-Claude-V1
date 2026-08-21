// Schreibpfad der gespeicherten Naehrstoffbaum-Ansicht (G-122).
//
// `public.user_display_preferences` (C-161): eine Zeile je Nutzer und
// Schluessel, `value jsonb`, RLS mit vier Policies. Gelesen wird sie
// in `ladeOrdnung` (Server-Render); hier steht nur das Upsert.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { ANSICHT_SCHLUESSEL, type GespeicherteAnsicht } from './naehrstoff-anzeige'

export class AnsichtWriteError extends Error {
  code: 'UNAUTHENTICATED' | 'WRITE_FAILED'
  constructor(code: 'UNAUTHENTICATED' | 'WRITE_FAILED', message: string) {
    super(message)
    this.code = code
  }
}

export async function speichereAnsicht(ansicht: GespeicherteAnsicht): Promise<void> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new AnsichtWriteError('UNAUTHENTICATED', 'Keine Sitzung.')

  const { error } = await client
    .from('user_display_preferences')
    .upsert(
      { user_id: user.id, preference_key: ANSICHT_SCHLUESSEL, value: ansicht },
      { onConflict: 'user_id,preference_key' },
    )
  if (error) throw new AnsichtWriteError('WRITE_FAILED', error.message)
}
