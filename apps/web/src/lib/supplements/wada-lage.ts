/**
 * Die WADA-Lage einer Substanz — G-184.
 *
 * ══ DIE FRAGE, DIE DAHINTERSTEHT ═══════════════════════════════════
 *
 * **Tom, 2026-08-25:** *„WADA verboten — gilt das auch fuer
 * bodybuilding?"*
 *
 * `[read]` **Die Kachel konnte das nie beantworten.** Sie sagt seit
 * G-182 *„im getesteten Wettkampf"* — richtig, aber es ist die
 * Sofortmassnahme, nicht die Antwort. Der Satz dahinter fehlte, weil
 * `note_de` bei **0 von 290** stand.
 *
 * `[cmd]` **Seit C-272 steht er bei 320 von 320.** Kreatin traegt
 * dort die Ligen namentlich — NADOs, IPF, IFBB, INBA/PNBA, WNBF, OCB,
 * IFBB Professional League, NPC — mit verifizierten Quellen.
 *
 * ══ WARUM EIN BLOCK UND KEIN AUFKLAPPER ════════════════════════════
 *
 * `[cmd]` **Gemessen 2026-08-26, VOR dem Bau, ueber alle 320:**
 *
 *     min 253 · Median 387 · p90 697 · max 818 Zeichen
 *     143 von 320 ueber 200 Zeichen
 *
 * `[read]` **Der Auftrag nannte die Bedingung: „wenn der laengste Text
 * drei Zeilen fuellt, ist ein Block richtiger."** Der Median fuellt
 * bei 78 Zeichen je Zeile **fuenf** Zeilen, das Maximum **elf**.
 * Damit ist die Frage entschieden — und sie war nicht knapp.
 *
 * `[read]` **Zwei weitere Gruende, die aus dem Inhalt kommen:**
 *
 * - **Der Satz ist die Antwort auf die haeufigste Frage.** Was man
 *   aufklappen muss, liest niemand; der Auftrag entstand, WEIL die
 *   Antwort fehlte.
 * - **Es ist eine Rechtsauskunft.** Ein Aufklapper legt nahe, dass
 *   man sie ueberspringen darf. Bei einem gesperrten Stoff darf man
 *   das nicht.
 *
 * ══ WAS HIER NICHT PASSIERT ════════════════════════════════════════
 *
 * **Kein Text wird gekuerzt oder umgeschrieben** — die Saetze tragen
 * ihre Quellen (Auftrag: *„wer sie strafft, loest die Belegkette"*).
 *
 * **Nichts ueber Verbaende wird ergaenzt.** Was ueber IFBB und NPC
 * gesagt wurde, war `[wahrscheinlich]`; was hier steht, kommt aus
 * `note_de` und sonst nirgendwoher.
 */

import type { BlockTon } from './block-ton'

/** Die drei Zustaende, die `wada_status` kennt. */
export type WadaZustand = 'prohibited' | 'monitored' | 'not_prohibited'

export type WadaLage = {
  zustand: WadaZustand | null
  /** Die Ueberschrift des Blocks — richtet sich nach dem Zustand. */
  titel: string
  /** Der Satz aus `note_de`, ungekuerzt. */
  text: string
  /**
   * Die Klasse, wo sie etwas sagt.
   *
   * `[cmd]` **Bei allen 145 verbotenen gefuellt, bei
   * `not_prohibited` nur bei 3 von 172** — dort entfaellt sie.
   */
  kategorie: string | null
  /** G-194: die Bedeutung, nicht die Farbe — siehe `block-ton.ts`. */
  ton: BlockTon | null
}

/**
 * Die Ueberschrift je Zustand.
 *
 * `[cmd]` **Drei Zustaende, nicht zwei** — `monitored` gibt es
 * dreimal (Koffein, Semaglutid, Tirzepatid). `[read]` Sie sind weder
 * erlaubt noch verboten: die WADA beobachtet sie. Wer das unter
 * „erlaubt" fuehrt, sagt etwas Falsches.
 */
const TITEL: Record<WadaZustand, string> = {
  prohibited: 'Für wen das Verbot gilt',
  monitored: 'Beobachtungsprogramm — was das heißt',
  not_prohibited: 'Für wen das gilt',
}

