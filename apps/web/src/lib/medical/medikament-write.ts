// ════════════════════════════════════════════════════════════════════
// DIE EINE SCHREIBSTELLE FUER `medical.user_medications` — G-211
// ════════════════════════════════════════════════════════════════════
//
// ══ WARUM ALLES DURCH DIESE DATEI LAEUFT ════════════════════════════
//
// **Auftrag G-211: *„Alle Schreibzugriffe durch genau eine Stelle
// fuehren."***
//
// `[read]` **Der Grund steht in `docs/todo/SICHERHEIT.md`, und er ist
// ein Datum, kein Prinzip.** C-285 hat entschieden: **in dieser Phase
// wird nicht verschluesselt** — alles laeuft lokal, zwei Konten tragen
// echte Daten, kein Fremdzugriff. **Verschoben, nicht gestrichen.**
//
// `[cmd]` **Die Entscheidung kippt bei jeder dieser vier Bedingungen**
// (SICHERHEIT.md, Abschnitt *„Wann diese Entscheidung kippt"*):
//
//     1. der erste Nutzer, der nicht wir ist
//     2. die Datenbank verlaesst diesen Rechner
//     3. echte Medikamente statt Seed-Daten
//     4. der Coach-Zugriff wird gegen einen echten Coach benutzt
//
// `[read]` **Punkt 3 trifft genau diese Datei.** Der Tag, an dem
// jemand seine echten Medikamente eintraegt, um zu sehen ob die Regeln
// stimmen, ist der Tag, an dem SICHERHEIT.md faellig wird — **und
// dieser Erfassungsweg ist die Einladung dazu.**
//
// ══ WAS DANN ZU AENDERN IST, UND WO ═════════════════════════════════
//
// `[cmd]` **Genau drei Spalten sind Freitext** und gehoeren dann
// verschluesselt (SICHERHEIT.md, Abschnitt 1):
//
//     name         der Handelsname, wie ihn der Mensch kennt
//     indication   *„Sertralin wegen Depression seit der Trennung"*
//     notes        alles, was sonst niemanden angeht
//
// `[read]` **Der Rest bleibt klar** — `active_substance_id`,
// `drug_class`, `cyp_profile`, `dose_amount`, `route`. **Sonst hoert
// die Regelauswertung auf zu funktionieren:** 30 der 64 Regeln lesen
// `drug_class` und `cyp_profile` (gemessen 2026-08-27).
//
// `[read]` **Und deshalb ist diese Buendelung die ganze Vorleistung:**
// wenn die drei Felder verschluesselt werden, sind es hier **drei
// Funktionen mit je einer Umhuellung** — `anlegen`, `aendern`,
// `absetzen`. Verstreute Zugriffe waeren eine Suche durch die
// Codebasis mit der Gewissheit, eine Stelle zu uebersehen.
//
// `[read]` **Was hier NICHT gebaut wird:** keine Verschluesselung auf
// Vorrat. SICHERHEIT.md sagt warum — *„Verschluesselte Spalten mit dem
// Schluessel im selben System sehen nach Schutz aus und sind kaum
// einer; das ist schlechter als bewusster Klartext."* **Die Frage
// *vor wem schuetzt es* ist nicht beantwortet, und ohne die Antwort
// ist jeder Bau geraten.**
//
// ══ DAS MUSTER ══════════════════════════════════════════════════════
//
// MUSTER: `lib/supplements/stack-write.ts` (G-148) — Session-Client
// mit der Identitaet der Nutzerin, `user_id` explizit gesetzt, kein
// Service-Client. Laeuft ausschliesslich serverseitig.
//
// ── DIE NULLZEILENPRUEFUNG IST PFLICHT ──────────────────────────────
//
// `[cmd]` **G-79:** *„PostgREST meldet `ok` bei einem `update`, das
// der Zeilenschutz leergefiltert hat."* Jede Schreibfunktion haengt
// deshalb ein `.select(...)` an und prueft auf null Zeilen — sonst
// meldet ein Schreibversuch auf eine fremde Id Erfolg.
//
// `[read]` **RLS macht *„gibt es nicht"* und *„gehoert jemand
// anderem"* bewusst ununterscheidbar.** Beides wird `NOT_FOUND`.
import { createSessionClient } from '@lumeos/shared/session'

import {
  pruefeEingabe, absetzenGueltig,
  type MedikamentEingabe,
} from './medikament-eingabe'

export class MedikamentSchreibFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'NOT_FOUND' | 'VALIDATION_FAILED' | 'WRITE_FAILED',
    message: string,
    /** Die Feldfehler, wenn es eine Eingabepruefung war. */
    public felder?: Array<{ feld: string; text: string }>,
  ) {
    super(message)
    this.name = 'MedikamentSchreibFehler'
  }
}

function db() {
  return createSessionClient().schema('medical')
}

async function sitzung() {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new MedikamentSchreibFehler('NO_SESSION', 'Keine angemeldete Session.')
  }
  return { userId: user.id }
}

