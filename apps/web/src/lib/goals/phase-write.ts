// Schreib-I/O fuer die Goal-Phase — G-513.
//
// `[cmd]` **Fuenf Funktionen in der Datenbank, null Aufrufer.** Die
// Schreibwege stehen seit G-357 (`goal_phase_start`, `goal_phase_end`)
// und C-422 (`phase_transition_recommendation`,
// `phase_transition_respond`) — **die Oberflaeche hat sie nie
// gerufen.**
//
// `[read]` **Dieselbe Klasse wie C-511 in G-468:** ein Speicher ohne
// Leser — hier ein Schreibweg ohne Knopf.
//
// ## Warum ein Wechsel ZWEI Aufrufe braucht
//
// `[cmd]` **Gemessen am Rumpf** (`111_goals_ziele_phasen.sql:245-253`):
// `goal_phase_start` **wirft `23505`, wenn schon eine Phase laeuft** —
//
//     'goal_phase_start: zuerst die laufende Phase beenden'
//
// `[read]` **Es gibt also keinen Wechsel, nur ein Beenden und ein
// Beginnen.** `[read]` **Und `goal_phase_end` verlangt einen Grund**
// (`:288`, ERRCODE 22023) — **das ist keine Formalie, es ist die
// einzige Spur, warum eine Phase endete.**
//
// ## Warum kein eigener Wechsel-Aufruf
//
// `[read]` **Die Datenbank kennt keinen** — und zwei Aufrufe aus dem
// Browser sind nicht atomar. `[cmd]` **Bricht der zweite ab, steht der
// Nutzer OHNE Phase da**, nicht mit der alten. `[read]` **Das ist
// sichtbar und behebbar** (er startet neu); eine stille Halbwahrheit
// waere schlimmer. **Die Meldung sagt es ihm.**
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import {
  PHASENARTEN, pruefePhasenstart, pruefeRate, type Phasenstart,
} from './phase-regeln'

/** Die Codes, die der Aufrufer unterscheiden muss. */
export type PhaseFehlerCode =
  | 'NO_SESSION'
  | 'VALIDATION_FAILED'
  | 'PHASE_LAEUFT'
  | 'NOT_FOUND'
  | 'WRITE_FAILED'

export class PhaseFehler extends Error {
  constructor(
    public code: PhaseFehlerCode,
    message: string,
    public felder?: Array<{ feld: string; text: string }>,
  ) {
    super(message)
    this.name = 'PhaseFehler'
  }
}

function db() {
  return createSessionClient().schema('goals')
}

/**
 * Legt eine Phase MIT Rate an — der Weg, den `goal_phase_start`
 * nicht kann.
 *
 * `[read]` **Die Funktion traegt eine Sperre, die hier fehlen
 * wuerde:** *,,zuerst die laufende Phase beenden"* (`23505`).
 * `[cmd]` **Deshalb wird sie hier NACHGEBILDET** — erst fragen, ob
 * eine laeuft, dann schreiben.
 *
 * `[read]` **Das ist kein gleichwertiger Ersatz:** zwischen Frage
 * und Schreiben liegt ein Augenblick. `[read]` **Ein zweiter
 * Anlauf im selben Moment kaeme durch** — bei einer Eingabe, die
 * ein Mensch in einem Formular macht, ist das hinnehmbar, und die
 * Datenbank haelt die uebrigen Regeln weiterhin.
 *
 * `[cmd]` **Der saubere Weg ist ein Rate-Parameter an
 * `goal_phase_start`** — Befund fuer Codex.
 */
async function startMitRate(e: Phasenstart) {
  const userId = await sitzung()

  const { data: laufend, error: leseFehler } = await db()
    .from('goal_phases')
    .select('id')
    .eq('user_id', userId)
    .is('actual_end_date', null)
    .limit(1)

  if (leseFehler) return { data: null, error: leseFehler }
  if (laufend && laufend.length > 0) {
    // Dieselbe Meldung wie die Funktion, damit der Aufrufer nur
    // einen Fall kennt.
    return {
      data: null,
      error: { code: '23505', message: 'goal_phase_start: zuerst die laufende Phase beenden' },
    }
  }

  const { data, error } = await db()
    .from('goal_phases')
    .insert({
      user_id: userId,
      phase_type: e.phase_type,
      gueltig_ab: e.gueltig_ab,
      goal_id: e.goal_id ?? null,
      projected_end_date: e.projected_end_date ?? null,
      variant: e.variant ?? null,
      zielrate_pct_kg_woche: e.zielrate_pct_kg_woche,
    })
    .select('id')
    .maybeSingle()

  return { data: data?.id ?? null, error }
}

