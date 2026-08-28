// ════════════════════════════════════════════════════════════════════
// DIE FEINSTUFIGE BEWERTUNG — G-218
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30. Dadurch ohne Datenbank testbar.
//
// **Entscheidung Tom, 2026-08-28:** *,,ja klar stellen wir critical
// dar, wir brauchen eine feinstufige bewertung"*.
//
// ══ WIE DIE ZWEI ACHSEN ZUSAMMENHAENGEN ═════════════════════════════
//
// **Auftrag: *„Miss zuerst, wie die Achsen zusammenhaengen. Wenn jede
// `critical` ohnehin `physician_referral` traegt, ist eine redundant;
// wenn sie sich kreuzen, braucht die Anzeige beide."***
//
// `[cmd]` **Gemessen am 2026-08-28 ueber alle 64 Regeln — die Antwort
// ist BEIDES, je nach Stufe:**
//
//     severity   Regeln   Handlungsarten darin
//     critical       10   physician_referral 10                    <- eine
//     high           18   physician_referral 17, lab_context 1
//     medium         17   physician_referral 6, lab_context 6,
//                         warning 3, schedule_adjustment 1,
//                         verify_prescription 1                    <- fuenf
//     low            19   information 15, general_information 2,
//                         lab_context 1, schedule_adjustment 1
//
// `[read]` **Innerhalb von `critical` ist die zweite Achse
// redundant** — 10 von 10 tragen `physician_referral`. **Wer nur
// `critical` anzeigt, braucht sie nicht.**
//
// `[read]` **Ueber den ganzen Katalog ist sie es nicht.**
// `physician_referral` steht bei **drei** Schweregraden (17 `high`,
// 10 `critical`, 6 `medium`), und `medium` allein zerfaellt in fuenf
// Handlungsarten. `[cmd]` **12 der 28 rechnerisch moeglichen
// Kombinationen kommen vor.**
//
// `[read]` **Daraus folgt die Gestaltung:** die Schwere ordnet und
// faerbt, **die Handlungsart sagt, was zu tun ist** — und sie darf
// nicht neben acht gleich aussehenden Kontextmarken untergehen.
// **Genau das war der Befund:** `[cmd]` auf dem Nachweisbild trug die
// `critical`-Karte die Marke *,,aerztlich abklaeren"* in derselben
// grauen Farbe wie `CYP2D6_substrate`.
//
// ══ WAS SICH NICHT AENDERT ══════════════════════════════════════════
//
// `[read]` **Keine Regel wird angefasst, keine `severity` angepasst.**
// Die Anzeige folgt dem Bestand. Diese Datei bildet ab, sie bewertet
// nicht neu.

/** `[cmd]` Aus dem Katalog gelesen, nicht erfunden. */
export const STUFEN = ['critical', 'high', 'medium', 'low'] as const
export type Stufe = (typeof STUFEN)[number]

/**
 * Die Rangfolge. `[read]` Unbekanntes faellt ans Ende, nicht an den
 * Anfang — eine unbekannte Stufe ist kein Notfall.
 */
export const STUFEN_RANG: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
}

/**
 * Die Farbe je Stufe.
 *
 * `[cmd]` **Der Befund, gemessen am 2026-08-28:** `critical` und
 * `high` rendern beide in `oklch(0.50 0.16 22)` — **dasselbe
 * `--neg`.** Auf dem ersten `critical`-Bild, das es je gab, war die
 * Stufe **nur an der Beschriftung** zu erkennen, nicht an der Farbe.
 *
 * `[read]` **`critical` bekommt deshalb eine eigene Behandlung**, und
 * zwar nicht durch einen weiteren Rotton — zwei benachbarte Rots
 * unterscheidet niemand. **Es bekommt Flaeche:** Rahmen und
 * Hintergrund, siehe `istHervorgehoben`.
 */
export const STUFEN_FARBE: Record<string, string> = {
  critical: 'var(--neg)',
  high: 'var(--neg)',
  medium: 'var(--warn)',
  low: 'var(--acc-suppl)',
}

/** Die Stufe im Klartext — `critical` ist kein deutsches Wort. */
export const STUFEN_TEXT: Record<string, string> = {
  critical: 'kritisch',
  high: 'hoch',
  medium: 'mittel',
  low: 'gering',
}

/**
 * Ob die Karte als Ganzes hervorgehoben wird.
 *
 * `[read]` **Nur `critical`.** `[cmd]` Bei 10 von 64 Regeln ist das
 * knapp ein Sechstel des Katalogs — **wuerde `high` mitgenommen,
 * waeren es 28 von 64**, und eine Hervorhebung, die fast die Haelfte
 * betrifft, hebt nichts mehr hervor.
 */
export function istHervorgehoben(stufe: string | null): boolean {
  return stufe === 'critical'
}

/** `[cmd]` Alle sieben aus dem Katalog, keine erfunden. */
export const HANDLUNG_TEXT: Record<string, string> = {
  physician_referral: 'ärztlich abklären',
  information: 'zur Kenntnis',
  lab_context: 'beim Labortermin nennen',
  warning: 'Hinweis',
  schedule_adjustment: 'zeitlicher Abstand',
  general_information: 'allgemeine Information',
  verify_prescription: 'Verordnung prüfen',
}

/**
 * Ob die Handlungsart aus dem Grau heraussticht.
 *
 * `[read]` **`physician_referral` ist die einzige, die jemanden aus
 * der App hinausschickt.** `[cmd]` Sie steht bei 33 von 64 Regeln —
 * **die Haelfte** —, und zwar bei `critical`, `high` UND `medium`.
 * `[read]` **Deshalb haengt ihre Auszeichnung an der Handlung, nicht
 * an der Schwere:** eine `medium`-Regel, die zum Arzt schickt, sagt
 * etwas anderes als eine `medium`-Regel, die ein Einnahmefenster
 * verschiebt — **und genau das war Toms Punkt.**
 */
export function istArztsache(handlung: string | null): boolean {
  return handlung === 'physician_referral'
}

export type Regelmarke = {
  stufe: string | null
  handlung: string | null
}

/**
 * Sortiert nach Schwere, bei Gleichstand nach Kennung.
 *
 * `[read]` Die Kennung als zweites Merkmal, **damit die Reihenfolge
 * zwischen zwei Aufrufen nicht springt** — das saehe aus wie ein
 * Fehler (uebernommen aus G-187).
 */
export function nachStufe<T extends { severity?: string | null; rule_id: string }>(
  regeln: readonly T[],
): T[] {
  return [...regeln].sort((a, b) => {
    const ra = STUFEN_RANG[a.severity ?? ''] ?? 9
    const rb = STUFEN_RANG[b.severity ?? ''] ?? 9
    return ra !== rb ? ra - rb : a.rule_id.localeCompare(b.rule_id)
  })
}

/**
 * Die Verteilung je Stufe, fuer die Kopfzeile.
 *
 * `[read]` **Gezaehlt wird, was zutrifft** — nicht der Katalog. Eine
 * Kopfzeile, die „10 kritisch" zeigt, obwohl keine davon feuert,
 * waere eine Falschmeldung.
 */
export function verteilung(
  regeln: ReadonlyArray<{ severity?: string | null }>,
): Array<{ stufe: Stufe; anzahl: number }> {
  return STUFEN
    .map(s => ({ stufe: s, anzahl: regeln.filter(r => r.severity === s).length }))
    .filter(x => x.anzahl > 0)
}
