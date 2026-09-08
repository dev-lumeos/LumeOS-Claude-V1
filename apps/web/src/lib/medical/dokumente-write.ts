// Schreibwege fuer Dokumente, Termine und Ereignisse — G-376.
//
// MUSTER: `lib/supplements/stack-write.ts` — Sitzungsclient mit der
// Identitaet der Nutzerin, `user_id` explizit gesetzt, kein
// Service-Client. Laeuft ausschliesslich serverseitig.
//
// ── DIE NULLZEILENPRUEFUNG IST PFLICHT ──────────────────────────
//
// `[cmd]` **G-79:** *„PostgREST meldet `ok` bei einem `update`, das der
// Zeilenschutz leergefiltert hat."* Jede Schreibfunktion haengt
// deshalb ein `.select(...)` an und prueft auf null Zeilen.
//
// ── E-74: ERFASSEN, NICHT DIAGNOSTIZIEREN ───────────────────────
//
// `[read]` **Hier wird nichts bewertet und nichts abgeleitet.** Was
// der Nutzer eintraegt, wird gespeichert — mit seiner Herkunft.
// **Die Herkunft ist Pflicht, nicht Beiwerk:** `source_kind` und
// `source_actor` sind NOT NULL, und das ist richtig so.
import { createSessionClient } from '@lumeos/shared/session'

export class MedicalSchreibFehler extends Error {
  constructor(public code: string, nachricht: string) {
    super(nachricht)
    this.name = 'MedicalSchreibFehler'
  }
}

async function sitzung() {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new MedicalSchreibFehler('NO_SESSION', 'Keine Sitzung.')
  return { client, userId: user.id }
}

/**
 * Die drei Ereignisarten, die `health_events_event_type_check`
 * zulaesst — gemessen, nicht erinnert.
 */
export const EREIGNIS_ARTEN = ['diagnosis', 'treatment', 'operation'] as const

/**
 * Die fuenf Herkunftsarten aus `health_events_source_kind_check`.
 *
 * `[read]` **`user` heisst: der Nutzer hat es selbst eingetragen** —
 * und genau das steht dann auch am Schirm. Kein stiller Default, der
 * so aussieht, als haette es ein Arzt gesagt.
 */
export const HERKUNFT_ARTEN = ['user', 'clinician', 'document', 'import', 'seed'] as const

/** Die drei Terminarten aus `appointments_appointment_type_check`. */
export const TERMIN_ARTEN = ['doctor', 'labor', 'other'] as const

/** Die drei Zustaende aus `appointments_status_check`. */
export const TERMIN_STATUS = ['scheduled', 'completed', 'cancelled'] as const

/** Ein Ereignis erfassen — Diagnose, Behandlung oder Operation. */
export async function legeEreignisAn(e: {
  art: string
  datum: string
  titel: string
  details?: string | null
  herkunftArt: string
  herkunftWer: string
  belegId?: string | null
}): Promise<{ id: string }> {
  const { client, userId } = await sitzung()

  if (!EREIGNIS_ARTEN.includes(e.art as typeof EREIGNIS_ARTEN[number])) {
    throw new MedicalSchreibFehler('VALIDATION_FAILED',
      `Unbekannte Art: ${e.art}. Erlaubt: ${EREIGNIS_ARTEN.join(', ')}.`)
  }
  if (!HERKUNFT_ARTEN.includes(e.herkunftArt as typeof HERKUNFT_ARTEN[number])) {
    throw new MedicalSchreibFehler('VALIDATION_FAILED',
      `Unbekannte Herkunft: ${e.herkunftArt}.`)
  }
  if (!e.titel.trim()) {
    throw new MedicalSchreibFehler('VALIDATION_FAILED', 'Der Titel fehlt.')
  }
  // `[read]` **Ohne Urheber kein Eintrag** — E-74: die Herkunft
  // traegt die Last. Ein Eintrag ohne sie waere eine Behauptung.
  if (!e.herkunftWer.trim()) {
    throw new MedicalSchreibFehler('VALIDATION_FAILED',
      'Wer hat das festgestellt? Ohne Urheber keine Herkunft.')
  }

  const { data, error } = await client
    .schema('medical')
    .from('health_events')
    .insert({
      user_id: userId,
      event_type: e.art,
      occurred_on: e.datum,
      title: e.titel.trim(),
      details: e.details?.trim() || null,
      source_kind: e.herkunftArt,
      source_actor: e.herkunftWer.trim(),
      source_recorded_at: new Date().toISOString(),
      source_lab_report_id: e.belegId ?? null,
    })
    .select('id')
  if (error) throw new MedicalSchreibFehler('WRITE_FAILED', error.message)
  const zeile = (data ?? [])[0] as unknown as { id: string } | undefined
  if (!zeile) {
    throw new MedicalSchreibFehler('WRITE_FAILED', 'Insert lieferte keine Zeile zurueck.')
  }
  return zeile
}

