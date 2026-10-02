// ════════════════════════════════════════════════════════════════════
// DIE SCHREIBSTELLE FUER DEN LABORIMPORT — G-578
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Drei Datenbankfunktionen, null Aufrufer** — gezaehlt am
// 2026-10-01 in `apps/web/src` und `packages/`, ohne Tests:
//
//     medical.import_lab_report_rows        0
//     medical.start_lab_report_ocr          0
//     medical.store_lab_report_ocr_result   0
//
// `[read]` **Sie werden hier gerufen, nicht geaendert** — `supabase/`
// gehoert Codex.
//
// ══ DER G-577-NACHTRAG, NACHGEMESSEN ════════════════════════════════
//
// `[cmd]` **Alle drei lesen live `auth.uid()`** (geprueft 2026-10-01
// mit `pg_get_functiondef`, `prokind = 'f'`) — **der 42501-Blocker
// aus G-577 ist weg.** Faellt trotzdem einer, ist das ein Befund.
//
// ══ WAS DIE FUNKTION SELBST TUT — UND WAS DER AUFRUFER DESHALB NICHT
//
// `[read]` **Sie legt den Bericht an.** `INSERT INTO
// medical.lab_reports … RETURNING id` steht im Rumpf. **Wer vorher
// selbst eine Zeile schriebe, erzeugte zwei.**
//
// `[read]` **Sie ordnet selbst zu.** Je Zeile ruft sie
// `biomarker_marker_candidates(marker_name, unit)` und setzt
// `match_status` auf `exact` / `ambiguous` / `unknown`, dazu
// `needs_verification = (status <> 'exact')`. **Die Oberflaeche
// schickt KEINEN LOINC** — es gibt kein Feld dafuer.

import { createSessionClient } from '@lumeos/shared/session'

import { fehlerart, fachmeldung } from '../fehler/ladefehler'
import {
  pruefeImport, alsZeilen,
  type ImportKopf, type ImportZeile, type Importergebnis,
  type Feldfehler,
} from './laborimport'

export class ImportFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'VALIDATION_FAILED' | 'FREMD'
      | 'NICHT_GEFUNDEN' | 'WRITE_FAILED',
    message: string,
    public felder?: Feldfehler[],
  ) {
    super(message)
    this.name = 'ImportFehler'
  }
}

function db() {
  return createSessionClient().schema('medical')
}

/**
 * Den Fehler einer der drei Funktionen in einen Satz uebersetzen.
 *
 * `[read]` **Die Fachmeldung zuerst** — sie ist genauer als die
 * Einteilung Sitzung/Daten. **Gibt es keine, faellt es auf die
 * Unterscheidung aus G-553 zurueck**, und zur Not steht der
 * technische Satz da. `[read]` **Ein Fehler ohne Text waere
 * schlechter als der falsche.**
 */
function alsFehler(
  error: { code?: string; message: string },
): ImportFehler {
  const fach = fachmeldung(error.message)
  if (fehlerart(error.message, error.code) === 'sitzung') {
    return new ImportFehler('NO_SESSION',
      fach ?? 'Die Sitzung ist nicht mehr gueltig. Melde dich neu an — '
        + 'deine Daten sind unveraendert.')
  }
  // `[cmd]` **`user mismatch` kommt als `P0001`** — ohne eigenen
  // SQLSTATE, weil der Rumpf keinen `USING ERRCODE` setzt
  // (`535_auth_uid_legacy_readers.sql:171`). **Deshalb am TEXT
  // erkannt, nicht am Code.**
  if (/user mismatch/i.test(error.message)) {
    return new ImportFehler('FREMD', fach ?? error.message)
  }
  if (error.code === 'P0002') {
    return new ImportFehler('NICHT_GEFUNDEN', fach ?? error.message)
  }
  if (fach) return new ImportFehler('VALIDATION_FAILED', fach)
  return new ImportFehler('WRITE_FAILED', error.message)
}

/**
 * Geprueffte Zeilen als Befund uebernehmen — A1.
 *
 * `[cmd]` **`p_user_id` muss `auth.uid()` sein**, sonst wirft die
 * Funktion `medical import: user mismatch`. `[read]` **Er wird
 * deshalb NICHT vom Aufrufer gewaehlt**, sondern aus der Sitzung
 * gelesen — ein Parameter vom Browser waere eine Einladung, einen
 * fremden zu nennen (dieselbe Linie wie `originalEntfernen`, G-381).
 *
 * @returns Die Zaehlung, die die Funktion selbst vergeben hat.
 */
