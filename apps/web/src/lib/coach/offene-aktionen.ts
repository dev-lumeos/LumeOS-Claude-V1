// ════════════════════════════════════════════════════════════════════
// OFFENE COACH-AKTIONEN JE MODUL — G-258, E-29
// ════════════════════════════════════════════════════════════════════
//
// **Entschieden in E-29:** *,,ueber eine Funktion, nicht direkt."*
//
// `[read]` **Warum nicht direkt lesen:** das Coach-Schema fuehrt drei
// Aenderungsprotokolle, und `client_permissions` / `client_autonomy`
// sagen, was ein Coach darf. **Ein direkter Zugriff aus jedem Modul
// muesste die Rechtelogik nachbauen — ab dem zweiten Modul doppelt.**
//
// `[cmd]` **`coach.offene_aktionen(p_modul text)` ist seit C-354
// live**, `SECURITY DEFINER`, **ohne `client_id`-Parameter: allein
// `auth.uid()` bestimmt den Klienten.** `[cmd]` **Gemessen am
// 2026-08-30:** `authenticated` und `service_role` duerfen ausfuehren,
// `anon` nicht.
//
// `[cmd]` **Die Funktion gibt 8 der 14 Spalten zurueck** — `client_id`,
// `coach_id`, `confirmed_at`, `confirmed_by`, `created_by`,
// `updated_at` bleiben drin. `[read]` **Das ist die Naht:** wer sie
// braeuchte, muesste durch das Coach-Portal gehen.
import { createSessionClient } from '@lumeos/shared/session'

/**
 * Eine offene Aktion, wie die Funktion sie liefert.
 *
 * `[read]` **Genau die acht Spalten der Funktion** — nicht die
 * vierzehn der Tabelle. Wer hier ein Feld ergaenzt, das die Funktion
 * nicht liefert, bekommt `undefined` und keinen Fehler.
 */
export type OffeneAktion = {
  id: string
  module: string
  action_type: string
  preview: Record<string, unknown> | null
  payload: Record<string, unknown> | null
  status: string
  expires_at: string | null
  created_at: string
}

/**
 * Der Zustand einer Aktion, wie die ANZEIGE ihn braucht.
 *
 * `[cmd]` **Der Befund aus dem Bau von C-354:** die beiden `dev`-Zeilen
 * tragen einen **vergangenen `expires_at` und trotzdem `status =
 * 'pending'`**. **Die Funktion gibt beides unveraendert aus, ein
 * Verfall-Schreibweg wurde nicht gebaut.**
 *
 * `[read]` **Also entscheidet die Anzeige** — und zwar mit drei
 * Zustaenden, nicht zwei:
 *
 *     offen        pending, und die Frist laeuft noch
 *     abgelaufen   pending, aber die Frist ist vorbei
 *     erledigt     alles andere (confirmed, rejected, ...)
 *
 * `[read]` **„Abgelaufen" ist NICHT „erledigt".** Niemand hat sie
 * bestaetigt oder abgelehnt; die Frist ist verstrichen. **Wer beides
 * zusammenwirft, behauptet eine Entscheidung, die nie gefallen ist.**
 * Dieselbe Dreiteilung wie in C-48 und G-239.
 */
export type AktionLage = 'offen' | 'abgelaufen' | 'erledigt'

export function lageVon(a: OffeneAktion, jetzt: Date): AktionLage {
  if (a.status !== 'pending') return 'erledigt'
  if (!a.expires_at) return 'offen'
  // `[read]` Zeichenkette zu Datum: `expires_at` kommt als ISO-Text.
  const frist = new Date(a.expires_at)
  if (Number.isNaN(frist.getTime())) return 'offen'
  return frist.getTime() < jetzt.getTime() ? 'abgelaufen' : 'offen'
}

export const LAGE_TEXT: Record<AktionLage, string> = {
  offen: '',
  abgelaufen: 'Frist abgelaufen — nicht bestätigt und nicht abgelehnt.',
  erledigt: '',
}

