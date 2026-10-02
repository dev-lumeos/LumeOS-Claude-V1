// Der Plansprung — G-579. **Server-frei.**
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// `[cmd]` **`nutrition.meal_plan_set_next_plan` hatte null Aufrufer**
// in `apps/web/src` und `packages/`, gezaehlt am 2026-10-02 — **nicht
// einmal einen Kommentar.** Gebaut in
// `058b_recipes_meal_plans.sql:1205`, seit G-535 auf `auth.uid()`.
//
// ══ DIE SIGNATUR, GEMESSEN STATT ANGENOMMEN ════════════════════════
//
// `[cmd]` **Aus `pg_proc` mit `prokind = 'f'`, 2026-10-02:**
//
//     nutrition.meal_plan_set_next_plan(p_plan_id uuid,
//                                       p_next_plan_id uuid)
//     RETURNS uuid · LANGUAGE plpgsql · SECURITY INVOKER
//
// ══ WAS DIE FUNKTION SELBST TUT ════════════════════════════════════
//
// `[read]` **Sie setzt BEIDE Spalten in einem Zug:**
// `lifecycle_type = 'sequence'` UND `next_plan_id`. **Ein Aufrufer,
// der vorher `lifecycle_type` schriebe, faellt am CHECK** —
// `meal_plans_sequence_target_check` verlangt beides zusammen
// (gemessen 2026-10-02: ein `PATCH` mit `sequence` allein ergibt
// `23514`).
//
// `[read]` **Sie setzt den vorigen Plan NICHT inaktiv** — die Frage
// aus A1. Sie verknuepft zwei Plaene, sie aktiviert keinen.
//
// `[cmd]` **Und sie prueft die Eigentuemerschaft zweimal:** Quellplan
// `FOR UPDATE`, Folgeplan ohne Sperre — beide mit `user_id =
// auth.uid()`, beide `P0002`, wenn sie fehlen.

import type { PlanKurz } from './plan-lesen'

/**
 * Die Plaene, die als Folgeplan in Frage kommen.
 *
 * `[cmd]` **Der Rumpf verbietet `p_plan_id = p_next_plan_id`**
 * (`22023`). `[read]` **Ein Plan kann nicht sein eigener Nachfolger
 * sein** — und ihn zur Wahl zu stellen waere ein Knopf, der
 * garantiert scheitert.
 *
 * `[read]` **Mehr schliesst diese Liste NICHT aus.** Ein Ringschluss
 * ueber zwei Plaene (A → B, B → A) ist in der Datenbank erlaubt —
 * **das hier ist kein Ort, an dem eine Regel erfunden wird, die das
 * Schema nicht kennt.** Siehe den Bericht zu G-579.
 */
export function moeglicheFolgeplaene(
  plan: { id: string }, alle: readonly PlanKurz[],
): PlanKurz[] {
  return alle.filter(p => p.id !== plan.id)
}

export type SprungFehler = { feld: string; text: string }

/**
 * Die Wahl pruefen, bevor sie die Datenbank erreicht.
 *
 * `[read]` **Dieselben drei Faelle, die der Rumpf wirft** — nur mit
 * einem Satz statt einer englischen Postgres-Meldung.
 */
export function pruefeSprung(
  planId: string | null | undefined,
  folgeId: string | null | undefined,
): SprungFehler[] {
  const f: SprungFehler[] = []
  if (!planId?.trim()) {
    f.push({ feld: 'plan', text: 'Kein Quellplan gewaehlt.' })
  }
  if (!folgeId?.trim()) {
    // `[cmd]` **`22023` im Rumpf** — und der CHECK verlangt es
    // ebenfalls. `[read]` **„geht in einen Folgeplan ueber" ohne
    // Folgeplan ist keine Angabe.**
    f.push({ feld: 'folgeplan', text: 'Welcher Plan folgt?' })
  }
  if (planId && folgeId && planId === folgeId) {
    f.push({
      feld: 'folgeplan',
      text: 'Ein Plan kann nicht auf sich selbst folgen.',
    })
  }
  return f
}

/**
 * Der Satz zum gesetzten Sprung.
 *
 * `[read]` **Er nennt BEIDE Plaene** — „gespeichert" allein sagt
 * nicht, was jetzt gilt.
 */
export function sprungSatz(von: string, nach: string): string {
  return `„${von}" geht am Ende in „${nach}" ueber.`
}
