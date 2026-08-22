// Die Regel, ab wann Extended offen ist — ohne I/O (G-167).
//
// ── WARUM EINE EIGENE DATEI ─────────────────────────────────────
//
// `[cmd]` **`regeln-read.ts` importiert `@lumeos/shared/session`**, und
// das zieht `next/headers`. **Ein WERT-Import daraus in eine
// `'use client'`-Datei holt Server-I/O ins Browserbuendel** — der
// Typecheck bleibt gruen, und jede Seite antwortet mit HTTP 500.
// Gemessen in G-74, G-79, G-97 und noch einmal in A-30.
//
// `[read]` **Zwei Stellen brauchen diese Werte im Browser:** die
// Sperrkachel (`extended-gate.tsx`) und der Settings-Hinweis
// (`settings/formular.tsx`). Beide sind `'use client'`. Deshalb stehen
// die Konstanten hier, serverfrei — dasselbe Muster wie
// `lib/coach/rechte-modell.ts` neben `rechte-read.ts` (G-90).

/** Die vier Stufen, in aufsteigender Reihenfolge. */
export const GRADE = ['beginner', 'advanced', 'pro', 'elite'] as const
export type Grad = typeof GRADE[number]

/**
 * Ab welcher Stufe Extended offen ist — **ein Provisorium.**
 *
 * `[read]` **Tom, 2026-08-22:** *„das ist proforma fuer heute unter
 * entwicklung. lass einen text dahin schreiben dass spaeter die
 * definierten logiken eingebunden werden welches sein koennte modul
 * hinzukaufen, tierlevel, kombination — es ist noch nicht definiert,
 * also legen wir es jetzt auf pro und elite."*
 *
 * `[cmd]` **G-167 (2026-08-22): von `advanced` auf `pro`.** Vorher
 * stand hier die zweite von vier Stufen, aus C-113. Jetzt die dritte —
 * offen sind `pro` und `elite`.
 *
 * `[cmd]` **Kein Tarif-Gate.** `SUBSCRIPTION_GATES_ADR` verbietet fuer
 * V1 ausdruecklich *„Tier-Lock, Paywall, Feature-Flag basierend auf
 * Subscription"*. **Der Erfahrungsgrad ist Selbstauskunft** (C-71),
 * keine Bezahlschranke — `subscription_tier` wird nirgends gelesen.
 */
export const GRAD_FUER_EXTENDED: Grad = 'pro'

/**
 * Der Satz, der das Provisorium benennt (G-167).
 *
 * `[read]` **An EINER Stelle, damit er nicht driftet** — die Sperrkachel
 * und der Settings-Hinweis zeigen denselben Text. Zwei Formulierungen
 * fuer dieselbe Regel waeren zwei Regeln.
 *
 * `[read]` Er traegt drei Dinge: **vorlaeufig**, **noch nicht
 * entschieden**, **was zur Wahl steht**. Ohne sie wird ein Provisorium
 * in vier Wochen als Entscheidung gelesen — so sind die fuenf Banner
 * entstanden, die G-155 gefunden hat.
 */
export const EXTENDED_VORLAEUFIG =
  'Vorlaeufig entscheidet der Erfahrungsgrad. Wie der Zugang endgueltig '
  + 'geregelt wird, ist offen — moeglich sind ein zubuchbares Modul, eine '
  + 'Tarifstufe oder eine Kombination aus beidem. Bis dahin: Pro und Elite.'

/** Ob der gespeicherte Grad reicht. `null` (nicht angegeben) reicht nie. */
export function reichtDerGrad(grad: string | null): boolean {
  if (!grad) return false
  const i = (GRADE as readonly string[]).indexOf(grad)
  const noetig = (GRADE as readonly string[]).indexOf(GRAD_FUER_EXTENDED)
  return i >= 0 && i >= noetig
}
