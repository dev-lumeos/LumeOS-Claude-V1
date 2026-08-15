// @lumeos/ui — Bausteine der Oberflaeche v2.
//
// STAND G-01: Das Paket ist in Betrieb genommen, enthaelt aber noch
// KEINE Komponente. Sidebar, Topbar und Karten entstehen in G-02.
// Hier steht heute nur, was die Oberflaeche v2 ueber sich selbst weiss.
//
// Muster wie @lumeos/shared: rohes TypeScript, kein Build. Die
// konsumierende App uebersetzt mit; deshalb traegt dieses Paket keine
// eigenen typecheck/test/build-Skripte und `pnpm gate` bleibt bei
// 8 Tasks.

/** Praefix aller v2-Klassen. Siehe src/styles/v2.css, Kopf. */
export const V2_PREFIX = 'v2-'

/**
 * Setzt das Praefix vor einen Klassennamen.
 * Gedacht fuer G-02 aufwaerts, damit das Praefix an einer Stelle steht
 * und nicht 123-mal im JSX wiederholt wird.
 */
export function v2(...namen: Array<string | false | null | undefined>): string {
  return namen
    .filter((n): n is string => typeof n === 'string' && n.length > 0)
    .map(n => `${V2_PREFIX}${n}`)
    .join(' ')
}