/**
 * Der Ton des Blocks — G-194.
 *
 * ══ DER PRUEFSTEIN DER FARBORDNUNG ═════════════════════════════════
 *
 * **Tom, 2026-08-26:** *„Wenn du dafuer eine fuenfte Farbe brauchst,
 * ist die Ordnung zu fein."*
 *
 * `[cmd]` **Drei Zustaende, drei verschiedene Aussagen:**
 * `prohibited` 145 · `not_prohibited` 172 · `monitored` 3.
 *
 * - **verboten ist eine Gefahr** → `gefahr`
 * - **erlaubt ist eine ENTWARNUNG**, nicht das Fehlen einer Warnung
 *   → `entwarnung`. `[read]` In G-184 stand hier `null`, also gar
 *   keine Farbe. **Das war zu wenig:** *„nicht auf der Verbotsliste,
 *   in keinem Verband verboten"* ist eine Aussage, und sie ist die
 *   haeufigste (172 von 320).
 * - **beobachtet ist keins von beidem** → `pruefen`. `[read]` In
 *   G-184 stand hier `acc`, also die Wirkungsfarbe — **falsch**, denn
 *   das Beobachtungsprogramm sagt nichts ueber die Wirkung. Es sagt:
 *   die WADA schaut hin, der Status kann sich aendern. **Das ist
 *   genau „pruefen, bevor du dich darauf verlaesst".**
 *
 * `[read]` **Keine fuenfte Farbe noetig** — die drei Zustaende fallen
 * auf drei der vier vorhandenen Bedeutungen. Die Ordnung traegt.
 */
const TON: Record<WadaZustand, BlockTon> = {
  prohibited: 'gefahr',
  not_prohibited: 'entwarnung',
  monitored: 'pruefen',
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

/**
 * Die Klasse, so wie sie angezeigt werden darf.
 *
 * ══ EIN BEFUND, DER DEN AUFTRAG KORRIGIERT ═════════════════════════
 *
 * `[cmd]` **Der Auftrag nennt `wada_category` als Code (`S1.1`, `S2`,
 * `S4.1`, `S0`). Gemessen sind es 41 verschiedene Werte**, viele davon
 * ganze Saetze bis **91 Zeichen**:
 *
 *     „S1.1 Anabolic agents (exogene AAS: Testosteron und seine
 *      Ester) — jederzeit verboten"
 *
 * `[read]` **In eine Kachel passt das nicht**, und in die Zeile neben
 * den Zustand auch nicht. **Gezeigt wird deshalb der CODE am Anfang**
 * — `S1.1`, `S2/S0`, `S4.4.2` —, der Rest des Satzes steht ohnehin in
 * `note_de`. Kein Text geht verloren, er wird nur nicht zweimal
 * gezeigt.
 *
 * `[cmd]` **`unknown` faellt weg** (7 Zeilen) — es ist keine Klasse,
 * sondern das Fehlen einer.
 */
export function kategorieKurz(roh: unknown): string | null {
  const s = text(roh)
  if (!s || s.toLowerCase() === 'unknown') return null
  // `[cmd]` Zwei Zeilen tragen als „Klasse" den Satz `not prohibited`
  // bzw. `not on WADA list (not prohibited)` — bei `wada_status =
  // 'prohibited'`. Das ist ein Datenwiderspruch, und `note_de` sagt es
  // dort selbst. **Eine solche Klasse wird nicht gezeigt**, sonst
  // steht „verboten · not prohibited" nebeneinander.
  if (/^not\s+(on\s+wada|prohibited)/i.test(s)) return null
  const treffer = s.match(/^(S\d(?:\.\d+)*(?:\.[A-Z])?(?:\/S\d(?:\.\d+)*)?)/i)
  return treffer ? treffer[1] : (s.length <= 12 ? s : null)
}

/**
 * Die Lage aus einer Substanzzeile lesen.
 *
 * `[read]` **Ohne `note_de` entsteht kein Block.** `[cmd]` 124 der 412
 * sichtbaren Substanzen haben gar keine `supplement_wada`-Zeile — dort
 * darf nichts erscheinen, auch keine Ueberschrift.
 */
export function wadaLage(
  status: unknown, note: unknown, kategorie: unknown,
): WadaLage | null {
  const t = text(note)
  if (!t) return null
  const s = text(status)
  const zustand = (s === 'prohibited' || s === 'monitored'
    || s === 'not_prohibited') ? s : null
  return {
    zustand,
    titel: zustand ? TITEL[zustand] : 'Dopingrechtliche Lage',
    text: t,
    kategorie: kategorieKurz(kategorie),
    ton: zustand ? TON[zustand] : null,
  }
}
