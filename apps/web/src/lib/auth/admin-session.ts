// I/O für die Rollenprüfung (C.3, 2026-08-06).
// Holt die Sitzung über den Session-Client und reicht app_metadata an die
// reine Regel in admin-role.ts. Läuft ausschliesslich serverseitig.
//
// Kein Service-Client: `[cmd]` createServiceClient hat null Aufrufer, das
// bleibt so (C-11).

import { createSessionClient } from '@lumeos/shared/session'

import { isAdminFromAppMetadata } from './admin-role'

/**
 * Ist die aktuelle Sitzung ein Admin?
 *
 * getUser() validiert gegen den Auth-Server (nicht nur das Cookie) und
 * liefert die app_metadata aus dem JWT — denselben Claim, den
 * public.is_admin() in der Datenbank prüft.
 *
 * Ohne Sitzung: false. Die Middleware leitet Unangemeldete ohnehin nach
 * /login um; diese Funktion trifft darüber keine Aussage.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  return isAdminFromAppMetadata(user.app_metadata as Record<string, unknown> | null | undefined)
}
