// Die Wechselwirkungen eines Stacks (G-187).
//
// ══ WAS DIE TABELLE ENTHAELT — UND WAS NICHT ════════════════════════
//
// Der Auftrag beschreibt einen Reiter, der **die Paare ZWISCHEN den
// Substanzen im Stack** zeigt.
//
// `[cmd]` **Gemessen am 2026-08-25: das geht mit diesen Daten nicht.**
// `supplements.supplement_interactions` traegt 78 Zeilen, und
// **keine einzige ist eine Paarung zwischen zwei Katalogsubstanzen:**
//
//     partner_type = 'drug'      77
//     partner_type = 'alcohol'    1
//     Substanz gegen Substanz     0
//
// `[cmd]` **Treffende Paare bei den vorhandenen Staenden: 0** — bei
// `test-user@lumeos.local`, `dev@lumeos.app` und `tom.seed`
// gleichermassen. Jeder Stack hat genau ein Paar, und keines steht in
// der Tabelle.
//
// `[cmd]` **Drei `partner_label` enthalten zufaellig einen
// Substanznamen** (*„caffeine interaction debated"*, *„stop biotin
// before lab draws"*, *„separate from levothyroxine…"*) — **das sind
// Medikamentenhinweise und eine Laboranweisung, keine Paare.**
//
// ══ WAS STATTDESSEN GEZEIGT WIRD ════════════════════════════════════
//
// `[read]` **Die Tabelle beantwortet eine andere Frage: womit beisst
// sich diese Substanz.** Das ist eine Aussage ueber den Stack, auch
// ohne Paare — nur eben ueber **Medikamente**, und die Ueberschrift
// sagt das.
//
// `[read]` **Nichts erfunden:** wo keine Zeile liegt, steht keine
// Warnung. Eine ausgedachte Wechselwirkung saehe aus wie eine
// geprueufte.
import type { StackPosition } from './stack-read'

/** Eine Wechselwirkung einer Stack-Position mit etwas ausserhalb. */
export type StackWechselwirkung = {
  /** Die Position im Stack, die es betrifft. */
  position: string
  /** Womit — ein Medikament, Alkohol, ein Laborhinweis. */
  partner: string
  /** `drug` · `alcohol` — NICHT `supplement`, siehe Dateikopf. */
  art: string
  schwere: string | null
  hinweis: string | null
}

export type WechselwirkungsRoh = {
  supplement_id: string
  partner_type: string | null
  partner_label: string | null
  severity: string | null
  description_de: string | null
  description_en: string | null
}

function text(a: unknown, b: unknown): string | null {
  for (const v of [a, b]) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return null
}

/**
 * Die Wechselwirkungen der Positionen eines Stacks.
 *
 * `[read]` **Entdoppelt ueber Position und Partner** — dieselbe
 * Vorsichtsmassnahme wie bei den Laborwirkungen in G-186, wo 222
 * Zeilen nur 156 verschiedene waren.
 *
 * `[read]` **Die Beschreibung entfaellt, wenn sie woertlich der
 * Partner ist.** `[cmd]` Bei beiden Zeilen des test-user-Stacks ist
 * genau das der Fall: `description_en` = `partner_label`.
 */
export function wechselwirkungenFuer(
  positionen: StackPosition[],
  roh: WechselwirkungsRoh[],
): StackWechselwirkung[] {
  // Zuordnung Supplement-ID -> Positionsname. Positionen ohne
  // Katalogbezug (freie Eintraege) koennen nicht treffen.
  const nachId = new Map<string, string>()
  for (const p of positionen) {
    if (p.katalog?.id) nachId.set(p.katalog.id, p.name)
  }

  const gesehen = new Set<string>()
  const aus: StackWechselwirkung[] = []
  for (const r of roh) {
    const position = nachId.get(r.supplement_id)
    if (!position) continue
    const partner = typeof r.partner_label === 'string' && r.partner_label.trim()
      ? r.partner_label.trim() : null
    if (!partner) continue
    const schluessel = `${position}|${partner}`
    if (gesehen.has(schluessel)) continue
    gesehen.add(schluessel)

    const hinweis = text(r.description_de, r.description_en)
    aus.push({
      position,
      partner,
      art: typeof r.partner_type === 'string' && r.partner_type.trim()
        ? r.partner_type.trim() : 'unbekannt',
      schwere: typeof r.severity === 'string' && r.severity.trim()
        ? r.severity.trim() : null,
      hinweis: hinweis && hinweis.toLowerCase() !== partner.toLowerCase()
        ? hinweis : null,
    })
  }
  return aus.sort((a, b) => a.position.localeCompare(b.position, 'de'))
}
