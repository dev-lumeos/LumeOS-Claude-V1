// Sitzungsfehler von Datenfehler trennen — G-553/A1.
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// **Tom, 2026-09-29, 16:56, auf dem Phase-Reiter:**
//
//     Goals konnten nicht geladen werden
//     body_composition_navy: JWT issued at future
//
// `[cmd]` **`goals.body_composition_navy` ist NICHT kaputt** —
// Kettenschritt 112 (`112_body_measurements.sql:216`), live, und
// `lesen.ts:86` ruft sie richtig auf. **`JWT issued at future` kommt
// aus der Tokenpruefung**, bevor die Funktion ueberhaupt laeuft.
//
// `[read]` **Die Meldung schickt auf die falsche Suche:** wer *„Goals
// konnten nicht geladen werden"* liest, prueft seine Ziele — und das
// Problem ist die Anmeldung.
//
// ── Warum der Fehlercode dafuer nicht reicht ───────────────────────
//
// `[cmd]` **Der beobachtete Fehler kam als `READ_FAILED`**, nicht als
// `NO_SESSION`: PostgREST meldet den Tokenfehler als Antwort auf die
// Abfrage, und `lesen.ts` verpackt jede Antwort mit `error` als
// `READ_FAILED`. `[read]` **Die Unterscheidung muss deshalb den TEXT
// lesen** — der Code weiss es nicht.
//
// `[read]` **Nicht Gegenstand dieses Punktes:** WARUM die Uhr
// sprang. Das ist Umgebung, nicht Bau.

export type Fehlerart = 'sitzung' | 'daten'

/**
 * Die Merkmale, an denen ein Tokenfehler erkennbar ist.
 *
 * `[cmd]` **`JWT issued at future` ist der beobachtete Fall.** Die
 * uebrigen stehen daneben, weil sie aus derselben Pruefung kommen und
 * dieselbe Handlung verlangen — neu anmelden:
 *
 *     JWT expired            Token abgelaufen
 *     JWT issued at future   `iat` hinter der Serveruhr (der Fall)
 *     invalid JWT / claim    verfaelscht oder falsch signiert
 *     token is expired       dieselbe Lage, andere Schreibweise
 *     PGRST301               PostgREST: JWT expired
 *
 * `[read]` **Kleingeschrieben verglichen** — die Schreibweise
 * schwankt zwischen GoTrue, PostgREST und Kong.
 */
const SITZUNGSMERKMALE = [
  'jwt',
  'token is expired',
  'pgrst301',
  'invalid claim',
  'bad_jwt',
  'session not found',
  'refresh_token',
] as const

/**
 * Ist das ein Sitzungsfehler oder ein Datenfehler?
 *
 * `[read]` **Im Zweifel Datenfehler.** Ein faelschlich als
 * Sitzungsfehler gemeldeter Datenfehler schickt den Nutzer zur
 * Anmeldung, die nichts aendert — und dort steht dann kein
 * technischer Text mehr, der weiterhilft.
 *
 * @param text  Die Fehlermeldung, wie sie `page.tsx` gefangen hat.
 * @param code  Der Code aus `GoalsLeseFehler`, wenn er bekannt ist.
 */
export function fehlerart(
  text: string | null, code?: string | null,
): Fehlerart {
  // `[cmd]` **`NO_SESSION` ist eindeutig** — die Session fehlte schon
  // vor der ersten Abfrage (`lesen.ts:43`).
  if (code === 'NO_SESSION') return 'sitzung'
  if (!text) return 'daten'
  const t = text.toLowerCase()
  return SITZUNGSMERKMALE.some(m => t.includes(m)) ? 'sitzung' : 'daten'
}

/** Was die Kachel ueber dem technischen Text sagt. */
export type Fehlertexte = { titel: string; satz: string }

/**
 * Der Satz zur Fehlerart.
 *
 * `[read]` **Er sagt, was zu tun ist — nicht, was schiefging.** Der
 * technische Text steht darunter und bleibt sichtbar: **er hat diesen
 * Befund moeglich gemacht.** `[read]` **Ein Fehler ohne Text waere
 * schlechter als der falsche.**
 */
export function fehlertexte(art: Fehlerart): Fehlertexte {
  if (art === 'sitzung') {
    return {
      titel: 'Sitzung abgelaufen',
      satz: 'Die Sitzung ist nicht mehr gueltig. Melde dich neu an — '
        + 'deine Daten sind unveraendert.',
    }
  }
  return {
    titel: 'Goals',
    satz: 'Die Daten konnten nicht geladen werden.',
  }
}
