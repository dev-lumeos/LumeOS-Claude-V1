// ════════════════════════════════════════════════════════════════════
// DIE SCHREIBSTELLE FUER ZYKLEN UND PROTOKOLLE — G-423
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **C-456 hat die Tabellen und fuenf Funktionen gebaut**,
// gemessen 2026-09-11:
//
//     user_supplement_cycles                 0 Zeilen
//     supplement_cycle_events                0
//     supplement_protocols                   0
//     supplement_protocol_items              0
//     supplement_protocol_templates          3
//     supplement_protocol_template_items     9
//
// `[cmd]` **Und keiner der fuenf Schreibwege hatte einen Aufrufer** —
// gemessen per Suche ueber `apps/web`. **Gebaut und unerreichbar.**
//
// ══ DIE SIGNATUREN, GEMESSEN ════════════════════════════════════════
//
// `[cmd]` **Gegen `pg_get_function_arguments`, nicht geraten:**
//
//     start_supplement_cycle(
//       p_supplement_id uuid,
//       p_source text DEFAULT 'confirmed_by_user',
//       p_suggestion_source text DEFAULT 'user_manual',
//       p_note_de text DEFAULT NULL) -> uuid
//
//     set_supplement_cycle_status(
//       p_cycle_id uuid, p_status text,
//       p_note_de text DEFAULT NULL) -> uuid
//
//     create_supplement_protocol_from_template(
//       p_template_code text, p_anchor_supplement_id uuid,
//       p_started_at date DEFAULT CURRENT_DATE) -> uuid
//
// ══ DIE ERLAUBTEN WERTE KOMMEN AUS DEM CHECK ════════════════════════
//
//     status              active | paused | stopped
//     source              coach_suggested | confirmed_by_user
//     suggestion_source   ai_suggested | marketplace_product |
//                         coach_recommendation | user_manual
//
// `[read]` **Eine Auswahlliste ist eine Zusage** — steht hier ein
// fuenfter Wert, weist die Datenbank ab, und die Nutzerin sieht eine
// Datenbankmeldung statt eines Feldfehlers.
//
// MUSTER: `lib/goals/koerpermass-write.ts` (G-122). Laeuft
// ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

export class ZyklusFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'NOT_FOUND' | 'VALIDATION_FAILED' | 'WRITE_FAILED',
    message: string,
    public felder?: Array<{ feld: string; text: string }>,
  ) {
    super(message)
    this.name = 'ZyklusFehler'
  }
}

/** Die drei Zustaende, die der CHECK auf `status` erlaubt. */
export const ZYKLUS_STATUS = ['active', 'paused', 'stopped'] as const
export type ZyklusStatus = typeof ZYKLUS_STATUS[number]

/** Die zwei Herkuenfte aus dem CHECK auf `source`. */
export const ZYKLUS_QUELLEN = ['coach_suggested', 'confirmed_by_user'] as const
export type ZyklusQuelle = typeof ZYKLUS_QUELLEN[number]

/** Die vier Vorschlagsherkuenfte aus dem CHECK. */
export const VORSCHLAG_QUELLEN = [
  'ai_suggested', 'marketplace_product', 'coach_recommendation', 'user_manual',
] as const
export type VorschlagQuelle = typeof VORSCHLAG_QUELLEN[number]

function db() {
  return createSessionClient().schema('supplements')
}

async function sitzung() {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new ZyklusFehler('NO_SESSION', 'Keine angemeldete Sitzung.')
  return { userId: user.id }
}

/**
 * Einen Zyklus starten.
 *
 * `[read]` **Die Funktion gibt die Kennung zurueck, nicht die Zeile** —
 * wer die Zeile braucht, liest sie danach.
 */
