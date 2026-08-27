// ════════════════════════════════════════════════════════════════════
// DIE EINE SCHREIBSTELLE FUER `goals.body_measurements` — G-122
// ════════════════════════════════════════════════════════════════════
//
// ══ DIE NAHT ════════════════════════════════════════════════════════
//
// `[read]` **Eine Schreibstelle je Ziel**, wie in G-211 gebaut und
// dort per Sabotage bewacht. **Hier ist es EINE Naht ohne zweites
// Ende:** die Oberflaeche ruft eine Serveraktion, die Serveraktion
// ruft diese Datei. **Keine HTTP-Route** — anders als bei G-138, wo
// `api/supplements/intake` historisch bereits stand.
//
// `[read]` **Warum keine Route:** eine Route ist ein zweiter Weg, der
// bewacht werden muss. Die drei Ziele dieses Auftrags haben keinen
// Aufrufer ausserhalb der eigenen Seite — **ein zweites Ende waere
// gebaut, ohne gebraucht zu werden.**
//
// ══ DER SNAPSHOT ════════════════════════════════════════════════════
//
// `[cmd]` **`height_cm_snapshot` ist der Snapshot dieser Tabelle** —
// bei allen 362 Zeilen gefuellt (gemessen 2026-08-27). Er stammt aus
// `public.profiles.height_cm`.
//
// `[read]` **Er wird beim SCHREIBEN eingefroren, nicht beim Lesen
// nachgeschlagen.** Das ist der Nachweis aus G-138, hier auf eine
// andere Groesse angewandt: **wer seine Groesse im Profil korrigiert,
// darf damit nicht rueckwirkend jedes BMI der Vergangenheit
// aendern.**
//
// `[read]` **Und es haengt mehr daran als bei G-138:** aus der
// Groesse folgen `bmi` UND `ffmi`. Eine spaetere Korrektur wuerde
// ohne Snapshot vier Werte je Zeile verschieben.
//
// MUSTER: `lib/goals/schreiben.ts` (G-79) — Session-Client mit der
// Identitaet der Nutzerin, `user_id` explizit, kein Service-Client.
// Laeuft ausschliesslich serverseitig.
//
// ── DIE NULLZEILENPRUEFUNG IST PFLICHT ──────────────────────────────
//
// `[cmd]` **G-79:** PostgREST meldet `ok` bei einem `update`, das der
// Zeilenschutz leergefiltert hat.
import { createSessionClient } from '@lumeos/shared/session'

import {
  pruefeMessung, abgeleitet, zahl,
  type KoerpermassEingabe, type Feldfehler,
} from './koerpermass-rechnung'

export class KoerpermassFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'NOT_FOUND' | 'VALIDATION_FAILED' | 'WRITE_FAILED',
    message: string,
    public felder?: Feldfehler[],
  ) {
    super(message)
    this.name = 'KoerpermassFehler'
  }
}

function db() {
  return createSessionClient().schema('goals')
}

async function sitzung() {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new KoerpermassFehler('NO_SESSION', 'Keine angemeldete Sitzung.')
  return { userId: user.id }
}

/**
 * Die Groesse aus dem Profil — EINMAL, beim Schreiben.
 *
 * `[read]` **Diese Funktion ist der Snapshot.** Sie wird beim Anlegen
 * gerufen und beim Aendern NICHT — eine bestehende Messung behaelt
 * ihre eingefrorene Groesse.
 *
 * `[cmd]` `public.profiles.height_cm` ist nullable; **fehlt sie,
 * entstehen kein BMI und kein FFMI** (siehe `OHNE_GROESSE`).
 */
async function groesseAusProfil(userId: string): Promise<number | null> {
  const { data, error } = await createSessionClient()
    .from('profiles')
    .select('height_cm')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new KoerpermassFehler('WRITE_FAILED', error.message)
  const h = (data as unknown as { height_cm: number | null } | null)?.height_cm
  return typeof h === 'number' && h > 0 ? h : null
}

export type GeschriebeneMessung = {
  id: string
  measurement_date: string
  measurement_time: string
  weight_kg: number
  body_fat_pct: number | null
  height_cm_snapshot: number | null
  bmi: number | null
  ffmi: number | null
  lean_mass_kg: number | null
  fat_mass_kg: number | null
}

const RUECKGABE = 'id, measurement_date, measurement_time, weight_kg, '
  + 'body_fat_pct, height_cm_snapshot, bmi, ffmi, lean_mass_kg, fat_mass_kg'

function alsZeile(v: unknown): GeschriebeneMessung {
  const z = v as Record<string, unknown>
  const n = (x: unknown) => (x == null ? null : Number(x))
  return {
    id: String(z.id),
    measurement_date: String(z.measurement_date),
    measurement_time: String(z.measurement_time),
    weight_kg: Number(z.weight_kg),
    body_fat_pct: n(z.body_fat_pct),
    height_cm_snapshot: n(z.height_cm_snapshot),
    bmi: n(z.bmi), ffmi: n(z.ffmi),
    lean_mass_kg: n(z.lean_mass_kg), fat_mass_kg: n(z.fat_mass_kg),
  }
}

