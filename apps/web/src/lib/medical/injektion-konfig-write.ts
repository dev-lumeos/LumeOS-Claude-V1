// ════════════════════════════════════════════════════════════════════
// DIE SCHREIBSTELLE FUER DIE INJEKTIONSKONFIGURATION — G-423, E-79
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-09-08:** *„der user waehlt: peptide oder enhanced,
// wieviel, nadel, moegliche injektionspunkte — und wir verwalten es."*
//
// `[cmd]` **Bis heute gab es dafuer keine Oberflaeche** — gemessen:
// kein Pfad in `apps/web` nannte `user_injection_site_selections`.
//
// ══ DIE PRUEFUNG STEHT IN DER DATENBANK ═════════════════════════════
//
// `[cmd]` **`medical.validate_injection_site_selection` ist ein
// TRIGGER, keine aufrufbare Funktion** — gemessen gegen `pg_proc`:
// `-> trigger`, und `pg_trigger` zeigt
// `BEFORE INSERT OR UPDATE OF substance_id, route`.
//
// `[read]` **Der Auftrag nannte sie als Pruefung, die man ruft** —
// **sie prueft von selbst.** Dieser Schreibweg fuegt ein und laesst
// die Datenbank ablehnen:
//
//     RAISE EXCEPTION 'Die Auswahl braucht eine im Katalog belegte
//                      Injektionsroute'  ERRCODE 23514
//
// `[read]` **Also kein zweiter Pruefweg daneben** — er koennte
// auseinanderlaufen.
//
// ══ WAS DIE TABELLE ERLAUBT ═════════════════════════════════════════
//
// `[cmd]` **Gemessen gegen `pg_constraint`:**
//
//     route            injection_im | injection_subq
//     body_area_code   21 Werte — dieselben wie
//                      `packages/ui/src/koerperkarte-pfade.ts`
//     UNIQUE           (user_id, substance_id, route, body_area_code)
//     needle_gauge     nicht leer, wenn gesetzt
//     needle_length_in > 0, wenn gesetzt
//
// MUSTER: `lib/goals/koerpermass-write.ts` (G-122) — Session-Client
// mit der Identitaet der Nutzerin, `user_id` explizit, kein
// Service-Client. Laeuft ausschliesslich serverseitig.
//
// ── DIE NULLZEILENPRUEFUNG IST PFLICHT ──────────────────────────────
//
// `[cmd]` **G-79:** PostgREST meldet `ok` bei einem Schreibvorgang,
// den der Zeilenschutz leergefiltert hat.
import { createSessionClient } from '@lumeos/shared/session'

// `[read]` **Die Konstanten stehen in einer Datei OHNE Serverimporte**
// — die Kachel braucht sie, und ein Import von hier zoege
// `next/headers` in den Browser (gemessen: HTTP 500 auf jeder Seite).
export {
  KOERPERFLAECHEN, INJEKTIONSWEGE,
  type Koerperflaeche, type Injektionsweg,
} from './koerperflaechen'
import { INJEKTIONSWEGE, KOERPERFLAECHEN, type Injektionsweg } from './koerperflaechen'

export class KonfigFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'NOT_FOUND' | 'VALIDATION_FAILED' | 'WRITE_FAILED',
    message: string,
    public felder?: Array<{ feld: string; text: string }>,
  ) {
    super(message)
    this.name = 'KonfigFehler'
  }
}


export type KonfigEingabe = {
  substance_id: string
  route: Injektionsweg
  body_area_code: string
  needle_gauge: string
  needle_length_in: string
}

export type GeschriebeneKonfig = {
  id: string
  substance_id: string
  route: string
  body_area_code: string
  needle_gauge: string | null
  needle_length_in: number | null
}

const RUECKGABE = 'id, substance_id, route, body_area_code, '
  + 'needle_gauge, needle_length_in'

function alsZeile(v: unknown): GeschriebeneKonfig {
  const z = v as Record<string, unknown>
  return {
    id: String(z.id),
    substance_id: String(z.substance_id),
    route: String(z.route),
    body_area_code: String(z.body_area_code),
    needle_gauge: z.needle_gauge == null ? null : String(z.needle_gauge),
    needle_length_in: z.needle_length_in == null ? null : Number(z.needle_length_in),
  }
}

