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

async function supplementName(id: string | null | undefined): Promise<string | null> {
  if (!id) return null
  const { data, error } = await db()
    .from('supplements')
    .select('name_de, name_en')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new SupplementSchreibFehler('WRITE_FAILED', error.message)
  const zeile = data as unknown as { name_de: string | null; name_en: string | null } | null
  return zeile?.name_de?.trim() || zeile?.name_en?.trim() || null
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

  // ══ G-138: eine unbrauchbare Id ist ein Eingabefehler ══════════════
  //
  // `[cmd]` **Gemessen 2026-08-27:** ein `stack_item_id` von `"x"`
  // ergab **HTTP 500** mit `WRITE_FAILED` und der rohen
  // Postgres-Meldung *„invalid input syntax for type uuid"*.
  //
  // `[read]` **Falscher Code und ein Leck.** 500 heisst *„der Server
  // hat einen Fehler"* — hier hat der Aufrufer einen. Und die
  // durchgereichte Datenbankmeldung verraet Typ und Spaltennamen an
  // eine Stelle, die sie nichts angehen.
  //
  // `[read]` **Die Pruefung steht neben der Datumspruefung**, nicht
  // stattdessen: dieselbe Sorte Eingabe, dieselbe Sorte Antwort.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    .test(eingabe.stack_item_id.trim())) {
    throw new SupplementSchreibFehler(
      'VALIDATION_FAILED', 'stack_item_id muss eine UUID sein.')
  }
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
    .select('id, dose, dose_unit, custom_name, supplement_id')
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
    supplement_id: string | null
  }
  const name = p.custom_name ?? await supplementName(p.supplement_id)
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
    .select('id, custom_name, supplement_id')

  if (error) throw new SupplementSchreibFehler('WRITE_FAILED', error.message)
  const zeile = (data ?? [])[0] as unknown as {
    id: string; custom_name: string | null
    supplement_id: string | null
  } | undefined
  if (!zeile) {
    throw new SupplementSchreibFehler('WRITE_FAILED', 'Insert lieferte keine Zeile zurueck.')
  }
  return { id: zeile.id, name: zeile.custom_name ?? await supplementName(zeile.supplement_id) ?? '—' }
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


// ══ G-372: aktivieren und uebernehmen ═══════════════════════
//
// **Tom, 2026-09-08:** *,,ist ja alles huebsch, aber was soll mir eine
// uebersicht bringen ohne funktionen? ich kann weder reinschauen, noch
// editieren, noch aktivieren."*
//
// `[cmd]` **Fuenf DB-Funktionen stehen** (C-423) —
// `create_curated_stack_template`, `publish_stack_template`,
// `withdraw_stack_template`, `decide_stack_curation_candidate`,
// `refresh_stack_item_count`. **Keine davon aktiviert einen Stack
// oder uebernimmt eine Vorlage.**
//
// `[cmd]` **Sie werden dafuer auch nicht gebraucht:** `authenticated`
// hat INSERT, SELECT, UPDATE und DELETE auf `user_stacks` und
// `stack_items` — gemessen ueber `role_table_grants`. **Beides geht
// ueber den Sitzungsclient, wie jeder andere Schreibweg hier.**

/**
 * Einen Stack aktivieren — G-372.
 *
 * `[cmd]` **`uq_user_stacks_one_active` ist ein partieller
 * Eindeutigkeitsindex** (`ON (user_id) WHERE is_active`). **Wer den
 * neuen aktiviert, bevor der alte abgeschaltet ist, kollidiert.**
 * Deshalb erst abschalten, dann einschalten.
 *
 * `[read]` **Und das ist genau der Ablauf der Spec** (`SPEC_03`,
 * Flow 2): *,,Dein bisheriger aktiver Stack wird pausiert."*
 */
