// Sicheres Ziel für `?redirect=` — VERSCHOBEN nach packages/shared
// (Block 19, 2026-08-12).
//
// Umsetzung und vollstaendige Begruendung jetzt in
// packages/shared/src/auth/safe-redirect.ts. Grund fuer den Umzug:
// apps/admin leitet nach der Anmeldung ebenfalls weiter, und ein offener
// Redirect waere dort dieselbe Luecke. Sicherheitslogik wird nicht
// kopiert — sonst wird sie an einer Stelle geflickt und an der anderen
// nicht.
//
// Diese Datei bleibt als Weiterleitung stehen, damit die bestehenden
// Importpfade in apps/web (und die Tests daneben) unveraendert gelten.

export { DEFAULT_REDIRECT, safeRedirect } from '@lumeos/shared/auth/safe-redirect'
