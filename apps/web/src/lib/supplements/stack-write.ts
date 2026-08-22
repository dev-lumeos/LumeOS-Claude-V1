// Schreibwege fuer Supplements (G-148).
//
// MUSTER: `lib/nutrition/water-write.ts` — Session-Client mit der
// Identitaet der Nutzerin, `user_id` explizit gesetzt, kein
// Service-Client. Laeuft ausschliesslich serverseitig.
//
// ── DIE NULLZEILENPRUEFUNG IST PFLICHT ──────────────────────────
//
// `[cmd]` **G-79:** *„PostgREST meldet `ok` bei einem `update`, das der
// Zeilenschutz leergefiltert hat."* Jede Schreibfunktion hier haengt
// deshalb ein `.select(...)` an und prueft auf null Zeilen — sonst
// meldet ein Schreibversuch auf eine fremde Id Erfolg.
//
// `[read]` **RLS macht „gibt es nicht" und „gehoert jemand anderem"
// bewusst ununterscheidbar.** Beides wird NOT_FOUND; die Antwort
// verraet nicht, ob die Zeile existiert.
//
// ── KEINE DOSIERUNGSEMPFEHLUNG ──────────────────────────────────
//
// `[read]` **Eine Dosis erfassen ist etwas anderes, als eine zu raten.**
// Die Vorbelegung kommt aus `stack_items.dose` — was die Nutzerin
// selbst eingetragen hat. **Nicht aus `typical_dose_min/max`:** die
// Spalten sind auf allen 44 Katalogeintraegen leer, und G-91 hat sie
// deshalb aus dem Katalog entfernt.

import { createSessionClient } from '@lumeos/shared/session'

export class SupplementSchreibFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'NOT_FOUND' | 'VALIDATION_FAILED' | 'WRITE_FAILED',
    message: string,
  ) {
    super(message)
    this.name = 'SupplementSchreibFehler'
  }
}

function db() {
  return createSessionClient().schema('supplements')
}

async function sitzung() {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new SupplementSchreibFehler('NO_SESSION', 'Keine angemeldete Session.')
  return { userId: user.id }
}

/**
 * `intake_time` braucht Sekunden = 0.
 *
 * `[cmd]` `intake_logs_intake_time_check` verlangt
 * `EXTRACT(second FROM intake_time) = 0`. Ein `<input type="time">`
 * liefert `HH:MM`, das passt — aber manche Browser haengen `:SS` an.
 */
function zeitOderNull(roh: string | null | undefined): string | null {
  if (!roh) return null
  const t = roh.trim()
  const m = /^(\d{2}):(\d{2})/.exec(t)
  if (!m) throw new SupplementSchreibFehler('VALIDATION_FAILED', `Ungueltige Zeit: ${roh}`)
  return `${m[1]}:${m[2]}:00`
}

export type EinnahmeEingabe = {
  stack_item_id: string
  intake_date: string
  intake_time?: string | null
  status: 'taken' | 'skipped'
  /** Die tatsaechlich genommene Menge, wenn sie abweicht. */
  actual_dose?: number | null
  notes?: string | null
}

export type GeschriebeneEinnahme = {
  id: string
  intake_date: string
  intake_time: string | null
  status: string
  supplement_name_snapshot: string
  dose_snapshot: number
  dose_unit_snapshot: string
  notes: string | null
}

const EINNAHME_SPALTEN =
  'id, intake_date, intake_time, status, supplement_name_snapshot, '
  + 'dose_snapshot, dose_unit_snapshot, notes'

/**
 * Eine Einnahme erfassen — `taken` oder `skipped`.
 *
 * `[cmd]` **Die Momentaufnahme wird aus der Stack-Position gelesen,
 * nicht vom Browser uebernommen.** `supplement_name_snapshot`,
 * `dose_snapshot` und `dose_unit_snapshot` sind `NOT NULL`; kaemen sie
 * aus dem Formular, koennte eine Zeile einen Namen tragen, der nie im
 * Stack stand.
 *
 * `[read]` **Und der Lesezugriff ist zugleich die Rechtepruefung:**
 * `stack_items` ist ueber `user_stacks.user_id` geschuetzt. Wer eine
 * fremde Id schickt, bekommt keine Zeile — und damit NOT_FOUND, bevor
 * irgendetwas geschrieben wird.
 */