export async function aktiviereStack(
  stackId: string,
): Promise<{ aktiviert: string; deaktiviert: number }> {
  const { userId } = await sitzung()

  // 1 · Gehoert der Stack ueberhaupt der Nutzerin?
  const { data: ziel, error: zielFehler } = await db()
    .from('user_stacks')
    .select('id, is_active')
    .eq('user_id', userId)
    .eq('id', stackId)
    .maybeSingle()
  if (zielFehler) throw new SupplementSchreibFehler('WRITE_FAILED', zielFehler.message)
  if (!ziel) throw new SupplementSchreibFehler('NOT_FOUND', 'Kein eigener Stack mit dieser id.')

  // 2 · Die bisherigen abschalten — VOR dem Einschalten.
  const { data: vorher, error: ausFehler } = await db()
    .from('user_stacks')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true)
    .neq('id', stackId)
    .select('id')
  if (ausFehler) throw new SupplementSchreibFehler('WRITE_FAILED', ausFehler.message)

  // 3 · Und den gewaehlten einschalten.
  const { data: an, error: anFehler } = await db()
    .from('user_stacks')
    .update({ is_active: true })
    .eq('user_id', userId)
    .eq('id', stackId)
    .select('id')
  if (anFehler) throw new SupplementSchreibFehler('WRITE_FAILED', anFehler.message)
  // `[read]` **Die Nullzeilenpruefung** (G-79): ein `update`, das der
  // Zeilenschutz leergefiltert hat, meldet trotzdem `ok`.
  if (!(an ?? []).length) {
    throw new SupplementSchreibFehler('WRITE_FAILED', 'Update lieferte keine Zeile zurueck.')
  }

  return { aktiviert: stackId, deaktiviert: (vorher ?? []).length }
}

// ══ G-372: zwei Ziel-Vokabulare ══════════════════════════
//
// `[cmd]` **Gemessen am 2026-09-08, und es ist ein Befund:**
//
//     stack_templates.goal   KEIN CHECK — freier Text
//                            belegt: body_composition, health,
//                            lifestyle, performance
//     user_stacks.goal       CHECK auf SIEBEN Werte
//                            muscle_building, fat_loss,
//                            recovery_sleep, health, longevity,
//                            performance, custom
//
// `[read]` **Nur `health` und `performance` stehen in beiden.**
// **`body_composition` und `lifestyle` gibt es im Stack nicht** —
// die Uebernahme fiel an `user_stacks_goal_check`.
//
// `[read]` **Hier wird nicht geraten:** was nicht in der erlaubten
// Liste steht, wird `custom`. **Eine falsche Zuordnung waere
// schlimmer als ein ehrliches ,,custom"** — `body_composition`
// koennte Aufbau ODER Diaet meinen, und das entscheidet der Nutzer,
// nicht dieser Code.
//
// `[read]` **Gemeldet, nicht ausgeglichen** — ob die beiden Listen
// zusammengefuehrt werden, ist eine Schemafrage (Codex).

/** Die sieben Werte, die `user_stacks_goal_check` zulaesst. */
const STACK_ZIELE = new Set([
  'muscle_building', 'fat_loss', 'recovery_sleep', 'health',
  'longevity', 'performance', 'custom',
])

function zielFuerStack(vorlagenZiel: string | null): string {
  if (!vorlagenZiel) return 'custom'
  return STACK_ZIELE.has(vorlagenZiel) ? vorlagenZiel : 'custom'
}

/**
 * Eine Vorlage uebernehmen — sie wird ein eigener Stack (G-372).
 *
 * `[cmd]` **`SPEC_03`, Flow 2, Schritt 4:** *,,[Template uebernehmen]
 * oder [Von Grund auf erstellen]"*.
 *
 * `[cmd]` **Die Posten werden KOPIERT, nicht verknuepft** — der
 * eigene Stack soll aenderbar sein, ohne die Vorlage zu beruehren.
 *
 * `[cmd]` **Und die Spalten heissen verschieden:**
 * `stack_template_items.dose_amount` gegen `stack_items.dose`.
 * **Eine Uebernahme ist eine Uebersetzung, keine Kopie.**
 *
 * `[read]` **Der neue Stack wird NICHT automatisch aktiv** — das
 * ist ein zweiter Schritt, und die Spec trennt ihn auch.
 */
