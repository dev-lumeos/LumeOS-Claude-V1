// ════════════════════════════════════════════════════════════════════
// DIE EINE SCHREIBSTELLE FUER `goals.body_circumferences` — G-577
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Die Datenbankfunktion ist GEBAUT und geprueft** —
// `goals.body_circumference_write`, seit G-535 auf `auth.uid()`.
// **Sie wird hier gerufen, nicht geaendert** (`supabase/` gehoert
// Codex).
//
// ══ DIE SIGNATUR, GEMESSEN ══════════════════════════════════════════
//
// `[cmd]` **Aus `pg_proc` mit `prokind = 'f'`, 2026-10-01** — nicht
// aus einer Abschrift:
//
//     goals.body_circumference_write(
//       p_measurement_date date, p_measurement_time time,
//       p_measurement_source text DEFAULT 'manual',
//       p_source_detail text DEFAULT NULL, p_notes text DEFAULT NULL,
//       p_neck_cm … p_calf_right_cm numeric DEFAULT NULL)  -- 13 Stellen
//     RETURNS uuid · LANGUAGE plpgsql · SECURITY INVOKER
//
// `[read]` **18 Parameter, EIN Satz** — nicht eine Zeile je Stelle.
// Die Tabelle fuehrt alle dreizehn Umfaenge als Spalten derselben
// Zeile, und die Funktion schreibt genau eine.
//
// `[cmd]` **`SECURITY INVOKER`** — die Zeilensicherheit der Nutzerin
// gilt, und `user_id` kommt aus `auth.uid()`. **Kein
// Service-Client**, dasselbe Muster wie `koerpermass-write.ts`
// (G-122).
//
// ══ WAS DIE FUNKTION SELBST ABFAENGT ════════════════════════════════
//
// `[cmd]` **Ohne Sitzung wirft sie `42501`** mit dem Satz
// *„body_circumference_write: Anmeldung erforderlich"*
// (`535_auth_uid_legacy_readers.sql:109`).
//
// `[read]` **Alles Uebrige kommt aus den Constraints** — und die
// Meldungen dafuer stehen in `umfang-rechnung.ts`, VOR dem Aufruf.
//
// ══ G-577/A2: FACHLICH IST DATENFEHLER, NICHT SITZUNG ═══════════════
//
// `[cmd]` **`fehlerart()` aus `lib/fehler/ladefehler.ts`** — seit
// G-555 querliegend und mit Modulnamen. `[read]` **Ein fremder
// Nutzer oder eine fehlende Pflichtangabe ist ein DATENfehler:** eine
// Neuanmeldung aendert daran nichts, und der Nutzer wuerde auf die
// falsche Suche geschickt (der Befund aus G-553).

import { createSessionClient } from '@lumeos/shared/session'

import { fehlerart } from '../fehler/ladefehler'
import {
  pruefeUmfang, alsParameter,
  type UmfangEingabe, type Feldfehler,
} from './umfang-rechnung'

export class UmfangFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'VALIDATION_FAILED' | 'KONFLIKT' | 'WRITE_FAILED',
    message: string,
    public felder?: Feldfehler[],
  ) {
    super(message)
    this.name = 'UmfangFehler'
  }
}

function db() {
  return createSessionClient().schema('goals')
}

/**
 * Einen Umfangssatz schreiben.
 *
 * `[read]` **Die Pruefung kommt zuerst** — ein Constraint-Fehler
 * waere eine englische Postgres-Meldung ohne Feldbezug.
 *
 * `[cmd]` **G-79 gilt auch hier:** die Funktion gibt die neue
 * Kennung zurueck. **Kommt keine, war es kein Schreibvorgang** —
 * auch wenn kein Fehler gemeldet wurde.
 *
 * @returns Die `id` der geschriebenen Zeile.
 */
export async function umfangAnlegen(e: UmfangEingabe): Promise<string> {
  const felder = pruefeUmfang(e)
  if (felder.length) {
    throw new UmfangFehler('VALIDATION_FAILED',
      'Die Eingabe ist unvollstaendig.', felder)
  }

  const { data, error } = await db()
    .rpc('body_circumference_write', alsParameter(e))

  if (error) {
    // `[cmd]` **`42501` wirft die Funktion selbst**, wenn
    // `auth.uid()` leer ist. `[read]` **Das ist der EINZIGE
    // Sitzungsfall hier** — alles andere ist fachlich.
    if (error.code === '42501' || fehlerart(error.message, error.code) === 'sitzung') {
      throw new UmfangFehler('NO_SESSION',
        'Die Sitzung ist nicht mehr gueltig. Melde dich neu an — '
        + 'deine Daten sind unveraendert.')
    }
    // `[cmd]` **`23505` ist der Eindeutigkeitsschluessel**
    // `(user_id, measurement_date, measurement_time)`. `[read]`
    // **Zwei Messungen am selben Tag sind erlaubt** — zwei zur
    // selben MINUTE nicht. **Der Satz sagt, was zu tun ist.**
    if (error.code === '23505') {
      throw new UmfangFehler('KONFLIKT',
        'Zu dieser Uhrzeit steht an diesem Tag schon ein Satz. '
        + 'Aendere die Uhrzeit — mehrere Messungen am selben Tag '
        + 'sind erlaubt.',
        [{ feld: 'measurement_time', text: 'Diese Uhrzeit ist belegt.' }])
    }
    // `[cmd]` **`23514` ist ein CHECK** — die Pruefung davor sollte
    // ihn abgefangen haben. `[read]` **Kommt er trotzdem, ist die
    // Pruefung unvollstaendig**, und der Satz sagt das statt die
    // Postgres-Meldung durchzureichen.
    if (error.code === '23514') {
      throw new UmfangFehler('VALIDATION_FAILED',
        'Ein Wert liegt ausserhalb des erlaubten Bereichs.',
        [{ feld: 'werte', text: error.message }])
    }
    throw new UmfangFehler('WRITE_FAILED', error.message)
  }

  if (!data) {
    throw new UmfangFehler('WRITE_FAILED',
      'Der Umfangssatz wurde nicht geschrieben — keine Kennung zurueck.')
  }
  return data as string
}
