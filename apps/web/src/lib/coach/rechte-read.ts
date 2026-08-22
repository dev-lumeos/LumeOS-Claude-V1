// Lese-I/O fuer Coach-Rechte und Autonomy (G-90).
//
// **DIE ZWEI ACHSEN SIND GETRENNT — das ist der Kern.**
//
// `[read]` Tom, 2026-08-19: *„In Permissions setzt der User, was der
// Coach sehen darf und wie autonom es sein soll. Unter Autonomy setzt
// der Coach den Level seines Users. Das sind zwei verschiedene
// Sachen."*
//
// `[cmd]` **Das Schema setzt beide Richtungen durch, nicht die
// Oberflaeche.** `150_coach_permissions_autonomy.sql`:
//
//   client_permissions_insert/update  WITH CHECK (auth.uid() = client_id)
//   client_autonomy_insert/update     WITH CHECK (auth.uid() = coach_id)
//
// **Der Coach kann seine Sichtrechte nicht selbst setzen, der Klient
// nicht seinen Reifegrad.** Das ist genau die Umkehr, die die
// Recherche verlangt (F-04, 7.3: *„Der Coach setzt seine eigene
// Autonomiestufe — halte ich fuer einen Irrtum"*).
//
// `[cmd]` **`coach` ist fuer PostgREST freigegeben** — gemessen am
// 2026-08-22: `PGRST_DB_SCHEMAS` des laufenden REST-Containers fuehrt
// `coach`, `supabase/config.toml:23` ebenso. Die Meldung `Invalid
// schema: coach` vom 2026-08-20 ist damit Geschichte; Codex hat die
// Freigabe nachgezogen.
//
// `[read]` **Jede Funktion hier liefert einen Leerzustand statt zu
// werfen** — Muster G-65. Die Oberflaeche zeigt dann, dass nichts
// da ist, und sagt warum.
import { createSessionClient } from '@lumeos/shared/session'

// `[cmd]` Modell und Beschriftungen stehen in `rechte-modell.ts` —
// serverfrei, damit die Oberflaeche sie importieren kann, ohne
// `next/headers` ins Browserbuendel zu ziehen (G-74, G-79).
import { MODULE, SICHT, type Modul, type Sicht } from './rechte-modell'

export { MODULE, SICHT }
export type { Modul, Sicht }

export type Rechtezeile = {
  id: string
  coach_id: string
  client_id: string
  sicht: Record<Modul, Sicht>
  autoAendern: Record<Modul, boolean>
  client_note: string | null
  expires_at: string | null
  updated_at: string
}

export type Autonomiezeile = {
  id: string
  coach_id: string
  client_id: string
  level: Record<Modul, number>
  safety_level: number
  coach_note: string | null
  updated_at: string
}

export type Logzeile = {
  id: string
  changed_at: string
  change_kind: string
  changed_by: string | null
  coach_id: string
  client_id: string
  /** Was sich geaendert hat — je Feld alt -> neu. */
  felder: Array<{ feld: string; alt: unknown; neu: unknown }>
}

export type WartendeAktion = {
  id: string
  coach_id: string
  module: string
  action_type: string
  preview: Record<string, unknown>
  status: string
  expires_at: string
  confirmed_at: string | null
  created_at: string
}

// G-158: die Beziehung und ihre Nachrichten — beide Tabellen lagen
// gefuellt (relationships 6, messages 6 am 2026-08-22) und wurden von
// keiner Kachel gelesen.
export type Beziehung = {
  id: string
  coach_id: string
  client_id: string
  status: string
  invite_note: string | null
  started_at: string | null
  ended_at: string | null
}

export type Nachricht = {
  id: string
  coach_id: string
  client_id: string
  sender_id: string
  body: string
  sent_at: string
  read_at: string | null
}

export type CoachRechteStand = {
  /** Die eigene Nutzerkennung, oder `null` wenn nicht angemeldet. */
  userId: string | null
  rechte: Rechtezeile[]
  autonomie: Autonomiezeile[]
  rechteLog: Logzeile[]
  autonomieLog: Logzeile[]
  wartend: WartendeAktion[]
  beziehungen: Beziehung[]
  nachrichten: Nachricht[]
  /**
   * Gesetzt, wenn die Abfrage scheiterte. **Ein Fehler ist nicht
   * dasselbe wie „nichts da"** — die Oberflaeche unterscheidet das.
   */
  fehler: string | null
}

export const LEER: CoachRechteStand = {
  userId: null, rechte: [], autonomie: [], rechteLog: [],
  autonomieLog: [], wartend: [], beziehungen: [], nachrichten: [],
  fehler: null,
}

function sichtVon(r: Record<string, unknown>): Record<Modul, Sicht> {
  const o = {} as Record<Modul, Sicht>
  for (const m of MODULE) {
    const v = r[`${m}_visibility`]
    o[m] = (SICHT as readonly string[]).includes(String(v)) ? (v as Sicht) : 'none'
  }
  return o
}

function autoVon(r: Record<string, unknown>): Record<Modul, boolean> {
  const o = {} as Record<Modul, boolean>
  for (const m of MODULE) o[m] = r[`${m}_auto_apply`] === true
  return o
}

function levelVon(r: Record<string, unknown>): Record<Modul, number> {
  const o = {} as Record<Modul, number>
  for (const m of MODULE) {
    const n = Number(r[`${m}_level`])
    o[m] = Number.isFinite(n) ? n : 2
  }
  return o
}

/**
 * Die Felder, die sich zwischen zwei Log-Staenden geaendert haben.
 *
 * `[read]` **Der Log speichert ganze Zeilen als JSONB**, nicht
 * einzelne Felder. Wer die Historie lesbar machen will, muss den
 * Unterschied selbst bilden — sonst steht in der Anzeige eine
 * 20-spaltige Zeile, in der man das Geaenderte suchen muss.
 */
