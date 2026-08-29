// ════════════════════════════════════════════════════════════════════
// WAS DER MITTELWERT IM FENSTER VERSCHWEIGT — G-108
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30.
//
// ══ DER GEMESSENE BEFUND ════════════════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-29, `dev@lumeos.app`, gegen die
// laufende Oberflaeche UND die Datenbank — beide Wege, dasselbe
// Ergebnis:**
//
//     Filter        7 Tage   30 Tage   90 Tage
//     Alle              37        37        37     Zeilen am Schirm
//     Auffaellig        42        42        42
//     Unter Ziel        34        34        34
//
// `[cmd]` **Und in der Datenbank dieselben ZWOELF Codes in allen drei
// Fenstern:** CA, CLD, F18:2CN6, F18:3CN3, FD, MG, NA, NACL, NIA,
// VITA, VITD, WATER.
//
// `[read]` **Der Fensterwaehler aendert die Zahlen, nicht die
// Auswahl.** `[cmd]` Der Mittelwert ueber alle 138 Naehrstoffe
// verschiebt sich (495,20 / 486,55 / 478,97), **aber keine einzige
// Zeile wechselt dadurch die Seite ihrer Schwelle.**
//
// ══ WARUM ══════════════════════════════════════════════════════════
//
// `[cmd]` `naehrstoff-ordnung.ts:451` bildet den Status aus
// `avg_per_logged_day` — **dem Mittelwert.** `[read]` **Ein
// Mittelwert ist gegen die Fensterbreite traege:** wer durchgehend
// bei 57 Prozent liegt, liegt in jedem Fenster bei 57 Prozent.
//
// `[read]` **Damit sind zwei verschiedene Lagen ununterscheidbar** —
// C-323 hat es gemessen: konstant 79 Prozent, und 45 Tage bei 40
// neben 45 Tagen bei 118, ergeben denselben Schnitt.
//
// ══ WAS HIER NICHT PASSIERT ════════════════════════════════════════
//
// `[read]` **Die Dauerregel wird NICHT angebunden**, obwohl sie
// gebaut ist (`mikro-flags.ts`, C-323). `[cmd]` **Der Grund ist
// gemessen:** `reference_assessment_window` kostet fuer 90 Tage
// **1.786 ms**, und der Reiter braucht heute schon **5.906 ms warm**
// bei `fenster=90`. **Zusammen waeren es rund 7,7 s** — mehr als die
// neun Sekunden aus C-189 in ihrer Groessenordnung.
//
// `[read]` **Also sagt der Reiter, was seine Zahl bedeutet, statt
// eine zweite teure Achse danebenzustellen.** **Das ist die Regel
// aus G-249 und G-253:** keine zweite Ansicht neben eine bestehende.

/**
 * Der Satz, der die Traegheit des Mittelwerts benennt.
 *
 * `[read]` **Er steht nur bei Fenstern ueber einem Tag** — ein
 * einzelner Tag traegt keinen Mittelwert und kann nichts verstecken.
 *
 * `[read]` **Und er behauptet keine Zahl**, sondern nennt die Grenze
 * der gezeigten: „diese Auswahl bleibt gleich" ist pruefbar, „so
 * viele schwanken" waere eine Aussage, die diese Achse nicht treffen
 * kann.
 */
export function mittelwertSatz(fenster: number): string {
  if (fenster <= 1) return ''
  return 'Die Auswahl stammt aus dem Schnitt über den Zeitraum. '
    + 'Ein Nährstoff, der die Hälfte der Tage weit darunter und die '
    + 'andere Hälfte weit darüber liegt, fällt hier nicht auf — '
    + 'und die Auswahl ändert sich kaum, wenn du den Zeitraum wechselst.'
}

/**
 * Ob der Hinweis ueberhaupt gezeigt wird.
 *
 * `[cmd]` **Nur wo er zutrifft:** bei `Heute` (Fenster 1) steht die
 * Tagessumme, kein Schnitt.
 */
export function zeigtMittelwertHinweis(fenster: number): boolean {
  return fenster > 1
}

/**
 * Die zwei Achsen — G-250.
 *
 * `[cmd]` **Gemessen am 2026-08-29:** `goals.nutrition_targets` fuehrt
 * **sechs** Naehrstoffspalten, nicht 60 — `kcal`, `protein_g`,
 * `carbs_g`, `fat_g`, `linoleic_acid_g`, `alpha_linolenic_acid_g`.
 * **`MAKRO_ZIEL` in `naehrstoff-ordnung.ts:61` bildet genau diese
 * sechs ab.**
 *
 * `[cmd]` **Von den sechs tragen drei ueberhaupt beide Achsen**
 * (`PROT625`, `F18:2CN6`, `F18:3CN3`); die anderen drei liefern
 * keinen `reference_pct` (`ENERCC` ohne Wert, `CHO` und `FAT` als
 * `energy_share`).
 *
 * `[cmd]` **Von diesen drei geht EINE auseinander:** `F18:3CN3` steht
 * bei **85,7 % des persoenlichen Ziels** (gedeckt) und zugleich bei
 * **51,6 % der Referenz** (zu wenig).
 *
 * `[read]` **Das ist die Antwort auf G-250 in der Form, die G-218
 * verlangt: selten.** **Eine Achse mit Vermerk reicht** — und der
 * Vermerk steht bereits im Kopf des Reiters (*„die Makros dein
 * persoenliches aus den Goals, die uebrigen die wissenschaftliche
 * Referenz"*).
 *
 * `[read]` **Die Entscheidung selbst faellt Tom**, nicht diese Datei;
 * hier steht nur, was gemessen wurde.
 */
export const ZWEI_ACHSEN_CODES = [
  'ENERCC', 'PROT625', 'CHO', 'FAT', 'F18:2CN6', 'F18:3CN3',
] as const

/**
 * Ob eine Zeile beide Achsen traegt und sie auseinandergehen.
 *
 * `[read]` **Nur dann ist der Vermerk noetig** — bei
 * uebereinstimmenden Achsen waere er Rauschen.
 */
export function achsenGehenAuseinander(
  zielProzent: number | null,
  referenzProzent: number | null,
  gedecktAb: number,
): boolean {
  if (zielProzent === null || referenzProzent === null) return false
  return (zielProzent >= gedecktAb) !== (referenzProzent >= gedecktAb)
}

/**
 * Der Vermerk fuer eine Zeile, deren Achsen auseinandergehen.
 *
 * `[read]` **Er nennt beide Zahlen und sagt, welche die Zeile
 * meint** — genau das verlangt G-250 fuer den Fall „oft". `[cmd]`
 * Gemessen ist der Fall „selten" (eine von drei), deshalb steht er
 * an der Zeile und nicht als zweite Spalte.
 */
export function achsenVermerk(
  zielProzent: number, referenzProzent: number,
): string {
  return `${Math.round(zielProzent)} % deines Ziels, `
    + `${Math.round(referenzProzent)} % der wissenschaftlichen Referenz.`
}
