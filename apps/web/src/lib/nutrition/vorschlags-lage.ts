// ════════════════════════════════════════════════════════════════════
// WAS EIN VORSCHLAG WAERE — G-263, GEMESSEN STATT GEBAUT
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// `[read]` **Diese Datei baut nichts.** Sie haelt fest, was am
// 2026-08-30 je Vorschlag gemessen wurde, **damit die Kachel nicht ein
// zweites Mal gefuellt wird, ohne dass jemand dieselbe Frage stellt.**
//
// ══ DIE VORFRAGE IST INHALTLICH ═════════════════════════════════════
//
// **Der Auftrag:** *,,Die Vorfrage ist inhaltlich, nicht technisch: was
// ist ein Vorschlag?"*
//
// `[read]` **Ein Vorschlag sagt, was jemand tun soll. Das ist eine
// Bewertung.** `[cmd]` **C-108/F-02 zieht die Grenze:** *nennen ja,
// bewerten nein* — ausdruecklich festgehalten in C-113: *,,Was nicht
// gebaut wird: Dosierungsempfehlung, Zyklusaufbau, PCT-Protokoll,
// Kombinationsvorschlag."*
//
// `[read]` **Damit ist die Kachel als Ganzes nicht baubar** — ihr Name
// ist ihr Problem. **Aber je Zeile ist die Antwort verschieden**, und
// nur eine Messung sagt, welche.
//
// ══ DIE VIER ZEILEN DER ATTRAPPE, EINZELN GEMESSEN ══════════════════
//
//   1. „Same as yesterday · Oats + Whey · 612 kcal"
//      `[cmd]` **Der Fakt ist da:** dev hat am Vortag 16 Posten ueber
//      vier Mahlzeiten (breakfast 4/501 kcal, lunch 4/715,
//      dinner 4/626, snack 4/391).
//      `[cmd]` **UND ES IST GEBAUT:** `wieGestern()` in
//      `mahlzeiten.tsx:275` uebernimmt genau das, je Mahlzeit, mit
//      Schreibweg und neu eingefrorenen Naehrwerten.
//      `[read]` **Eine Kachel daneben waere die zweite Ansicht** —
//      dreimal passiert (G-249, G-11, verhindert in G-253).
//
//   2. „Top breakfast (last 30d) · 78% adherence · 24x this month"
//      `[cmd]` **Die Haeufigkeit ist zaehlbar:** Huehnerei roh 27x,
//      Hafer Flocken 8x, Dinkelbrot 8x in 30 Tagen.
//      `[cmd]` **„78% adherence" ist es nicht:** `goals.nutrition_
//      targets` traegt fuer dev EINE Zeile (gueltig ab 2026-05-21) —
//      eine Einhaltungsquote je Fruehstueck laesst sich daraus nicht
//      bilden.
//      `[read]` **Und „Top" ist bereits eine Wertung.** Haeufig
//      gegessen heisst nicht gut. **Nennen ginge: „27x in 30 Tagen".
//      Bewerten nicht.**
//
//   3. „Quick post-workout · Whey 30g + Banana · 30 sec to log"
//      `[cmd]` **Keine Quelle.** Menge und Kombination stehen
//      nirgends — das ist genau die Dosierungs- und
//      Kombinationsempfehlung aus C-113.
//
//   4. „Saturday cheat meal · You typically eat out Sat · 850 kcal"
//      `[cmd]` **Das Muster gibt es nicht.** Ueber 90 Tage traegt
//      jeder Wochentag **dieselben 13 Tage**, und der Samstagsschnitt
//      (625 kcal) liegt zwischen Freitag (560) und Donnerstag (663).
//      `[read]` **„Allowance" ist zudem eine Erlaubnis** — die
//      staerkste Form der Bewertung.
//
// ══ DAS URTEIL ══════════════════════════════════════════════════════
//
// `[read]` **Von vier Zeilen: eine ist gebaut, eine ist erfunden, zwei
// sind Empfehlungen.** **Keine traegt.**
//
// `[read]` **Der Auftrag sagt, was dann geschieht:** *,,Wenn nicht: sag
// es, und die Kachel wird entfernt statt gefuellt."* **Entfernt.**

/** Die vier Zeilen der Attrappe. */
export type Vorschlag =
  | 'wie_gestern' | 'top_fruehstueck' | 'post_workout' | 'samstag'

/** Warum eine Zeile nicht gebaut wurde. */
export type VorschlagUrteil =
  /** Der Fakt ist da — aber die Sache existiert schon woanders. */
  | 'gebaut_woanders'
  /** Die Daten tragen die Aussage nicht. */
  | 'kein_muster'
  /** Es waere eine Bewertung, nicht eine Angabe (C-108/F-02). */
  | 'bewertung'

export const URTEIL: Record<Vorschlag, {
  urteil: VorschlagUrteil
  gemessen: string
}> = {
  wie_gestern: {
    urteil: 'gebaut_woanders',
    gemessen: 'Vortag mit 16 Posten über vier Mahlzeiten; `wieGestern()` '
      + 'in mahlzeiten.tsx:275 übernimmt sie bereits, mit Schreibweg.',
  },
  top_fruehstueck: {
    urteil: 'bewertung',
    gemessen: 'Häufigkeit zählbar (Hühnerei roh 27× in 30 Tagen), '
      + '„78% adherence" nicht — eine Zielzeile seit 2026-05-21. '
      + '„Top" wertet.',
  },
  post_workout: {
    urteil: 'bewertung',
    gemessen: 'Keine Quelle für Menge oder Kombination — genau die '
      + 'Dosierungs- und Kombinationsempfehlung aus C-113.',
  },
  samstag: {
    urteil: 'kein_muster',
    gemessen: 'Über 90 Tage je Wochentag dieselben 13 Tage; Samstag '
      + '625 kcal liegt zwischen Freitag 560 und Donnerstag 663.',
  },
}

/**
 * Was gebaut werden koennte, ohne die Grenze zu verletzen.
 *
 * `[read]` **Nicht als Vorschlag, sondern als Angabe.** Eine Zahl
 * *,,27x in 30 Tagen"* nennt; *,,Top breakfast"* bewertet. **Der
 * Unterschied ist nicht die Zahl, sondern der Satz darum.**
 *
 * `[read]` **Das ist eine Entscheidung, keine Messung** — deshalb
 * steht es hier und ist nicht gebaut.
 */
export const OFFENE_FRAGE =
  'Eine Kachel „häufig erfasst" wäre eine Angabe und keine Bewertung: '
  + 'sie nennt Zahlen aus dem eigenen Protokoll, ohne zu sagen, was '
  + 'jemand tun soll. Ob das gewünscht ist, ist eine Produktfrage.'