/**
 * Wieviel Zeit bleibt, in Worten.
 *
 * `[read]` **Kein `Date.now()` in der Funktion** — die Zeit kommt als
 * Argument, sonst ist sie nicht pruefbar (dieselbe Regel wie in
 * `stand-aus-sitzung.ts`).
 */
export function fristSatz(a: OffeneAktion, jetzt: Date): string {
  if (!a.expires_at) return ''
  const frist = new Date(a.expires_at)
  if (Number.isNaN(frist.getTime())) return ''
  const min = Math.round((frist.getTime() - jetzt.getTime()) / 60000)
  if (min < 0) {
    const her = Math.abs(min)
    if (her < 60) return `vor ${her} min abgelaufen`
    if (her < 1440) return `vor ${Math.round(her / 60)} h abgelaufen`
    return `vor ${Math.round(her / 1440)} Tagen abgelaufen`
  }
  if (min < 60) return `noch ${min} min`
  if (min < 1440) return `noch ${Math.round(min / 60)} h`
  return `noch ${Math.round(min / 1440)} Tage`
}

export type OffeneAktionenStand = {
  aktionen: OffeneAktion[]
  /** `null` heisst geladen; ein Text heisst: gar nicht erst gelesen. */
  fehler: string | null
  /**
   * Der Zeitpunkt des Lesens, als ISO-Text.
   *
   * `[read]` **Er gehoert zu den Daten, nicht in das Bauteil.** Eine
   * Frist ist nur gegen eine Uhr zu beurteilen, und wenn der Server
   * eine andere Minute rechnet als der Browser, bricht React die
   * Hydration ab — derselbe Fehler, den `tab-insights.tsx` mit
   * `Math.random()` hatte. **Hier steht die Uhr des Lesens.**
   */
  gelesenUm: string
}

export const LEER: OffeneAktionenStand = {
  aktionen: [], fehler: null, gelesenUm: '',
}

/**
 * Die offenen Aktionen eines Moduls.
 *
 * `[read]` **`p_modul` ist der einzige Parameter.** Der Klient kommt
 * aus `auth.uid()` — **eine fremde Kennung laesst sich nicht
 * schicken**, und genau deshalb braucht diese Funktion keine
 * Rechtepruefung in der Oberflaeche.
 */
export async function ladeOffeneAktionen(
  modul: string,
): Promise<OffeneAktionenStand> {
  // Eine Uhr fuer diesen Lesevorgang — sie geht mit den Daten mit.
  const gelesenUm = new Date().toISOString()
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { ...LEER, gelesenUm }

    const { data, error } = await client
      .schema('coach')
      .rpc('offene_aktionen', { p_modul: modul })

    // `[read]` Der Fehler wird durchgereicht, damit die Anzeige
    // „nicht geladen" von „nichts vorhanden" unterscheiden kann —
    // dieselbe Trennung wie in `rechte-read.ts`.
    if (error) return { aktionen: [], fehler: error.message, gelesenUm }

    const zeilen = Array.isArray(data) ? data : []
    return {
      aktionen: zeilen.map(r => {
        const z = r as Record<string, unknown>
        return {
          id: String(z.id ?? ''),
          module: String(z.module ?? ''),
          action_type: String(z.action_type ?? ''),
          preview: (z.preview ?? null) as Record<string, unknown> | null,
          payload: (z.payload ?? null) as Record<string, unknown> | null,
          status: String(z.status ?? ''),
          expires_at: typeof z.expires_at === 'string' ? z.expires_at : null,
          created_at: typeof z.created_at === 'string' ? z.created_at : '',
        }
      // Eine Zeile ohne Kennung waere nicht adressierbar — sie faellt
      // heraus, statt die ganze Liste scheitern zu lassen.
      }).filter(a => a.id !== ''),
      fehler: null,
      gelesenUm,
    }
  } catch (e) {
    return { aktionen: [], fehler: e instanceof Error ? e.message : String(e), gelesenUm }
  }
}