export async function uebernimmVorlage(
  templateId: string,
): Promise<{ id: string; name: string; posten: number }> {
  const { userId } = await sitzung()

  const { data: vorlage, error: vFehler } = await db()
    .from('stack_templates')
    .select('id, name_de, goal')
    .eq('id', templateId)
    .maybeSingle()
  if (vFehler) throw new SupplementSchreibFehler('WRITE_FAILED', vFehler.message)
  if (!vorlage) {
    throw new SupplementSchreibFehler('NOT_FOUND', 'Keine sichtbare Vorlage mit dieser id.')
  }
  const v = vorlage as unknown as { id: string; name_de: string; goal: string | null }

  const { data: posten, error: pFehler } = await db()
    .from('stack_template_items')
    .select('supplement_id, custom_name, dose_amount, dose_unit, timing, frequency, sort_order')
    .eq('template_id', templateId)
    .order('sort_order', { ascending: true })
  if (pFehler) throw new SupplementSchreibFehler('WRITE_FAILED', pFehler.message)

  const { data: neu, error: nFehler } = await db()
    .from('user_stacks')
    .insert({
      user_id: userId,
      name: v.name_de,
      goal: zielFuerStack(v.goal),
      // `[read]` **Die Herkunft steht dran** — der Mockup zeigt sie
      // als eigene Marke neben dem Namen (`module-supplements-spec.jsx:203`).
      source: 'template',
      is_active: false,
    })
    .select('id, name')
  if (nFehler) throw new SupplementSchreibFehler('WRITE_FAILED', nFehler.message)
  const stack = (neu ?? [])[0] as unknown as { id: string; name: string } | undefined
  if (!stack) {
    throw new SupplementSchreibFehler('WRITE_FAILED', 'Insert lieferte keine Zeile zurueck.')
  }

  const zeilen = (posten ?? []) as unknown as Array<Record<string, unknown>>
  if (zeilen.length === 0) return { id: stack.id, name: stack.name, posten: 0 }

  const { data: kopien, error: kFehler } = await db()
    .from('stack_items')
    .insert(zeilen.map((z, i) => ({
      stack_id: stack.id,
      supplement_id: (z.supplement_id as string) ?? null,
      custom_name: (z.custom_name as string) ?? null,
      // `dose_amount` -> `dose`: die Uebersetzung.
      dose: Number(z.dose_amount ?? 0),
      dose_unit: String(z.dose_unit ?? 'mg'),
      timing: String(z.timing ?? 'morning'),
      frequency: String(z.frequency ?? 'daily'),
      sort_order: Number(z.sort_order ?? i),
    })))
    .select('id')
  if (kFehler) throw new SupplementSchreibFehler('WRITE_FAILED', kFehler.message)

  return { id: stack.id, name: stack.name, posten: (kopien ?? []).length }
}


/**
 * Einen eigenen Stack anlegen — G-373.
 *
 * `[cmd]` **Keine Datenbankarbeit noetig:** `authenticated` haelt
 * INSERT auf `user_stacks` (in G-372 ueber `role_table_grants`
 * gemessen).
 *
 * `[read]` **`goal` gegen die Siebenerliste**, die im CHECK steht —
 * `STACK_ZIELE`. **C-427 ist offen; bis dahin gilt sie**, weil sie in
 * der Datenbank steht und die aeltere ist. **Hier wird sie benutzt,
 * nicht entschieden.**
 *
 * `[read]` **Der neue Stack ist NICHT automatisch aktiv** — dieselbe
 * Trennung wie bei `uebernimmVorlage` (SPEC_03, Flow 2: erst anlegen,
 * dann aktivieren).
 */
