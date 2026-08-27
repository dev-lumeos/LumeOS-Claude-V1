/**
 * Welche Farbe eine Blockueberschrift traegt — G-194.
 *
 * ══ DIE REGEL ══════════════════════════════════════════════════════
 *
 * **Tom, 2026-08-26:** *„Die Farbe muss etwas BEDEUTEN, sonst ist es
 * Dekoration."*
 *
 * `[read]` **Vier Bedeutungen, vier Farben — und keine fuenfte.** Die
 * Frage ist nie *„welche Farbe passt"*, sondern *„welche der vier
 * Aussagen macht dieser Block".*
 *
 *   `gefahr`   Was schaden kann.            → `--warn`
 *   `wirkung`  Was der Stoff bewirkt.       → `--acc`
 *   `pruefen`  Was gemessen oder geprueft
 *              gehoert, bevor man vertraut. → `--acc-suppl`
 *   `entwarnung` Dass etwas NICHT zutrifft. → `--pos`
 *
 * `[read]` **`pruefen` ist die Gruppe, nach der der Auftrag fragt.**
 * *„Ueberwachung"* ist keine Warnung — Blutwerte zu kontrollieren
 * schadet niemandem. *„Reinheit"* ist keine Wirkung — sie sagt, dass
 * dem Inhalt nicht zu trauen ist. **Beide sagen dasselbe: pruef das,
 * bevor du dich darauf verlaesst.** Deshalb eine Gruppe, nicht zwei.
 *
 * `[read]` **`entwarnung` entstand am WADA-Block**, und der war der
 * Pruefstein: *verboten* ist eine Warnung, *erlaubt* ist das
 * Gegenteil — **eine Entwarnung in Warnfarbe waere falsch**, und in
 * Akzentfarbe waere sie eine Wirkungsaussage. `[cmd]` Sie kostet
 * keine fuenfte Farbe: `--pos` ist im Bestand und wird bereits fuer
 * *„Im Stack"* benutzt.
 *
 * ══ WAS OHNE FARBE BLEIBT ══════════════════════════════════════════
 *
 * `[read]` **Die Mehrheit.** *„Wann und wie"*, *„Fragen"*, *„Weitere
 * Angaben"*, *„Aus der Community"* sind Gliederung, keine Aussage —
 * sie bekommen die normale Ueberschriftenfarbe. **Vier Farben sind
 * eine Ordnung, sieben ein Regenbogen**, und eine Farbe, die jeder
 * Block traegt, unterscheidet nichts mehr.
 *
 * ══ DER KONTRAST IST GEMESSEN, NICHT ANGENOMMEN ════════════════════
 *
 * `[cmd]` **Gemessen 2026-08-26 im Browser** (Canvas → sRGB, WCAG-2),
 * gegen die vier Gruende, auf denen Ueberschriften stehen:
 *
 *                    dunkel        hell
 *     --warn         9.42–11.06    4.56–4.89
 *     --acc          8.35–9.81     6.05–6.49
 *     --acc-suppl    7.46–8.76     4.88–5.23
 *     --pos          8.78–10.31    4.83–5.18
 *
 * **Alle vier ueber 4.5:1 in beiden Themen.** `[cmd]` **`--fg-dim`
 * faellt durch** (2.12 dunkel / 2.88 hell) — es taugt fuer
 * Beiwerk, nicht fuer eine Ueberschrift.
 *
 * `[read]` **4.5 gilt, nicht 3.0:** die Ueberschriften sind 10 px und
 * in Grossbuchstaben — das ist kein Grosstext im Sinne der Norm.
 */

/** Die vier Bedeutungen. Mehr gibt es nicht. */
export type BlockTon = 'gefahr' | 'wirkung' | 'pruefen' | 'entwarnung'

/**
 * Welcher Block welche Aussage macht.
 *
 * `[read]` **Die Zuordnung steht an EINER Stelle**, damit „Reinheit"
 * im Ueberblick und „Nicht im Blut nachweisbar" in der Sicherheit
 * nicht auseinanderlaufen — sie sagen dasselbe und bekommen deshalb
 * dieselbe Farbe.
 */