async function sitzung(): Promise<string> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new PhaseFehler('NO_SESSION', 'Keine angemeldete Sitzung.')
  return user.id
}

/**
 * Eine Phase beginnen.
 *
 * `[read]` **Die Pruefung liegt in `phase-regeln.ts`** — dieselbe
 * Trennung wie bei `ziel-regeln.ts`: diese Datei zieht
 * `next/headers`, die Regeln muessen auch im Browser lesbar sein.
 *
 * @returns die Kennung der neuen Phase
 */
export async function phaseStarten(e: Phasenstart): Promise<string> {
  await sitzung()

  const felder = [
    ...pruefePhasenstart(e),
    // G-519/A5: die Rate gegen beide CHECKs, VOR dem Schreiben.
    ...pruefeRate(e.phase_type, e.zielrate_pct_kg_woche),
  ]
  if (felder.length) {
    throw new PhaseFehler('VALIDATION_FAILED',
      'Die Eingabe ist unvollstaendig.', felder)
  }

  // `[read]` **`p_parameters` bleibt leer, solange die Schluessel
  // nicht entschieden sind.** `[cmd]` **G-511 macht
  // `calorie_surplus_kcal` tragend** — welcher Name gilt und woher
  // die Zahl kommt, entscheidet der Punkt bei Codex. **Ein hier
  // erfundener Schluessel waere eine Zahl, die niemand liest.**
  // ── G-519/A5: die Rate MUSS beim Anlegen mit ───────────────────
  //
  // `[cmd]` **Gemessen 2026-09-29:** `goal_phase_start` hat sechs
  // Parameter und KEINEN fuer die Rate:
  //
  //     p_phase_type, p_gueltig_ab, p_goal_id,
  //     p_projected_end_date, p_variant, p_parameters
  //
  // `[cmd]` **Der CHECK `goal_phases_zielrate_passt_zur_art`
  // verlangt sie aber fuer `fat_loss`, `lean_bulk` und `mini_cut`
  // NOT NULL.** `[cmd]` **Folge, dreimal belegt:** ein Aufruf von
  // `goal_phase_start('fat_loss', …)` **scheitert am CHECK** —
  // *,,new row … violates check constraint
  // goal_phases_zielrate_passt_zur_art"*.
  //
  // `[read]` **Diese drei Arten sind ueber die Funktion nicht
  // anlegbar.** `[cmd]` **Gemessen geht es per INSERT mit Rate**
  // (`INSERT 0 1`), und die Zeilenschutzregel `goal_phases_insert`
  // erlaubt es dem Eigentuemer.
  //
  // `[read]` **Deshalb der zweigeteilte Weg:** wo die Funktion
  // reicht, wird sie gerufen — sie traegt die Sperre gegen eine
  // zweite laufende Phase. **Wo sie den CHECK nicht erfuellen
  // kann, legt der Schreibweg die Zeile selbst an und prueft die
  // Sperre vorher.**
  //
  // `[cmd]` **Die fehlende Parameterliste ist ein Befund fuer
  // Codex** (G-519/A5) — **nicht etwas, das die Oberflaeche in
  // `supabase/` behebt.**
  const brauchtRate = e.zielrate_pct_kg_woche !== null
    && e.zielrate_pct_kg_woche !== undefined

  const { data, error } = brauchtRate
    ? await startMitRate(e)
    : await db().rpc('goal_phase_start', {
      p_phase_type: e.phase_type,
      p_gueltig_ab: e.gueltig_ab,
      p_goal_id: e.goal_id ?? null,
      p_projected_end_date: e.projected_end_date ?? null,
      p_variant: e.variant ?? null,
    })

  if (error) {
    // `[cmd]` **23505 ist hier KEIN doppelter Schluessel**, sondern
    // die ausdrueckliche Sperre aus dem Funktionsrumpf. `[read]` **Der
    // Nutzer soll wissen, was zu tun ist** — nicht „Fehler 23505".
    if (error.code === '23505' || /laufende Phase beenden/.test(error.message)) {
      throw new PhaseFehler('PHASE_LAEUFT',
        'Es laeuft bereits eine Phase. Beende sie zuerst — '
        + 'mit einem Grund, damit der Verlauf lesbar bleibt.')
    }
    if (error.code === '42501') {
      throw new PhaseFehler('NO_SESSION', error.message)
    }
    throw new PhaseFehler('WRITE_FAILED', error.message)
  }
  if (!data) {
    throw new PhaseFehler('WRITE_FAILED',
      'Die Phase wurde nicht angelegt — keine Kennung zurueck.')
  }
  return data as string
}

