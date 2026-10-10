// G-640 — der wirksame Zielzustand (G-611), rein.
//
// `[cmd]` **`goals.goal_list_at(p_user_id, p_stichtag)`** liefert je Ziel
// `stored_status`, `effective_status` ('eingefroren' oder der gespeicherte),
// `freeze_reason` (erreicht / frist_abgelaufen / beendet) und `frozen_on` —
// archivierte Ziele nicht. **Die App rechnet Einfrieren nicht selbst:** Frist
// und Zielerreichung wirken in der Kette auch ohne Schreibereignis.
//
// `[read]` **Rueckfall, solange G-611 nicht eingespielt ist:** der gespeicherte
// Status, wie bisher — abgeschlossen ist achieved / missed / abandoned. Keine
// Frist- oder Treffer-Pruefung im Code; die kommt mit der Kette.

export type Grund = 'erreicht' | 'frist_abgelaufen' | 'beendet'
export type Zustandsquelle = 'kette' | 'gespeichert'

export interface Zustand {
  /** `effective_status`: 'eingefroren' oder der gespeicherte Status. */
  zustand: string | null
  grund: Grund | null
  eingefroren_am: string | null
  quelle: Zustandsquelle
}

export const GRUND_TEXT: Record<Grund, string> = {
  erreicht: 'erreicht', frist_abgelaufen: 'Frist abgelaufen', beendet: 'beendet',
}

const GRUENDE: readonly Grund[] = ['erreicht', 'frist_abgelaufen', 'beendet']

/** Eine Zeile aus `goal_list_at`. */
export function zustandAusListe(z: Record<string, unknown>): Zustand {
  const g = z.freeze_reason
  return {
    zustand: typeof z.effective_status === 'string' ? z.effective_status : null,
    grund: GRUENDE.includes(g as Grund) ? g as Grund : null,
    eingefroren_am: typeof z.frozen_on === 'string' ? z.frozen_on : null,
    quelle: 'kette',
  }
}

/** Rueckfall ohne G-611: dieselbe Zuordnung, die `goal_state_at` fuer gespeicherte Abschluesse nutzt. */
export function zustandAusStatus(status: string | null): Zustand {
  const grund: Grund | null = status === 'achieved' ? 'erreicht'
    : status === 'missed' ? 'frist_abgelaufen' : status === 'abandoned' ? 'beendet' : null
  return { zustand: grund ? 'eingefroren' : status, grund, eingefroren_am: null, quelle: 'gespeichert' }
}

export const istEingefroren = (z: Pick<Zustand, 'zustand'>) => z.zustand === 'eingefroren'

/**
 * Welche Aktionen eine Kachel anbietet. `[read]` **Ohne G-611 keine** — der
 * Loeschweg, das Archiv und der Neustart existieren dann nicht (Rueckfall auf
 * heute: kein Knopf ohne Weg).
 */
export function aktionen(z: Zustand): { neuStarten: boolean; archivieren: boolean; loeschen: boolean; bearbeiten: boolean } {
  const kette = z.quelle === 'kette'
  const eis = istEingefroren(z)
  return { neuStarten: kette && eis, archivieren: kette && eis, loeschen: kette, bearbeiten: !eis }
}

// ── Fehler der Kette als Satz ────────────────────────────────────

/**
 * Jeder Schluessel aus `611_goal_freeze_archive_delete.sql` und
 * `638_goal_plan_status_follows_goal.sql` hat einen Satz (Test). Unbekannte
 * Schluessel: der Satz, den die Kette mitschickt — **nie das Praefix**.
 */
const SAETZE: Record<string, string> = {
  ziel_eingefroren: 'Dieses Ziel ist eingefroren und kann nicht mehr geändert werden. Starte es neu.',
  ziel_fremd: 'Das Ziel fehlt oder gehört nicht zu deinem Konto.',
  erst_beenden: 'Dieses Ziel ist noch nicht abgeschlossen. Bitte erst beenden, dann archivieren.',
  archiv_nur_funktion: 'Archivieren geht nur über „Archivieren".',
  nur_eingefroren_neustarten: 'Nur abgeschlossene oder abgelaufene Ziele lassen sich neu starten.',
  neue_frist: 'Der neue Zeitraum muss heute oder später beginnen, und das Ende darf nicht vor dem Start liegen.',
  beenden_statt_loeschen: 'Dieses Ziel hat einen Verlauf. Lieber beenden? Dann bleibt die Historie erhalten.',
  ziel_eingefroren_oder_archiviert: 'Eingefrorene oder archivierte Ziele lassen sich nicht fortsetzen — bitte neu starten.',
  anderer_aktiver_plan: 'Ein anderer Plan ist gerade aktiv. Pausiere oder beende ihn zuerst.',
}

export interface Kettenfehler { art: 'block' | 'confirm'; schluessel: string; satz: string }

export function kettenfehler(text: string | null | undefined): Kettenfehler | null {
  const m = /(G611_BLOCK|G611_CONFIRM|G638_BLOCK):([a-z_]+)(?::\s*([^]*))?/.exec(text ?? '')
  if (!m) return null
  const satz = SAETZE[m[2]!] ?? (m[3]?.trim() || 'Die Datenbank hat das abgelehnt.')
  return { art: m[1] === 'G611_CONFIRM' ? 'confirm' : 'block', schluessel: m[2]!, satz }
}

/** Fuer Anzeigen, die nur einen Satz brauchen: Kettenfehler als Satz, sonst der Text. */
export const fehlerSatz = (text: string) => kettenfehler(text)?.satz ?? text

/** Die Funktion fehlt live (PostgREST 202 oder Postgres 42883) — G-611 nicht eingespielt. */
export const nichtEingespielt = (e: { code?: string | null; message?: string | null } | null) =>
  !!e && (e.code === 'PGRST202' || e.code === '42883')