export async function zeilenUebernehmen(
  kopf: ImportKopf, zeilen: ImportZeile[],
): Promise<Importergebnis> {
  const felder = pruefeImport(kopf, zeilen)
  if (felder.length) {
    throw new ImportFehler('VALIDATION_FAILED',
      'Die Auswahl ist unvollstaendig.', felder)
  }

  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new ImportFehler('NO_SESSION', 'Keine angemeldete Sitzung.')
  }

  const { data, error } = await supabase.schema('medical')
    .rpc('import_lab_report_rows', {
      p_user_id: user.id,
      p_report_date: kopf.report_date,
      p_report_time: kopf.report_time?.trim() || null,
      p_lab_name: kopf.lab_name?.trim() || null,
      p_title: kopf.title?.trim() || null,
      p_source: kopf.source,
      p_rows: alsZeilen(zeilen),
    })

  if (error) throw alsFehler(error)

  // `[cmd]` **`RETURNS TABLE` kommt als Array zurueck** — eine Zeile.
  // `[read]` **G-79: die Rueckgabe pruefen**, nicht auf das Ausbleiben
  // eines Fehlers vertrauen.
  const zeile = Array.isArray(data) ? data[0] : data
  if (!zeile?.report_id) {
    throw new ImportFehler('WRITE_FAILED',
      'Der Befund wurde nicht angelegt — keine Kennung zurueck.')
  }
  return zeile as Importergebnis
}

/**
 * Die Texterkennung fuer ein hochgeladenes Original anstossen — A2.
 *
 * `[cmd]` **Die Funktion verlangt `file_ref IS NOT NULL`** und setzt
 * `ocr_status = 'processing'`. **Sie ERKENNT nichts** — sie merkt den
 * Bericht vor.
 *
 * `[read]` **Dahinter fehlt der Dienst, der die Datei liest.** Das
 * ist ein Befund und kein Grund, einen zu bauen: der Aufruf steht an
 * der Stelle, an die er gehoert, und was fehlt, steht im Bericht.
 */
export async function erkennungStarten(
  berichtId: string,
): Promise<{ report_id: string; ocr_status: string }> {
  const { data, error } = await db()
    .rpc('start_lab_report_ocr', { p_report_id: berichtId })
  if (error) throw alsFehler(error)
  const zeile = Array.isArray(data) ? data[0] : data
  if (!zeile?.report_id) {
    throw new ImportFehler('WRITE_FAILED',
      'Die Erkennung wurde nicht vorgemerkt — keine Kennung zurueck.')
  }
  return zeile
}

/**
 * Das Ergebnis der Texterkennung ablegen — A2.
 *
 * `[cmd]` **Die Funktion prueft `p_extracted_values` selbst:** jedes
 * Element braucht `biomarker_name`, `unit` und `confidence` zwischen
 * 0 und 1, sonst `22023`. **Sie setzt den Status auf `needs_review`,
 * sobald eine Vertrauenszahl unter 0,85 liegt.**
 *
 * `[read]` **Sie verlangt `ocr_status = 'processing'`** — also erst
 * `erkennungStarten`, dann das hier. **Zwei Aufrufe, eine
 * Reihenfolge**, und die Funktion erzwingt sie.
 */
export async function erkennungAblegen(
  berichtId: string, roh: unknown, werte: unknown[],
): Promise<{
  report_id: string; ocr_status: string
  total_markers_found: number; markers_needs_review: number
}> {
  const { data, error } = await db()
    .rpc('store_lab_report_ocr_result', {
      p_report_id: berichtId,
      p_ocr_results: roh,
      p_extracted_values: werte,
    })
  if (error) throw alsFehler(error)
  const zeile = Array.isArray(data) ? data[0] : data
  if (!zeile?.report_id) {
    throw new ImportFehler('WRITE_FAILED',
      'Das Ergebnis wurde nicht abgelegt — keine Kennung zurueck.')
  }
  return zeile
}