/**
 * Eine laufende Phase beenden.
 *
 * `[cmd]` **Der Grund ist Pflicht** — die Funktion weist einen leeren
 * mit `22023` ab. `[read]` **Hier wird er deshalb VOR dem Aufruf
 * geprueft**, damit die Meldung am Feld steht und nicht als
 * Datenbanktext erscheint.
 */
export async function phaseBeenden(
  phaseId: string, grund: string, ende?: string,
): Promise<string> {
  await sitzung()

  if (!grund.trim()) {
    throw new PhaseFehler('VALIDATION_FAILED',
      'Ein Grund ist erforderlich.',
      [{ feld: 'grund', text: 'Warum endet die Phase?' }])
  }

  const { data, error } = await db().rpc('goal_phase_end', {
    p_phase_id: phaseId,
    p_transition_reason: grund.trim(),
    ...(ende ? { p_actual_end_date: ende } : {}),
  })

  if (error) {
    // `[cmd]` **P0002 deckt ZWEI Faelle ab** (`:300`): die Phase
    // gehoert nicht dem Nutzer/laeuft nicht mehr — **oder das
    // Enddatum liegt vor dem Beginn.** `[read]` **Die Funktion
    // unterscheidet sie nicht, also darf die Meldung es auch
    // nicht.**
    if (error.code === 'P0002' || /nicht gefunden/.test(error.message)) {
      throw new PhaseFehler('NOT_FOUND',
        'Keine laufende Phase getroffen — entweder ist sie schon '
        + 'beendet, oder das Enddatum liegt vor ihrem Beginn.')
    }
    throw new PhaseFehler('WRITE_FAILED', error.message)
  }
  return data as string
}

/**
 * Auf einen Wechselvorschlag antworten.
 *
 * `[cmd]` **`phase_transition_respond` SCHREIBT NUR DIE ANTWORT**
 * (`422_…sql:53-60`) — **sie wechselt die Phase nicht.** `[read]`
 * **Auch `accepted` beendet nichts:** die Zeile landet in
 * `phase_transition_responses`, und der Wechsel bleibt zwei
 * getrennte Handgriffe.
 *
 * `[read]` **Deshalb sagt die Oberflaeche nach einem Ja nicht
 * *,,gewechselt"*** — sie fuehrt zum Beenden.
 */
export async function vorschlagBeantworten(
  phaseId: string, antwort: 'accepted' | 'rejected', grund?: string,
): Promise<string> {
  await sitzung()

  // `[cmd]` **Der CHECK erlaubt genau zwei Werte**
  // (`phase_transition_responses_response_check`). `[read]` **Die
  // Typangabe deckt den Compiler, nicht einen Aufruf von aussen.**
  if (antwort !== 'accepted' && antwort !== 'rejected') {
    throw new PhaseFehler('VALIDATION_FAILED',
      'Nur „accepted" oder „rejected".')
  }

  const { data, error } = await db().rpc('phase_transition_respond', {
    p_phase_id: phaseId,
    p_response: antwort,
    ...(grund?.trim() ? { p_reason: grund.trim() } : {}),
  })

  if (error) {
    if (/nicht gefunden/.test(error.message)) {
      throw new PhaseFehler('NOT_FOUND',
        'Diese Phase gehoert nicht zu dieser Sitzung.')
    }
    if (/Anmeldung erforderlich/.test(error.message)) {
      throw new PhaseFehler('NO_SESSION', error.message)
    }
    throw new PhaseFehler('WRITE_FAILED', error.message)
  }
  return data as string
}

export { PHASENARTEN }
export type { Phasenstart }
