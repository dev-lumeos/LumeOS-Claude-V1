// Rollenprüfung — die REGEL, ohne I/O.
// packages/shared/src/auth/admin-role.ts
//
// Hierher verschoben aus apps/web/src/lib/auth/admin-role.ts (Block 19,
// 2026-08-12), als apps/admin dazukam. Grund: Zwei Apps prüfen dieselbe
// Rolle. Eine Kopie hätte zwei Wahrheiten erzeugt, die auseinanderdriften
// — und Rollenlogik ist die falsche Stelle für Drift.
// Verschoben, NICHT kopiert: apps/web importiert jetzt von hier.
//
// WARUM NUR app_metadata:
// `[cmd]` 2026-08-06 gegen die laufende Auth-API belegt:
//   * PUT /auth/v1/user mit {"app_metadata":{"role":"admin"}}
//     -> 403 {"error_code":"not_admin"}
//   * PUT /auth/v1/user mit {"data":{"role":"admin"}}
//     -> GELINGT. Der Wert landet in user_metadata und im JWT.
// Ein Nutzer kann sich in user_metadata also nach Belieben zum "admin"
// erklären. Wer diesen Claim liest, baut die Lücke ein.
//
// Diese Prüfung ist die ANZEIGE-Seite. Die Durchsetzung liegt in der
// Datenbank (public.is_admin() + RLS-Policies aus 061) — die Oberfläche
// entscheidet nur, ob sie eine Seite zeigt, nicht ob Daten fliessen.
// Beides liest denselben Claim, damit Anzeige und Wirkung nicht
// auseinanderlaufen.

/** Rollenwert, den 061 in der Datenbank prüft. */
export const ADMIN_ROLE = 'admin'

/**
 * Die app_metadata einer Supabase-Session, auf das Nötige reduziert.
 * `unknown`, weil der Wert aus dem JWT kommt und nicht typisiert ist.
 */
export type SessionAppMetadata = Record<string, unknown> | null | undefined

/**
 * Ist diese Sitzung ein Admin?
 *
 * Standard ist "kein Admin": fehlende Metadaten, fehlende Rolle, ein
 * anderer Typ oder ein anderer Wert ergeben alle `false`. Es gibt keinen
 * Pfad, auf dem "unbekannt" zu "erlaubt" wird — dieselbe Linie wie
 * public.is_admin() in 061.
 */
export function isAdminFromAppMetadata(appMetadata: SessionAppMetadata): boolean {
  if (!appMetadata || typeof appMetadata !== 'object') return false
  return appMetadata.role === ADMIN_ROLE
}