async function sitzung() {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new KonfigFehler('NO_SESSION', 'Keine angemeldete Sitzung.')
  return { userId: user.id }
}

/**
 * Die Eingabe pruefen — was die Datenbank ohnehin abweist, hier mit
 * Feldbezug.
 *
 * `[read]` **Nur die Faelle, die ein FELD betreffen.** Ob die Substanz
 * die Route im Katalog hat, prueft der Trigger — das ist keine
 * Eigenschaft der Eingabe, sondern des Katalogs.
 */
export function pruefeKonfig(
  e: KonfigEingabe,
): Array<{ feld: string; text: string }> {
  const felder: Array<{ feld: string; text: string }> = []
  if (!e.substance_id.trim()) {
    felder.push({ feld: 'substance_id', text: 'Eine Substanz wird gebraucht.' })
  }
  if (!(INJEKTIONSWEGE as readonly string[]).includes(e.route)) {
    felder.push({ feld: 'route', text: 'Unbekannter Injektionsweg.' })
  }
  if (!(KOERPERFLAECHEN as readonly string[]).includes(e.body_area_code)) {
    felder.push({ feld: 'body_area_code', text: 'Unbekannte Körperfläche.' })
  }
  // `[read]` **Leer ist erlaubt** (die Spalte ist nullable), **aber
  // eine Zeichenkette aus Leerzeichen nicht** — das verbietet der
  // CHECK, und die Meldung gehoert ans Feld.
  if (e.needle_gauge.length > 0 && !e.needle_gauge.trim()) {
    felder.push({ feld: 'needle_gauge', text: 'Die Nadelstärke ist leer.' })
  }
  if (e.needle_length_in.trim()) {
    const n = Number(e.needle_length_in)
    if (!Number.isFinite(n) || n <= 0) {
      felder.push({ feld: 'needle_length_in', text: 'Die Länge muss größer als 0 sein.' })
    }
  }
  return felder
}

/**
 * Eine Flaeche fuer eine Substanz konfigurieren.
 *
 * `[read]` **`upsert` statt `insert`** — die UNIQUE liegt auf
 * `(user_id, substance_id, route, body_area_code)`, und wer dieselbe
 * Flaeche mit anderer Nadel noch einmal waehlt, meint eine Aenderung.
 */
export async function konfigAnlegen(
  e: KonfigEingabe,
): Promise<GeschriebeneKonfig> {
  const felder = pruefeKonfig(e)
  if (felder.length > 0) {
    throw new KonfigFehler('VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const { userId } = await sitzung()

  const laenge = e.needle_length_in.trim()
  const { data, error } = await createSessionClient()
    .schema('medical')
    .from('user_injection_site_selections')
    .upsert({
      user_id: userId,
      substance_id: e.substance_id.trim(),
      route: e.route,
      body_area_code: e.body_area_code,
      needle_gauge: e.needle_gauge.trim() || null,
      needle_length_in: laenge ? Number(laenge) : null,
    }, { onConflict: 'user_id,substance_id,route,body_area_code' })
    .select(RUECKGABE)

  // `[read]` **Der Trigger meldet sich als Datenbankfehler** — sein
  // Satz ist deutsch und gehoert unveraendert weitergereicht.
  if (error) throw new KonfigFehler('WRITE_FAILED', error.message)

  const zeilen = (data ?? []) as unknown[]
  if (zeilen.length === 0) {
    throw new KonfigFehler('NOT_FOUND', 'Keine Zeile angelegt.')
  }
  return alsZeile(zeilen[0])
}

/** Eine konfigurierte Flaeche wieder entfernen. */
export async function konfigEntfernen(id: string): Promise<void> {
  const { userId } = await sitzung()
  const { data, error } = await createSessionClient()
    .schema('medical')
    .from('user_injection_site_selections')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
  if (error) throw new KonfigFehler('WRITE_FAILED', error.message)
  // `[cmd]` **G-79 gilt auch hier** — ein `delete`, das der
  // Zeilenschutz leerfiltert, meldet `ok`.
  if (((data ?? []) as unknown[]).length === 0) {
    throw new KonfigFehler('NOT_FOUND', 'Nichts entfernt.')
  }
}
