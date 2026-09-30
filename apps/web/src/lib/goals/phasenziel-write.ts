// Ein Phasenziel anlegen — G-554/A2. **Ziel UND Phase, beides oder
// keines.**
//
// ══ WAS EIN PHASENZIEL IST ═════════════════════════════════════════
//
// **Tom, 2026-09-29:** *,,da wirst die einzelnen phasen als normale
// goals finden, und phase engine ist nur ein builder der diese einzel
// goals plant."*
//
// `[read]` **Ein Ziel mit einer Strategie und einem Zeitfenster.**
// „Lean Bulk bis September" ist ein `body_composition`-Ziel, an dem
// die Strategie `lean_bulk` haengt — von `gueltig_ab` bis
// `target_date`.
//
// ── Warum das hier steht und nicht im Modal ───────────────────────
//
// `[cmd]` **Der Vorgaenger machte es serverseitig in EINEM Aufruf**
// (`GoalSetupDialog.tsx:45` -> `useCreateNutritionGoal` -> ein
// `POST`). `[read]` **Zwei Aufrufe aus dem Browser heraus koennen
// zwischen den Schritten abbrechen** — und dann stuende ein Ziel
// ohne seine Phase.
//
// ── Beides oder keines ────────────────────────────────────────────
//
// `[cmd]` **Es gibt keine Transaktion ueber zwei PostgREST-Aufrufe.**
// `[read]` **Also wird der erste Schritt zurueckgenommen, wenn der
// zweite faellt** — das Ziel wird geloescht, und der Nutzer sieht
// den Phasenfehler, nicht ein halbes Ergebnis.
//
// `[read]` **G-79 gilt fuer beide Schreibvorgaenge:** die Zeilenzahl
// pruefen, nicht auf das Ausbleiben eines Fehlers vertrauen.

import { createSessionClient } from '@lumeos/shared/session'

import { zielAnlegen } from './schreiben'
import { phaseStarten, PhaseFehler } from './phase-write'
import { fehlerart } from './ladefehler'
import type { ZielNeu } from './ziel-regeln'
import type { Phasenart } from './phase-regeln'

export type PhasenzielNeu = {
  ziel: ZielNeu
  /**
   * Die Phase, die an dem Ziel haengt — oder `null` fuer ein Ziel
   * ohne Phase.
   *
   * `[read]` **Die Wahl ist freiwillig** (A1): ein
   * `body_composition`-Ziel ohne Strategie bleibt gueltig. **Es sagt
   * wohin, nicht wie.**
   */
  phase: {
    phase_type: Phasenart
    /**
     * `[cmd]` **`goal_phase_start` nimmt den Strategiecode heute
     * NICHT entgegen** — gemessen 2026-09-30 an
     * `pg_get_function_arguments`, die Signatur hat sieben
     * Parameter und keinen dafuer. **Das liegt bei Codex
     * (G-543/A5).**
     *
     * `[read]` **Er wird trotzdem mitgefuehrt**, damit am Tag der
     * Einspielung nur noch durchgereicht werden muss — und die
     * Oberflaeche sagt, dass er noch nicht ankommt.
     */
    strategie_code: string | null
    zielrate_pct_kg_woche?: number | null
  } | null
}

export type PhasenzielErgebnis =
  | {
      ok: true
      goal_id: string
      phase_id: string | null
      /**
       * `true`, wenn eine Strategie gewaehlt wurde, die nicht
       * gespeichert werden konnte — **die Oberflaeche muss das
       * sagen.**
       */
      strategieOffen: boolean
    }
  | {
      ok: false
      fehler: string
      /** `sitzung` schickt zur Anmeldung, `daten` nicht (G-553). */
      art: 'sitzung' | 'daten'
      /** Wurde ein angelegtes Ziel wieder entfernt? */
      zurueckgenommen: boolean
    }

/**
 * Nimmt ein eben angelegtes Ziel zurueck.
 *
 * `[read]` **Kein `deleted_at`**: die Zeile ist Sekunden alt und war
 * nie gueltig — ein weiches Loeschen hinterliesse ein Ziel, das der
 * Nutzer nie hatte. `[cmd]` **Der Zeilenschutz erlaubt das nur der
 * eigenen Sitzung**, und `.select('id')` zaehlt nach (G-79).
 */
async function zielZuruecknehmen(goalId: string): Promise<boolean> {
  const { data, error } = await createSessionClient()
    .schema('goals')
    .from('user_goals')
    .delete()
    .eq('id', goalId)
    .select('id')
  return !error && (data?.length ?? 0) > 0
}

/**
 * Legt ein Ziel an und haengt optional eine Phase daran.
 *
 * `[read]` **Die Fehlerart kommt aus `ladefehler.ts`** (G-553) —
 * **dieselbe Funktion, derselbe Vorbehalt:** im Zweifel Datenfehler.
 * `[read]` **Faellt das Anlegen an einem abgelaufenen Token, darf im
 * Modal nicht ,,Das Ziel konnte nicht angelegt werden" stehen** —
 * der Nutzer aendert dann seine Eingaben, und das Problem ist die
 * Sitzung.
 */
export async function phasenzielAnlegen(
  n: PhasenzielNeu,
): Promise<PhasenzielErgebnis> {
  // ── Schritt 1: das Ziel ─────────────────────────────────────────
  const z = await zielAnlegen(n.ziel)
  if (!z.ok) {
    return {
      ok: false, fehler: z.fehler, art: fehlerart(z.fehler),
      zurueckgenommen: false,
    }
  }
  if (!z.id) {
    return {
      ok: false,
      fehler: 'Das Ziel wurde angelegt, aber ohne Kennung — '
        + 'die Phase laesst sich nicht daran haengen.',
      art: 'daten', zurueckgenommen: false,
    }
  }

  // `[read]` **Ohne Phase ist hier Schluss** — ein Ziel ohne
  // Strategie ist gueltig.
  if (!n.phase) {
    return { ok: true, goal_id: z.id, phase_id: null, strategieOffen: false }
  }

  // ── Schritt 2: die Phase ────────────────────────────────────────
  try {
    const phaseId = await phaseStarten({
      phase_type: n.phase.phase_type,
      gueltig_ab: n.ziel.gueltig_ab,
      goal_id: z.id,
      projected_end_date: n.ziel.target_date ?? null,
      zielrate_pct_kg_woche: n.phase.zielrate_pct_kg_woche ?? null,
    })
    return {
      ok: true,
      goal_id: z.id,
      phase_id: phaseId,
      // `[cmd]` **Der Code wurde NICHT geschrieben** — die Signatur
      // nimmt ihn nicht. **Das wird gemeldet, nicht verschwiegen.**
      strategieOffen: n.phase.strategie_code !== null,
    }
  } catch (e) {
    // `[read]` **Die Phase faellt — also faellt auch das Ziel.**
    const zurueck = await zielZuruecknehmen(z.id)
    const text = e instanceof PhaseFehler ? e.message
      : e instanceof Error ? e.message : String(e)
    const art = e instanceof PhaseFehler && e.code === 'NO_SESSION'
      ? 'sitzung' as const
      : fehlerart(text)
    return {
      ok: false,
      fehler: zurueck
        ? text
        : `${text} — Achtung: das Ziel konnte nicht zurueckgenommen `
          + 'werden und steht ohne Phase.',
      art,
      zurueckgenommen: zurueck,
    }
  }
}
