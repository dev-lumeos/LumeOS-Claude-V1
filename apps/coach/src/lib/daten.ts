// Leseweg des Coach-Portals. Alles laeuft ueber den Session-Client —
// kein Service-Client, der Zeilenschutz aus 150-154 greift (Muster
// G-90). Fehler werden nach G-65 gemeldet, nie verschluckt: der erste
// Fehler steht in `fehler`, die Kacheln zeigen ihn als Leerzustand.
import { createSessionClient } from '@lumeos/shared/session'

export const MODULE = [
  'nutrition', 'training', 'recovery', 'goals', 'supplements', 'medical', 'buddy',
] as const

export type Modul = (typeof MODULE)[number]

export const MODUL_LABEL: Record<Modul, string> = {
  nutrition: 'Ernaehrung',
  training: 'Training',
  recovery: 'Recovery',
  goals: 'Ziele & Koerper',
  supplements: 'Supplements',
  medical: 'Medical',
  buddy: 'Buddy',
}

export type Klient = {
  relationship_id: string
  client_id: string
  status: 'invited' | 'active' | 'ended'
  started_at: string | null
  invited_at: string
  invite_note: string | null
  email: string
  display_name: string
}

export type RechteZeile = Record<string, unknown> & {
  id: string
  client_id: string
  expires_at: string | null
  client_note: string | null
}

export type AutonomieZeile = Record<string, unknown> & {
  id: string
  client_id: string
  safety_level: number
  coach_note: string | null
}

export type Checkin = {
  id: string
  client_id: string
  template_id: string | null
  due_date: string
  status: 'pending' | 'submitted' | 'reviewed' | 'missed'
  auto_data: Record<string, unknown>
  client_data: Record<string, unknown>
  client_note: string | null
  coach_feedback: string | null
  coach_notes: string | null
  submitted_at: string | null
  reviewed_at: string | null
}

export type Nachricht = {
  id: string
  client_id: string
  sender_id: string
  body: string
  sent_at: string
  read_at: string | null
}

export type Alert = {
  id: string
  client_id: string
  module: string
  title: string
  detail: string | null
  metric: Record<string, unknown>
  status: 'open' | 'read' | 'done'
  created_at: string
}

export type PendingAction = {
  id: string
  client_id: string
  module: string
  action_type: string
  preview: Record<string, unknown>
  payload: Record<string, unknown>
  status: string
  expires_at: string
  created_at: string
}

export type LogZeile = {
  id: string
  client_id: string
  changed_by: string | null
  changed_at: string
  change_kind: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
}

export type PortalStand = {
  userId: string
  email: string
  istCoach: boolean
  klienten: Klient[]
  rechte: RechteZeile[]
  autonomie: AutonomieZeile[]
  checkins: Checkin[]
  templates: { id: string; client_id: string; name: string; cadence: string; fields: unknown[] }[]
  nachrichten: Nachricht[]
  alerts: Alert[]
  pending: PendingAction[]
  actionLog: {
    id: string; client_id: string; module: string; action_type: string
    executed_at: string; undone_at: string | null; undo_data: unknown
  }[]
  rechteLog: LogZeile[]
  autonomieLog: LogZeile[]
  beziehungsLog: LogZeile[]
  /**
   * Die letzte Trainingseinheit je Klient — G-402.
   *
   * `[read]` **Nur fuer Klienten, die `training` auf `full`
   * freigegeben haben** — dieselbe Regel wie in der Akte
   * (`sicht[modul] === 'full'`). **Wer nicht freigibt, taucht hier
   * nicht auf**, und die Liste zeigt dann einen benannten Strich
   * statt eines Datums.
   */
  letzteSitzung: Record<string, string>
  fehler: string | null
}

const LEER: Omit<PortalStand, 'userId' | 'email'> = {
  istCoach: false,
  klienten: [], rechte: [], autonomie: [], checkins: [], templates: [],
  nachrichten: [], alerts: [], pending: [], actionLog: [],
  rechteLog: [], autonomieLog: [], beziehungsLog: [],
  letzteSitzung: {},
  fehler: null,
}

