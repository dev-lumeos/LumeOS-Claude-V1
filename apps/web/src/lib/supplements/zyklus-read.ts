// Leseweg fuer Zyklen und Protokolle — G-423.
//
// `[cmd]` **C-456 hat die Tabellen gebaut**, gemessen 2026-09-11:
// alle leer ausser den drei Vorlagen. `[read]` **Dieser Leseweg ist
// deshalb von Anfang an auf den Leerzustand ausgelegt** — ein
// benannter Hinweis, keine Null (E-72).
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

export type Zyklus = {
  id: string
  supplement_id: string
  substanz_name: string | null
  status: string
  source: string
  suggestion_source: string | null
  started_at: string | null
  paused_at: string | null
  stopped_at: string | null
  note_de: string | null
}

export type ProtokollPosten = {
  id: string
  supplement_id: string
  substanz_name: string | null
  dose_amount: number | null
  dose_unit: string | null
  timing: string | null
  weeks_start: number | null
  weeks_end: number | null
}

export type Protokoll = {
  id: string
  name_de: string | null
  status: string
  source: string | null
  started_at: string | null
  posten: ProtokollPosten[]
}

/** Eine Vorlage aus `supplement_protocol_templates`. */
export type ProtokollVorlage = {
  id: string
  code: string
  name_de: string | null
  description_de: string | null
  source: string | null
  /** Wie viele Posten die Vorlage traegt. */
  posten: number
}

export type ZyklusStand = {
  zyklen: Zyklus[]
  protokolle: Protokoll[]
  vorlagen: ProtokollVorlage[]
  fehler: string | null
}

/** Die Namen mehrerer Substanzen in EINER Abfrage. */
async function substanzNamen(ids: string[]): Promise<Map<string, string>> {
  const namen = new Map<string, string>()
  const eindeutig = ids.filter((v, i) => v && ids.indexOf(v) === i)
  if (eindeutig.length === 0) return namen
  const { data } = await createSessionClient()
    .schema('supplements')
    .from('supplements')
    .select('id, name_de, name_en')
    .in('id', eindeutig)
  for (const s of (data ?? []) as unknown as Array<Record<string, unknown>>) {
    const n = (s.name_de || s.name_en) as string | null
    if (n) namen.set(String(s.id), n)
  }
  return namen
}

/**
 * Zyklen, Protokolle und die verfuegbaren Vorlagen.
 *
 * `[read]` **Jede Abfrage haelt ihren eigenen Rueckfall** — faellt
 * eine aus, bleiben die anderen gueltig (dasselbe Muster wie
 * `ladeInjektionsStand`).
 */
export async function ladeZyklusStand(): Promise<ZyklusStand> {
  const s = createSessionClient().schema('supplements')

  const [zyklen, protokolle, posten, vorlagen, vorlagenPosten] = await Promise.all([
    s.from('user_supplement_cycles')
      .select('id, supplement_id, status, source, suggestion_source, '
        + 'started_at, paused_at, stopped_at, note_de')
      .order('started_at', { ascending: false })
      .limit(50),
    s.from('supplement_protocols')
      .select('id, name_de, status, source, started_at')
      .order('started_at', { ascending: false })
      .limit(20),
    s.from('supplement_protocol_items')
      .select('id, protocol_id, supplement_id, dose_amount, dose_unit, '
        + 'timing, weeks_start, weeks_end')
      .order('sort_order', { ascending: true }),
    s.from('supplement_protocol_templates')
      .select('id, code, name_de, description_de, source')
      .eq('is_active', true)
      .order('code', { ascending: true }),
    s.from('supplement_protocol_template_items')
      .select('template_id'),
  ])

  const fehler = zyklen.error?.message ?? protokolle.error?.message ?? null

  const zZeilen = (zyklen.data ?? []) as unknown as Array<Record<string, unknown>>
  const pZeilen = (protokolle.data ?? []) as unknown as Array<Record<string, unknown>>
  const iZeilen = (posten.data ?? []) as unknown as Array<Record<string, unknown>>

  const namen = await substanzNamen([
    ...zZeilen.map(z => String(z.supplement_id)),
    ...iZeilen.map(z => String(z.supplement_id)),
  ])

  // Wie viele Posten je Vorlage — ohne zweite Abfrage je Vorlage.
  const proVorlage = new Map<string, number>()
  for (const v of (vorlagenPosten.data ?? []) as unknown as Array<Record<string, unknown>>) {
    const k = String(v.template_id)
    proVorlage.set(k, (proVorlage.get(k) ?? 0) + 1)
  }

  return {
    zyklen: zZeilen.map(z => ({
      id: String(z.id),
      supplement_id: String(z.supplement_id),
      substanz_name: namen.get(String(z.supplement_id)) ?? null,
      status: String(z.status),
      source: String(z.source),
      suggestion_source: z.suggestion_source == null ? null : String(z.suggestion_source),
      started_at: z.started_at == null ? null : String(z.started_at),
      paused_at: z.paused_at == null ? null : String(z.paused_at),
      stopped_at: z.stopped_at == null ? null : String(z.stopped_at),
      note_de: z.note_de == null ? null : String(z.note_de),
    })),
    protokolle: pZeilen.map(p => ({
      id: String(p.id),
      name_de: p.name_de == null ? null : String(p.name_de),
      status: String(p.status),
      source: p.source == null ? null : String(p.source),
      started_at: p.started_at == null ? null : String(p.started_at),
      posten: iZeilen
        .filter(i => String(i.protocol_id) === String(p.id))
        .map(i => ({
          id: String(i.id),
          supplement_id: String(i.supplement_id),
          substanz_name: namen.get(String(i.supplement_id)) ?? null,
          dose_amount: i.dose_amount == null ? null : Number(i.dose_amount),
          dose_unit: i.dose_unit == null ? null : String(i.dose_unit),
          timing: i.timing == null ? null : String(i.timing),
          weeks_start: i.weeks_start == null ? null : Number(i.weeks_start),
          weeks_end: i.weeks_end == null ? null : Number(i.weeks_end),
        })),
    })),
    vorlagen: ((vorlagen.data ?? []) as unknown as Array<Record<string, unknown>>)
      .map(v => ({
        id: String(v.id),
        code: String(v.code),
        name_de: v.name_de == null ? null : String(v.name_de),
        description_de: v.description_de == null ? null : String(v.description_de),
        source: v.source == null ? null : String(v.source),
        posten: proVorlage.get(String(v.id)) ?? 0,
      })),
    fehler,
  }
}
