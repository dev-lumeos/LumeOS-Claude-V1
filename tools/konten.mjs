// Die EINE Stelle fuer die lokalen Nachweiskonten (G-175).
//
// [read] Vorher trug jedes Nachweisskript das Wort fest verdrahtet —
// neun Skripte, und als der Hash einmal abwich, liefen alle
// Browser-Nachweise auf dem falschen Konto oder gar nicht. Jetzt:
// ein Ort, aus dem tools/schuss.mjs, die _g-Skripte UND der
// Testdaten-Kettenschritt (setzt den Hash) dasselbe lesen.
//
// [cmd] Lokale Entwicklungskonten der Wegwerf-/Dev-Instanz — keine
// Geheimnisse im Sinne der Sicherheitsregeln, aber trotzdem nur hier.
//
// LUMEOS_WORT in der Umgebung schlaegt den Eintrag; ein UNBEKANNTES
// Konto ohne LUMEOS_WORT wirft, statt still mit einem fremden Wort
// anzuklopfen.

export const KONTEN = {
  'dev@lumeos.app': 'LumeosDev2026',
  'test-user@lumeos.local': 'LumeosTestUser2026',
  // `[cmd]` **2026-09-08:** das Coach-Portal auf 3220 verlangt ein
  // Konto MIT Beziehung ? `dev@lumeos.app` ist dort der Klient und
  // sieht die Absage. Passwort aus dem Seed.
  'coach@lumeos.app': 'LumeosCoach2026',
}

/** Das Anmeldewort fuer ein Konto — Umgebung vor Tabelle, sonst Wurf. */
export function wortFuer(konto, env = process.env) {
  if (env.LUMEOS_WORT) return env.LUMEOS_WORT
  const wort = KONTEN[konto]
  if (!wort) {
    throw new Error(
      `Kein Anmeldewort fuer "${konto}" hinterlegt — LUMEOS_WORT setzen `
      + 'oder das Konto in tools/konten.mjs eintragen (G-175).')
  }
  return wort
}