export async function zyklusStarten(
  supplementId: string,
  notiz = '',
  quelle: ZyklusQuelle = 'confirmed_by_user',
  vorschlag: VorschlagQuelle = 'user_manual',
): Promise<string> {
  if (!supplementId.trim()) {
    throw new ZyklusFehler('VALIDATION_FAILED', 'Eine Substanz wird gebraucht.',
      [{ feld: 'supplement_id', text: 'Eine Substanz wird gebraucht.' }])
  }
  await sitzung()
  const { data, error } = await db().rpc('start_supplement_cycle', {
    p_supplement_id: supplementId.trim(),
    p_source: quelle,
    p_suggestion_source: vorschlag,
    p_note_de: notiz.trim() || null,
  })
  if (error) throw new ZyklusFehler('WRITE_FAILED', error.message)
  // `[read]` **Kein `null` durchreichen** — die Funktion gibt eine
  // Kennung, und ihr Ausbleiben ist ein Fehler, kein Erfolg.
  if (!data) throw new ZyklusFehler('NOT_FOUND', 'Kein Zyklus angelegt.')
  return String(data)
}

/**
 * Den Zustand eines Zyklus setzen — pausieren, fortsetzen, beenden.
 *
 * `[cmd]` **`status` kommt aus dem CHECK** (`active | paused |
 * stopped`).
 */
export async function zyklusStatusSetzen(
  zyklusId: string, status: ZyklusStatus, notiz = '',
): Promise<string> {
  if (!(ZYKLUS_STATUS as readonly string[]).includes(status)) {
    throw new ZyklusFehler('VALIDATION_FAILED', 'Unbekannter Zustand.',
      [{ feld: 'status', text: 'Unbekannter Zustand.' }])
  }
  await sitzung()
  const { data, error } = await db().rpc('set_supplement_cycle_status', {
    p_cycle_id: zyklusId,
    p_status: status,
    p_note_de: notiz.trim() || null,
  })
  if (error) throw new ZyklusFehler('WRITE_FAILED', error.message)
  if (!data) throw new ZyklusFehler('NOT_FOUND', 'Kein Zyklus geaendert.')
  return String(data)
}

/**
 * Ein Protokoll aus einer Vorlage anlegen.
 *
 * `[cmd]` **Drei Vorlagen liegen bereit** (gemessen):
 * `standard_nolva_clomid`, `nolvadex_only_6_weeks`, `hcg_nolva` —
 * alle mit `source = 'legacy_cycleplanner'`.
 *
 * `[read]` **Der Anker ist die Substanz, um die es geht** — ein PCT
 * haengt an dem Zyklus, den es abfaengt.
 */
export async function protokollAusVorlage(
  vorlageCode: string, ankerSupplementId: string, startDatum?: string,
): Promise<string> {
  const felder: Array<{ feld: string; text: string }> = []
  if (!vorlageCode.trim()) {
    felder.push({ feld: 'template_code', text: 'Eine Vorlage wird gebraucht.' })
  }
  if (!ankerSupplementId.trim()) {
    felder.push({ feld: 'anchor', text: 'Eine Substanz wird gebraucht.' })
  }
  if (startDatum && !/^\d{4}-\d{2}-\d{2}$/.test(startDatum)) {
    felder.push({ feld: 'started_at', text: 'Ein Datum wird gebraucht.' })
  }
  if (felder.length > 0) {
    throw new ZyklusFehler('VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  await sitzung()

  // `[read]` **`p_started_at` hat eine Vorgabe** — wird nichts
  // uebergeben, nimmt die Datenbank `CURRENT_DATE`. **Kein
  // `new Date()` hier**, das waere die Uhr des Servers gegen die der
  // Datenbank.
  const args: Record<string, unknown> = {
    p_template_code: vorlageCode.trim(),
    p_anchor_supplement_id: ankerSupplementId.trim(),
  }
  if (startDatum) args.p_started_at = startDatum

  const { data, error } = await db()
    .rpc('create_supplement_protocol_from_template', args)
  if (error) throw new ZyklusFehler('WRITE_FAILED', error.message)
  if (!data) throw new ZyklusFehler('NOT_FOUND', 'Kein Protokoll angelegt.')
  return String(data)
}