export async function portalStand(): Promise<PortalStand | null> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    const c = supabase.schema('coach')
    const uid = user.id
    const [
      klienten, rechte, autonomie, checkins, templates,
      nachrichten, alerts, pending, actionLog,
      rechteLog, autonomieLog, beziehungsLog,
    ] = await Promise.all([
      c.rpc('klienten'),
      c.from('client_permissions').select('*').eq('coach_id', uid),
      c.from('client_autonomy').select('*').eq('coach_id', uid),
      c.from('checkins').select('*').eq('coach_id', uid).order('due_date', { ascending: false }).limit(100),
      c.from('checkin_templates').select('id, client_id, name, cadence, fields').eq('coach_id', uid),
      c.from('messages').select('*').eq('coach_id', uid).order('sent_at', { ascending: false }).limit(200),
      c.from('alerts').select('*').eq('coach_id', uid).order('created_at', { ascending: false }).limit(100),
      c.from('pending_actions').select('*').eq('coach_id', uid).order('created_at', { ascending: false }).limit(100),
      c.from('action_log').select('id, client_id, module, action_type, executed_at, undone_at, undo_data').eq('coach_id', uid).order('executed_at', { ascending: false }).limit(100),
      c.from('permission_change_log').select('*').eq('coach_id', uid).order('changed_at', { ascending: false }).limit(50),
      c.from('autonomy_change_log').select('*').eq('coach_id', uid).order('changed_at', { ascending: false }).limit(50),
      c.from('relationship_change_log').select('*').eq('coach_id', uid).order('changed_at', { ascending: false }).limit(50),
    ])

    const erster = [
      klienten, rechte, autonomie, checkins, templates, nachrichten,
      alerts, pending, actionLog, rechteLog, autonomieLog, beziehungsLog,
    ].find(r => r.error)

    if (erster?.error) {
      return { ...LEER, userId: uid, email: user.email ?? '', fehler: erster.error.message }
    }

    const kl = (klienten.data ?? []) as Klient[]

    // ══ G-402: die letzte Trainingseinheit je Klient ═══════════════
    //
    // `[read]` **Die Liste soll zeigen, wann zuletzt trainiert
    // wurde** — das Altrepo hatte es, der Bau nicht. `[cmd]`
    // **`training.workout_sessions` traegt `session_date`.**
    //
    // `[read]` **Nur fuer Klienten mit `training_visibility = 'full'`**
    // — dieselbe Regel wie in der Akte. **Der Coach liest nichts,
    // was der Klient nicht freigegeben hat**, auch nicht ein Datum.
    //
    // `[read]` **Eine Abfrage fuer alle**, nicht eine je Klient: bei
    // n Klienten waeren es sonst n Rundreisen.
    const rechteZeilen = (rechte.data ?? []) as RechteZeile[]
    const trainingFrei = kl
      .map(k => k.client_id)
      .filter(id => {
        const r = rechteZeilen.find(x => x.client_id === id)
        return r?.['training_visibility'] === 'full'
      })
    const letzte: Record<string, string> = {}
    if (trainingFrei.length > 0) {
      const { data: sitzungen } = await supabase.schema('training')
        .from('workout_sessions')
        .select('user_id, session_date')
        .in('user_id', trainingFrei)
        .order('session_date', { ascending: false })
      for (const s of (sitzungen ?? []) as Array<{ user_id: string, session_date: string }>) {
        // `[read]` **Absteigend sortiert, also gewinnt der erste** —
        // jeder weitere Treffer desselben Klienten ist aelter.
        if (!letzte[s.user_id]) letzte[s.user_id] = s.session_date
      }
    }

    return {
      userId: uid,
      email: user.email ?? '',
      istCoach: kl.length > 0,
      klienten: kl,
      rechte: (rechte.data ?? []) as RechteZeile[],
      autonomie: (autonomie.data ?? []) as AutonomieZeile[],
      checkins: (checkins.data ?? []) as Checkin[],
      templates: (templates.data ?? []) as PortalStand['templates'],
      nachrichten: (nachrichten.data ?? []) as Nachricht[],
      alerts: (alerts.data ?? []) as Alert[],
      pending: (pending.data ?? []) as PendingAction[],
      actionLog: (actionLog.data ?? []) as PortalStand['actionLog'],
      rechteLog: (rechteLog.data ?? []) as LogZeile[],
      autonomieLog: (autonomieLog.data ?? []) as LogZeile[],
      beziehungsLog: (beziehungsLog.data ?? []) as LogZeile[],
      letzteSitzung: letzte,
      fehler: null,
    }
  } catch (e) {
    return {
      ...LEER,
      userId: user.id,
      email: user.email ?? '',
      fehler: e instanceof Error ? e.message : 'Unbekannter Fehler beim Lesen',
    }
  }
}

export type ModulSummary = { freigegeben: boolean } & Record<string, unknown>

/** Die sechs Modul-Aggregate eines Klienten, ueber die 152-Funktionen.
 *  Jede prueft die Freigabe selbst; `buddy` hat kein Datengegenstueck
 *  (T5) und bekommt bewusst keine Funktion. */
export async function modulSummaries(clientId: string): Promise<Record<string, ModulSummary>> {
  const supabase = createSessionClient()
  const c = supabase.schema('coach')
  const funktionen = [
    ['nutrition', 'summary_nutrition'],
    ['training', 'summary_training'],
    ['recovery', 'summary_recovery'],
    ['goals', 'summary_goals'],
    ['supplements', 'summary_supplements'],
    ['medical', 'summary_medical'],
  ] as const

  const ergebnisse = await Promise.all(
    funktionen.map(([, fn]) => c.rpc(fn, { p_client: clientId })),
  )

  const raus: Record<string, ModulSummary> = {}
  funktionen.forEach(([modul], i) => {
    const r = ergebnisse[i]
    raus[modul] = r.error
      ? { freigegeben: false, fehler: r.error.message }
      : ((r.data ?? { freigegeben: false }) as ModulSummary)
  })
  return raus
}

