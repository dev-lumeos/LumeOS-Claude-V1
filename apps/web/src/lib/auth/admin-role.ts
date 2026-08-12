// Rollenprüfung — VERSCHOBEN nach packages/shared (Block 19, 2026-08-12).
//
// Die Regel steht jetzt in packages/shared/src/auth/admin-role.ts, weil
// apps/admin sie ebenfalls braucht. Eine Kopie hätte zwei Wahrheiten
// erzeugt; bei Rollenlogik ist das die teuerste Stelle für Drift.
//
// Diese Datei bleibt als Weiterleitung stehen, damit die bestehenden
// Importpfade in apps/web (und die Tests daneben) unverändert gelten.
// Neuer Code importiert direkt aus '@lumeos/shared/auth/role'.

export { ADMIN_ROLE, isAdminFromAppMetadata } from '@lumeos/shared/auth/role'
export type { SessionAppMetadata } from '@lumeos/shared/auth/role'
