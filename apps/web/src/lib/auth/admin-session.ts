// Rollenprüfung (I/O) — VERSCHOBEN nach packages/shared (Block 19).
//
// Umsetzung jetzt in packages/shared/src/auth/admin-session.ts, gemeinsam
// genutzt von apps/web und apps/admin. Siehe admin-role.ts daneben.
//
// Diese Datei bleibt als Weiterleitung stehen, damit die bestehenden
// Importpfade unverändert gelten. Neuer Code importiert direkt aus
// '@lumeos/shared/auth'.

export { isCurrentUserAdmin } from '@lumeos/shared/auth'
