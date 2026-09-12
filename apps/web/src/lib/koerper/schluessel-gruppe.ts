// G-438 - die fehlende Uebersetzung: motor.ts-Schluessel -> muscle_groups.
//
// ══ WARUM ES DIESE DATEI GIBT ═══════════════════════════════════
//
// **Tom, 2026-09-12:** *„das ist unlogisches ghetto. beispiel arms
// triceps ist orange, zeigt aber keine werte in der liste."*
//
// `[cmd]` **Gemessen, drei Stellen mit drei Kennungen:**
//
//     Karte faerbt   triceps-longum, -lateralis, -mediale
//                    -> die drei KOEPFE
//     Hierarchie     `Triceps` (305 Uebungszuordnungen),
//                    die Koepfe darunter
//     motor.ts       triceps: { hours: 38, sets: 12, soreness: 1 }
//
// `[read]` **Die Karte faerbt die KOEPFE, der Wert haengt am
// ELTERNTEIL, und die Uebersetzung dazwischen fehlte.** **Deshalb
// orange und „--".**
//
// ══ WAS DIESE DATEI NICHT TUT ═══════════════════════════════════
//
// `[cmd]` **Sie vererbt KEINEN Wert nach unten.** `[read]` **Die
// drei Koepfe haben keine eigene Messung, und sie bekommen auch
// keine.** **Die Zuordnung sagt nur, WOHER der Wert kaeme** — die
// Ansicht schreibt dann dazu, dass er von der Gruppe stammt.
//
// `[read]` **Und sie erfindet keinen Namen.** **Wo `motor.ts` und
// `muscle_groups` nicht zusammenpassen, steht es in
// `OHNE_GRUPPE`** — mit Grund, nicht als Luecke.
//
// `[cmd]` **Alle Namen gemessen gegen `training.muscle_groups`**
// (`tools/_g438-zuordnung.mjs`, 2026-09-12) — Volumen in Klammern
// ist die Zahl der Uebungszuordnungen in `exercise_muscles`.

/**
 * Der Muskelgruppen-Name, an dem der Wert eines Schluessels haengt.
 *
 * `[read]` **Der Schluessel ist die Messung, der Name die Stelle im
 * Baum.** Wo die Karte ein KIND dieses Namens faerbt, stammt der
 * angezeigte Wert von hier — und die Liste sagt es dazu.
 */
export const SCHLUESSEL_ZU_GRUPPE: Record<string, string> = {
  // ── Gleicher Name, nur Schreibweise ───────────────────────────
  chest: 'Chest',                 // (211)
  biceps: 'Biceps',               // (293)  Kind: Brachialis
  triceps: 'Triceps',             // (305)  Kinder: die drei Koepfe
  trapezius: 'Trapezius',         // (42)
  obliques: 'Obliques',           // (220)
  quadriceps: 'Quadriceps',       // (353)

  // ── Plural/Singular ───────────────────────────────────────────
  forearm: 'Forearms',            // (214)
  hamstring: 'Hamstrings',        // (382)
  calves: 'Calves',               // (199)
  adductor: 'Adductors',          // (31)

  // ── Anders benannt — gemessen, nicht geraten ──────────────────
  //
  // `[cmd]` **Der erste Lauf meldete diese fuenf als „kein Name in
  // muscle_groups"** — sie existieren, nur unter anderem Namen.
  // `[read]` **Die Lehre `werkzeug-meldet-fehlend-pruefe-umbenannt`:
  // erst suchen, dann melden.**
  abs: 'Abdominals',              // (147)  unter `Core`
  gluteal: 'Glutes',              // (403)  unter `Legs`
  neck: 'Neck Muscles',           // (4)    Wurzel
  front_deltoids: 'Front Shoulders', // (9)  unter `Deltoids`
  back_deltoids: 'Rear Deltoids', // (7)    unter `Deltoids`

  // ── Der Ruecken: die Karte teilt feiner als die Messung ───────
  //
  // `[read]` **`upper_back` faerbt drei Flaechen** (Latissimus,
  // Teres major, Teres minor), **`lower_back` zwei** — die Messung
  // kennt nur die beiden Gruppen. **Der Gegenpart ist trotzdem
  // eindeutig**, es ist nur eine Gruppe mit mehreren gezeichneten
  // Kindern. **Dasselbe Muster wie beim Trizeps.**
  upper_back: 'Upper Back',       // (331)  4 Kinder
  lower_back: 'Lower Back',       // (193)  1 Kind
}

/**
 * Schluessel OHNE eindeutigen Gegenpart — gemeldet, nicht geraten.
 *
 * `[read]` **Eine leere Liste waere die bequeme Antwort.** `[cmd]`
 * **Der Auftrag verlangt das Gegenteil:** *„wo motor.ts und
 * muscle_groups nicht zusammenpassen, wird es gemeldet."*
 */
export const OHNE_GRUPPE: Array<{ slug: string; grund: string }> = [
  {
    slug: 'abductors',
    grund: '`muscle_groups` fuehrt zwar „Abductors" (2 Zuordnungen) '
      + 'und „Hip Abductors" (30) — aber die Karte zeichnet die '
      + 'Aussenseite des Oberschenkels NICHT, nur `adductors` '
      + '(Innenseite). Eine Zuordnung waere folgenlos: es gibt '
      + 'keine Flaeche, die sie faerben koennte. Steht seit G-26 '
      + 'in OHNE_ENTSPRECHUNG.',
  },
]

/**
 * Kommt der Wert dieser Flaeche von einer GRUPPE statt von ihr
 * selbst?
 *
 * `[read]` **Genau dann, wenn der gezeichnete Muskel ein anderer
 * ist als die Gruppe, an der die Messung haengt.** `[cmd]` **Beim
 * Trizeps: die Flaeche zeigt `Triceps Brachii Long Head`, die
 * Messung haengt an `Triceps`** — also geerbt.
 */
export function wertKommtVonGruppe(
  flaechenName: string | null, slug: string | null,
): string | null {
  if (!slug || !flaechenName) return null
  const gruppe = SCHLUESSEL_ZU_GRUPPE[slug]
  if (!gruppe) return null
  return gruppe.toLowerCase() === flaechenName.toLowerCase() ? null : gruppe
}