export async function legeStackAn(
  name: string, goal: string,
): Promise<{ id: string; name: string; goal: string }> {
  const { userId } = await sitzung()

  const sauber = name.trim()
  if (!sauber) {
    throw new SupplementSchreibFehler('VALIDATION_FAILED', 'Der Name fehlt.')
  }
  // `[read]` **Der CHECK wuerde es ohnehin abfangen** — aber eine
  // Meldung, die den Wert nennt, ist brauchbarer als
  // `user_stacks_goal_check`.
  if (!STACK_ZIELE.has(goal)) {
    throw new SupplementSchreibFehler('VALIDATION_FAILED',
      `Unbekanntes Ziel: ${goal}. Erlaubt sind `
      + `${Array.from(STACK_ZIELE).join(', ')}.`)
  }

  const { data, error } = await db()
    .from('user_stacks')
    .insert({
      user_id: userId,
      name: sauber,
      goal,
      source: 'user',
      is_active: false,
    })
    .select('id, name, goal')
  if (error) throw new SupplementSchreibFehler('WRITE_FAILED', error.message)
  const zeile = (data ?? [])[0] as unknown as
    { id: string; name: string; goal: string } | undefined
  // `[read]` **Die Nullzeilenpruefung** (G-79): ein Schreibversuch,
  // den der Zeilenschutz leergefiltert hat, meldet trotzdem `ok`.
  if (!zeile) {
    throw new SupplementSchreibFehler('WRITE_FAILED', 'Insert lieferte keine Zeile zurueck.')
  }
  return zeile
}

/**
 * Eine Position aendern — G-373, der Gegenpart zu
 * *Item customization* (`module-supplements-spec.jsx:562`).
 *
 * `[cmd]` **Der Mockup nennt vier Felder:** eigener Name, eigene
 * Dosis, eigenes Timing, Cycling. **`cycling` bleibt hier aussen
 * vor** — es ist ein Objekt (`{on_weeks, off_weeks}`) und braucht
 * eine eigene Eingabe; **gemeldet, nicht halb gebaut.**
 */
export async function aenderePosition(
  id: string,
  aenderung: {
    custom_name?: string | null
    dose?: number
    dose_unit?: string
    timing?: string
    frequency?: string
  },
): Promise<{ id: string }> {
  await sitzung()

  const feld: Record<string, unknown> = {}
  if (aenderung.custom_name !== undefined) {
    feld.custom_name = aenderung.custom_name?.trim() || null
  }
  if (aenderung.dose !== undefined) {
    if (!(aenderung.dose > 0)) {
      throw new SupplementSchreibFehler('VALIDATION_FAILED',
        'Die Dosis muss groesser als 0 sein.')
    }
    feld.dose = aenderung.dose
  }
  if (aenderung.dose_unit !== undefined) {
    if (!aenderung.dose_unit.trim()) {
      throw new SupplementSchreibFehler('VALIDATION_FAILED', 'Die Einheit fehlt.')
    }
    feld.dose_unit = aenderung.dose_unit.trim()
  }
  if (aenderung.timing !== undefined) feld.timing = aenderung.timing
  if (aenderung.frequency !== undefined) feld.frequency = aenderung.frequency

  if (Object.keys(feld).length === 0) {
    throw new SupplementSchreibFehler('VALIDATION_FAILED', 'Nichts zu aendern.')
  }

  const { data, error } = await db()
    .from('stack_items').update(feld).eq('id', id)
    .select('id')
  if (error) throw new SupplementSchreibFehler('WRITE_FAILED', error.message)
  const zeile = (data ?? [])[0] as unknown as { id: string } | undefined
  if (!zeile) {
    throw new SupplementSchreibFehler('NOT_FOUND', 'Keine eigene Position mit dieser id.')
  }
  return zeile
}