function unterschied(alt: unknown, neu: unknown): Logzeile['felder'] {
  const a = (alt ?? {}) as Record<string, unknown>
  const n = (neu ?? {}) as Record<string, unknown>
  const uninteressant = new Set(['updated_at', 'created_at', 'changed_by', 'id'])
  const felder: Logzeile['felder'] = []
  // `Array.from` statt Spread ueber ein Set — das Ziel der
  // Uebersetzung erlaubt die Iteration sonst nicht.
  const schluessel = Array.from(new Set(Object.keys(a).concat(Object.keys(n))))
  for (const k of schluessel) {
    if (uninteressant.has(k)) continue
    if (JSON.stringify(a[k]) === JSON.stringify(n[k])) continue
    felder.push({ feld: k, alt: a[k] ?? null, neu: n[k] ?? null })
  }
  return felder
}

function logVon(r: Record<string, unknown>): Logzeile {
  return {
    id: String(r.id),
    changed_at: String(r.changed_at),
    change_kind: String(r.change_kind),
    changed_by: (r.changed_by as string) ?? null,
    coach_id: String(r.coach_id),
    client_id: String(r.client_id),
    felder: unterschied(r.old_value, r.new_value),
  }
}

/**
 * Rechte, Autonomy, beide Historien und die wartenden Aktionen.
 *
 * `[cmd]` Kein Service-Client — die Zeilenrechte der sechs Tabellen
 * greifen. Sie sind echt, nicht `USING (true)`: der Klient sieht seine
 * Zeilen, der Coach seine, sonst niemand.
 */
export async function ladeCoachRechte(): Promise<CoachRechteStand> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return LEER

    const c = client.schema('coach')
    const [p, a, pl, al, pa, re, na] = await Promise.all([
      c.from('client_permissions').select('*').order('updated_at', { ascending: false }),
      c.from('client_autonomy').select('*').order('updated_at', { ascending: false }),
      c.from('permission_change_log').select('*')
        .order('changed_at', { ascending: false }).limit(50),
      c.from('autonomy_change_log').select('*')
        .order('changed_at', { ascending: false }).limit(50),
      c.from('pending_actions').select('*')
        .order('created_at', { ascending: false }).limit(50),
      // G-158: die Beziehungen und die juengsten Nachrichten. Die
      // Zeilenrechte begrenzen beides auf eigene Zeilen (coach ODER
      // client) — gemessen: dev@lumeos.app sieht 1 von 6 Beziehungen.
      c.from('relationships').select('*').order('created_at', { ascending: false }),
      c.from('messages').select('*').order('sent_at', { ascending: false }).limit(100),
    ])

    // `[read]` Ein Fehler auf der ERSTEN Abfrage entscheidet: schlaegt
    // das Schema fehl, schlagen alle fehl, und die Meldung ist
    // dieselbe. Sie wird durchgereicht, damit die Anzeige „nicht
    // geladen" von „nichts vorhanden" unterscheiden kann.
    const fehler = p.error ?? a.error ?? pl.error ?? al.error ?? pa.error
      ?? re.error ?? na.error
    if (fehler) return { ...LEER, userId: user.id, fehler: fehler.message }

    const zeile = (r: unknown) => r as unknown as Record<string, unknown>

    return {
      userId: user.id,
      rechte: (p.data ?? []).map(r => {
        const x = zeile(r)
        return {
          id: String(x.id),
          coach_id: String(x.coach_id),
          client_id: String(x.client_id),
          sicht: sichtVon(x),
          autoAendern: autoVon(x),
          client_note: (x.client_note as string) ?? null,
          expires_at: (x.expires_at as string) ?? null,
          updated_at: String(x.updated_at),
        }
      }),
      autonomie: (a.data ?? []).map(r => {
        const x = zeile(r)
        return {
          id: String(x.id),
          coach_id: String(x.coach_id),
          client_id: String(x.client_id),
          level: levelVon(x),
          safety_level: Number(x.safety_level ?? 1),
          coach_note: (x.coach_note as string) ?? null,
          updated_at: String(x.updated_at),
        }
      }),
      rechteLog: (pl.data ?? []).map(r => logVon(zeile(r))),
      autonomieLog: (al.data ?? []).map(r => logVon(zeile(r))),
      wartend: (pa.data ?? []).map(r => {
        const x = zeile(r)
        return {
          id: String(x.id),
          coach_id: String(x.coach_id),
          module: String(x.module),
          action_type: String(x.action_type),
          preview: (x.preview as Record<string, unknown>) ?? {},
          status: String(x.status),
          expires_at: String(x.expires_at),
          confirmed_at: (x.confirmed_at as string) ?? null,
          created_at: String(x.created_at),
        }
      }),
      beziehungen: (re.data ?? []).map(r => {
        const x = zeile(r)
        return {
          id: String(x.id),
          coach_id: String(x.coach_id),
          client_id: String(x.client_id),
          status: String(x.status),
          invite_note: (x.invite_note as string) ?? null,
          started_at: (x.started_at as string) ?? null,
          ended_at: (x.ended_at as string) ?? null,
        }
      }),
      nachrichten: (na.data ?? []).map(r => {
        const x = zeile(r)
        return {
          id: String(x.id),
          coach_id: String(x.coach_id),
          client_id: String(x.client_id),
          sender_id: String(x.sender_id),
          body: String(x.body),
          sent_at: String(x.sent_at),
          read_at: (x.read_at as string) ?? null,
        }
      }),
      fehler: null,
    }
  } catch (e) {
    return { ...LEER, fehler: e instanceof Error ? e.message : String(e) }
  }
}