export const BLOCK_TON: Record<string, BlockTon> = {
  // ── Was schaden kann ──────────────────────────────────────────
  'Was nicht zurückkommt': 'gefahr',
  'Bei zu viel': 'gefahr',
  'Wer es nicht nehmen sollte': 'gefahr',
  'Berichtete Nebenwirkungen': 'gefahr',
  'Was Kombinationen kosten': 'gefahr',
  // G-196: **Tom:** *„Eine Wechselwirkung ist ein Risiko, kein
  // Hinweis."* `[cmd]` Der Block traegt seit G-187
  // Medikamenten-Interaktionen — Blutverduennung, Schilddruese.
  //
  // `[cmd]` **G-188 hat die Ueberschrift praezisiert:** aus
  // *„Wechselwirkung und Labor"* wurde *„Wechselwirkung mit
  // Medikamenten und Labor"*, weil die alte Paare zwischen
  // Supplements versprach, die es nicht gibt (0 von 78).
  // `[read]` **Der Ton bleibt `gefahr`** — die Sache hat sich nicht
  // geaendert, nur ihr Name.
  'Wechselwirkung mit Medikamenten und Labor': 'gefahr',

  // ── Was der Stoff bewirkt ─────────────────────────────────────
  'Wie es wirkt': 'wirkung',
  'Was es bringt': 'wirkung',
  'Im Labor': 'wirkung',

  // ── Was geprueft gehoert, bevor man vertraut ──────────────────
  'Überwachung': 'pruefen',
  'Reinheit': 'pruefen',
  'Produktqualitaet': 'pruefen',
  'Nicht im Blut nachweisbar': 'pruefen',
  'Rechtslage': 'pruefen',
  'Zu wenig': 'pruefen',
  // G-196: „Wann und wie" steht in der Liste des Auftrags unter
  // `pruefen`. `[read]` Das traegt: der Text sagt, WORAUF beim
  // Einnehmen zu achten ist — nuechtern, mit Fett, Abstand zu
  // anderen Mitteln. Keine Wirkungsaussage, keine Warnung.
  'Wann und wie': 'pruefen',

  // ── Dass etwas NICHT zutrifft ─────────────────────────────────
  'Mythen': 'entwarnung',

  // ══ WAS BEWUSST GRAU BLEIBT — G-196 ═══════════════════════════
  //
  // `[read]` **„Fragen" bekommt keine der vier**, und das ist eine
  // Entscheidung, kein Vergessen. `[cmd]` Gemessen an den Fragen im
  // Bestand: *„Ist Tresiba in der Schwangerschaft untersucht?"*
  // (Gefahr) · *„Wie schnell wirkt Turinabol?"* (Wirkung) · *„Wie
  // lange ist Turinabol im Dopingtest nachweisbar?"* (Pruefen).
  //
  // **Der Block traegt alle vier Bedeutungen gleichzeitig.** Eine
  // Farbe darueber waere fuer drei Viertel des Inhalts falsch — und
  // die Regel lautet, dass die Farbe etwas BEDEUTET. Wo die
  // Ueberschrift keine gemeinsame Aussage hat, hat sie keine Farbe.
  //
  // `[read]` **Dasselbe bei „Weitere Angaben"** — Obergrenze,
  // Einnahme, Mit Essen stehen dort nebeneinander; der Kasten ist
  // ein Sammelplatz, keine Aussage. Und bei „Aus der Community",
  // „Formen", „Szene-Begriffe".
  //
  // **Sie stehen hier NICHT eingetragen** — `tonFuer` gibt dann
  // `null`, und das ist das gewuenschte Ergebnis.
}

/** Das CSS-Token je Bedeutung — nur vorhandene, keine neuen Werte. */
export const TON_TOKEN: Record<BlockTon, string> = {
  gefahr: 'var(--warn)',
  wirkung: 'var(--acc)',
  pruefen: 'var(--acc-suppl)',
  entwarnung: 'var(--pos)',
}

/**
 * Die Bedeutung einer Ueberschrift — oder keine.
 *
 * `[read]` **Unbekannt heisst farblos, nicht geraten.** Ein neuer
 * Block bekommt erst dann eine Farbe, wenn jemand entschieden hat,
 * welche der vier Aussagen er macht.
 */
export function tonFuer(titel: string | null | undefined): BlockTon | null {
  if (typeof titel !== 'string') return null
  return BLOCK_TON[titel.trim()] ?? null
}
