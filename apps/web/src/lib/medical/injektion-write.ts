// ════════════════════════════════════════════════════════════════════
// DIE SCHREIBSTELLE FUER `medical.injection_logs` — G-389
// ════════════════════════════════════════════════════════════════════
//
// ══ DER BEFUND ══════════════════════════════════════════════════════
//
// `[cmd]` **`medical.injection_logs`: 0 Zeilen, und NIEMAND schreibt
// hinein.** `[cmd]` **`injektion-read.ts:142` ist ein LESEweg,
// sonst nichts.**
//
// `[cmd]` **Der Knopf existiert seit G-45:**
// `tab-injektionen.tsx:206` ruft `open('logInjection')`,
// `modale.tsx:258` verteilt es, `LogInjektionFenster` zeigt neun
// Felder — **und der Speichern-Knopf ist ein `InEntwicklungKnopf`.**
//
// `[read]` **Dieselbe Klasse dreimal an einem Tag:** `logPhoto` war
// ein Modal ohne Ausloeser (G-421), `messungAnlegenAktion` eine
// Funktion ohne Aufrufer, `logInjection` ein Modal ohne Schreibweg.
//
// ══ WAS DIE TABELLE VERLANGT ════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-11 gegen `information_schema` und
// `pg_constraint`** — zwanzig Spalten, davon drei Pflicht:
//
//     user_id          NOT NULL   aus der Sitzung
//     injected_at      NOT NULL   Datum + Uhrzeit
//     body_area_code   NOT NULL   die Kartenflaeche
//
// `[cmd]` **Und die CHECKs sagen, was erlaubt ist:**
//
//     route           im | sc            (NICHT injection_im!)
//     pain_score      0 bis 3
//     complication    none | bleeding | lump | swelling |
//                     redness | leakage | nerve_sensation
//     volume_ml       > 0
//     dose_amount     > 0
//     needle_length_in > 0
//
// ══ ZWEI VOKABULARE FUER DENSELBEN WEG ══════════════════════════════
//
// `[cmd]` **`injection_logs.route` erlaubt `im | sc`.**
// `[cmd]` **`user_injection_site_selections.route` erlaubt
// `injection_im | injection_subq`** (G-423).
//
// `[read]` **Dieselbe Sache, zwei Schreibweisen** — wer die eine in
// die andere Spalte schreibt, bekommt einen CHECK-Fehler. **Die
// Umrechnung steht hier, an einer Stelle.**
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

import {
  INJEKTIONSWEGE_LOG, KOMPLIKATIONEN,
  type Injektionsweg_Log, type Komplikation,
} from './injektion-vokabular'

export class InjektionFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'NOT_FOUND' | 'VALIDATION_FAILED' | 'WRITE_FAILED',
    message: string,
    public felder?: Array<{ feld: string; text: string }>,
  ) {
    super(message)
    this.name = 'InjektionFehler'
  }
}

export type InjektionEingabe = {
  /** Die Kartenflaeche — `body_area_code`, NOT NULL. */
  body_area_code: string
  /** `YYYY-MM-DD`. */
  datum: string
  /** `HH:MM`. */
  uhrzeit: string
  /** Der Ort aus dem Entwurf (`glute_l` …), fuer `injection_site_id`. */
  ort_id: string
  route: Injektionsweg_Log
  substanz_name: string
  substance_id: string
  volume_ml: string
  dose_amount: string
  dose_unit: string
  needle_gauge: string
  needle_length_in: string
  pain_score: string
  komplikationen: Komplikation[]
  notes: string
}

export type GeschriebeneInjektion = {
  id: string
  injected_at: string
  body_area_code: string
  route: string | null
  volume_ml: number | null
  needle_gauge: string | null
}

const RUECKGABE = 'id, injected_at, body_area_code, route, volume_ml, needle_gauge'

function alsZeile(v: unknown): GeschriebeneInjektion {
  const z = v as Record<string, unknown>
  return {
    id: String(z.id),
    injected_at: String(z.injected_at),
    body_area_code: String(z.body_area_code),
    route: z.route == null ? null : String(z.route),
    volume_ml: z.volume_ml == null ? null : Number(z.volume_ml),
    needle_gauge: z.needle_gauge == null ? null : String(z.needle_gauge),
  }
}

async function sitzung() {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new InjektionFehler('NO_SESSION', 'Keine angemeldete Sitzung.')
  return { userId: user.id }
}

/**
 * Die Eingabe pruefen — was die Datenbank ohnehin abweist, hier mit
 * Feldbezug.
 *
 * `[read]` **Nur, was ein FELD betrifft.** Ob der Ort existiert,
 * entscheidet der Fremdschluessel; das ist keine Eigenschaft der
 * Eingabe.
 */
