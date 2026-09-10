// Wohin ein Klick fuehrt — G-409.
//
// **Tom, 2026-09-08:** *„dann hat es diverse klicks die in
// `?bereich=` zurueckspringen. es kann nicht so schwer sein, ein
// scheiss mockup zu duplizieren."*
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// `[cmd]` **Der Draft hat eine eigene Schale, aber der INHALT kommt
// aus den alten Reitern** — und die schrieben ihre Ziele fest:
// `/?bereich=klienten`, `/athlet/<id>`, `/?tab=alerts`.
//
// `[read]` **Wer im Draft auf einen Athleten klickte, landete in
// der alten Fassung** — heller Hintergrund, keine Schale, keine
// Kontextspalte.
//
// ══ WARUM EIN HELFER UND KEINE ZWEITE FASSUNG ══════════════════════
//
// `[read]` **Die Reiter zweimal zu bauen hiesse, sie zweimal zu
// pflegen** — und die zweite Fassung altert ab dem ersten Tag.
//
// `[cmd]` **Stattdessen fragt jeder Reiter hier nach dem Ziel.**
// `[read]` **Ohne `draft` kommt heraus, was vorher dastand** —
// `?bereich=` ist Zeichen fuer Zeichen unveraendert.

/**
 * In welcher Fassung ein Reiter laeuft.
 *
 * `null`  — die bestehende Fassung (`?bereich=`), unveraendert
 * sonst   — die Draft-Fassung, mit Bereich und Unterpunkt
 */
export type DraftLage = { bereich: string, kind: string | null } | null

/**
 * Die Zuordnung alter Reiter zu Draft-Bereich und -Unterpunkt.
 *
 * `[cmd]` **Abgelesen aus `portal-draft-nav.ts`** — dort steht,
 * welcher Unterpunkt zu welchem Bereich gehoert.
 *
 * `[read]` **Nur die zehn angebundenen stehen hier** — ein Reiter,
 * den es im Draft nicht gibt, kann auch nicht angesprungen werden.
 */
const REITER_ZU_DRAFT: Record<string, [string, string]> = {
  athletes: ['athletes', 'athletes'],
  klienten: ['athletes', 'athletes'],
  record: ['athletes', 'record'],
  onboard: ['athletes', 'onboard'],
  autonomy: ['athletes', 'autonomy'],
  consent: ['athletes', 'consent'],
  messages: ['checkins', 'messages'],
  workflows: ['checkins', 'workflows'],
  checkins: ['checkins', 'workflows'],
  alerts: ['alerts', 'alerts'],
  intervene: ['analytics', 'intervene'],
}

/** `?draft=…&kind=…` aus Bereich und Unterpunkt. */
function draftAdresse(bereich: string, kind: string | null, rest = ''): string {
  const k = kind ? `&kind=${kind}` : ''
  return `/?draft=${bereich}${k}${rest}`
}

/**
 * Das Ziel eines Reiter-Verweises.
 *
 * `[read]` **`reiter` ist der Name, den die alte Fassung benutzt** —
 * `klienten`, `alerts`, `workflows`. **Der Helfer uebersetzt ihn.**
 *
 * @param rest Weitere Parameter, mit `&` beginnend (`&stand=aktiv`).
 */
export function wegZuReiter(
  lage: DraftLage, reiter: string, rest = '',
): string {
  if (!lage) return `/?bereich=${reiter}${rest}`
  const treffer = REITER_ZU_DRAFT[reiter]
  // `[read]` **Kennt der Draft den Reiter nicht, bleibt man wo man
  // ist** — ein Sprung in die alte Fassung waere genau der Fehler,
  // den dieser Auftrag behebt.
  if (!treffer) return draftAdresse(lage.bereich, lage.kind, rest)
  return draftAdresse(treffer[0], treffer[1], rest)
}

/**
 * Das Ziel eines Filterknopfs — derselbe Reiter, anderer Stand.
 *
 * `[read]` **Der Filter darf den Unterpunkt NICHT wechseln**, sonst
 * springt „Aktiv" aus der Akte zurueck in die Liste.
 */
export function wegZuFilter(
  lage: DraftLage, reiter: string, rest: string,
): string {
  if (!lage) return `/?bereich=${reiter}${rest}`
  return draftAdresse(lage.bereich, lage.kind, rest)
}

/**
 * Das Ziel einer Athletenzeile.
 *
 * `[cmd]` **Im Draft: `/athlet/<id>?draft=1`** — dieselbe Adresse,
 * aber die Seite weiss, in welcher Schale sie stecken soll (A2).
 */
export function wegZuAthlet(lage: DraftLage, id: string): string {
  return lage ? `/athlet/${id}?draft=1` : `/athlet/${id}`
}

/** Der Weg zurueck aus der Akte. */
export function wegZurueck(lage: DraftLage): string {
  return lage ? draftAdresse('athletes', 'athletes') : '/?bereich=klienten'
}

/**
 * Die Lage aus den Adressparametern.
 *
 * `[read]` **Ein Ort, an dem entschieden wird, ob der Draft laeuft**
 * — sonst prueft jede Seite es anders.
 */
export function lageAus(
  p: { draft?: string, kind?: string },
): DraftLage {
  if (p.draft === undefined) return null
  return { bereich: p.draft || 'overview', kind: p.kind ?? null }
}