function zahlOderNull(roh: string): number | null {
  const t = roh.trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

function textOderNull(roh: string): string | null {
  const t = roh.trim()
  return t ? t : null
}

/**
 * Wirkstoffdaten aus dem Katalog holen — der Kern des Auftrags.
 *
 * ══ WARUM DIESE FUNKTION DER EIGENTLICHE PUNKT IST ══════════════════
 *
 * **Auftrag: *„Wer Scemblix eintraegt, muss auf `drug_0642bd1e2f`
 * landen — sonst feuert keine der Regeln."***
 *
 * `[cmd]` **Und die Kette ist laenger, als sie klingt.** Die Regeln
 * lesen **nicht** `active_substance_id`. Gemessen 2026-08-27 ueber
 * `supplements.rule_catalog.input_paths`:
 *
 *     medications                          20 Regeln
 *     medical.medications[].drug_class      9
 *     medical.medications[].cyp_profile     1
 *
 * `[read]` **Die Zuordnung wirkt also mittelbar:** sie holt
 * `drug_class` und `cyp_profile` aus dem Katalog auf die Zeile, und
 * **diese beiden Felder sind es, die eine Regel treffen kann.** Ohne
 * Zuordnung bleiben sie auf ihrem Vorgabewert `'{}'` — und keine
 * Bedingung greift.
 *
 * `[cmd]` **`cyp_profile` ist nur bei 22 der 498 Wirkstoffe
 * gefuellt**, `drug_class` bei allen 498. **Auch eine korrekte
 * Zuordnung garantiert also nicht, dass eine CYP-Regel greifen
 * kann** — sie ist die Voraussetzung, nicht die Zusage.
 *
 * `[read]` **Kopiert wird, nicht verwiesen.** Der Wert wird zum
 * Zeitpunkt der Erfassung uebernommen (`frozen_at` traegt den
 * Zeitstempel) — **so wie es die Spalten schon vorsehen.** Wer den
 * Katalog spaeter korrigiert, aendert damit nicht rueckwirkend, was
 * jemand genommen hat.
 */
async function katalogFelder(id: string | null): Promise<{
  drug_class: string[]
  cyp_profile: string[]
}> {
  if (!id) return { drug_class: [], cyp_profile: [] }
  const { data, error } = await db()
    .from('medication_active_substances')
    .select('drug_class, cyp_profile')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new MedikamentSchreibFehler('WRITE_FAILED', error.message)
  if (!data) {
    // `[read]` **Nicht auf „irgendeinen Wirkstoff" fallen.** Dieselbe
    // Regel wie in G-210: ein falscher Wirkstoff ist schlimmer als
    // keiner. `[cmd]` Der Fremdschluessel
    // `user_medications_active_substance_id_fkey` weist es ohnehin
    // ab — das hier ist der Satz dazu, nicht der Schutz.
    throw new MedikamentSchreibFehler(
      'VALIDATION_FAILED',
      'Diesen Wirkstoff gibt es im Katalog nicht.',
      [{ feld: 'active_substance_id', text: 'Unbekannter Wirkstoff.' }],
    )
  }
  const z = data as unknown as Record<string, unknown>
  const feld = (v: unknown): string[] => Array.isArray(v)
    ? v.map(e => String(e ?? '').trim()).filter(Boolean) : []
  return { drug_class: feld(z.drug_class), cyp_profile: feld(z.cyp_profile) }
}

/** Eine Zeile, wie der Schreibweg sie zurueckgibt. */
export type GeschriebenesMedikament = {
  id: string
  name: string
  active_substance_id: string | null
  is_active: boolean
  start_date: string
  end_date: string | null
}

const RUECKGABE = 'id, name, active_substance_id, is_active, start_date, end_date'

function alsZeile(v: unknown): GeschriebenesMedikament {
  const z = v as Record<string, unknown>
  return {
    id: String(z.id),
    name: String(z.name),
    active_substance_id: typeof z.active_substance_id === 'string'
      ? z.active_substance_id : null,
    is_active: z.is_active === true,
    start_date: String(z.start_date),
    end_date: typeof z.end_date === 'string' ? z.end_date : null,
  }
}

/**
 * Ein Medikament anlegen.
 *
 * `[read]` **`active_substance_id` darf `null` sein**, und das ist
 * kein Sonderfall, sondern der dritte Zustand aus
 * `medikament-eingabe.ts`. **Der Katalog kennt keine deutschen
 * Handelsnamen** (`DE` bei 0 von 448 Produkten, G-210) — wer Concor
 * nimmt, muss es eintragen koennen.
 */
export async function medikamentAnlegen(
  e: MedikamentEingabe,
): Promise<GeschriebenesMedikament> {
  const felder = pruefeEingabe(e)
  if (felder.length > 0) {
    throw new MedikamentSchreibFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const { userId } = await sitzung()
  const kat = await katalogFelder(e.active_substance_id)

  const { data, error } = await db()
    .from('user_medications')
    .insert({
      user_id: userId,
      name: e.name.trim(),
      active_substance_id: e.active_substance_id || null,
      drug_class: kat.drug_class,
      cyp_profile: kat.cyp_profile,
      dose_amount: zahlOderNull(e.dose_amount),
      dose_unit: textOderNull(e.dose_unit),
      doses_per_day: zahlOderNull(e.doses_per_day),
      route: textOderNull(e.route),
      start_date: e.start_date.trim(),
      indication: textOderNull(e.indication),
      notes: textOderNull(e.notes),
      measurement_source: 'manual',
    })
    .select(RUECKGABE)
  if (error) throw new MedikamentSchreibFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  // G-79: PostgREST meldet Erfolg, wenn RLS leerfiltert.
  if (zeilen.length === 0) {
    throw new MedikamentSchreibFehler('NOT_FOUND', 'Nicht angelegt.')
  }
  return alsZeile(zeilen[0])
}

/**
 * Ein Medikament aendern.
 *
 * `[read]` **Nur die Felder, die das Formular fuehrt.** `start_date`
 * bleibt, `is_active` und `end_date` gehoeren dem Absetzen — **wer
 * beides ueber dieselbe Funktion aendern kann, setzt irgendwann
 * versehentlich ab.**
 *
 * `[read]` **Die Zuordnung darf sich aendern**, und dann werden
 * `drug_class` und `cyp_profile` neu aus dem Katalog geholt. Sonst
 * stuende dort der Klassensatz des alten Wirkstoffs — **und die
 * Regeln liefen auf einer Angabe, die nicht mehr gilt.**
 */
export async function medikamentAendern(
  id: string, e: MedikamentEingabe,
): Promise<GeschriebenesMedikament> {
  const felder = pruefeEingabe(e)
  if (felder.length > 0) {
    throw new MedikamentSchreibFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  await sitzung()
  const kat = await katalogFelder(e.active_substance_id)

  const { data, error } = await db()
    .from('user_medications')
    .update({
      name: e.name.trim(),
      active_substance_id: e.active_substance_id || null,
      drug_class: kat.drug_class,
      cyp_profile: kat.cyp_profile,
      dose_amount: zahlOderNull(e.dose_amount),
      dose_unit: textOderNull(e.dose_unit),
      doses_per_day: zahlOderNull(e.doses_per_day),
      route: textOderNull(e.route),
      start_date: e.start_date.trim(),
      indication: textOderNull(e.indication),
      notes: textOderNull(e.notes),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(RUECKGABE)
  if (error) throw new MedikamentSchreibFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  if (zeilen.length === 0) {
    throw new MedikamentSchreibFehler('NOT_FOUND', 'Nicht gefunden.')
  }
  return alsZeile(zeilen[0])
}

/**
 * Ein Medikament absetzen — NICHT loeschen.
 *
 * ══ WARUM HIER KEIN `delete` STEHT ══════════════════════════════════
 *
 * **Auftrag: *„Absetzen ist kein Loeschen. Was jemand genommen hat,
 * bleibt Teil seiner Geschichte — und eine Wechselwirkung, die vor
 * drei Wochen galt, erklaert einen Laborwert von heute."***
 *
 * `[cmd]` **Die Tabelle hat beide Spalten:** `end_date` (nullable)
 * und `is_active` (`NOT NULL DEFAULT true`). **Sie sind genau dafuer
 * da.**
 *
 * `[cmd]` **`authenticated` HAT das DELETE-Recht** und es gibt eine
 * `user_medications_delete`-Policy. `[read]` **Diese Datei benutzt
 * beides nicht** — nicht weil es unmoeglich waere, sondern weil es
 * die falsche Handlung ist. **Wer wirklich loeschen will, braucht
 * eine eigene Entscheidung und eine eigene Funktion.**
 */
export async function medikamentAbsetzen(
  id: string, start_date: string, end_date: string,
): Promise<GeschriebenesMedikament> {
  const felder = absetzenGueltig(start_date, end_date)
  if (felder.length > 0) {
    throw new MedikamentSchreibFehler(
      'VALIDATION_FAILED', 'Das Absetzdatum passt nicht.', felder)
  }
  await sitzung()
  const { data, error } = await db()
    .from('user_medications')
    .update({
      is_active: false,
      end_date: end_date.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(RUECKGABE)
  if (error) throw new MedikamentSchreibFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  if (zeilen.length === 0) {
    throw new MedikamentSchreibFehler('NOT_FOUND', 'Nicht gefunden.')
  }
  return alsZeile(zeilen[0])
}

/**
 * Ein abgesetztes Medikament wieder aufnehmen.
 *
 * `[read]` **Die Gegenrichtung gehoert dazu**, sonst ist Absetzen
 * doch endgueltig — nur ohne `delete`. `end_date` faellt weg,
 * `is_active` wird wieder wahr; **die Zeile und ihr `start_date`
 * bleiben, was sie waren.**
 */
export async function medikamentFortsetzen(
  id: string,
): Promise<GeschriebenesMedikament> {
  await sitzung()
  const { data, error } = await db()
    .from('user_medications')
    .update({ is_active: true, end_date: null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(RUECKGABE)
  if (error) throw new MedikamentSchreibFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  if (zeilen.length === 0) {
    throw new MedikamentSchreibFehler('NOT_FOUND', 'Nicht gefunden.')
  }
  return alsZeile(zeilen[0])
}
