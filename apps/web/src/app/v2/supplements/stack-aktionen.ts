'use server'

// Die Serveraktionen der Stack-Kachel — G-372.
//
// **Tom, 2026-09-08:** *„ist ja alles huebsch, aber was soll mir eine
// uebersicht bringen ohne funktionen? ich kann weder reinschauen, noch
// editieren, noch aktivieren."*
//
// `[cmd]` **Gemessen: EIN Knopf in `tab-spec.tsx`** — die Kachel
// zaehlte, mehr nicht.
//
// ## Warum Serveraktionen und keine API-Route
//
// `[read]` **Derselbe Weg wie bei den Einkaufslisten** (G-344):
// `app/api/` ist hier nicht die Bauform. **Die Schreibwege liegen in
// `lib/supplements/stack-write.ts`**, diese Datei reicht sie an die
// Oberflaeche durch und faengt die Fehler ab.
//
// `[cmd]` **`stack-write.ts` zieht `next/headers` mit** — ein
// Wert-Import aus einer Client-Komponente braechte HTTP 500 bei
// gruenem Typecheck (G-74, G-79, G-97). **Deshalb der dynamische
// Import im Rumpf.**

import { revalidatePath } from 'next/cache'

/** Was eine Aktion zurueckmeldet — nie eine Ausnahme nach aussen. */
export type StackAntwort = {
  ok: boolean
  fehler?: string
  /** Bei `uebernehmen`: die Kennung des neuen Stacks. */
  id?: string
  /** Bei `uebernehmen`: wie viele Posten kopiert wurden. */
  posten?: number
  /** Bei `aktivieren`: wie viele vorher aktive abgeschaltet wurden. */
  deaktiviert?: number
}

function satz(f: unknown): string {
  return f instanceof Error ? f.message : 'Unbekannter Fehler.'
}

/**
 * Einen Stack aktivieren.
 *
 * `[read]` **Der vorher aktive wird pausiert** — `SPEC_03`, Flow 2:
 * *„Dein bisheriger aktiver Stack wird pausiert."*
 */
export async function stackAktivieren(stackId: string): Promise<StackAntwort> {
  try {
    const { aktiviereStack } = await import(
      '../../../lib/supplements/stack-write')
    const r = await aktiviereStack(stackId)
    revalidatePath('/v2/supplements')
    return { ok: true, id: r.aktiviert, deaktiviert: r.deaktiviert }
  } catch (f) {
    return { ok: false, fehler: satz(f) }
  }
}

/**
 * Eine Vorlage uebernehmen — sie wird ein eigener Stack.
 *
 * `[read]` **Er wird NICHT automatisch aktiv** — das ist ein zweiter
 * Schritt, und die Spec trennt ihn auch (`SPEC_03`, Flow 2: erst
 * Schritt 4 uebernehmen, dann Schritt 6 aktivieren).
 */
export async function vorlageUebernehmen(templateId: string): Promise<StackAntwort> {
  try {
    const { uebernimmVorlage } = await import(
      '../../../lib/supplements/stack-write')
    const r = await uebernimmVorlage(templateId)
    revalidatePath('/v2/supplements')
    return { ok: true, id: r.id, posten: r.posten }
  } catch (f) {
    return { ok: false, fehler: satz(f) }
  }
}

/**
 * Einen eigenen Stack veroeffentlichen — C-423.
 *
 * `[cmd]` **`supplements.publish_stack_template(p_stack_id, p_reason)`**
 * gibt `template_id` und `candidate_id` zurueck. **Gebaut und
 * getestet; die Oberflaeche hat sie nur nie gerufen.**
 */
export async function stackVeroeffentlichen(
  stackId: string, grund: string,
): Promise<StackAntwort> {
  try {
    const { createSessionClient } = await import('@lumeos/shared/session')
    const { data, error } = await createSessionClient()
      .schema('supplements')
      .rpc('publish_stack_template', { p_stack_id: stackId, p_reason: grund })
    if (error) return { ok: false, fehler: error.message }
    const zeile = (data as unknown as Array<Record<string, unknown>>)?.[0]
    revalidatePath('/v2/supplements')
    return { ok: true, id: zeile ? String(zeile.template_id) : undefined }
  } catch (f) {
    return { ok: false, fehler: satz(f) }
  }
}

/**
 * Eine Veroeffentlichung zuruecknehmen — C-423.
 *
 * `[cmd]` **`supplements.withdraw_stack_template(p_stack_id)`.**
 */
export async function stackZurueckziehen(stackId: string): Promise<StackAntwort> {
  try {
    const { createSessionClient } = await import('@lumeos/shared/session')
    const { data, error } = await createSessionClient()
      .schema('supplements')
      .rpc('withdraw_stack_template', { p_stack_id: stackId })
    if (error) return { ok: false, fehler: error.message }
    revalidatePath('/v2/supplements')
    return { ok: true, id: data ? String(data) : undefined }
  } catch (f) {
    return { ok: false, fehler: satz(f) }
  }
}
