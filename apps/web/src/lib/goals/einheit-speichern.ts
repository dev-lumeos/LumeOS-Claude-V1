// Die gewaehlte Einheit — G-565/A4. **Sie gehoert dem Nutzer.**
//
// ══ WO SIE LIEGT, UND WARUM NICHT IN DER PHASE ═════════════════════
//
// `[read]` **E-83: „Was der Nutzer zuletzt gewaehlt hat, gehoert an
// den Nutzer, nicht an die Phase — eine Einstellung, keine Spalte in
// `goal_phases`."**
//
// `[cmd]` **Den Ort gibt es schon:** `public.user_display_preferences`
// (C-161) — eine Zeile je Nutzer und Schluessel, `value jsonb`,
// **vier RLS-Regeln** (select, insert, update, delete), gemessen
// 2026-10-01. `[cmd]` **Live stehen dort zwei Zeilen unter
// `nutrition.nutrient_tree`** — das Muster ist in Gebrauch.
//
// `[read]` **Kein Befund fuer Codex, kein Schemawechsel** — die
// Einstellung passt in die vorhandene Ablage, und ihr Schluessel ist
// mit `goals.` abgegrenzt wie der der Naehrstoffansicht.
//
// `[read]` **Dieselbe Form wie `ansicht-speichern.ts`** (G-122) —
// ein zweites Muster fuer dieselbe Sache waere eine zweite Wahrheit.
//
// **Laeuft ausschliesslich serverseitig.**
import { createSessionClient } from '@lumeos/shared/session'

import { EINHEITEN, type Rateneinheit } from './zielrate-einheit'

/** `[read]` **Mit Modulpraefix**, wie `nutrition.nutrient_tree`. */
export const EINHEIT_SCHLUESSEL = 'goals.zielrate_einheit'

/**
 * Was gilt, solange der Nutzer nichts gewaehlt hat.
 *
 * `[cmd]` **Prozent** — das ist die gespeicherte Groesse
 * (`zielrate_pct_kg_woche`), und sie gilt ohne Gewicht. `[read]`
 * **Kilokalorien brauchen ein Gewicht**, und das fehlt bei einem
 * neuen Nutzer.
 */
export const EINHEIT_VORGABE: Rateneinheit = 'prozent'

function alsEinheit(v: unknown): Rateneinheit | null {
  return typeof v === 'string' && (EINHEITEN as readonly string[]).includes(v)
    ? v as Rateneinheit
    : null
}

/**
 * Die gewaehlte Einheit des angemeldeten Nutzers.
 *
 * `[read]` **Ein Lesefehler ist keine Wahl** — er faellt auf die
 * Vorgabe, statt die Seite zu verhindern. **Die Einheit ist eine
 * Darstellung, kein Datum.**
 */
export async function ladeEinheit(): Promise<Rateneinheit> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return EINHEIT_VORGABE

  const { data, error } = await client
    .from('user_display_preferences')
    .select('value')
    .eq('user_id', user.id)
    .eq('preference_key', EINHEIT_SCHLUESSEL)
    .maybeSingle()
  if (error || !data) return EINHEIT_VORGABE

  const v = (data as { value?: unknown }).value
  // `[read]` **`{ einheit: 'kcal' }`** — ein Objekt, kein nackter
  // Text: so laesst sich spaeter etwas danebenstellen, ohne den
  // Schluessel zu wechseln.
  const roh = typeof v === 'object' && v !== null
    ? (v as Record<string, unknown>).einheit
    : null
  return alsEinheit(roh) ?? EINHEIT_VORGABE
}

export class EinheitWriteError extends Error {
  constructor(
    public code: 'UNAUTHENTICATED' | 'WRITE_FAILED',
    message: string,
  ) {
    super(message)
    this.name = 'EinheitWriteError'
  }
}

/**
 * Die Wahl des Nutzers festhalten.
 *
 * `[read]` **Upsert auf `(user_id, preference_key)`** — eine Zeile je
 * Nutzer, wie bei der Naehrstoffansicht.
 */
export async function speichereEinheit(einheit: Rateneinheit): Promise<void> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new EinheitWriteError('UNAUTHENTICATED', 'Keine Sitzung.')

  const { data, error } = await client
    .from('user_display_preferences')
    .upsert(
      {
        user_id: user.id,
        preference_key: EINHEIT_SCHLUESSEL,
        value: { einheit },
      },
      { onConflict: 'user_id,preference_key' },
    )
    // `[read]` **G-79: zaehlen, nicht auf das Ausbleiben eines
    // Fehlers vertrauen** — ein vom Zeilenschutz gefiltertes Upsert
    // kaeme sonst als Erfolg zurueck.
    .select('preference_key')

  if (error) throw new EinheitWriteError('WRITE_FAILED', error.message)
  if (!data || data.length === 0) {
    throw new EinheitWriteError('WRITE_FAILED',
      'Die Einstellung wurde nicht gespeichert — gehoert sie dieser Sitzung?')
  }
}