export async function erfasseEinnahme(
  eingabe: EinnahmeEingabe,
): Promise<GeschriebeneEinnahme> {
  const { userId } = await sitzung()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eingabe.intake_date)) {
    throw new SupplementSchreibFehler('VALIDATION_FAILED', 'intake_date muss YYYY-MM-DD sein.')
  }
  if (eingabe.actual_dose !== null && eingabe.actual_dose !== undefined
      && !(eingabe.actual_dose > 0)) {
    // `intake_logs_actual_dose_check` verlangt > 0 oder NULL.
    throw new SupplementSchreibFehler('VALIDATION_FAILED', 'actual_dose muss groesser als 0 sein.')
  }

  const { data: position, error: leseFehler } = await db()
    .from('stack_items')
    .select('id, dose, dose_unit, custom_name, supplement_id, supplement_catalog(name)')
    .eq('id', eingabe.stack_item_id)
    .maybeSingle()

  if (leseFehler) {
    throw new SupplementSchreibFehler('WRITE_FAILED', leseFehler.message)
  }
  if (!position) {
    throw new SupplementSchreibFehler('NOT_FOUND', 'Keine eigene Stack-Position mit dieser id.')
  }

  const p = position as unknown as {
    dose: number | string
    dose_unit: string
    custom_name: string | null
    supplement_catalog: { name: string } | { name: string }[] | null
  }
  // PostgREST liefert eingebettete Zeilen je nach Beziehung als Objekt
  // oder als Liste — beides abfangen.
  const katalog = Array.isArray(p.supplement_catalog)
    ? p.supplement_catalog[0] ?? null
    : p.supplement_catalog
  const name = p.custom_name ?? katalog?.name ?? null
  if (!name) {
    throw new SupplementSchreibFehler('WRITE_FAILED', 'Position ohne Namen — nicht erfassbar.')
  }

  const { data, error } = await db()
    .from('intake_logs')
    .insert({
      user_id: userId,
      stack_item_id: eingabe.stack_item_id,
      intake_date: eingabe.intake_date,
      intake_time: zeitOderNull(eingabe.intake_time),
      status: eingabe.status,
      supplement_name_snapshot: name,
      dose_snapshot: Number(p.dose),
      dose_unit_snapshot: p.dose_unit,
      actual_dose: eingabe.actual_dose ?? null,
      actual_dose_unit: eingabe.actual_dose != null ? p.dose_unit : null,
      notes: eingabe.notes?.trim() || null,
      measurement_source: 'manual',
    })
    .select(EINNAHME_SPALTEN)

  if (error) throw new SupplementSchreibFehler('WRITE_FAILED', error.message)
  const zeile = (data ?? [])[0] as unknown as GeschriebeneEinnahme | undefined
  if (!zeile) {
    throw new SupplementSchreibFehler('WRITE_FAILED', 'Insert lieferte keine Zeile zurueck.')
  }
  return zeile
}

/** Eine erfasste Einnahme wieder entfernen — die Fehlklick-Korrektur. */
export async function entferneEinnahme(id: string): Promise<{ entfernt: number }> {
  await sitzung()
  const { data, error } = await db()
    .from('intake_logs')
    .delete()
    .eq('id', id)
    .select('id')
  if (error) throw new SupplementSchreibFehler('WRITE_FAILED', error.message)
  const entfernt = Array.isArray(data) ? data.length : 0
  if (entfernt === 0) {
    // G-79: ohne diese Pruefung meldete ein Loeschversuch auf eine
    // fremde Id Erfolg.
    throw new SupplementSchreibFehler('NOT_FOUND', 'Keine eigene Einnahme mit dieser id.')
  }
  return { entfernt }
}

export type PositionEingabe = {
  /** Aus dem Katalog, oder `null` fuer einen freien Namen. */
  supplement_id?: string | null
  custom_name?: string | null
  dose: number
  dose_unit: string
  timing: string
  frequency?: string
  /**
   * C-224: der GEWAEHLTE Stack. Ohne Angabe gilt weiter der aktive.
   * Kein zweiter Rechteweg: die Id wird gegen die eigenen Stacks
   * geprueft, nicht blind eingesetzt.
   */
  stack_id?: string | null
  /** C-224: der Anker zur Substanzdatenbank, z. B. `substance_catalog:sub_…`. */
  notes?: string | null
}

/**
 * Eine Position zum aktiven ODER zum gewaehlten Stack hinzufuegen.
 *
 * `[cmd]` **Der Stack wird geprueft, nicht uebernommen** — eine
 * uebergebene `stack_id` zaehlt nur, wenn sie zu einem eigenen Stack
 * gehoert (`user_id`-Abfrage; die Zeilenrechte pruefen zusaetzlich).
 * Gibt es keinen Treffer, ist das ein Befund und kein Grund, still
 * einen Stack anzulegen.
 */
