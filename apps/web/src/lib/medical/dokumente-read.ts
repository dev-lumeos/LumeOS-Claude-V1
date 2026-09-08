// Dokumente, Termine und Zeitachse — G-376.
//
// `[cmd]` **Seit C-431 steht das Schema live** — `health_events`
// (13 Spalten), `health_timeline` (Sicht, 12), `appointments` (12),
// Bucket `medical-originals` (privat, 20 MB). **Und die Oberflaeche
// kannte nichts davon** — neunter Fall von A-71.
//
// ## Was E-74 verlangt
//
// Tom, 2026-09-08: *„dessen inhalt mit herkunft bei fragen des users
// wiedergeben."*
//
// `[read]` **Jede Zeile sagt, woher sie kommt:** wer, wann, und ob
// ein Dokument dahinterliegt. **LumeOS sagt nicht „du hast X",
// sondern „Dr. Y hat am Z. X festgestellt".**
//
// `[cmd]` Die Sicht `health_timeline` traegt genau diese drei Felder
// mit: `source_kind`, `source_actor`, `source_recorded_at` — plus
// `source_lab_report_id` fuer das Dokument dahinter.
//
// ## Und was hier NICHT passiert
//
// `[read]` **Kein Wert wird bewertet, keine Diagnose abgeleitet**
// (E-74). Diese Datei liest und reicht durch; sie rechnet nichts aus,
// was ein Arzt sagen muesste.
import { createSessionClient } from '@lumeos/shared/session'

/** Ein Eintrag der Zeitachse — aus `medical.health_timeline`. */
export type ZeitachsenEintrag = {
  id: string
  /** `diagnosis`, `treatment`, `operation` — oder `lab_report`. */
  art: string
  datum: string
  titel: string
  details: string | null
  /** E-74: woher der Eintrag kommt. */
  herkunftArt: string
  herkunftWer: string
  herkunftWann: string | null
  /** Die Kennung des Befunds, falls einer dahinterliegt. */
  belegId: string | null
}

/** Ein Termin — aus `medical.appointments`. */
export type Termin = {
  id: string
  art: string
  beginn: string
  zeitzone: string
  status: string
  titel: string | null
  notiz: string | null
}

/** Ein abgelegtes Original — aus `medical.lab_reports`. */
export type Dokument = {
  id: string
  datum: string
  labor: string | null
  titel: string | null
  /** E-75: der PFAD im Bucket, nicht die URL. */
  pfad: string | null
  quelle: string | null
}

export type DokumenteStand = {
  zeitachse: ZeitachsenEintrag[]
  termine: Termin[]
  dokumente: Dokument[]
  fehler: string | null
}

export const DOKUMENTE_LEER: DokumenteStand = {
  zeitachse: [], termine: [], dokumente: [], fehler: null,
}

const txt = (v: unknown) =>
  typeof v === 'string' && v.trim() !== '' ? v : null

/**
 * Alles, was der Dokumentteil braucht — in drei Abfragen.
 *
 * `[read]` **Getrennte Ergebnisse:** faellt eine aus, bleiben die
 * uebrigen gueltig. Dieselbe Linie wie im Tagebuch.
 */
export async function ladeDokumente(): Promise<DokumenteStand> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return DOKUMENTE_LEER
  const m = client.schema('medical')

  const [zeit, term, dok] = await Promise.all([
    m.from('health_timeline')
      .select('entry_id, entry_type, occurred_on, title, details, '
        + 'source_kind, source_actor, source_recorded_at, source_lab_report_id')
      .eq('user_id', user.id)
      .order('occurred_on', { ascending: false })
      .limit(200),
    m.from('appointments')
      .select('id, appointment_type, starts_at, time_zone, status, title, notes')
      .eq('user_id', user.id)
      .order('starts_at', { ascending: false })
      .limit(100),
    m.from('lab_reports')
      .select('id, report_date, lab_name, title, file_ref, source')
      .eq('user_id', user.id)
      .order('report_date', { ascending: false })
      .limit(100),
  ])

  const fehler = zeit.error?.message ?? term.error?.message ?? dok.error?.message ?? null

  return {
    zeitachse: ((zeit.data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
      id: String(z.entry_id),
      art: String(z.entry_type ?? ''),
      datum: String(z.occurred_on ?? ''),
      titel: String(z.title ?? ''),
      details: txt(z.details),
      herkunftArt: String(z.source_kind ?? ''),
      herkunftWer: String(z.source_actor ?? ''),
      herkunftWann: txt(z.source_recorded_at),
      belegId: txt(z.source_lab_report_id),
    })),
    termine: ((term.data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
      id: String(z.id),
      art: String(z.appointment_type ?? ''),
      beginn: String(z.starts_at ?? ''),
      zeitzone: String(z.time_zone ?? ''),
      status: String(z.status ?? ''),
      titel: txt(z.title),
      notiz: txt(z.notes),
    })),
    dokumente: ((dok.data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
      id: String(z.id),
      datum: String(z.report_date ?? ''),
      labor: txt(z.lab_name),
      titel: txt(z.title),
      pfad: txt(z.file_ref),
      quelle: txt(z.source),
    })),
    fehler,
  }
}

/**
 * Eine zeitlich begrenzte URL zu einem abgelegten Original — E-75.
 *
 * `[cmd]` **`file_ref` traegt den PFAD, nicht die URL** — *„eine URL
 * waere ein Zugriff, ein Pfad ist ein Verweis."* **Die URL entsteht
 * beim Lesen und laeuft ab.**
 *
 * `[cmd]` **Der Zeilenschutz prueft das erste Pfadsegment gegen
 * `auth.uid()`** — wer nicht der Eigentuemer ist, bekommt keine URL.
 */
export async function signierteUrl(
  pfad: string, sekunden = 300,
): Promise<{ url: string | null; fehler: string | null }> {
  const client = createSessionClient()
  const { data, error } = await client.storage
    .from('medical-originals')
    .createSignedUrl(pfad, sekunden)
  if (error) return { url: null, fehler: error.message }
  return { url: data?.signedUrl ?? null, fehler: null }
}