export function pruefeInjektion(
  e: InjektionEingabe,
): Array<{ feld: string; text: string }> {
  const felder: Array<{ feld: string; text: string }> = []

  if (!e.body_area_code.trim()) {
    felder.push({ feld: 'body_area_code', text: 'Eine Körperfläche wird gebraucht.' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.datum.trim())) {
    felder.push({ feld: 'datum', text: 'Ein Datum wird gebraucht.' })
  }
  if (!/^\d{2}:\d{2}$/.test(e.uhrzeit.trim())) {
    felder.push({ feld: 'uhrzeit', text: 'Eine Uhrzeit wird gebraucht.' })
  }
  // `[cmd]` **`im | sc`** — aus dem CHECK, nicht aus dem Kopf.
  if (!(INJEKTIONSWEGE_LOG as readonly string[]).includes(e.route)) {
    felder.push({ feld: 'route', text: 'Unbekannter Injektionsweg.' })
  }
  // `[read]` **Leer ist erlaubt** (die Spalte ist nullable) — **eine
  // Null oder ein negativer Wert nicht**, das verbietet der CHECK.
  for (const [wert, feld, name] of [
    [e.volume_ml, 'volume_ml', 'Das Volumen'],
    [e.dose_amount, 'dose_amount', 'Die Dosis'],
    [e.needle_length_in, 'needle_length_in', 'Die Nadellänge'],
  ] as const) {
    if (!wert.trim()) continue
    const n = Number(wert)
    if (!Number.isFinite(n) || n <= 0) {
      felder.push({ feld, text: `${name} muss größer als 0 sein.` })
    }
  }
  if (e.pain_score.trim()) {
    const p = Number(e.pain_score)
    if (!Number.isInteger(p) || p < 0 || p > 3) {
      felder.push({ feld: 'pain_score', text: 'Der Schmerzwert liegt zwischen 0 und 3.' })
    }
  }
  for (const k of e.komplikationen) {
    if (!(KOMPLIKATIONEN as readonly string[]).includes(k)) {
      felder.push({ feld: 'complication', text: `Unbekannte Komplikation: ${k}` })
    }
  }
  return felder
}

/**
 * Eine Injektion erfassen.
 *
 * `[read]` **`injection_site_id` ist NULLABLE und bleibt leer**, wenn
 * der Entwurfsort keine Entsprechung in `medical.injection_sites`
 * hat. `[cmd]` **Die Tabelle fuehrt vier Ortsarten, der Entwurf
 * sechzehn Orte** — ein erfundener Fremdschluessel waere schlimmer
 * als ein leerer.
 */
export async function injektionAnlegen(
  e: InjektionEingabe,
): Promise<GeschriebeneInjektion> {
  const felder = pruefeInjektion(e)
  if (felder.length > 0) {
    throw new InjektionFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const { userId } = await sitzung()
  const db = createSessionClient()

  // `[read]` **Datum und Uhrzeit werden hier zusammengesetzt** — die
  // Tabelle fuehrt EINEN Zeitpunkt, das Modal zwei Felder.
  const zeitpunkt = new Date(`${e.datum.trim()}T${e.uhrzeit.trim()}:00`)
  if (Number.isNaN(zeitpunkt.getTime())) {
    throw new InjektionFehler('VALIDATION_FAILED', 'Zeitpunkt nicht lesbar.',
      [{ feld: 'datum', text: 'Datum und Uhrzeit ergeben keinen Zeitpunkt.' }])
  }

  // `[cmd]` **Nur Orte, die es in `injection_sites` WIRKLICH gibt.**
  // `[read]` **Sonst schlaegt der Fremdschluessel zu** — und die
  // Nutzerin saehe eine Datenbankmeldung statt einer Zeile.
  let ortId: string | null = null
  if (e.ort_id.trim()) {
    const { data } = await db.schema('medical')
      .from('injection_sites').select('id').eq('id', e.ort_id.trim()).maybeSingle()
    ortId = (data as { id?: string } | null)?.id ?? null
  }

  const zahl = (s: string) => (s.trim() ? Number(s) : null)

  const { data, error } = await db
    .schema('medical')
    .from('injection_logs')
    .insert({
      user_id: userId,
      injected_at: zeitpunkt.toISOString(),
      body_area_code: e.body_area_code.trim(),
      injection_site_id: ortId,
      route: e.route,
      substance_name: e.substanz_name.trim() || null,
      substance_id: e.substance_id.trim() || null,
      volume_ml: zahl(e.volume_ml),
      dose_amount: zahl(e.dose_amount),
      dose_unit: e.dose_unit.trim() || null,
      needle_gauge: e.needle_gauge.trim() || null,
      needle_length_in: zahl(e.needle_length_in),
      pain_score: e.pain_score.trim() ? Number(e.pain_score) : null,
      // `[read]` **Leeres Feld heisst `null`, nicht `{}`** — ein
      // leeres Feld ist keine Angabe „keine Komplikation".
      complication: e.komplikationen.length > 0 ? e.komplikationen : null,
      notes: e.notes.trim() || null,
    })
    .select(RUECKGABE)

  if (error) throw new InjektionFehler('WRITE_FAILED', error.message)

  // `[cmd]` **G-79: PostgREST meldet `ok`, wenn der Zeilenschutz
  // leergefiltert hat** — ohne diese Pruefung saehe das wie Erfolg aus.
  const zeilen = (data ?? []) as unknown[]
  if (zeilen.length === 0) {
    throw new InjektionFehler('NOT_FOUND', 'Keine Zeile angelegt.')
  }
  return alsZeile(zeilen[0])
}