/** Sichtstufe eines Klienten je Modul aus der Rechte-Zeile. */
export function sichtVon(zeile: RechteZeile | undefined, modul: Modul): 'none' | 'summary' | 'full' {
  if (!zeile) return 'none'
  const wert = zeile[`${modul}_visibility`]
  return wert === 'full' || wert === 'summary' ? wert : 'none'
}

export function autoApplyVon(zeile: RechteZeile | undefined, modul: Modul): boolean {
  return zeile ? zeile[`${modul}_auto_apply`] === true : false
}

export function levelVon(zeile: AutonomieZeile | undefined, modul: Modul): number | null {
  if (!zeile) return null
  const wert = zeile[`${modul}_level`]
  return typeof wert === 'number' ? wert : null
}

/** Feld-Diff zweier Log-Schnappschuesse — der Log speichert ganze
 *  Zeilen (150), die Anzeige zeigt nur die Unterschiede (Muster G-90). */
export function unterschied(
  alt: Record<string, unknown> | null,
  neu: Record<string, unknown> | null,
): { feld: string; von: string; zu: string }[] {
  const ausgenommen = new Set(['id', 'created_at', 'updated_at', 'changed_by'])
  const felder = new Set([...Object.keys(alt ?? {}), ...Object.keys(neu ?? {})])
  const raus: { feld: string; von: string; zu: string }[] = []
  for (const feld of felder) {
    if (ausgenommen.has(feld)) continue
    const von = alt ? String(alt[feld] ?? '—') : '—'
    const zu = neu ? String(neu[feld] ?? '—') : '—'
    if (von !== zu) raus.push({ feld, von, zu })
  }
  return raus
}

/** Volltiefe je Modul fuer die Klientenakte — nur was `full` hergibt.
 *  Jede Abfrage laeuft unter RLS; ein gesperrtes Modul liefert schlicht
 *  keine Zeilen. Gerendert wird trotzdem nur, was die Sichtstufe sagt —
 *  die Stufe entscheidet die Anzeige, die Policy erzwingt sie. */
export async function modulDetails(clientId: string, sicht: Record<Modul, string>) {
  const supabase = createSessionClient()
  const wenn = <T,>(modul: Modul, lauf: () => T): T | null =>
    sicht[modul] === 'full' ? lauf() : null

  const [tage, einheiten, gewichte, ziele, scores, einnahmen, befunde] = await Promise.all([
    wenn('nutrition', () =>
      supabase.schema('nutrition').from('daily_summary')
        .select('entry_date, enercc, prot625, cho, fat, item_count')
        .eq('user_id', clientId).order('entry_date', { ascending: false }).limit(7),
    ) ?? Promise.resolve(null),
    wenn('training', () =>
      supabase.schema('training').from('workout_sessions')
        .select('session_date, name, status, total_sets, total_volume_kg')
        .eq('user_id', clientId).order('session_date', { ascending: false }).limit(5),
    ) ?? Promise.resolve(null),
    wenn('goals', () =>
      supabase.schema('goals').from('body_measurements')
        .select('measurement_date, weight_kg, body_fat_pct')
        .eq('user_id', clientId).order('measurement_date', { ascending: false }).limit(5),
    ) ?? Promise.resolve(null),
    wenn('goals', () =>
      supabase.schema('goals').from('user_goals')
        .select('title, goal_type, status, progress_pct')
        .eq('user_id', clientId).eq('status', 'active').limit(5),
    ) ?? Promise.resolve(null),
    wenn('recovery', () =>
      supabase.schema('recovery').from('scores')
        .select('entry_date, score')
        .eq('user_id', clientId).order('entry_date', { ascending: false }).limit(7),
    ) ?? Promise.resolve(null),
    wenn('supplements', () =>
      supabase.schema('supplements').from('intake_logs')
        .select('intake_date, supplement_name_snapshot, status')
        .eq('user_id', clientId).order('intake_date', { ascending: false }).limit(7),
    ) ?? Promise.resolve(null),
    wenn('medical', () =>
      supabase.schema('medical').from('lab_reports')
        .select('report_date, lab_name, title')
        .eq('user_id', clientId).order('report_date', { ascending: false }).limit(5),
    ) ?? Promise.resolve(null),
  ])

  return {
    nutritionTage: tage?.data ?? null,
    trainingEinheiten: einheiten?.data ?? null,
    gewichte: gewichte?.data ?? null,
    ziele: ziele?.data ?? null,
    recoveryScores: scores?.data ?? null,
    einnahmen: einnahmen?.data ?? null,
    befunde: befunde?.data ?? null,
  }
}