/**
 * Eine Koerpermessung anlegen.
 *
 * `[cmd]` **`body_measurements_user_date_time_uq`** verlangt
 * `(user_id, measurement_date, measurement_time)` eindeutig — zwei
 * Messungen am selben Tag brauchen verschiedene Uhrzeiten.
 */
export async function messungAnlegen(
  e: KoerpermassEingabe,
): Promise<GeschriebeneMessung> {
  const felder = pruefeMessung(e)
  if (felder.length > 0) {
    throw new KoerpermassFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const { userId } = await sitzung()

  // ══ HIER wird eingefroren — und NUR das ═══════════════════════════
  //
  // `[cmd]` **`bmi`, `ffmi`, `lean_mass_kg` und `fat_mass_kg` sind
  // `GENERATED ALWAYS`** (gemessen 2026-08-27 gegen
  // `information_schema.columns`). **Die Datenbank rechnet sie, und
  // sie weist einen Insert ab, der sie setzt:**
  //
  //     ERROR: cannot insert a non-DEFAULT value into column
  //            "lean_mass_kg" — is a generated column
  //
  // `[read]` **Damit ist `height_cm_snapshot` das einzige Feld, das
  // dieser Schreibweg einfrieren muss** — die vier abgeleiteten
  // folgen ihm automatisch, auch rueckwirkend richtig, weil sie aus
  // dem Snapshot rechnen und nicht aus dem Profil.
  const hoehe = await groesseAusProfil(userId)
  const gewicht = zahl(e.weight_kg) as number
  const bf = zahl(e.body_fat_pct)

  const { data, error } = await db()
    .from('body_measurements')
    .insert({
      user_id: userId,
      measurement_date: e.measurement_date.trim(),
      measurement_time: e.measurement_time.trim(),
      weight_kg: gewicht,
      body_fat_pct: bf === null || Number.isNaN(bf) ? null : bf,
      bf_method: e.bf_method.trim() || null,
      height_cm_snapshot: hoehe,
      notes: e.notes.trim() || null,
      measurement_source: 'manual',
    })
    .select(RUECKGABE)
  if (error) throw new KoerpermassFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  if (zeilen.length === 0) throw new KoerpermassFehler('NOT_FOUND', 'Nicht angelegt.')
  return alsZeile(zeilen[0])
}

/**
 * Eine Messung aendern.
 *
 * ══ DER SNAPSHOT BLEIBT ═════════════════════════════════════════════
 *
 * `[read]` **`height_cm_snapshot` wird NICHT neu geholt.** Er gehoert
 * zum Zeitpunkt der Messung — wer heute seine Groesse korrigiert,
 * aendert damit nicht, wie gross er im Maerz war.
 *
 * `[cmd]` **Die abgeleiteten Werte werden trotzdem neu gerechnet** —
 * aus dem NEUEN Gewicht und der ALTEN Groesse. Sonst stuende nach
 * einer Gewichtskorrektur ein BMI, der nicht mehr zum Gewicht passt.
 */
export async function messungAendern(
  id: string, e: KoerpermassEingabe,
): Promise<GeschriebeneMessung> {
  const felder = pruefeMessung(e)
  if (felder.length > 0) {
    throw new KoerpermassFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const { userId } = await sitzung()

  // `[read]` **Der Lesezugriff ist zugleich die Rechtepruefung** —
  // RLS gibt keine fremde Zeile heraus. Und er belegt, dass die Zeile
  // existiert, bevor geschrieben wird.
  const { data: alt, error: leseFehler } = await db()
    .from('body_measurements')
    .select('height_cm_snapshot')
    .eq('id', id)
    .maybeSingle()
  if (leseFehler) throw new KoerpermassFehler('WRITE_FAILED', leseFehler.message)
  if (!alt) throw new KoerpermassFehler('NOT_FOUND', 'Keine eigene Messung mit dieser id.')

  const gewicht = zahl(e.weight_kg) as number
  const bf = zahl(e.body_fat_pct)

  // ══ `height_cm_snapshot` STEHT NICHT IM RUMPF ═════════════════════
  //
  // `[read]` **Das ist die ganze Zusage dieser Funktion.** Der
  // Snapshot bleibt, was er beim Anlegen war — und weil `bmi` und
  // `ffmi` generiert sind, rechnen sie automatisch mit der ALTEN
  // Groesse und dem NEUEN Gewicht weiter.
  const { data, error } = await db()
    .from('body_measurements')
    .update({
      measurement_date: e.measurement_date.trim(),
      measurement_time: e.measurement_time.trim(),
      weight_kg: gewicht,
      body_fat_pct: bf === null || Number.isNaN(bf) ? null : bf,
      bf_method: e.bf_method.trim() || null,
      notes: e.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select(RUECKGABE)
  if (error) throw new KoerpermassFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  if (zeilen.length === 0) throw new KoerpermassFehler('NOT_FOUND', 'Nicht gefunden.')
  return alsZeile(zeilen[0])
}