/** Einen Termin anlegen. */
export async function legeTerminAn(t: {
  art: string
  beginn: string
  titel?: string | null
  notiz?: string | null
}): Promise<{ id: string }> {
  const { client, userId } = await sitzung()

  if (!TERMIN_ARTEN.includes(t.art as typeof TERMIN_ARTEN[number])) {
    throw new MedicalSchreibFehler('VALIDATION_FAILED',
      `Unbekannte Terminart: ${t.art}.`)
  }
  if (!t.beginn) {
    throw new MedicalSchreibFehler('VALIDATION_FAILED', 'Der Zeitpunkt fehlt.')
  }

  const { data, error } = await client
    .schema('medical')
    .from('appointments')
    .insert({
      user_id: userId,
      appointment_type: t.art,
      starts_at: new Date(t.beginn).toISOString(),
      // `[cmd]` `time_zone` ist NOT NULL mit CHECK auf nicht-leer.
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Zurich',
      status: 'scheduled',
      title: t.titel?.trim() || null,
      notes: t.notiz?.trim() || null,
    })
    .select('id')
  if (error) throw new MedicalSchreibFehler('WRITE_FAILED', error.message)
  const zeile = (data ?? [])[0] as unknown as { id: string } | undefined
  if (!zeile) {
    throw new MedicalSchreibFehler('WRITE_FAILED', 'Insert lieferte keine Zeile zurueck.')
  }
  return zeile
}

/**
 * Einen Termin aendern — Zeitpunkt oder Zustand.
 *
 * `[read]` **Absagen ist ein Zustand, kein Loeschen** — ein
 * abgesagter Termin bleibt lesbar, wie eine archivierte
 * Einkaufsliste (G-344).
 */
export async function aendereTermin(
  id: string,
  aenderung: { beginn?: string; status?: string; titel?: string | null; notiz?: string | null },
): Promise<{ id: string }> {
  const { client, userId } = await sitzung()

  const feld: Record<string, unknown> = {}
  if (aenderung.beginn) feld.starts_at = new Date(aenderung.beginn).toISOString()
  if (aenderung.status !== undefined) {
    if (!TERMIN_STATUS.includes(aenderung.status as typeof TERMIN_STATUS[number])) {
      throw new MedicalSchreibFehler('VALIDATION_FAILED',
        `Unbekannter Zustand: ${aenderung.status}.`)
    }
    feld.status = aenderung.status
  }
  if (aenderung.titel !== undefined) feld.title = aenderung.titel?.trim() || null
  if (aenderung.notiz !== undefined) feld.notes = aenderung.notiz?.trim() || null

  if (Object.keys(feld).length === 0) {
    throw new MedicalSchreibFehler('VALIDATION_FAILED', 'Nichts zu aendern.')
  }

  const { data, error } = await client
    .schema('medical')
    .from('appointments')
    .update(feld)
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
  if (error) throw new MedicalSchreibFehler('WRITE_FAILED', error.message)
  const zeile = (data ?? [])[0] as unknown as { id: string } | undefined
  if (!zeile) {
    throw new MedicalSchreibFehler('NOT_FOUND', 'Kein eigener Termin mit dieser id.')
  }
  return zeile
}

/**
 * Ein Original ablegen — E-75.
 *
 * `[cmd]` **Der Pfad ist `<user_id>/<report_id>.<ext>`** — der
 * Zeilenschutz prueft das erste Segment gegen `auth.uid()`.
 *
 * `[cmd]` **`file_ref` bekommt den PFAD, nicht die URL** — *„eine URL
 * waere ein Zugriff, ein Pfad ist ein Verweis."*
 *
 * `[read]` **Der Befund entsteht zuerst, dann die Datei** — sonst
 * gaebe es einen Pfad ohne `report_id`.
 */
export async function legeOriginalAb(
  berichtId: string, datei: File,
): Promise<{ pfad: string; groesse: number }> {
  const { client, userId } = await sitzung()

  const endung = (datei.name.split('.').pop() ?? 'bin').toLowerCase()
  const pfad = `${userId}/${berichtId}.${endung}`

  const { error: hochFehler } = await client.storage
    .from('medical-originals')
    .upload(pfad, datei, { upsert: true, contentType: datei.type || undefined })
  if (hochFehler) throw new MedicalSchreibFehler('UPLOAD_FAILED', hochFehler.message)

  const { data, error } = await client
    .schema('medical')
    .from('lab_reports')
    .update({ file_ref: pfad })
    .eq('id', berichtId)
    .eq('user_id', userId)
    .select('id')
  if (error) throw new MedicalSchreibFehler('WRITE_FAILED', error.message)
  if (!(data ?? []).length) {
    throw new MedicalSchreibFehler('NOT_FOUND', 'Kein eigener Befund mit dieser id.')
  }

  return { pfad, groesse: datei.size }
}