export async function ergaenzePosition(
  eingabe: PositionEingabe,
): Promise<{ id: string; name: string }> {
  const { userId } = await sitzung()

  if (!(eingabe.dose > 0)) {
    throw new SupplementSchreibFehler('VALIDATION_FAILED', 'Die Dosis muss groesser als 0 sein.')
  }
  if (!eingabe.dose_unit.trim()) {
    throw new SupplementSchreibFehler('VALIDATION_FAILED', 'Die Einheit fehlt.')
  }
  if (!eingabe.supplement_id && !eingabe.custom_name?.trim()) {
    throw new SupplementSchreibFehler('VALIDATION_FAILED',
      'Entweder ein Katalogeintrag oder ein eigener Name.')
  }

  let stackAbfrage = db()
    .from('user_stacks')
    .select('id')
    .eq('user_id', userId)
  stackAbfrage = eingabe.stack_id
    ? stackAbfrage.eq('id', eingabe.stack_id)
    : stackAbfrage.eq('is_active', true)
  const { data: stack, error: stackFehler } = await stackAbfrage.maybeSingle()
  if (stackFehler) throw new SupplementSchreibFehler('WRITE_FAILED', stackFehler.message)
  if (!stack) {
    throw new SupplementSchreibFehler('NOT_FOUND', eingabe.stack_id
      ? 'Kein eigener Stack mit dieser id.'
      : 'Kein aktiver Stack — es gibt nichts, wozu die Position gehoeren koennte.')
  }

  const { data, error } = await db()
    .from('stack_items')
    .insert({
      stack_id: (stack as unknown as { id: string }).id,
      supplement_id: eingabe.supplement_id ?? null,
      custom_name: eingabe.custom_name?.trim() || null,
      dose: eingabe.dose,
      dose_unit: eingabe.dose_unit.trim(),
      timing: eingabe.timing,
      frequency: eingabe.frequency ?? 'daily',
      notes: eingabe.notes?.trim() || null,
    })
    .select('id, custom_name, supplement_catalog(name)')

  if (error) throw new SupplementSchreibFehler('WRITE_FAILED', error.message)
  const zeile = (data ?? [])[0] as unknown as {
    id: string; custom_name: string | null
    supplement_catalog: { name: string } | { name: string }[] | null
  } | undefined
  if (!zeile) {
    throw new SupplementSchreibFehler('WRITE_FAILED', 'Insert lieferte keine Zeile zurueck.')
  }
  const katalog = Array.isArray(zeile.supplement_catalog)
    ? zeile.supplement_catalog[0] ?? null
    : zeile.supplement_catalog
  return { id: zeile.id, name: zeile.custom_name ?? katalog?.name ?? '—' }
}

/** Eine Position wieder entfernen. */
export async function entfernePosition(id: string): Promise<{ entfernt: number }> {
  await sitzung()
  const { data, error } = await db()
    .from('stack_items').delete().eq('id', id).select('id')
  if (error) throw new SupplementSchreibFehler('WRITE_FAILED', error.message)
  const entfernt = Array.isArray(data) ? data.length : 0
  if (entfernt === 0) {
    throw new SupplementSchreibFehler('NOT_FOUND', 'Keine eigene Position mit dieser id.')
  }
  return { entfernt }
}

/**
 * Den Bestand einer Position setzen — der Nachbestellweg (`ReorderModal`).
 *
 * `[cmd]` **Es gibt keine `user_inventory`-Tabelle.** Der Bestand steht
 * in `stack_items.stock_remaining`, die Schwelle in
 * `low_stock_threshold` — beide sind seit G-74 gelesen und gerechnet
 * (`tage_bis_leer`, `unter_schwelle`).
 */
export async function setzeBestand(
  id: string, stock_remaining: number, low_stock_threshold?: number | null,
): Promise<{ id: string; stock_remaining: number | null }> {
  await sitzung()
  if (!(stock_remaining >= 0)) {
    throw new SupplementSchreibFehler('VALIDATION_FAILED', 'Der Bestand darf nicht negativ sein.')
  }
  const feld: Record<string, unknown> = { stock_remaining }
  if (low_stock_threshold !== undefined) feld.low_stock_threshold = low_stock_threshold

  const { data, error } = await db()
    .from('stack_items').update(feld).eq('id', id)
    .select('id, stock_remaining')
  if (error) throw new SupplementSchreibFehler('WRITE_FAILED', error.message)
  const zeile = (data ?? [])[0] as unknown as
    { id: string; stock_remaining: number | null } | undefined
  if (!zeile) {
    throw new SupplementSchreibFehler('NOT_FOUND', 'Keine eigene Position mit dieser id.')
  }
  return zeile
}
