// Rollenprüfung — der I/O-Teil.
// packages/shared/src/auth/admin-session.ts
//
// Hierher verschoben aus apps/web/src/lib/auth/admin-session.ts
// (Block 19, 2026-08-12), zusammen mit der Regel in admin-role.ts.
//
// Eigener Einstiegspunkt `@lumeos/shared/auth` und NICHT im Barrel
// (index.ts): diese Datei hängt über createSessionClient an
// `next/headers` und ist damit nur in Server Components und Route
// Handlers gültig. Im Barrel würde jeder Client-Component-Import daran
// scheitern — dieselbe Trennung wie bei `@lumeos/shared/session`.

import { createSessionClient } from '../supabase/session'

import { isAdminFromAppMetadata } from './admin-role'

export { ADMIN_ROLE, isAdminFromAppMetadata } from './admin-role'
export type { SessionAppMetadata } from './admin-role'

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
